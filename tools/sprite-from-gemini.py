# Planches générées par Gemini (docs/sprites/<nom>-gemini.jpg) → assets/sprites/<nom>.png, avec la réduction nette
# de tools/hero-propositions.py (palette par personnage, pixel dominant par bloc, contour sombre).
# Les personnages sont repérés automatiquement (taches sur fond blanc, triées par ligne puis colonne) ;
# PICK dit quelles taches forment chaque ligne (face, dos, profil vers la gauche) et lesquelles retourner (regardent à droite).
# Puis régénère src/render/sheets.js. Usage : python3 -I tools/sprite-from-gemini.py
import os, json, base64, numpy as np
from PIL import Image
from scipy import ndimage
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, 'tools/hero-propositions.py')).read().split('cells = lambda')[0]
G = {'__file__': os.path.join(ROOT, 'tools/hero-propositions.py')}; exec(src, G)
PICK = {
  'myst': dict(H=40, ncol=40, white=222, front=[0, 1, 2, 3], back=[4, 5, 6, 7], side=[(8, 1), (9, 1), (10, 1), (11, 1)]),   # planche myst_v2 (profils tournés à droite → miroir)
}
def blobs(im):
    a = np.array(im).astype(int); fg = np.abs(a - 255).sum(2) > 60
    lab, _ = ndimage.label(ndimage.binary_dilation(fg, iterations=4))
    bs = [b for b in ndimage.find_objects(lab) if b[0].stop - b[0].start > im.height // 6]
    bs.sort(key=lambda b: (round(b[0].start / (im.height / 4)), b[1].start))
    return [(b[1].start - 8, b[0].start - 8, b[1].stop + 8, b[0].stop + 8) for b in bs]
for name, P in PICK.items():
    im = Image.open(os.path.join(ROOT, 'docs/sprites', name + '-gemini.jpg')).convert('RGB'); bs = blobs(im)
    rows = {}
    for v in ('front', 'back', 'side'):
        L = []
        for it in P[v]:
            i, flip = it if isinstance(it, tuple) else (it, 0)
            c = G['cut'](im, bs[i])
            if P.get('white'):   # blanc enfermé (entre les jambes) et liseré clair du JPEG : transparents
                a = np.array(c); a[a[..., :3].min(2) > P['white'], 3] = 0; c = Image.fromarray(a, 'RGBA')
            L.append(c.transpose(Image.FLIP_LEFT_RIGHT) if flip else c)
        rows[v] = L
    X = np.concatenate([np.array(c).reshape(-1, 4) for r in rows.values() for c in r]); X = X[X[:, 3] > 128][:, :3].astype(float)
    C = G['kmeans'](X[::2], P['ncol']); C = np.clip(C, 0, 255)
    k = P['H'] / max(c.size[1] for c in rows['front'])
    def halo(s):   # liseré gris clair laissé par le fond du JPEG sur le bord de la silhouette
        a = np.array(s).astype(int)
        for _ in range(2):
            op = a[..., 3] > 0; edge = np.zeros_like(op)
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)): edge |= ~np.pad(op, 1)[1 + dy:1 + dy + op.shape[0], 1 + dx:1 + dx + op.shape[1]]
            rgb = a[..., :3]; grey = (rgb.max(2) - rgb.min(2) < 40) & (rgb.mean(2) > 95)
            a[op & edge & grey, 3] = 0
        return Image.fromarray(a.astype('uint8'), 'RGBA')
    rows = {v: [G['outline'](halo(G['crisp'](c, k, C))) for c in r] for v, r in rows.items()}
    n = 4; FW = max(c.size[0] for r in rows.values() for c in r) + 2; FH = max(c.size[1] for r in rows.values() for c in r) + 2
    sh = Image.new('RGBA', (FW * n, FH * 3))
    for ri, v in enumerate(('front', 'back', 'side')):
        for ci, f in enumerate(rows[v]): sh.alpha_composite(f, (ci * FW + (FW - f.size[0]) // 2, ri * FH + FH - f.size[1]))
    sh.save(os.path.join(ROOT, 'assets/sprites', name + '.png'))
    fr = json.load(open(os.path.join(ROOT, 'assets/sprites/frames.json'))); fr[name] = [FW, FH, n]
    json.dump(fr, open(os.path.join(ROOT, 'assets/sprites/frames.json'), 'w')); print(name, FW, FH, n)
# src/render/sheets.js (même format que tools/sprite-from-sheets.py)
fr = json.load(open(os.path.join(ROOT, 'assets/sprites/frames.json'))); js = []
for f in sorted(os.listdir(os.path.join(ROOT, 'assets/sprites'))):
    if not f.endswith('.png'): continue
    nm = f[:-4]; im = Image.open(os.path.join(ROOT, 'assets/sprites', f)); n = fr.get(nm, (0, 0, 4))[2]
    js.append(f"  {nm}: {{ fw: {im.width // n}, fh: {im.height // 3}, n: {n}, url: 'data:image/png;base64,{base64.b64encode(open(os.path.join(ROOT, 'assets/sprites', f), 'rb').read()).decode()}' }}")
head = open(os.path.join(ROOT, 'src/render/sheets.js')).read().split('export const SHEETS')[0]
open(os.path.join(ROOT, 'src/render/sheets.js'), 'w').write(head + "export const SHEETS = {\n" + ',\n'.join(js) + "\n};\n")
