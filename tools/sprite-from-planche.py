# Planches fournies par l'utilisateur (docs/sprites/<nom>.png, pixel art agrandi) → assets/sprites/<nom>.png
# SANS PERTE : on retrouve la grille d'origine (1 pixel du dessin = PX × PX pixels de l'image), on garde toutes les
# couleurs et le contour d'origine ; seul le fond uni devient transparent. Le jeu affiche ensuite la planche à la taille
# voulue (H pixels du monde) : à l'écran (agrandi ~3 à 6 fois), tout le détail de la planche reste visible.
# Lignes de la planche produite : face, dos, profil vers la gauche ; 4 images de marche par ligne.
# Les poses sont repérées automatiquement (taches sur le fond, triées de gauche à droite) ; PLANCHES dit lesquelles prendre
# pour chaque ligne et lesquelles retourner en miroir (1). Met à jour la ligne du personnage dans src/render/sheets.js.
# Usage : python3 -I tools/sprite-from-planche.py
import os, re, json, base64, numpy as np
from PIL import Image
from scipy import ndimage
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PLANCHES = {
  # planche du 18/11 : 7 poses (face, face marche, dos, dos marche, profil droit, 2 pas) ; marche = pas miroir
  'manu': dict(PX=3, H=40, bgTol=28, front=[0, 1, 0, (1, 1)], back=[2, 3, 2, (3, 1)], side=[(4, 1), (5, 1), (4, 1), (6, 1)]),
}
def phase(a, px, axis):   # décalage de la grille : là où les changements de couleur tombent sur les bords des blocs
    d = (np.abs(np.diff(a, axis=axis)).sum(2) > 18).sum(1 - axis)
    return int(np.argmax([d[o::px].sum() for o in range(px)]) + 1) % px
for name, P in PLANCHES.items():
    src = np.array(Image.open(os.path.join(ROOT, 'docs/sprites', name + '.png')).convert('RGB')).astype(int)
    px = P['PX']; oy, ox = phase(src, px, 0), phase(src, px, 1)
    a = src[oy + px // 2::px, ox + px // 2::px][:, :, :3]     # un échantillon par pixel du dessin, au centre du bloc
    bg = np.median(np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]]), 0)
    alpha = (np.abs(a - bg).sum(2) > P['bgTol']).astype('uint8') * 255
    rgba = np.dstack([a, alpha]).astype('uint8')
    lab, _ = ndimage.label(ndimage.binary_dilation(alpha > 0, iterations=1))
    bs = sorted([b for b in ndimage.find_objects(lab) if b[0].stop - b[0].start > a.shape[0] // 3], key=lambda b: b[1].start)
    cut = lambda b: rgba[:, b[1].start:b[1].stop]          # toute la hauteur : pieds alignés sur la même ligne
    rows = {}
    for v in ('front', 'back', 'side'):
        L = []
        for it in P[v]:
            i, flip = it if isinstance(it, tuple) else (it, 0)
            c = Image.fromarray(cut(bs[i]).copy(), 'RGBA'); L.append(c.transpose(Image.FLIP_LEFT_RIGHT) if flip else c)
        rows[v] = L
    # recadrage vertical commun (du haut du chapeau le plus haut aux pieds)
    top = min(np.argmax(np.array(c)[..., 3].any(1)) for r in rows.values() for c in r)
    bot = max(len(np.array(c)) - np.argmax(np.array(c)[::-1, :, 3].any(1)) for r in rows.values() for c in r)
    top, bot = int(top), int(bot)
    n = 4; SW = max(c.size[0] for r in rows.values() for c in r) + 2; SH = bot - top + 1
    sh = Image.new('RGBA', (SW * n, SH * 3))
    for ri, v in enumerate(('front', 'back', 'side')):
        for ci, f in enumerate(rows[v]): sh.alpha_composite(f.crop((0, top, f.size[0], bot + 1)), (ci * SW + (SW - f.size[0]) // 2, ri * SH))
    sh.save(os.path.join(ROOT, 'assets/sprites', name + '.png'))
    k = P['H'] / SH; fw, fh = round(SW * k), P['H']                # taille dans le monde (pixels du jeu)
    fr = json.load(open(os.path.join(ROOT, 'assets/sprites/frames.json'))); fr[name] = [int(fw), int(fh), n, int(SW), int(SH)]
    json.dump(fr, open(os.path.join(ROOT, 'assets/sprites/frames.json'), 'w'))
    url = base64.b64encode(open(os.path.join(ROOT, 'assets/sprites', name + '.png'), 'rb').read()).decode()
    line = f"  {name}: {{ fw: {fw}, fh: {fh}, sw: {SW}, sh: {SH}, n: {n}, url: 'data:image/png;base64,{url}' }}"
    p = os.path.join(ROOT, 'src/render/sheets.js'); js = open(p).read()
    js, nb = re.subn(r"^  " + name + r": \{[^\n]*$", lambda m: line + (',' if m.group(0).rstrip().endswith(',') else ''), js, flags=re.M)
    assert nb == 1, 'ligne ' + name + ' introuvable dans sheets.js'
    open(p, 'w').write(js); print(name, 'grille', px, 'décalage', (ox, oy), 'planche', SW, '×', SH, '→ monde', fw, '×', fh)
