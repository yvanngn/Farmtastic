# 19/11 : planche fournie en JPEG agrandi d'un facteur non entier (ici ×3,75) → planche du jeu SANS PERTE de dessin :
# on retrouve le pas exact de la grille (analyse de Fourier des contours), puis on prend la couleur au centre de chaque
# pixel du dessin (moyenne d'un petit noyau, pour gommer le bruit JPEG). Fond blanc → transparent (seulement le fond relié
# aux bords : les reflets blancs des yeux restent). 3 lignes × 4 images : face, dos, profil (retourné vers la gauche).
# Usage : python3 -I tools/sprite-from-jpeg-grid.py docs/sprites/myst-test.jpg myst_test 46
import sys, os, re, base64, io, numpy as np
from PIL import Image
from scipy import ndimage
src, name, H = sys.argv[1], sys.argv[2], int(sys.argv[3])
# ordre des lignes de la planche fournie → face, dos, profil ; ex. « 0,3,1L » (le L : profil déjà tourné vers la gauche)
ORDER = (sys.argv[4] if len(sys.argv) > 4 else '0,1,2R').split(',')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
a = np.array(Image.open(src).convert('RGB')).astype(float)
def pitch_phase(ax):
    g = np.abs(np.diff(a.mean(2), axis=ax)).sum(1 - ax); idx = np.arange(len(g)) + .5
    best = max((abs((g * np.exp(2j * np.pi * idx / p)).sum()), p) for p in np.arange(2.5, 8, .0025))[1]
    ph = (np.angle((g * np.exp(2j * np.pi * idx / best)).sum()) / (2 * np.pi) * best) % best
    return best, ph
(py, oy), (px, ox) = pitch_phase(0), pitch_phase(1)
ys, xs = np.arange(oy + py / 2, a.shape[0] - 1, py), np.arange(ox + px / 2, a.shape[1] - 1, px)
o = np.zeros((len(ys), len(xs), 3))
for i, y in enumerate(ys):
    for j, x in enumerate(xs):
        o[i, j] = a[int(round(y - .7)):int(round(y + .7)) + 1, int(round(x - .7)):int(round(x + .7)) + 1].reshape(-1, 3).mean(0)
o = o.round().clip(0, 255).astype('uint8')
bgc = np.median(np.concatenate([o[0], o[-1], o[:, 0], o[:, -1]]), 0)
white = np.abs(o.astype(int) - bgc).sum(2) < 40   # fond uni (blanc, lilas…)
lab, _ = ndimage.label(white); border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
bg = np.isin(lab, list(border))
for k, sz in enumerate(ndimage.sum(white, lab, range(1, lab.max() + 1)), 1):   # trous de fond enfermés (entre les jambes) : transparents, sauf les petits reflets
    if sz >= 5: bg |= lab == k
for _ in range(2):   # liseré clair laissé par le JPEG au bord de la silhouette → transparent
    edge = ndimage.binary_dilation(bg) & ~bg
    light = np.abs(o.astype(int) - bgc).sum(2) < 90
    bg |= edge & light
alpha = (~bg).astype('uint8') * 255
rgba = np.dstack([o, alpha])
fl, _ = ndimage.label(~bg)
objs = [b for b in ndimage.find_objects(fl) if b is not None and (b[0].stop - b[0].start) > o.shape[0] // 6]
objs.sort(key=lambda b: (b[0].start + b[0].stop) / 2)
rows = [sorted(objs[k:k + 4], key=lambda b: b[1].start) for k in range(0, len(objs) - len(objs) % 4, 4)]
assert all(len(r) == 4 for r in rows), [len(r) for r in rows]
flipSide = ORDER[2].endswith('R'); rows = [rows[int(k.rstrip('LR'))] for k in ORDER]
cells = []
for ri, r in enumerate(rows):
    y0, y1 = min(b[0].start for b in r), max(b[0].stop for b in r)
    row = []
    for b in r:
        k = fl[(b[0].start + b[0].stop) // 2, :][b[1].start:b[1].stop]; k = np.bincount(k[k > 0]).argmax()   # étiquette de ce personnage
        c = rgba[y0:y1, b[1].start:b[1].stop].copy(); c[..., 3] = np.where(fl[y0:y1, b[1].start:b[1].stop] == k, c[..., 3], 0)
        row.append(Image.fromarray(c, 'RGBA'))
    cells.append(row)
SW = max(c.size[0] for r in cells for c in r) + 2; SH = max(c.size[1] for r in cells for c in r)
sh = Image.new('RGBA', (SW * 4, SH * 3))
for ri, r in enumerate(cells):
    for ci, c in enumerate(r):
        if ri == 2 and flipSide: c = c.transpose(Image.FLIP_LEFT_RIGHT)   # le profil fourni regarde à droite ; le jeu attend la gauche
        sh.alpha_composite(c, (ci * SW + (SW - c.size[0]) // 2, ri * SH + SH - c.size[1]))   # pieds alignés en bas
os.makedirs(os.path.join(ROOT, 'assets/sprites'), exist_ok=True)
sh.save(os.path.join(ROOT, 'assets/sprites', name + '.png'))
fw = round(SW * H / SH)
buf = io.BytesIO(); sh.save(buf, 'PNG'); url = base64.b64encode(buf.getvalue()).decode()
line = f"  {name}: {{ fw: {fw}, fh: {H}, sw: {SW}, sh: {SH}, n: 4, url: 'data:image/png;base64,{url}' }}"
p = os.path.join(ROOT, 'src/render/sheets.js'); js = open(p).read()
if re.search(r"^  " + name + r": \{", js, flags=re.M): js = re.sub(r"^  " + name + r": \{[^\n]*$", lambda m: line + (',' if m.group(0).rstrip().endswith(',') else ''), js, flags=re.M)
else: js = re.sub(r"(\n)(  [a-z_]+: \{[^\n]*\n)(\};)", lambda m: m.group(1) + m.group(2).rstrip('\n') + (',' if not m.group(2).rstrip().endswith(',') else '') + '\n' + line + '\n' + m.group(3), js, count=1)
open(p, 'w').write(js)
print('pas', round(py, 3), round(px, 3), 'dessin', o.shape[1], '×', o.shape[0], 'image', SW, '×', SH, '→ monde', fw, '×', H)
