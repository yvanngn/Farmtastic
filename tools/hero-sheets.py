# 19/11 : héros et héroïne d'après les planches fournies (docs/sprites/heros.jpg, heroine.jpg : JPEG agrandis × ~5).
# Lignes fournies : face, profil gauche, profil droit, dos ; 4 images. Les planches mélangent poses avec et sans sac à dos :
# on les « simplifie » en deux versions cohérentes, avec sac et sans sac (face : 4 images ; profil gauche : arrêt / pas ;
# dos : avec sac 0-3-2-3, sans sac : le pas sans sac et l'arrêt reconstitué). Sans perte : grille d'origine retrouvée.
# Sortie : sheets.js (hero_h_p, hero_h_n, hero_f_p, hero_f_n) + masque des cheveux et des yeux (pour les recolorer).
import os, re, io, base64, numpy as np
from PIL import Image
from scipy import ndimage
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
H = 46
def grid(path):
    a = np.array(Image.open(path).convert('RGB')).astype(float)
    def pp(ax):
        g = np.abs(np.diff(a.mean(2), axis=ax)).sum(1 - ax); idx = np.arange(len(g)) + .5
        p = max((abs((g * np.exp(2j * np.pi * idx / p)).sum()), p) for p in np.arange(3, 8, .0025))[1]
        return p, (np.angle((g * np.exp(2j * np.pi * idx / p)).sum()) / (2 * np.pi) * p) % p
    (py, oy), (px, ox) = pp(0), pp(1)
    ys, xs = np.arange(oy + py / 2, a.shape[0] - 1, py), np.arange(ox + px / 2, a.shape[1] - 1, px)
    o = np.zeros((len(ys), len(xs), 3))
    for i, y in enumerate(ys):
        for j, x in enumerate(xs): o[i, j] = a[int(round(y - .8)):int(round(y + .8)) + 1, int(round(x - .8)):int(round(x + .8)) + 1].reshape(-1, 3).mean(0)
    o = o.round().clip(0, 255).astype('uint8')
    bgc = np.median(np.concatenate([o[0], o[-1], o[:, 0], o[:, -1]]), 0)
    near = np.abs(o.astype(int) - bgc).sum(2) < 42
    lab, _ = ndimage.label(near); border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(border))
    for _ in range(2):
        edge = ndimage.binary_dilation(bg) & ~bg; bg |= edge & (np.abs(o.astype(int) - bgc).sum(2) < 80)
    fl, _ = ndimage.label(~bg)
    objs = [b for b in ndimage.find_objects(fl) if b is not None and b[0].stop - b[0].start > o.shape[0] // 8]
    objs.sort(key=lambda b: (b[0].start + b[0].stop) / 2)
    rows = [sorted(objs[k:k + 4], key=lambda b: b[1].start) for k in range(0, 16, 4)]
    cells = []
    for r in rows:
        row = []
        for b in r:
            sl = fl[b]; k = np.bincount(sl[sl > 0].ravel()).argmax()
            c = np.dstack([o[b], np.where(fl[b] == k, 255, 0).astype('uint8')])
            row.append(c)
        cells.append(row)
    print(path, 'pas', round(py, 3), round(px, 3), [[c.shape[:2] for c in r] for r in cells])
    return cells
def pad(c, W, Hh):   # centre horizontalement, pieds en bas
    out = np.zeros((Hh, W, 4), 'uint8'); h, w = c.shape[:2]; x = (W - w) // 2; out[Hh - h:, x:x + w] = c; return out
def head_x(c, frac=.3):   # centre horizontal de la tête (haut de l'image)
    a = c[:int(c.shape[0] * frac), :, 3] > 0; xs = np.nonzero(a.any(0))[0]; return (xs.min() + xs.max()) / 2
def compose(top, bottom, cut):   # haut d'une image + bas d'une autre, têtes alignées, pieds en bas
    Hh = max(top.shape[0], bottom.shape[0]); W = max(top.shape[1], bottom.shape[1]) + 8
    def place(c, dx=0):
        out = np.zeros((Hh, W, 4), 'uint8'); h, w = c.shape[:2]; x = (W - w) // 2 + dx; out[Hh - h:, x:x + w] = c; return out
    b = place(bottom); t0 = place(top); dx = int(round(head_x(b) - head_x(t0))); t = place(top, dx)
    y = int(Hh * cut); out = b.copy(); out[:y] = t[:y]
    xs = np.nonzero(out[..., 3].any(0))[0]; return out[:, xs.min():xs.max() + 1]
def build(cells):
    F, L, R, B = cells
    # profil : la tête (et la coiffure) de l'image à l'arrêt sur le pas, pour qu'elle ne change pas en marchant
    Lp, Ln = compose(L[2], L[3], .42), compose(L[0], L[1], .42)
    # dos : avec sac = haut de l'arrêt avec sac + jambes du pas ; sans sac = haut du pas sans sac + jambes de l'arrêt
    Bp_step, Bn_idle = compose(B[0], B[1], .74), compose(B[1], B[0], .66)
    return {
        'p': [[F[0], F[1], F[2], F[3]], [B[0], Bp_step, B[0], Bp_step], [L[2], Lp, L[2], Lp]],
        'n': [[F[0], F[1], F[2], F[3]], [Bn_idle, B[1], Bn_idle, B[1]], [L[0], Ln, L[0], Ln]],
    }
def masks(sheet, hairRef):   # cheveux : couleurs proches de celles du haut de la tête ; yeux : pixels bleutés du visage
    rgb = sheet[..., :3].astype(int); m = np.zeros(sheet.shape[:2] + (3,), 'uint8')
    d = np.min([np.abs(rgb - c).sum(2) for c in hairRef], 0)
    hair = (d < 60) & (sheet[..., 3] > 0)
    return hair
def to_url(im):
    b = io.BytesIO(); Image.fromarray(im).save(b, 'PNG'); return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()
lines = []
for sex, path in (('h', 'docs/sprites/heros.jpg'), ('f', 'docs/sprites/heroine.jpg')):
    V = build(grid(os.path.join(ROOT, path)))
    for k, rows in V.items():
        W = max(c.shape[1] for r in rows for c in r) + 2; Hh = max(c.shape[0] for r in rows for c in r)
        sh = np.zeros((Hh * 3, W * 4, 4), 'uint8')
        for ri, r in enumerate(rows):
            for ci, c in enumerate(r): sh[ri * Hh:(ri + 1) * Hh, ci * W:(ci + 1) * W] = pad(c, W, Hh)
        # masque : R = cheveux (bruns du crâne, dans la moitié haute de chaque image), G = yeux (bleus/gris foncés du visage)
        rgb = sh[..., :3].astype(int); a = sh[..., 3] > 0; yy = np.arange(sh.shape[0])[:, None] % Hh
        inner = ndimage.binary_erosion(a, iterations=2)   # sans le contour sombre
        ref = []
        for ri in range(3):
            for ci in range(4):
                sl = (slice(ri * Hh, (ri + 1) * Hh), slice(ci * W, (ci + 1) * W)); cell = sh[sl]; top = np.nonzero(cell[..., 3].any(1))[0][0]
                m_ = inner[sl][top:top + 6]; ref += list(cell[top:top + 6][m_][:, :3].astype(int))
        ref = np.array(ref); lum = ref.sum(1); ref = np.unique(ref[(lum > 90) & (lum < 520)], axis=0)
        d = np.min([np.abs(rgb - c).sum(2) for c in ref], 0)
        cand = inner & (d < 26) & (yy < Hh * .5)
        lab, _ = ndimage.label(cand); keep = set(np.unique(lab[(yy < Hh * .2) & cand])) - {0}
        hair = np.isin(lab, list(keep))
        r_, g_, b_ = rgb[..., 0], rgb[..., 1], rgb[..., 2]
        skin = (r_ > 200) & (g_ > 150) & (b_ > 100)
        nearSkin = ndimage.binary_dilation(skin, iterations=1)
        eyes = np.zeros_like(a)   # yeux : à faire plus tard (trop peu de pixels distincts)
        mk = np.zeros_like(sh); mk[..., 0] = hair * 255; mk[..., 1] = eyes * 255; mk[..., 3] = 255
        Image.fromarray(sh).save(os.path.join(ROOT, f'assets/sprites/hero_{sex}_{k}.png'))
        fw = round(W * H / Hh)
        lines.append(f"  hero_{sex}_{k}: {{ fw: {fw}, fh: {H}, sw: {W}, sh: {Hh}, n: 4, url: '{to_url(sh)}', mask: '{to_url(mk)}' }}")
        print(sex, k, W, Hh, 'cheveux', int(hair.sum()), 'yeux', int(eyes.sum()))
p = os.path.join(ROOT, 'src/render/sheets.js'); js = open(p).read()
js = re.sub(r"\n  hero_[hf]_[pn]: \{[^\n]*", '', js)
head, tail = js.rsplit('};', 1); head = head.rstrip().rstrip(',')
js = head + ',\n' + ',\n'.join(lines) + '\n};' + tail
open(p, 'w').write(js)

# ---- 19/11 : coups de pioche de l'héroïne (docs/sprites/heroine-pioche.jpg) : 3 temps par direction (levée haute, levée,
# frappe), têtes alignées au centre de l'image (la pioche dépasse de chaque côté).
PICK = {'f': 'docs/sprites/heroine-pioche.jpg'}
plines = []
for sex, path in PICK.items():
    F, L, R, B = grid(os.path.join(ROOT, path))
    rows = [[F[3], F[2], F[1]], [B[2], B[2], B[0]], [L[2], L[2], L[0]]]   # dos et profil : la coiffure à queue de cheval reste la même
    Hh = max(c.shape[0] for r in rows for c in r)
    half = max(max(head_x(c), c.shape[1] - head_x(c)) for r in rows for c in r); W = int(np.ceil(half * 2)) + 2
    sh = np.zeros((Hh * 3, W * 3, 4), 'uint8')
    for ri, r in enumerate(rows):
        for ci, c in enumerate(r):
            h, w = c.shape[:2]; x = int(round(W / 2 - head_x(c))); sh[ri * Hh + Hh - h:ri * Hh + Hh, ci * W + x:ci * W + x + w] = c
    Image.fromarray(sh).save(os.path.join(ROOT, f'assets/sprites/hero_{sex}_pick.png'))
    plines.append(f"  hero_{sex}_pick: {{ fw: {round(W * H / Hh)}, fh: {H}, sw: {W}, sh: {Hh}, n: 3, url: '{to_url(sh)}' }}")
    print('pioche', sex, W, Hh)
js = open(p).read(); js = re.sub(r"\n  hero_[hf]_pick: \{[^\n]*", '', js)
head, tail = js.rsplit('};', 1); js = head.rstrip().rstrip(',') + ',\n' + ',\n'.join(plines) + '\n};' + tail
open(p, 'w').write(js)
