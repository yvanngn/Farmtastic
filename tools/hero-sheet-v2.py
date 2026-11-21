# 21/11 : nouvelle planche du héros (avec sac) générée par l'utilisateur (docs/sprites/heros-v2.jpg, fond blanc) :
# 3 rangées (face, dos, profil gauche) × 4 images de marche toutes différentes. Même méthode que tools/hero-sheets.py
# (grille d'origine retrouvée, tête alignée d'une image à l'autre, masque des cheveux pour la couleur choisie) ;
# remplace seulement hero_h_p dans src/render/sheets.js.
import os, re, numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, 'tools/hero-sheets.py')).read().split('\nlines = []')[0].replace('range(0, 16, 4)', 'range(0, 12, 4)')
ns = {'__file__': os.path.join(ROOT, 'tools/hero-sheets.py')}; exec(src, ns)
# les rangées se touchent (pieds de face contre cheveux de dos) : on trace une fine ligne blanche là où elles se touchent le moins
im = np.array(Image.open(os.path.join(ROOT, 'docs/sprites/heros-v2.jpg')).convert('RGB')); Hs = im.shape[0]
ink = (im.astype(int).sum(2) < 600).sum(1)
for k in (1, 2):
    y0 = int(Hs * k / 3); y = min(range(y0 - 60, y0 + 60), key=lambda v: ink[v]); im[y - 5:y + 5] = 255   # une case de pixel d'origine (≈ 7,7 px)
tmp = '/tmp/heros-v2-sep.png'; Image.fromarray(im).save(tmp)
F, B, L = ns['grid'](tmp)
rows = [F, B, L]; head_x, pad, H = ns['head_x'], ns['pad'], ns['H']
W = int(np.ceil(2 * max(max(head_x(c), c.shape[1] - head_x(c)) for r in rows for c in r))) + 2; Hh = max(c.shape[0] for r in rows for c in r)
sh = np.zeros((Hh * 3, W * 4, 4), 'uint8')
for ri, r in enumerate(rows):
    for ci, c in enumerate(r): sh[ri * Hh:(ri + 1) * Hh, ci * W:(ci + 1) * W] = pad(c, W, Hh)
# Profil : Gemini n'a dessiné que des grands pas presque identiques. Les images 2 et 4 deviennent des « passages »
# (jambes réunies) : buste de l'image précédente + jambes de l'ancienne image à l'arrêt (docs/sprites/heros-profil-arret.png,
# même personnage), corps remonté d'1 pixel.
legs = np.array(Image.open(os.path.join(ROOT, 'docs/sprites/heros-profil-arret.png')).convert('RGBA'))
CUT = 31   # ligne de coupe (hanches), dans la case de la nouvelle planche
for ci, src_c in ((1, 0), (3, 2)):
    top = sh[2 * Hh:3 * Hh, src_c * W:(src_c + 1) * W].copy(); out = np.zeros_like(top)
    lh = legs.shape[0]; off = Hh - lh   # aligne les bas des cases (pieds)
    out[:CUT - 1] = top[1:CUT]                                       # buste remonté d'1 pixel
    for y in range(CUT - 1, Hh):
        ly = y - off + 1; out[y] = legs[ly, :W] if 0 <= ly < lh else 0
    sh[2 * Hh:3 * Hh, ci * W:(ci + 1) * W] = out
hair, _ = ns['hair_mask'](sh, W, Hh, 4)
mk = np.zeros_like(sh); mk[..., 0] = hair * 255; mk[..., 3] = 255
Image.fromarray(sh).save(os.path.join(ROOT, 'assets/sprites/hero_h_p.png'))
line = f"  hero_h_p: {{ fw: {round(W * H / Hh)}, fh: {H}, sw: {W}, sh: {Hh}, n: 4, url: '{ns['to_url'](sh)}', mask: '{ns['to_url'](mk)}' }}"
p = os.path.join(ROOT, 'src/render/sheets.js'); js = open(p).read()
js, n = re.subn(r"  hero_h_p: \{[^\n]*?\}(,?)", lambda m: line + m.group(1), js, count=1); assert n == 1   # garde la virgule de fin
open(p, 'w').write(js); print('hero_h_p', W, Hh, 'cheveux', int(hair.sum()))
