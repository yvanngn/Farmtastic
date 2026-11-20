# Lot 32 (21/11) : découpe les planches de décors fournies (docs/sprites/decors/*.jpg) en images à fond transparent
# (assets/decors/<nom>.png). Fond violet uni retiré par distance de couleur, objets séparés par composantes connexes ;
# les étiquettes écrites sous les filons sont ignorées (trop plates). Qualité d'origine gardée (pas de réduction).
import sys, json
from PIL import Image, ImageFilter
import numpy as np
from collections import deque

def cut(path, min_area=400, tol=26):
    im = Image.open(path).convert('RGB'); a = np.array(im).astype(int); H, W, _ = a.shape
    bg = np.median(np.concatenate([a[:8].reshape(-1, 3), a[-8:].reshape(-1, 3), a[:, :8].reshape(-1, 3), a[:, -8:].reshape(-1, 3)]), axis=0)
    fg = np.sqrt(((a - bg) ** 2).sum(2)) > tol
    seen = np.zeros_like(fg); comps = []
    for y in range(0, H, 2):
        for x in range(0, W, 2):
            if not fg[y, x] or seen[y, x]: continue
            q = deque([(y, x)]); seen[y, x] = 1; pts = []
            while q:
                cy, cx = q.popleft(); pts.append((cy, cx))
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = cy + dy, cx + dx
                    if 0 <= ny < H and 0 <= nx < W and fg[ny, nx] and not seen[ny, nx]: seen[ny, nx] = 1; q.append((ny, nx))
            if len(pts) < min_area: continue
            ys = [p[0] for p in pts]; xs = [p[1] for p in pts]
            comps.append(dict(x0=min(xs), y0=min(ys), x1=max(xs), y1=max(ys), n=len(pts)))
    return im, fg, comps

def save(im, fg, c, out, pad=2):
    x0, y0, x1, y1 = max(0, c['x0'] - pad), max(0, c['y0'] - pad), c['x1'] + pad + 1, c['y1'] + pad + 1
    rgb = im.crop((x0, y0, x1, y1)).convert('RGBA'); f = fg[y0:y1, x0:x1].copy(); h, w = f.shape
    bgk = np.zeros_like(f); q = deque([(y, x) for y in range(h) for x in (0, w - 1)] + [(y, x) for x in range(w) for y in (0, h - 1)])   # le fond = ce qui touche le bord
    for y, x in q: bgk[y, x] = not f[y, x]
    q = deque([(y, x) for y, x in q if not f[y, x]])
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not f[ny, nx] and not bgk[ny, nx]: bgk[ny, nx] = 1; q.append((ny, nx))
    m = Image.fromarray(((~bgk.astype(bool)) * 255).astype('uint8')).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))   # trous intérieurs bouchés
    rgb.putalpha(m); rgb.save(out); return rgb.size

if __name__ == '__main__' and sys.argv[1:] != ['--all']:
    src, prefix = sys.argv[1], sys.argv[2]
    im, fg, comps = cut(src)
    comps.sort(key=lambda c: (round(c['y0'] / 120), c['x0']))
    info = []
    for i, c in enumerate(comps):
        if (c['y1'] - c['y0']) < 30 and (c['x1'] - c['x0']) > 60: continue   # une étiquette de texte
        info.append(dict(i=i, **c))
    print(json.dumps(info))

# Noms des éléments de chaque planche, dans l'ordre de cut() trié (rangée, puis gauche → droite).
NAMES = {
  'nature': {0: 'cactus_grand', 1: 'sapin', 2: 'cypres', 3: 'arbre_fleurs', 4: 'cactus_petit', 5: 'broussaille', 6: 'rocher_grand', 7: 'rocher_bas',
             8: 'cailloux', 9: 'roche_pilier', 10: 'filon_cuivre', 11: 'filon_etain', 12: 'filon_argent', 13: 'caillou', 14: 'filon_fer', 15: 'roche_plate',
             16: 'filon_or', 17: 'filon_or2', 18: 'filon_cobalt', 20: 'filon_zinc', 21: 'filon_nickel'},
}
def run_all():
    out = {}
    for planche in ['nature', 'saloon', 'fontaine', 'diligence']:
        im, fg, comps = cut(f'docs/sprites/decors/{planche}.jpg')
        comps.sort(key=lambda c: (round(c['y0'] / 120), c['x0']))
        names = NAMES.get(planche)
        if not names:   # une planche = un objet (le plus gros), ou plusieurs vues pour la diligence
            big = sorted(comps, key=lambda c: -c['n'])
            if planche == 'diligence':
                vues = sorted(big[:4], key=lambda c: (c['y0'] > 380, c['x0']))
                names = {comps.index(c): n for c, n in zip(vues, ['diligence_droite', 'diligence_gauche', 'diligence_face', 'diligence_dos'])}
            else: names = {comps.index(big[0]): planche}
        for i, n in names.items(): out[n] = save(im, fg, comps[i], f'assets/decors/{n}.png')
    print(json.dumps(out))
if __name__ == '__main__' and sys.argv[1:] == ['--all']: run_all()
