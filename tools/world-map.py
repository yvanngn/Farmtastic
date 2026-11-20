# 20/11 : dessine docs/carte-reelle.png à partir de docs/carte-reelle.json (tools/world-map.mjs).
import json, os
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = json.load(open(os.path.join(ROOT, 'docs/carte-reelle.json')))
PX = 6
COL = {'T': (40, 92, 44), 'g': (104, 160, 76), 's': (206, 170, 112), '.': (226, 204, 150), 'D': (220, 40, 40), 'w': (60, 120, 200), '^': (120, 116, 128),
       'f': (120, 80, 44), 'X': (150, 100, 70), 'H': (170, 70, 50), 'B': (170, 50, 40), 'h': (40, 92, 44), 'F': (226, 204, 150), 'K': (190, 140, 90), '!': (90, 60, 30), '$': (200, 60, 50)}
DEF = (150, 140, 130)
Z = {k: v for k, v in D.items() if v['pos']}
x0 = min(v['pos']['x'] for v in Z.values()); y0 = min(v['pos']['y'] for v in Z.values())
x1 = max(v['pos']['x'] + v['W'] for v in Z.values()); y1 = max(v['pos']['y'] + v['H'] for v in Z.values())
M = 4
im = Image.new('RGB', ((x1 - x0 + 2 * M) * PX, (y1 - y0 + 2 * M) * PX + 20), (24, 20, 32)); dr = ImageDraw.Draw(im)
try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 13); small = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ts', 9)
except Exception:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 13) if os.path.exists('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf') else ImageFont.load_default()
    small = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 10) if os.path.exists('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf') else ImageFont.load_default()
O = lambda v, x, y: ((v['pos']['x'] - x0 + M + x) * PX, (v['pos']['y'] - y0 + M + y) * PX + 20)
for k, v in Z.items():
    for y, row in enumerate(v['grid']):
        for x, ch in enumerate(row):
            px, py = O(v, x, y); dr.rectangle([px, py, px + PX - 1, py + PX - 1], fill=COL.get(ch, DEF))
    px, py = O(v, 0, 0); qx, qy = O(v, v['W'], v['H']); dr.rectangle([px - 1, py - 1, qx, qy], outline=(255, 255, 255))
for k, v in Z.items():
    seen = set()
    for d in v['doors']:
        px, py = O(v, d['x'], d['y']); dr.rectangle([px, py, px + PX - 1, py + PX - 1], fill=(255, 40, 200))
        key = (d['to'], d['side'])
        if key in seen: continue
        seen.add(key); B = D[d['to']]
        tx, ty = px + {'E': 8, 'W': -8, 'N': 0, 'S': 0}[d['side']], py + {'N': -12, 'S': 10, 'E': 0, 'W': 0}[d['side']]
        txt = '→ ' + B['name']; w = dr.textlength(txt, font=small)
        if d['side'] == 'W': tx -= w
        dr.rectangle([tx - 2, ty - 1, tx + w + 2, ty + 11], fill=(20, 16, 26)); dr.text((tx, ty), txt, fill=(255, 150, 230), font=small)
for k, v in Z.items():
    px, py = O(v, 0, 0); qx, _ = O(v, v['W'], 0); w = dr.textlength(v['name'], font=font)
    dr.rectangle([(px + qx) / 2 - w / 2 - 4, py + 2, (px + qx) / 2 + w / 2 + 4, py + 19], fill=(0, 0, 0)); dr.text(((px + qx) / 2 - w / 2, py + 3), v['name'], fill=(255, 240, 160), font=font)
dr.text((8, 3), 'Carte réelle du jeu (tools/world-map.mjs) — rose : sorties et où elles mènent. Zones non reliées : ' + (', '.join(D[k]['name'] for k in D if not D[k]['pos']) or 'aucune'), fill=(230, 230, 230), font=font)
im.save(os.path.join(ROOT, 'docs/carte-reelle.png')); print(im.size)
