# 21/11 : Simplet, le mineur, d'après la planche fournie (docs/sprites/simplet-v2.jpg : face, dos, profil droit ; 4 images).
# Corrections : de dos, la pioche manque dans les images 1 et 3 → haut du corps repris des images 2 et 4 ;
# le profil fourni regarde à droite → retourné (la rangée du jeu regarde à gauche, la droite = miroir).
import os, re, numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, 'tools/hero-sheets.py')).read(); exec(src[:src.index('\nlines = []')])
HH = 44
F, B, P = grid(os.path.join(ROOT, 'docs/sprites/simplet-v2.jpg'))[:3]
B = [compose(B[1], B[0], .5), B[1], compose(B[3], B[2], .5), B[3]]
P = [c[:, ::-1].copy() for c in P]
rows = [F, B, P]
W = int(np.ceil(2 * max(max(head_x(c), c.shape[1] - head_x(c)) for r in rows for c in r))) + 2; Hh = max(c.shape[0] for r in rows for c in r)
sh = np.zeros((Hh * 3, W * 4, 4), 'uint8')
for ri, r in enumerate(rows):
    for ci, c in enumerate(r): sh[ri * Hh:(ri + 1) * Hh, ci * W:(ci + 1) * W] = pad(c, W, Hh)
Image.fromarray(sh).save(os.path.join(ROOT, 'assets/sprites/simplet_v2.png'))
line = f"  simplet_v2: {{ fw: {round(W * HH / Hh)}, fh: {HH}, sw: {W}, sh: {Hh}, n: 4, url: '{to_url(sh)}' }}"
p = os.path.join(ROOT, 'src/render/sheets.js'); js = open(p).read()
js = re.sub(r"\n  simplet_v2: \{[^\n]*", '', js)
head, tail = js.rsplit('};', 1); head = head.rstrip().rstrip(',')
open(p, 'w').write(head + ',\n' + line + '\n};' + tail)
print('simplet_v2', W, Hh)
