# 21/11 : l'esprit de la vieille femme d'après la planche générée par l'utilisateur (docs/sprites/esprit-v2.jpg, fond vert) :
# 3 rangées (face, dos, profil gauche) × 4 temps de flottement. La 4e image de face et de dos montrait une autre robe
# (sans traînée) : elle est remplacée par la 2e. Même méthode que tools/hero-sheets.py. Écrit « esprit2 » dans sheets.js.
import os, re, numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, 'tools/hero-sheets.py')).read().split('\nlines = []')[0].replace('range(0, 16, 4)', 'range(0, 12, 4)')
ns = {'__file__': os.path.join(ROOT, 'tools/hero-sheets.py')}; exec(src, ns)
F, B, L = ns['grid'](os.path.join(ROOT, 'docs/sprites/esprit-v2.jpg'))
rows = [[F[0], F[1], F[2], F[1]], [B[0], B[1], B[2], B[1]], L]
head_x, pad = ns['head_x'], ns['pad']; FH = 40
W = int(np.ceil(2 * max(max(head_x(c), c.shape[1] - head_x(c)) for r in rows for c in r))) + 2; Hh = max(c.shape[0] for r in rows for c in r)
sh = np.zeros((Hh * 3, W * 4, 4), 'uint8')
for ri, r in enumerate(rows):
    for ci, c in enumerate(r): sh[ri * Hh:(ri + 1) * Hh, ci * W:(ci + 1) * W] = pad(c, W, Hh)
Image.fromarray(sh).save(os.path.join(ROOT, 'assets/sprites/esprit2.png'))
line = f"  esprit2: {{ fw: {round(W * FH / Hh)}, fh: {FH}, sw: {W}, sh: {Hh}, n: 4, url: '{ns['to_url'](sh)}' }}"
p = os.path.join(ROOT, 'src/render/sheets.js'); js = open(p).read()
js = re.sub(r"\n  esprit2: \{[^\n]*?\}(,?)", '', js)
head, tail = js.rsplit('};', 1); js = head.rstrip().rstrip(',') + ',\n' + line + '\n};' + tail
open(p, 'w').write(js); print('esprit2', W, Hh)
