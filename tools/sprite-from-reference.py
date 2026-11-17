# Planches de sprites tirées de docs/personnages-reference.jpg : découpe, fond retiré, réduction, contour coloré,
# images de marche (jambes décalées). Écrit assets/sprites/<nom>.png et src/render/sheets.js (images en data URL).
# Usage : python3 tools/sprite-from-reference.py
import base64, os
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
im = Image.open(os.path.join(ROOT, 'docs/personnages-reference.jpg')).convert('RGB')
K = 0.205   # échelle : ~155 px sur la planche → ~32 px dans le jeu
# nom : (face, profil, dos) en (x0, y0, x1, y1) ; profil tourné vers la gauche sauf rightSide
CHARS = {
  'heros':  dict(front=(48, 44, 119, 198), side=(145, 43, 212, 198), back=(49, 203, 119, 350)),
  'myst':   dict(front=(275, 42, 342, 199), side=(362, 42, 423, 199), back=(275, 200, 342, 350)),
  'luna':   dict(front=(474, 42, 537, 198), side=(560, 43, 624, 199), back=(558, 212, 622, 350)),
  'franck': dict(front=(674, 52, 744, 198), side=None, back=(678, 207, 745, 350)),
  'hailey': dict(front=(798, 40, 862, 199), side=(882, 44, 942, 198), back=(801, 210, 858, 350)),
  'manu':   dict(front=(983, 38, 1073, 199), side=(1080, 39, 1162, 198), back=(1081, 208, 1157, 350)),
  'igor':   dict(front=(1198, 45, 1280, 199), side=(1295, 49, 1373, 199), back=(1212, 209, 1289, 350)),
  'ed':     dict(front=(32, 405, 130, 563), side=(147, 410, 220, 563), back=(35, 573, 125, 715)),
  'suzie':  dict(front=(266, 411, 340, 564), side=(360, 413, 431, 564), back=(267, 576, 339, 715)),
  'jade':   dict(front=(492, 451, 579, 563), side=None, back=None),
  'remy':   dict(front=(629, 403, 693, 564), side=(721, 405, 780, 563), back=(719, 574, 776, 715)),
  'harry':  dict(front=(827, 404, 897, 563), side=(918, 406, 969, 563), back=(911, 573, 979, 715)),
  'esprit': dict(front=(1010, 413, 1087, 563), side=(1099, 415, 1159, 565), back=(1091, 577, 1159, 715)),
  'cocher': dict(front=(1197, 408, 1290, 564), side=None, back=(1296, 411, 1378, 562)),
}
RIGHT_SIDE = {'myst', 'suzie', 'esprit'}   # profils dessinés tournés vers la droite sur la planche (à retourner)
def cut(box):
    c = im.crop(box); px = c.load(); w, h = c.size; bg = (192, 192, 190)
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0)); po = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            if abs(r - bg[0]) + abs(g - bg[1]) + abs(b - bg[2]) > 40: po[x, y] = (r, g, b, 255)
    return out.crop(out.getbbox())
def shrink(s, H):
    w, h = s.size; nw = max(1, round(w * H / h)); small = s.resize((nw, H), Image.BOX); p = small.load()
    for y in range(H):
        for x in range(nw):
            r, g, b, a = p[x, y]
            p[x, y] = (min(255, r * 255 // a), min(255, g * 255 // a), min(255, b * 255 // a), 255) if a > 110 else (0, 0, 0, 0)
    return small
def outline(s):
    w, h = s.size; o = Image.new('RGBA', (w + 2, h + 2), (0, 0, 0, 0)); o.paste(s, (1, 1), s); p = o.load(); src = o.copy().load()
    for y in range(h + 2):
        for x in range(w + 2):
            if src[x, y][3]: continue
            nb = [src[x + a, y + b] for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1)) if 0 <= x + a < w + 2 and 0 <= y + b < h + 2 and src[x + a, y + b][3]]
            if nb: p[x, y] = (sum(n[0] for n in nb) // len(nb) * 38 // 100, sum(n[1] for n in nb) // len(nb) * 32 // 100, sum(n[2] for n in nb) // len(nb) * 30 // 100, 255)
    return o
def walk(s, view, k):
    if k == 0: return s
    w, h = s.size; out = s.copy(); hip = int(h * .72); legs = s.crop((0, hip, w, h)); out.paste((0, 0, 0, 0), (0, hip, w, h)); half = w // 2
    a, b = legs.crop((0, 0, half, h - hip)), legs.crop((half, 0, w, h - hip))
    if view == 'side': dx = 1 if k == 1 else -1; out.alpha_composite(a, (max(0, -dx), hip)); out.alpha_composite(b, (half + max(0, dx), hip))
    else: out.alpha_composite(a, (0, hip - (k == 1))); out.alpha_composite(b, (half, hip - (k == 2)))
    return out
os.makedirs(os.path.join(ROOT, 'assets/sprites'), exist_ok=True)
js = []
ONLY = {'heros', 'luna', 'franck', 'hailey'}   # les autres ont leurs planches de marche (tools/sprite-from-sheets.py)
for name, P in CHARS.items():
    if name not in ONLY: continue
    H = round((P['front'][3] - P['front'][1]) * K)
    fr = outline(shrink(cut(P['front']), H))
    sd = outline(shrink(cut(P['side']), H)) if P['side'] else fr
    if P['side'] and name in RIGHT_SIDE: sd = sd.transpose(Image.FLIP_LEFT_RIGHT)
    bk = outline(shrink(cut(P['back']), round((P['back'][3] - P['back'][1]) * K))) if P['back'] else fr
    views = {'front': fr, 'back': bk, 'side': sd}
    FW = max(v.size[0] for v in views.values()) + 2; FH = max(v.size[1] for v in views.values()) + 2
    sheet = Image.new('RGBA', (FW * 4, FH * 3), (0, 0, 0, 0))
    for row, v in enumerate(['front', 'back', 'side']):
        for col, k in enumerate([0, 1, 0, 2]):
            f = walk(views[v], v, k); sheet.alpha_composite(f, (col * FW + (FW - f.size[0]) // 2, row * FH + (FH - f.size[1])))
    path = os.path.join(ROOT, 'assets/sprites', name + '.png'); sheet.save(path)
    js.append(f"  {name}: {{ fw: {FW}, fh: {FH}, url: 'data:image/png;base64,{base64.b64encode(open(path, 'rb').read()).decode()}' }}")
    print(name, FW, FH)
# (src/render/sheets.js est écrit par tools/sprite-from-sheets.py, à lancer ensuite)
