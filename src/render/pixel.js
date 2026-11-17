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
  return out;
}

// Cache borné : les sprites coûteux ne sont dessinés qu'une fois.
export function makeCache(max = 300) {
  const m = new Map();
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
