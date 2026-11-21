# Lot 32 (21/11) : découpe les planches de décors fournies (docs/sprites/decors/*.jpg) en images à fond transparent
# (assets/decors/<nom>.png). Fond violet uni retiré par distance de couleur, objets séparés par composantes connexes ;
# les étiquettes écrites sous les filons sont ignorées (trop plates). Qualité d'origine gardée (pas de réduction).
import sys, json
from PIL import Image, ImageFilter
import numpy as np
from collections import deque

def cut(path, min_area=400, tol=26):
    im = Image.open(path).convert('RGB'); a = np.array(im).astype(int); H, W, _ = a.shape
    bg = np.median(np.concatenate([a[:8].reshape(-1, 3), a[-8:].reshape(-1, 3), a[:, :8].reshape(-1, 3), a[:, -8:].reshape(-1, 3)]), axis=0)
    fg = np.sqrt(((a - bg) ** 2).sum(2)) > tol
    seen = np.zeros_like(fg); comps = []
    for y in range(0, H, 2):
        for x in range(0, W, 2):
            if not fg[y, x] or seen[y, x]: continue
            q = deque([(y, x)]); seen[y, x] = 1; pts = []
            while q:
                cy, cx = q.popleft(); pts.append((cy, cx))
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = cy + dy, cx + dx
                    if 0 <= ny < H and 0 <= nx < W and fg[ny, nx] and not seen[ny, nx]: seen[ny, nx] = 1; q.append((ny, nx))
            if len(pts) < min_area: continue
            ys = [p[0] for p in pts]; xs = [p[1] for p in pts]
            comps.append(dict(x0=min(xs), y0=min(ys), x1=max(xs), y1=max(ys), n=len(pts)))
    return im, fg, comps

def save(im, fg, c, out, pad=2):
    x0, y0, x1, y1 = max(0, c['x0'] - pad), max(0, c['y0'] - pad), c['x1'] + pad + 1, c['y1'] + pad + 1
    rgb = im.crop((x0, y0, x1, y1)).convert('RGBA'); f = fg[y0:y1, x0:x1].copy(); h, w = f.shape
    bgk = np.zeros_like(f); q = deque([(y, x) for y in range(h) for x in (0, w - 1)] + [(y, x) for x in range(w) for y in (0, h - 1)])   # le fond = ce qui touche le bord
    for y, x in q: bgk[y, x] = not f[y, x]
    q = deque([(y, x) for y, x in q if not f[y, x]])
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not f[ny, nx] and not bgk[ny, nx]: bgk[ny, nx] = 1; q.append((ny, nx))
    m = Image.fromarray(((~bgk.astype(bool)) * 255).astype('uint8')).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))   # trous intérieurs bouchés
    rgb.putalpha(m); rgb.save(out); return rgb.size

if __name__ == '__main__' and sys.argv[1:] != ['--all']:
    src, prefix = sys.argv[1], sys.argv[2]
    im, fg, comps = cut(src)
    comps.sort(key=lambda c: (round(c['y0'] / 120), c['x0']))
    info = []
    for i, c in enumerate(comps):
        if (c['y1'] - c['y0']) < 30 and (c['x1'] - c['x0']) > 60: continue   # une étiquette de texte
        info.append(dict(i=i, **c))
    print(json.dumps(info))

# Noms des éléments de chaque planche, dans l'ordre de cut() trié (rangée, puis gauche → droite).
NAMES = {
  'nature': {0: 'cactus_grand', 1: 'sapin', 2: 'cypres', 3: 'arbre_fleurs', 4: 'cactus_petit', 5: 'broussaille', 6: 'rocher_grand', 7: 'rocher_bas',
             8: 'cailloux', 9: 'roche_pilier', 10: 'filon_cuivre', 11: 'filon_etain', 12: 'filon_argent', 13: 'caillou', 14: 'filon_fer', 15: 'roche_plate',
             16: 'filon_or', 17: 'filon_or2', 18: 'filon_cobalt', 20: 'filon_zinc', 21: 'filon_nickel'},
}
def run_all():
    out = {}
    for planche in ['nature', 'saloon', 'fontaine', 'diligence']:
        im, fg, comps = cut(f'docs/sprites/decors/{planche}.jpg')
        comps.sort(key=lambda c: (round(c['y0'] / 120), c['x0']))
        names = NAMES.get(planche)
        if not names:   # une planche = un objet (le plus gros), ou plusieurs vues pour la diligence
            big = sorted(comps, key=lambda c: -c['n'])
            if planche == 'diligence':
                vues = sorted(big[:4], key=lambda c: (c['y0'] > 380, c['x0']))
                names = {comps.index(c): n for c, n in zip(vues, ['diligence_droite', 'diligence_gauche', 'diligence_face', 'diligence_dos'])}
            else: names = {comps.index(big[0]): planche}
        for i, n in names.items(): out[n] = save(im, fg, comps[i], f'assets/decors/{n}.png')
    print(json.dumps(out))
if __name__ == '__main__' and sys.argv[1:] == ['--all']: run_all()

# 21/11 : franges violettes — près du bord transparent, les pixels trop proches de la couleur du fond deviennent transparents.
def defringe(path, bg=(102, 93, 110), r=3, tol=58, big=False):
    im = np.array(Image.open(path).convert('RGBA')).astype(int); a = im[..., 3] > 0
    near = np.zeros_like(a)
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            near |= ~np.roll(np.roll(a, dy, 0), dx, 1)
    d = np.sqrt(((im[..., :3] - np.array(bg)) ** 2).sum(2)); purple = (im[..., 2] >= im[..., 1]) & (d < tol)
    im[a & near & purple, 3] = 0
    if big:   # la diligence : le fond violet enfermé entre la caisse, les harnais et les chevaux
        P = (im[..., 3] > 0) & purple; seen = np.zeros_like(P); H, W = P.shape
        for y in range(H):
            for x in range(W):
                if not P[y, x] or seen[y, x]: continue
                q = deque([(y, x)]); seen[y, x] = 1; pts = []
                while q:
                    cy, cx = q.popleft(); pts.append((cy, cx))
                    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        ny, nx = cy + dy, cx + dx
                        if 0 <= ny < H and 0 <= nx < W and P[ny, nx] and not seen[ny, nx]: seen[ny, nx] = 1; q.append((ny, nx))
                if len(pts) > 40:
                    for py, px in pts: im[py, px, 3] = 0
    Image.fromarray(im.astype('uint8')).save(path)
# Diligence : la roue (pour la faire tourner) ; les roues fixes sont retirées de la caisse.
WHEELS = { 'diligence_droite': [(83, 186, 62), (302, 186, 58)], 'diligence_gauche': [(543, 186, 62), (324, 186, 58)] }   # (centre x, centre y, rayon)
def wheels():
    src = np.array(Image.open('assets/decors/diligence_droite.png').convert('RGBA'))
    cx, cy, R = WHEELS['diligence_droite'][0]
    w = np.zeros((2 * R, 2 * R, 4), 'uint8'); y0, x0 = cy - R, max(0, cx - R); part = src[y0:cy + R, x0:cx + R]; w[:part.shape[0], 2 * R - part.shape[1]:] = part
    yy, xx = np.mgrid[-R:R, -R:R]; w[(xx ** 2 + yy ** 2) > R * R, 3] = 0
    w[:, :R] = np.where(w[:, :R, 3:4] == 0, np.flip(np.flip(w, 0), 1)[:, :R], w[:, :R])   # la roue touche le bord gauche : on complète par symétrie
    Image.fromarray(w).save('assets/decors/roue.png')
    for n, cs in WHEELS.items():
        im = np.array(Image.open(f'assets/decors/{n}.png').convert('RGBA')); H, W = im.shape[:2]; yy, xx = np.mgrid[0:H, 0:W]
        for cx, cy, R in cs: im[((xx - cx) ** 2 + (yy - cy) ** 2) <= (R + 1) ** 2, 3] = 0
        Image.fromarray(im).save(f'assets/decors/{n}.png')
if __name__ == '__main__' and sys.argv[1:] == ['--all']:
    import os
    for f in os.listdir('assets/decors'):
        if f.endswith('.png') and f != 'roue.png': defringe('assets/decors/' + f, big=f.startswith('diligence'))
    wheels()
# 21/11 : le panneau du saloon dit seulement « SALOON » (on efface « RED EYE » et on recentre le mot).
def saloon_sign(path='assets/decors/saloon.png'):
    im = np.array(Image.open(path).convert('RGBA')); fill = np.median(im[322:330, 372:388, :].reshape(-1, 4), axis=0).astype('uint8')
    word = im[350:404, 364:616].copy()
    im[310:404, 364:616] = fill
    im[331:385, 364:616] = word   # le mot remonte au milieu du panneau
    Image.fromarray(im).save(path)
if __name__ == '__main__' and sys.argv[1:] == ['--all']: saloon_sign()
# 21/11 : poids réduit sans perte visible — chaque image est ramenée à 4 × sa largeur d'affichage dans le monde
# (le plus grand agrandissement de l'écran : téléphone haute définition au zoom le plus proche), PNG optimisé.
DISPLAY_W = { 'saloon': 112, 'fontaine': 88, 'diligence_droite': 126, 'diligence_gauche': 126, 'diligence_face': 60, 'diligence_dos': 60, 'roue': 26,
  'sapin': 26, 'cypres': 14, 'arbre_fleurs': 34, 'cactus_grand': 13, 'cactus_petit': 9, 'broussaille': 13, 'rocher_grand': 28, 'roche_pilier': 26,
  'rocher_bas': 20, 'roche_plate': 19, 'cailloux': 17, 'caillou': 13 }
def shrink():
    import os
    for f in os.listdir('assets/decors'):
        if not f.endswith('.png'): continue
        n = f[:-4]; w0 = DISPLAY_W.get(n, 22) * 4; im = Image.open('assets/decors/' + f).convert('RGBA')
        if im.width > w0: im = im.resize((w0, max(1, round(im.height * w0 / im.width))), Image.LANCZOS)
        im.save('assets/decors/' + f, optimize=True)
if __name__ == '__main__' and sys.argv[1:] == ['--all']: shrink()
