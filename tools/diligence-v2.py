# 21/11 : diligence d'après les 3 bandes Gemini (docs/sprites/decors/dilig-v2/{profil,face,dos}.jpg), 4 images de trot chacune.
# Sortie : assets/decors/diligence_{droite,face,dos}.png = bandes de 4 cases égales, fond transparent, bas des cases = sol.
# Gemini a dessiné le profil vers la gauche ; le profil droit est son miroir (fait dans le jeu). Lancer : python3 -I tools/diligence-v2.py
import os, numpy as np
from PIL import Image
from scipy import ndimage
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'docs/sprites/decors/dilig-v2')
# Images gardées dans l'ordre du cycle (profil : l'image 1 montre deux chevaux séparés, les autres un seul → 2, 3, 4, 3).
# Face : l'image 4 montre les chevaux tête levée (les autres de dos) → 1, 2, 3, 2.
ORDER = { 'profil': [1, 2, 3, 2], 'face': [0, 1, 2, 1], 'dos': [0, 1, 2, 3] }
OUT = { 'profil': 'diligence_gauche', 'face': 'diligence_face', 'dos': 'diligence_dos' }
MAXW = 4 * 126   # 4 × la largeur d'affichage du profil au plus

def cut(v):
    a = np.array(Image.open(os.path.join(SRC, v + '.jpg')).convert('RGB')).astype(int)
    white = a.min(2) > 225
    lab, _ = ndimage.label(white); border = set(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]]) - {0}
    bg = white   # tout le blanc devient transparent (fond, entre les rayons des roues, sous la caisse)
    m = ~bg
    def longest(r):
        d = np.diff(np.r_[0, r.astype(int), 0]); st, en = np.where(d == 1)[0], np.where(d == -1)[0]
        return (en - st).max() if len(st) else 0
    wide = np.array([longest(r) for r in m]) > a.shape[1] * .6   # ligne de sol continue dessinée sous le profil
    if wide.any(): m[np.where(wide)[0].min() - 2:] = False
    m = ndimage.binary_opening(m, iterations=1)
    lab2, n = ndimage.label(m); sizes = ndimage.sum(m, lab2, range(1, n + 1))
    m = np.isin(lab2, [i + 1 for i, s in enumerate(sizes) if s > 400])
    cols = np.where(m.any(0))[0]; runs = []; s = p = cols[0]
    for c in cols[1:]:
        if c - p > 8: runs.append((s, p)); s = c
        p = c
    runs.append((s, p)); assert len(runs) == 4, (v, runs)
    rgba = np.dstack([a, np.where(m, 255, 0)]).astype('uint8')
    fr = []
    for x0, x1 in runs:
        sub = m[:, x0:x1 + 1]; ys = np.where(sub.any(1))[0]
        fr.append(rgba[ys[0]:ys[-1] + 1, x0:x1 + 1])
    return fr

for v, out in OUT.items():
    fr = [f for f in cut(v)]; fr = [fr[i] for i in ORDER[v]]
    W = max(f.shape[1] for f in fr) + 2; H = max(f.shape[0] for f in fr)
    sheet = np.zeros((H, W * 4, 4), 'uint8')
    for i, f in enumerate(fr):
        h, w = f.shape[:2]
        x = W - 1 - w if v == 'profil' else (W - w) // 2   # profil : caisse calée à droite (les chevaux changent à gauche)
        sheet[H - h:, i * W + x:i * W + x + w] = f
    im = Image.fromarray(sheet)
    k = min(1, MAXW * (1 if v == 'profil' else 60 / 126) * 4 / im.width)
    if k < 1: im = im.resize((round(im.width * k / 4) * 4, round(im.height * k)), Image.LANCZOS)
    im.save(os.path.join(ROOT, 'assets/decors', out + '.png')); print(out, im.size)

# Profil : les roues tournent à part dans le jeu. Centre x, centre y, rayon dans une case (485 px de large, 252 de haut).
WHEELS = [(275, 212, 40), (423, 202, 50)]
p = os.path.join(ROOT, 'assets/decors/diligence_gauche.png'); sh = np.array(Image.open(p).convert('RGBA')); sh = np.pad(sh, ((0, 2), (0, 0), (0, 0))); CW = sh.shape[1] // 4
# fenêtres : trous fermés de la caisse (hors roues) remplis en brun sombre
holes = ndimage.binary_fill_holes(sh[..., 3] > 0) & (sh[..., 3] == 0)
lab, n = ndimage.label(holes)
yy, xx = np.mgrid[:sh.shape[0], :sh.shape[1]]
inwheel = np.zeros(sh.shape[:2], bool)
for i in range(4):
    for cx, cy, r in WHEELS: inwheel |= (xx - i * CW - cx) ** 2 + (yy - cy) ** 2 <= (r + 2) ** 2
for k in range(1, n + 1):
    z = lab == k
    if z.sum() < 3000 and not (z & inwheel).any(): sh[z] = (58, 36, 24, 255)
# roue : moitié basse de la grande roue (propre, sans caisse), complétée par symétrie
cx, cy, r = WHEELS[1]
w = sh[cy - r:cy + r + 1, cx - r:cx + r + 1].copy()
w[:r] = w[::-1][:r][:, ::-1]
ww = np.mgrid[-r:r + 1, -r:r + 1]; w[(ww ** 2).sum(0) > (r + 1) ** 2] = 0
Image.fromarray(w).save(os.path.join(ROOT, 'assets/decors/roue.png'))
# on retire des cases les roues fixes (sauf les pixels des chevaux, orangés, et le haut caché par la caisse)
rgb = sh[..., :3].astype(int); horse = (rgb[..., 0] - rgb[..., 2] > 90) & (rgb[..., 0] > 150)
for i in range(4):
    for cx, cy, r in WHEELS:
        z = ((xx - i * CW - cx) ** 2 + (yy - cy) ** 2 <= (r + 3) ** 2) & (yy > cy - r * .35) & ~horse
        sh[z] = 0
Image.fromarray(sh).save(p); print('roues', WHEELS)
