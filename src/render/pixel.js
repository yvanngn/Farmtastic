// Outils pixel art partagés : ombrage, disques pixelisés, contours, cache de sprites.

export function hex6(c) {
  return c.length === 4 ? '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3] : c;
}

// Éclaircit (f > 1) ou assombrit (f < 1) une couleur #rrggbb.
export function shade(c, f) {
  const n = parseInt(hex6(c).slice(1), 16);
  const k = v => Math.max(0, Math.min(255, Math.round(v * f)));
  return '#' + ((1 << 24) | (k(n >> 16) << 16) | (k((n >> 8) & 255) << 8) | k(n & 255)).toString(16).slice(1);
}

// Disque net (sans anticrénelage) dessiné ligne par ligne.
export function disc(c, cx, cy, r, col) {
  c.fillStyle = col;
  for (let dy = -r; dy <= r; dy++) {
    const w = Math.round(Math.sqrt(r * r - dy * dy));
    c.fillRect(cx - w, cy + dy, w * 2, 1);
  }
}

export function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

// Ajoute un contour sombre d'1 px autour de tout ce qui est opaque.
export function outline(src, col = '#2b1b14') {
  const w = src.width, h = src.height;
  const sil = canvas(w, h), k = sil.getContext('2d');
  k.drawImage(src, 0, 0);
  k.globalCompositeOperation = 'source-in';
  k.fillStyle = col; k.fillRect(0, 0, w, h);
  const out = canvas(w, h), o = out.getContext('2d');
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) o.drawImage(sil, dx, dy);
  o.drawImage(src, 0, 0);
  return harmonize(out);   // lot 11g : sprites dans la palette unique
}

// Cache borné : les sprites coûteux ne sont dessinés qu'une fois.
// 20/11 : toutes les images mises en cache, pour pouvoir tout redessiner (téléphone : le navigateur vide parfois les canvas en arrière-plan)
export const ALL_CACHES = [];
export const clearAllCaches = () => ALL_CACHES.forEach(m => m.clear());
export function makeCache(max = 300) {
  const m = new Map(); ALL_CACHES.push(m);
  return (key, build) => {
    let v = m.get(key);
    if (!v) { if (m.size >= max) m.clear(); v = build(); m.set(key, v); }
    return v;
  };
}

// Ombre ovale au sol.
// 7g : décalage des ombres selon l'heure (posé par le moteur de rendu à chaque image)
export const SHADOW = { dx: 0, sx: 1 };
export function groundShadow(c, cx, cy, rx, ry, a = 0.28) {
  c.fillStyle = `rgba(20,12,8,${a})`; cx += SHADOW.dx; rx = Math.round(rx * SHADOW.sx);
  for (let dy = -ry; dy <= ry; dy++) {
    const w = Math.round(rx * Math.sqrt(1 - (dy * dy) / (ry * ry)));
    c.fillRect(cx - w, cy + dy, w * 2, 1);
  }
}

// ---------- Lot 11g : palette unique et contours colorés ----------
// 48 couleurs tirées de tous les décors du jeu (k-moyennes sur les 4 saisons), + 3 couleurs vives pour les accents.
export const PALETTE = ['#1f281a', '#244f24', '#1f4633', '#5a331e', '#80341a', '#40444c', '#2d6446', '#6c4628', '#3b792f', '#7b5231', '#69564c', '#498e3b', '#535c67', '#b0402f', '#936339', '#3169a0', '#c25e1d', '#699e3f', '#918d3c', '#d44e3b', '#3578b8', '#a7764a', '#86a542', '#877574', '#85b74a', '#af8753', '#9caf45', '#b2a048', '#438fcc', '#7b8f97', '#bf965e', '#9c9286', '#eea23a', '#cfa667', '#c0ca53', '#a9a1a1', '#c9b079', '#deb26e', '#bcb7ab', '#e1c48a', '#96cbec', '#cdc5be', '#e9d29a', '#dfd5c6', '#f2e2b4', '#dfded9', '#e2eaee', '#f1f7fa',
  '#e070b0', '#8a6aaa', '#f2c832', '#f0a8a8', '#d08484'];   // accents (+ roses du cochon)
const PAL_RGB = PALETTE.map(c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)));
const PAL_CACHE = new Map();
export function nearest(r, g, b) {
  const k = (r << 16) | (g << 8) | b; let v = PAL_CACHE.get(k);
  if (v) return v;
  let bd = 1e18;
  for (const p of PAL_RGB) { const d = 2 * (r - p[0]) ** 2 + 4 * (g - p[1]) ** 2 + 3 * (b - p[2]) ** 2; if (d < bd) { bd = d; v = p; } }
  PAL_CACHE.set(k, v); return v;
}
// Ramène un canvas à la palette ; colored = contours colorés : un pixel presque noir au bord d'une forme claire
// prend la teinte sombre de sa voisine (fini les contours noirs).
export function harmonize(cv, colored = false) {
  if (!cv || !cv.getContext || cv.__pal) return cv;
  const g = cv.getContext('2d'), W = cv.width, H = cv.height, img = g.getImageData(0, 0, W, H), d = img.data;
  if (colored) {
    const src = new Uint8ClampedArray(d), dark = i => src[i + 3] > 0 && Math.max(src[i], src[i + 1], src[i + 2]) < 52;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4; if (!dark(i)) continue;
      let r = 0, gg = 0, b = 0, n = 0;
      for (const [a, c] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = x + a, yy = y + c; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; const j = (yy * W + xx) * 4; if (src[j + 3] > 0 && Math.max(src[j], src[j + 1], src[j + 2]) > 90) { r += src[j]; gg += src[j + 1]; b += src[j + 2]; n++; } }
      if (n) { d[i] = r / n * .42; d[i + 1] = gg / n * .38; d[i + 2] = b / n * .36; }   // teinte chaude, un peu brune
    }
  }
  const BAYER = [0, 0, 0, 0];   // tramage retiré (17/11) : il brouillait les textes et donnait du grain partout   // tramage 2 × 2 léger : des transitions douces au lieu d'aplats en escalier
  for (let i = 0, n = 0; i < d.length; i += 4, n++) if (d[i + 3]) { const x = n % W, y = n / W | 0, o = BAYER[(x & 1) + 2 * (y & 1)], p = nearest(Math.max(0, Math.min(255, d[i] + o)), Math.max(0, Math.min(255, d[i + 1] + o)), Math.max(0, Math.min(255, d[i + 2] + o))); d[i] = p[0]; d[i + 1] = p[1]; d[i + 2] = p[2]; }
  g.putImageData(img, 0, 0); cv.__pal = true;
  return cv;
}
