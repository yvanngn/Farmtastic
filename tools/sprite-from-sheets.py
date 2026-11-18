# Planches de marche fournies par l'utilisateur (docs/sprites/*.jpg) → planches du jeu (assets/sprites/<nom>.png).
# Chaque cellule : fond blanc retiré, recadrée, réduite à la même échelle pour tout le personnage, contour coloré.
# Lignes : face, dos, profil (tourné vers la gauche) ; autant de colonnes que d'images de marche.
# Les vues absentes des nouvelles planches viennent de l'ancienne (docs/personnages-reference.jpg).
# Puis : python3 tools/sprite-from-sheets.py && (régénère src/render/sheets.js avec toutes les planches)
import base64, os, json
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = lambda f: Image.open(os.path.join(ROOT, 'docs', f)).convert('RGB')
A, B, M, REF = D('sprites/manu-igor-ed-suzie.jpg'), D('sprites/jade-remy-harry-esprit-cocher.jpg'), D('sprites/myst.jpg'), D('personnages-reference.jpg')
def grid(x0, y0, x1, y1, cols, rows):
    cw, rh = (x1 - x0) / cols, (y1 - y0) / rows
    return [[(round(x0 + c * cw), round(y0 + r * rh), round(x0 + (c + 1) * cw), round(y0 + (r + 1) * rh)) for c in range(cols)] for r in range(rows)]
GA = grid(0, 0, 703, 383, 6, 3); GB = grid(703, 0, 1408, 383, 6, 3); GC = grid(0, 383, 703, 766, 6, 3); GD = grid(703, 383, 1408, 766, 6, 3)
GM = grid(0, 0, 942, 1136, 4, 3)
J = [[(0, 0, 110, 185), (110, 0, 226, 185), (226, 0, 336, 185)], [(0, 185, 110, 377), (110, 185, 226, 377), (226, 185, 336, 377)], [(0, 377, 110, 567), (110, 377, 226, 567), (226, 377, 336, 567)]]
R_ = [[(336, 0, 499, 185), (499, 0, 623, 185)], [(336, 185, 499, 377), (499, 185, 623, 377)]]
HA = [[(623, 0, 729, 185), (729, 0, 836, 185), (836, 0, 942, 185)], [(623, 377, 729, 567), (729, 377, 836, 567), (836, 377, 942, 567)]]
GH = [[(222, 572, 330, 762), (222, 762, 330, 952), (222, 952, 330, 1136)], [(342, 572, 450, 762), (342, 762, 450, 952), (342, 952, 450, 1136)]]
CO = [[(660, 572, 800, 762), (660, 952, 800, 1136)], [(660, 762, 800, 952)], [(800, 572, 942, 762), (800, 952, 942, 1136)]]
# nom : { vue : (image, [cellules]) , hauteur cible }
CH = {
  'manu':  dict(H=33, front=(A, GA[0]), back=(A, GA[1]), side=(A, GA[2])),
  'igor':  dict(H=33, front=(A, GB[0]), back=(A, GB[1]), side=(A, GB[2])),
  'ed':    dict(H=33, front=(A, GC[0]), back=(A, GC[1]), side=(A, GC[2])),
  'suzie': dict(H=32, front=(A, GD[0]), back=(A, GD[1]), side=(A, GD[2])),
  'jade':  dict(H=25, front=(B, J[0]), back=(B, J[1]), side=(B, J[2])),
  'remy':  dict(H=33, front=(B, R_[0]), back=(B, R_[1]), side=(REF, [(721, 405, 780, 563)])),
  'harry': dict(H=33, front=(B, HA[0]), back=(REF, [(911, 573, 979, 715)]), side=(B, HA[1])),
  'esprit': dict(H=33, front=(B, GH[0]), back=(REF, [(1091, 577, 1159, 715)]), side=(B, GH[1]), flipSide=True),
  'cocher': dict(H=33, front=(B, CO[0]), back=(B, CO[1]), side=(B, CO[2])),
}
def cut(img, box, ref=False):
    # fond retiré par remplissage depuis les bords (le blanc à l'intérieur du personnage, ex. veste de chef, est gardé)
    import numpy as np
    from scipy import ndimage
    m = 6; x0, y0, x1, y1 = box; c = img.crop(box if ref else (x0 + m, y0 + m, x1 - m, y1 - m)); a = np.array(c).astype(int)
    bg = np.array((192, 192, 190) if ref else (255, 255, 255)); near = np.abs(a - bg).sum(2) <= (40 if ref else 60)
    lab, _ = ndimage.label(near); edge = set(lab[0]) | set(lab[-1]) | set(lab[:, 0]) | set(lab[:, -1]); edge.discard(0)
    keep = ~np.isin(lab, list(edge))
    rgba = np.dstack([a, keep * 255]).astype('uint8'); o = Image.fromarray(rgba, 'RGBA')
    bb = o.getbbox(); return o.crop(bb) if bb else o
def shrink(s, k):
    w, h = s.size; nw, nh = max(1, round(w * k)), max(1, round(h * k)); small = s.resize((nw, nh), Image.BOX); p = small.load()
    for y in range(nh):
        for x in range(nw):
            r, g, b, a = p[x, y]
            p[x, y] = (min(255, r * 255 // a), min(255, g * 255 // a), min(255, b * 255 // a), 255) if a > 110 else (0, 0, 0, 0)
    return small
def defringe(s):   # retire le liseré blanc laissé par le fond autour de la silhouette
    p = s.load(); w, h = s.size
    for _ in range(2):
        q = s.copy().load()
        for y in range(h):
            for x in range(w):
                r, g, b, a = q[x, y]
                if a and r + g + b > 690 and any(not (0 <= x + i < w and 0 <= y + j < h) or not q[x + i, y + j][3] for i, j in ((1, 0), (-1, 0), (0, 1), (0, -1))): p[x, y] = (0, 0, 0, 0)
    return s
def outline(s):
    w, h = s.size; o = Image.new('RGBA', (w + 2, h + 2), (0, 0, 0, 0)); o.paste(s, (1, 1), s); p = o.load(); src = o.copy().load()
    for y in range(h + 2):
        for x in range(w + 2):
            if src[x, y][3]: continue
            nb = [src[x + a, y + b] for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1)) if 0 <= x + a < w + 2 and 0 <= y + b < h + 2 and src[x + a, y + b][3]]
            if nb: p[x, y] = (sum(n[0] for n in nb) // len(nb) * 38 // 100, sum(n[1] for n in nb) // len(nb) * 32 // 100, sum(n[2] for n in nb) // len(nb) * 30 // 100, 255)
    return o
# Personnages faits depuis les planches fournies (tools/sprite-from-planche.py, haute définition) : on n'y touche pas.
_fr0 = json.load(open(os.path.join(ROOT, 'assets/sprites/frames.json'))) if os.path.exists(os.path.join(ROOT, 'assets/sprites/frames.json')) else {}
HD = {k: v for k, v in _fr0.items() if len(v) == 5}
def hd(nm, im, n):   # champs de sheets.js : taille dans le monde (fw, fh) et, pour les planches HD, taille d'une image (sw, sh)
    if nm in HD: fw, fh, n, sw, sh = HD[nm]; return f"fw: {fw}, fh: {fh}, sw: {sw}, sh: {sh}, n: {n}"
    return f"fw: {im.width // n}, fh: {im.height // 3}, n: {n}"
out = dict(HD)
for name, C in CH.items():
    if name in HD: continue   # planche fournie (haute définition), faite par tools/sprite-from-planche.py
    rows = {}
    for v in ('front', 'back', 'side'):
        img, cells = C[v]; ref = img is REF
        rows[v] = [cut(img, b, ref) for b in cells]
    k = C['H'] / max(c.size[1] for c in rows['front'])   # même échelle pour tout le personnage (sur la face)
    for v in rows:
        kk = k if not (C[v][0] is REF) else C['H'] / max(c.size[1] for c in rows[v])
        rows[v] = [outline(defringe(shrink(c, kk))) for c in rows[v]]
        if v == 'side' and C.get('flipSide'): rows[v] = [c.transpose(Image.FLIP_LEFT_RIGHT) for c in rows[v]]
    n = max(len(r) for r in rows.values()); FW = max(c.size[0] for r in rows.values() for c in r) + 2; FH = max(c.size[1] for r in rows.values() for c in r) + 2
    sheet = Image.new('RGBA', (FW * n, FH * 3), (0, 0, 0, 0))
    for ri, v in enumerate(('front', 'back', 'side')):
        for ci in range(n):
            f = rows[v][ci % len(rows[v])]; sheet.alpha_composite(f, (ci * FW + (FW - f.size[0]) // 2, ri * FH + FH - f.size[1]))
    sheet.save(os.path.join(ROOT, 'assets/sprites', name + '.png')); out[name] = (FW, FH, n); print(name, FW, FH, n)
json.dump(out, open(os.path.join(ROOT, 'assets/sprites/frames.json'), 'w'))

# src/render/sheets.js : toutes les planches de assets/sprites (n = images par ligne ; 4 pour celles tirées de la planche de référence)
frames = out; js = []
for f in sorted(os.listdir(os.path.join(ROOT, 'assets/sprites'))):
    if not f.endswith('.png'): continue
    name = f[:-4]; im = Image.open(os.path.join(ROOT, 'assets/sprites', f)); n = frames.get(name, (0, 0, 4))[2]
    js.append(f"  {name}: {{ {hd(name, im, n)}, url: 'data:image/png;base64,{base64.b64encode(open(os.path.join(ROOT, 'assets/sprites', f), 'rb').read()).decode()}' }}")
open(os.path.join(ROOT, 'src/render/sheets.js'), 'w').write("""// Planches de sprites des personnages (ne pas modifier à la main) : tools/sprite-from-sheets.py (planches de marche fournies,
// docs/sprites/) et tools/sprite-from-reference.py (docs/personnages-reference.jpg). Lignes : face, dos, profil (vers la gauche) ;
// n images de marche par ligne. Intégrées en data URL pour marcher partout ; le dessin par code prend le relais tant qu'elles chargent.
export const SHEETS = {
""" + ',\n'.join(js) + "\n};\n")
