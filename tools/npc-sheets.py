# 19/11 : planches des habitants façon héros (Luna, Manu : docs/sprites/luna-v2.jpg, manu-v2.jpg). Lignes : face, profil, profil, dos ;
# 4 images (arrêt, pas, arrêt, pas). Même méthode que tools/hero-sheets.py : grille d'origine retrouvée, tête centrée dans chaque image.
# Sortie : sheets.js (luna_v2, manu_v2), rangées face / dos / profil (le profil de l'autre côté = miroir).
import os, re, sys, numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, 'tools/hero-sheets.py')).read(); exec(src[:src.index('\nlines = []')])
NPCS = [('luna_v2', 'docs/sprites/luna-v2.jpg', 40, 2), ('manu_v2', 'docs/sprites/manu-v2.jpg', 42, 1)]   # nom, planche, hauteur (px du monde), rangée de profil utilisée
lines = []
for name, path, HH, prow in NPCS:
    F, P1, P2, B = grid(os.path.join(ROOT, path)); P = [c[:, ::-1].copy() for c in (P1, P2)[prow - 1]]   # profils fournis tournés vers la droite : la rangée du jeu regarde à gauche
    rows = [F, B, P]
    W = int(np.ceil(2 * max(max(head_x(c), c.shape[1] - head_x(c)) for r in rows for c in r))) + 2; Hh = max(c.shape[0] for r in rows for c in r)
    sh = np.zeros((Hh * 3, W * 4, 4), 'uint8')
    for ri, r in enumerate(rows):
        for ci, c in enumerate(r): sh[ri * Hh:(ri + 1) * Hh, ci * W:(ci + 1) * W] = pad(c, W, Hh)
    Image.fromarray(sh).save(os.path.join(ROOT, f'assets/sprites/{name}.png'))
    lines.append(f"  {name}: {{ fw: {round(W * HH / Hh)}, fh: {HH}, sw: {W}, sh: {Hh}, n: 4, url: '{to_url(sh)}' }}")
    print(name, W, Hh)
p = os.path.join(ROOT, 'src/render/sheets.js'); js = open(p).read()
js = re.sub(r"\n  (luna|manu)_v2: \{[^\n]*", '', js)
head, tail = js.rsplit('};', 1); head = head.rstrip().rstrip(',')
open(p, 'w').write(head + ',\n' + ',\n'.join(lines) + '\n};' + tail)
