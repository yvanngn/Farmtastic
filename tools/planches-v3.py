# 21/11 : planches Gemini « toutes les poses en une demande » (grille 4 × 3 : face, dos, profil). Claude corrige les écarts.
# Par personnage : nom de la planche, image, hauteur (px du monde), profil fourni tourné vers la droite (True → retourné),
# corrections du dos (images sans l'accessoire : haut du corps repris d'une autre image).
import os, re, numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, 'tools/hero-sheets.py')).read(); exec(src[:src.index('\nlines = []')])
PL = [
  dict(name='simplet_v2', path='docs/sprites/simplet-v2.jpg', H=44, flip=True, backfix={0: 1, 2: 3}),   # pioche absente de dos en 1 et 3
  dict(name='myst_v3', path='docs/sprites/myst-v3.jpg', H=44, flip=True, backfix={}),
  dict(name='jade_v3', path='docs/sprites/jade-v3.jpg', H=32, flip=False, backfix={}),   # enfant : même taille que l'ancienne Jade ; profil déjà vers la gauche
]
def defringe(c, n=3):   # pixels gris clairs collés au fond (reste du blanc du JPEG) → transparents
    from scipy import ndimage
    c = c.copy()
    for _ in range(n):
        a = c[..., 3] > 0; rgb = c[..., :3].astype(int); edge = a & ndimage.binary_dilation(~a)
        grey = (rgb.max(2) - rgb.min(2) < 30) & (rgb.mean(2) > 120); c[edge & grey, 3] = 0
    return c
lines = []
for d in PL:
    F, B, P = grid(os.path.join(ROOT, d['path']))[:3]
    B = [compose(B[d['backfix'][i]], c, .5) if i in d['backfix'] else c for i, c in enumerate(B)]
    if d['flip']: P = [c[:, ::-1].copy() for c in P]
    rows = [[defringe(c) for c in r] for r in (F, B, P)]
    W = int(np.ceil(2 * max(max(head_x(c), c.shape[1] - head_x(c)) for r in rows for c in r))) + 2; Hh = max(c.shape[0] for r in rows for c in r)
    sh = np.zeros((Hh * 3, W * 4, 4), 'uint8')
    for ri, r in enumerate(rows):
        for ci, c in enumerate(r): sh[ri * Hh:(ri + 1) * Hh, ci * W:(ci + 1) * W] = pad(c, W, Hh)
    Image.fromarray(sh).save(os.path.join(ROOT, f"assets/sprites/{d['name']}.png"))
    lines.append(f"  {d['name']}: {{ fw: {round(W * d['H'] / Hh)}, fh: {d['H']}, sw: {W}, sh: {Hh}, n: 4, url: '{to_url(sh)}' }}"); print(d['name'], W, Hh)
p = os.path.join(ROOT, 'src/render/sheets.js'); js = open(p).read()
js = re.sub(r"\n  (" + '|'.join(d['name'] for d in PL) + r"): \{[^\n]*", '', js)
head, tail = js.rsplit('};', 1); head = head.rstrip().rstrip(',')
open(p, 'w').write(head + ',\n' + ',\n'.join(lines) + '\n};' + tail)
