# Propositions de héros (recolorations des planches de l'utilisateur) avec une réduction plus nette :
# recoloration en haute résolution, palette réduite par personnage (k-means), pixel dominant par bloc, contour sombre net.
import os, colorsys, numpy as np
from PIL import Image, ImageDraw
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, 'tools/sprite-from-sheets.py')).read().split('out = {}')[0]
src = src.replace('r + g + b > 690', 'r + g + b > 600')
G = {'__file__': os.path.join(ROOT, 'tools/sprite-from-sheets.py')}; exec(src, G)
cut, A_, B_, M_, REF = G['cut'], G['A'], G['B'], G['M'], G['REF']
def recolor(im, rules):
    a = np.array(im).astype(float) / 255; rgb = a[..., :3]
    import matplotlib.colors as mc
    hsv = mc.rgb_to_hsv(rgb); h, s, v = hsv[..., 0] * 360, hsv[..., 1], hsv[..., 2]; done = np.zeros(h.shape, bool)
    for test, fn in rules:
        m = test(h, s, v) & ~done & (a[..., 3] > 0); nh, ns, nv = fn(h, s, v)
        hsv[..., 0] = np.where(m, (nh % 360) / 360, hsv[..., 0]); hsv[..., 1] = np.where(m, np.clip(ns, 0, 1), hsv[..., 1]); hsv[..., 2] = np.where(m, np.clip(nv, 0, 1), hsv[..., 2]); done |= m
    a[..., :3] = mc.hsv_to_rgb(hsv); return Image.fromarray((a * 255).astype('uint8'), 'RGBA')
def kmeans(X, k, it=12):
    rng = np.random.default_rng(1); C = X[rng.choice(len(X), k, replace=False)]
    for _ in range(it):
        L = ((X[:, None] - C[None]) ** 2).sum(2).argmin(1)
        for i in range(k):
            if (L == i).any(): C[i] = X[L == i].mean(0)
    return C
def crisp(im, k, C):
    a = np.array(im).astype(float); w, h = im.size; nw, nh = max(1, round(w * k)), max(1, round(h * k)); out = np.zeros((nh, nw, 4), 'uint8')
    for y in range(nh):
        for x in range(nw):
            blk = a[int(y / k):max(int(y / k) + 1, int((y + 1) / k)), int(x / k):max(int(x / k) + 1, int((x + 1) / k))].reshape(-1, 4)
            op = blk[blk[:, 3] > 128]
            if len(op) < len(blk) * 0.45: continue
            L = ((op[:, None, :3] - C[None]) ** 2).sum(2).argmin(1); cnt = np.bincount(L, minlength=len(C))
            # dominant, mais les détails sombres (yeux, contours internes) l'emportent s'ils sont assez présents
            dark = C.sum(1) < 150; best = cnt.argmax()
            dk = np.where(dark, cnt, 0).argmax()
            if dark[dk] and cnt[dk] >= len(op) * 0.3: best = dk
            sat = (C.max(1) - C.min(1)) / np.maximum(C.max(1), 1); vv = np.where(sat > 0.5, cnt, 0).argmax()   # couleurs vives (yeux, bandana)
            if sat[vv] > 0.5 and cnt[vv] >= len(op) * 0.25 and sat[best] < 0.5: best = vv
            out[y, x, :3] = C[best]; out[y, x, 3] = 255
    return Image.fromarray(out, 'RGBA')
def outline(s):
    a = np.array(s); w, h = s.size; o = np.zeros((h + 2, w + 2, 4), 'uint8'); o[1:-1, 1:-1] = a; al = o[..., 3] > 0
    nb = np.zeros_like(al)
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)): nb |= np.roll(np.roll(al, dy, 0), dx, 1)
    o[nb & ~al] = (36, 22, 18, 255); return Image.fromarray(o, 'RGBA')
def build(rows, H, rules=(), ncol=22):
    rows = {v: [recolor(cut(img, b, img is REF), rules) for img, b in cells] for v, cells in rows.items()}
    X = np.concatenate([np.array(c).reshape(-1, 4) for r in rows.values() for c in r]); X = X[X[:, 3] > 128][:, :3].astype(float)
    C = kmeans(X[::7], ncol); C = np.clip((C - 128) * 1.12 + 128, 0, 255)   # léger gain de contraste
    k = H / max(c.size[1] for c in rows['front'])
    rows = {v: [outline(G['defringe'](crisp(c, k, C).copy())) for c in r] for v, r in rows.items()}
    n = max(len(r) for r in rows.values()); FW = max(c.size[0] for r in rows.values() for c in r) + 2; FH = max(c.size[1] for r in rows.values() for c in r) + 2
    sh = Image.new('RGBA', (FW * n, FH * 3))
    for ri, v in enumerate(('front', 'back', 'side')):
        for ci in range(n):
            f = rows[v][ci % len(rows[v])]; sh.alpha_composite(f, (ci * FW + (FW - f.size[0]) // 2, ri * FH + FH - f.size[1]))
    return sh, (FW, FH, n)
cells = lambda img, L: [(img, b) for b in L]
GM, J, HA = G['GM'], G['J'], G['HA']
brun = [(lambda h, s, v: (v < 0.30) & (s < 0.45), lambda h, s, v: (h * 0 + 26, s * 0 + 0.55, v * 1.9 + 0.08))]
P = {
  'A': build(dict(front=cells(M_, GM[0]), back=cells(M_, GM[1]), side=cells(M_, GM[2])), 36, brun),
  'B': build(dict(front=cells(M_, GM[0]), back=cells(M_, GM[1]), side=cells(M_, GM[2])), 36),
  'C': build(dict(front=cells(B_, HA[0]), back=[(REF, (911, 573, 979, 715))], side=cells(B_, HA[1])), 35,
             [(lambda h, s, v: ((h < 8) | (h > 345)) & (s > 0.6), lambda h, s, v: (h * 0 + 215, s * 0.8, v)),
              (lambda h, s, v: (s < 0.2) & (v > 0.25) & (v < 0.7), lambda h, s, v: (h * 0 + 30, s * 0 + 0.45, v * 0.8))]),
  'D': build(dict(front=cells(B_, J[0]), back=cells(B_, J[1]), side=cells(B_, J[2])), 32,
             [(lambda h, s, v: (v < 0.25) | ((h > 190) & (h < 270) & (s < 0.45) & (v < 0.5)), lambda h, s, v: (h * 0 + 18, s * 0 + 0.75, v * 2.4 + 0.1)),
              (lambda h, s, v: (h > 190) & (h < 250) & (s > 0.25), lambda h, s, v: (h * 0 + 110, s * 0.7, v * 0.9))]),
  'E': build(dict(front=[(REF, (48, 44, 119, 198))], back=[(REF, (49, 203, 119, 350))], side=[(REF, (145, 43, 212, 198))]), 36),
}
os.makedirs('/tmp/prop', exist_ok=True)
for k_, (sh, fr) in P.items(): sh.save(f'/tmp/prop/hero_{k_}.png')
# planche de présentation : avant (actuel) / après, grossi ×5 sur herbe
W = sum(s.width + 24 for s, _ in P.values()); H = max(s.height for s, _ in P.values()) + 16
o = Image.new('RGBA', (W, H), (150, 186, 110, 255)); d = ImageDraw.Draw(o); x = 4
for k_, (sh, _) in P.items(): o.alpha_composite(sh, (x, 14)); d.text((x, 1), k_, fill=(30, 20, 10)); x += sh.width + 24
o.resize((W * 4, H * 4), Image.NEAREST).save('/tmp/prop/planche2.png')
