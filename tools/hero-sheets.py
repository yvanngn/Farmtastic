# 19/11 : héros et héroïne d'après les planches fournies (docs/sprites/heros.jpg, heroine.jpg : JPEG agrandis × ~5).
# Lignes fournies : face, profil gauche, profil droit, dos ; 4 images. Les planches mélangent poses avec et sans sac à dos :
# on les « simplifie » en deux versions cohérentes, avec sac et sans sac (face : 4 images ; profil gauche : arrêt / pas ;
# dos : avec sac 0-3-2-3, sans sac : le pas sans sac et l'arrêt reconstitué). Sans perte : grille d'origine retrouvée.
# Sortie : sheets.js (hero_h_p, hero_h_n, hero_f_p, hero_f_n) + masque des cheveux et des yeux (pour les recolorer).
import os, re, io, base64, numpy as np
from PIL import Image
from scipy import ndimage
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
H = 42   # 19/11 : un peu plus petit (46 → 42 pixels du monde)
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
def pad(c, W, Hh):   # tête au centre de l'image (19/11 : plus de saut du visage entre deux images), pieds en bas
    out = np.zeros((Hh, W, 4), 'uint8'); h, w = c.shape[:2]; x = int(round(W / 2 - head_x(c))); x = max(0, min(W - w, x)); out[Hh - h:, x:x + w] = c; return out
def head_x(c, frac=.3):   # centre horizontal de la tête (haut de l'image)
    a = c[:int(c.shape[0] * frac), :, 3] > 0; xs = np.nonzero(a.any(0))[0]; return (xs.min() + xs.max()) / 2
def head_top(c): return int(np.nonzero(c[..., 3].any(1))[0][0])
def compose(top, bottom, cut, lo=.42, hi=.6):   # haut d'une image + bas d'une autre : têtes alignées (x et y), coupe là où les deux se ressemblent le plus
    Hh = max(top.shape[0], bottom.shape[0]) + 16; W = max(top.shape[1], bottom.shape[1]) + 24
    def place(c, dx=0, dy=0):
        out = np.zeros((Hh, W, 4), 'uint8'); h, w = c.shape[:2]; x = (W - w) // 2 + dx; y = Hh - 8 - h + dy; out[y:y + h, x:x + w] = c; return out
    b = place(bottom); t0 = place(top); dx0 = int(round(head_x(b) - head_x(t0))); dy0 = head_top(b) - head_top(t0)
    # recalage fin : décalage qui superpose le mieux les deux visages (bande du visage)
    yb = head_top(b); band = slice(yb + 6, yb + 16)
    def score(dx, dy):
        t = place(top, dx, dy); return np.abs(t[band].astype(int) - b[band].astype(int)).sum()
    dx, dy = min(((dx, dy) for dx in range(dx0 - 4, dx0 + 5) for dy in range(dy0 - 2, dy0 + 3)), key=lambda v: score(*v))
    t = place(top, dx, dy)
    best = None
    y0b = head_top(b); hb = Hh - 8 - y0b
    for y in range(y0b + int(hb * lo), y0b + int(hb * hi)):
        diff = np.abs(t[y - 1:y + 1].astype(int) - b[y - 1:y + 1].astype(int)).sum()
        if best is None or diff < best[0]: best = (diff, y)
    y = best[1] if cut is None else y0b + int(hb * cut)
    out = b.copy(); out[:y] = t[:y]
    ys = np.nonzero(out[..., 3].any(1))[0]; xs = np.nonzero(out[..., 3].any(0))[0]; return out[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
def step_legs(idle, side, lift=2, legs=.8):   # pas de dos synthétique : une jambe remonte (genou plié), l'autre reste, le corps monte d'1 pixel
    c = idle.copy(); h, w = c.shape[:2]; y0 = int(h * legs); mid = int(round(head_x(idle)))
    out = np.zeros((h, w, 4), 'uint8'); out[:y0 - 1] = c[1:y0]; out[y0 - 1:] = c[y0 - 1:]   # buste remonté d'1
    xs = slice(0, mid) if side == 'L' else slice(mid, w)
    seg = c[y0:, xs].copy(); out[y0:, xs] = 0; out[y0 - lift:h - lift, xs] = np.where(seg[..., 3:] > 0, seg, out[y0 - lift:h - lift, xs])
    return out
def build(cells):
    F, L, R, B = cells
    # profil : la tête (et la coiffure) de l'image à l'arrêt sur le pas ; coupe au cou, là où les deux images se rejoignent
    Lp, Ln = compose(L[2], L[3], None), compose(L[0], L[1], None)
    # dos : marche synthétique à partir de la pose à l'arrêt (une jambe puis l'autre), plus de raccord visible
    Bn_idle = compose(B[1], B[0], .66)
    return {
        'p': [[F[0], F[1], F[2], F[3]], [B[0], step_legs(B[0], 'L'), B[0], step_legs(B[0], 'R')], [L[2], Lp, L[2], Lp]],
        'n': [[F[0], F[1], F[2], F[3]], [Bn_idle, step_legs(Bn_idle, 'L'), Bn_idle, step_legs(Bn_idle, 'R')], [L[0], Ln, L[0], Ln]],
    }
def masks(sheet, hairRef):   # cheveux : couleurs proches de celles du haut de la tête ; yeux : pixels bleutés du visage
    rgb = sheet[..., :3].astype(int); m = np.zeros(sheet.shape[:2] + (3,), 'uint8')
    d = np.min([np.abs(rgb - c).sum(2) for c in hairRef], 0)
    hair = (d < 60) & (sheet[..., 3] > 0)
    return hair
def to_url(im):
    b = io.BytesIO(); Image.fromarray(im).save(b, 'PNG'); return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()
REF = {}
def hair_mask(sh, W, Hh, ncol, ref=None):   # R = cheveux : couleurs du haut du crâne, dans la moitié haute, reliées au sommet
    rgb = sh[..., :3].astype(int); a = sh[..., 3] > 0; yy = np.arange(sh.shape[0])[:, None] % Hh
    inner = ndimage.binary_erosion(a, iterations=2)   # sans le contour sombre
    if ref is None:
        ref = []
        for ri in range(sh.shape[0] // Hh):
            for ci in range(ncol):
                sl = (slice(ri * Hh, (ri + 1) * Hh), slice(ci * W, (ci + 1) * W)); cell = sh[sl]; top = np.nonzero(cell[..., 3].any(1))[0][0]
                m_ = inner[sl][top:top + 6]; ref += list(cell[top:top + 6][m_][:, :3].astype(int))
        ref = np.array(ref); lum = ref.sum(1); ref = np.unique(ref[(lum > 90) & (lum < 520)], axis=0)
    d = np.min([np.abs(rgb - c).sum(2) for c in ref], 0)
    cand = inner & (d < 26) & (yy < Hh * .5)
    lab, _ = ndimage.label(cand); keep = set(np.unique(lab[(yy < Hh * .25) & cand])) - {0}
    return np.isin(lab, list(keep)), ref
lines = []
for sex, path in (('h', 'docs/sprites/heros.jpg'), ('f', 'docs/sprites/heroine.jpg')):
    V = build(grid(os.path.join(ROOT, path)))
    for k, rows in V.items():
        W = int(np.ceil(2 * max(max(head_x(c), c.shape[1] - head_x(c)) for r in rows for c in r))) + 2; Hh = max(c.shape[0] for r in rows for c in r)
        sh = np.zeros((Hh * 3, W * 4, 4), 'uint8')
        for ri, r in enumerate(rows):
            for ci, c in enumerate(r): sh[ri * Hh:(ri + 1) * Hh, ci * W:(ci + 1) * W] = pad(c, W, Hh)
        hair, ref = hair_mask(sh, W, Hh, 4); REF[sex] = ref
        mk = np.zeros_like(sh); mk[..., 0] = hair * 255; mk[..., 3] = 255; eyes = np.zeros(1)
        Image.fromarray(sh).save(os.path.join(ROOT, f'assets/sprites/hero_{sex}_{k}.png'))
        fw = round(W * H / Hh)
        lines.append(f"  hero_{sex}_{k}: {{ fw: {fw}, fh: {H}, sw: {W}, sh: {Hh}, n: 4, url: '{to_url(sh)}', mask: '{to_url(mk)}' }}")
        print(sex, k, W, Hh, 'cheveux', int(hair.sum()), 'yeux', int(eyes.sum()))
p = os.path.join(ROOT, 'src/render/sheets.js'); js = open(p).read()
js = re.sub(r"\n  hero_[hf]_[pn]: \{[^\n]*", '', js)
head, tail = js.rsplit('};', 1); head = head.rstrip().rstrip(',')
js = head + ',\n' + ',\n'.join(lines) + '\n};' + tail
open(p, 'w').write(js)

# ---- 19/11 : coups d'outils (planches fournies) : 3 temps par direction (levée haute, levée, frappe), têtes alignées ;
# masque des cheveux pris avec les couleurs de cheveux de la planche de marche (pour ne pas teinter le manche).
TOOLS = [
    ('f', 'pick', 'docs/sprites/heroine-pioche.jpg', lambda F, L, B: [[F[3], F[2], F[1]], [B[2], B[2], B[0]], [L[2], L[2], L[0]]]),
    ('f', 'axe', 'docs/sprites/heroine-hache.jpg', lambda F, L, B: [[F[3], F[2], F[0]], [B[2], B[2], B[0]], [L[2], L[2], L[0]]]),
    ('h', 'axe', 'docs/sprites/heros-hache.jpg', lambda F, L, B: [[F[3], F[2], F[0]], [B[2], B[2], B[0]], [L[2], L[2], L[0]]]),
]
plines = []
for sex, tool, path, pick in TOOLS:
    F, L, R, B = grid(os.path.join(ROOT, path)); rows = pick(F, L, B)
    Hh = max(c.shape[0] for r in rows for c in r)
    half = max(max(head_x(c), c.shape[1] - head_x(c)) for r in rows for c in r); W = int(np.ceil(half * 2)) + 2
    sh = np.zeros((Hh * 3, W * 3, 4), 'uint8')
    for ri, r in enumerate(rows):
        for ci, c in enumerate(r):
            h, w = c.shape[:2]; x = int(round(W / 2 - head_x(c))); sh[ri * Hh + Hh - h:ri * Hh + Hh, ci * W + x:ci * W + x + w] = c
    hair, _ = hair_mask(sh, W, Hh, 3, REF[sex]); mk = np.zeros_like(sh); mk[..., 0] = hair * 255; mk[..., 3] = 255
    Image.fromarray(sh).save(os.path.join(ROOT, f'assets/sprites/hero_{sex}_{tool}.png'))
    plines.append(f"  hero_{sex}_{tool}: {{ fw: {round(W * H / Hh)}, fh: {H}, sw: {W}, sh: {Hh}, n: 3, url: '{to_url(sh)}', mask: '{to_url(mk)}' }}")
    print('outil', sex, tool, W, Hh, 'cheveux', int(hair.sum()))
js = open(p).read(); js = re.sub(r"\n  hero_[hf]_(pick|axe): \{[^\n]*", '', js)
head, tail = js.rsplit('};', 1); js = head.rstrip().rstrip(',') + ',\n' + ',\n'.join(plines) + '\n};' + tail
open(p, 'w').write(js)
