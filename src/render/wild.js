// Terres sauvages pré-rendues : herbe plus sombre et touffue, arbres serrés en bordure,
// rochers, sortie vers la ferme. Reconstruites à chaque saison.
import { CFG } from '../config.js';
import { LAYOUTS } from '../world/scenes.js';
import { rng } from '../world/map.js';
import { shade, disc } from './pixel.js';
import { GRASS } from './ground.js';
import { treeSprite, pineSprite } from './sprites.js';
const T = CFG.T;

export function buildWild(season, name = 'wild') {
  const L = LAYOUTS[name], H = L.length, W = L[0].length;
  const c = document.createElement('canvas'); c.width = W * T; c.height = H * T;
  const g = c.getContext('2d'), r = rng(77 + season);
  const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  const B = shade(GRASS[season], .88), tones = [B, B, shade(B, .9), shade(B, 1.08)];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const px = x * T, py = y * T;
    for (let by = 0; by < T; by += 4) for (let bx = 0; bx < T; bx += 4) R(px + bx, py + by, 4, 4, tones[r() * 4 | 0]);
    for (let k = 0; k < 3; k++) { const sx = px + 1 + (r() * 12 | 0), sy = py + 2 + (r() * 10 | 0), d = shade(B, .75); R(sx, sy + 1, 1, 2, d); R(sx + 2, sy + 1, 1, 2, d); R(sx + 1, sy, 1, 3, d); }
    if (L[y][x] === 'D') { R(px, py, T, T, '#5a4a3a'); R(px + 2, py + 2, 10, 12, '#2a2220'); R(px, py, T, 2, '#8a7a68'); }
  }
  // rochers (#) puis arbres (T), triés de haut en bas
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (L[y][x] === '#') {
    const px = x * T + 8, py = y * T + 9; disc(g, px, py + 1, 8, '#3c3843'); disc(g, px - 1, py, 7, '#6a6672'); disc(g, px - 3, py - 3, 3, '#9a96a2');
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (L[y][x] === 'T') {
    const v = (x * 7 + y * 3) % 4, im = (x + y) % 3 === 0 || (name === 'foret' && (x * y) % 5 === 1) ? pineSprite(season, v) : treeSprite(season, v);
    g.drawImage(im, x * T - 9, y * T - 26);
  }
  return c;
}

// Monstres : slimes vert ou bleu, cochon qui tire (sanglier sombre au lance-pierre).
export function drawMob(c, e, now) {
  const px = Math.round(e.x * T), py = Math.round(e.y * T), R = (a, b, w, h, col) => { c.fillStyle = col; c.fillRect(px + a, py + b, w, h); };
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(px - 6, py + 3, 12, 2);
  if (e.type === 'pig') {
    const f = e.hit > 0 ? '#ffffff' : '#9a6a6a', d = '#6e4648', bob = Math.round(Math.sin(now / 160 + e.x) * 1);
    R(-7, -8 + bob, 13, 9, f); R(-7, 0 + bob, 13, 1, d); R(3, -11 + bob, 7, 8, f); R(9, -8 + bob, 2, 4, d); R(10, -7 + bob, 1, 1, '#3a2020');
    R(5, -9 + bob, 1, 1, '#ffd84a'); R(3, -13 + bob, 2, 2, d); R(7, -13 + bob, 2, 2, d);
    R(-6, 1, 2, 3, d); R(-1, 1, 2, 3, d); R(3, 1, 2, 3, d);
    R(-9, -9 + bob, 3, 1, '#5b3a22'); R(-10, -11 + bob, 1, 3, '#5b3a22'); R(-8, -11 + bob, 1, 3, '#5b3a22'); // lance-pierre
    return;
  }
  const col = e.hit > 0 ? '#ffffff' : e.type === 'slime_b' ? '#4a8ae0' : '#56c45a', b = Math.round(Math.abs(Math.sin(now / (e.type === 'slime_b' ? 120 : 180) + e.x)) * 3);
  c.fillStyle = shade(col, .75); c.beginPath(); c.ellipse(px, py - 3 - b, 7, 5, 0, 0, 7); c.fill();
  c.fillStyle = col; c.beginPath(); c.ellipse(px, py - 4 - b, 6, 4.5, 0, 0, 7); c.fill();
  R(-3, -7 - b, 2, 2, '#fff'); R(-3, -5 - b, 2, 2, '#123'); R(2, -5 - b, 2, 2, '#123'); R(-4, -8 - b, 2, 1, shade(col, 1.4));
}

export function drawZRock(c, x, y, o) {
  const px = x * T + 8 + (o.shake > 0 ? Math.round(Math.sin(o.shake * 40)) : 0), py = y * T + 9;
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(px - 7, py + 4, 14, 2);
  const base = o.t === 'zrock3' ? ['#3d5a7a', '#5a86b0', '#a8d8ff'] : o.t === 'zrock2' ? ['#5a4a5e', '#7e6a82', '#c9a0d8'] : ['#57535e', '#827e8a', '#b4afba'];
  disc(c, px, py, 6, base[0]); disc(c, px - 1, py - 1, 5, base[1]); disc(c, px - 3, py - 3, 2, base[2]);
  if (o.t !== 'zrock1') { c.fillStyle = o.t === 'zrock3' ? '#e0f6ff' : '#e05a8a'; c.fillRect(px + 1, py - 2, 2, 2); c.fillRect(px - 2, py + 1, 1, 1); }
}

// Champignon au pied d'un arbre : chapeau coloré selon l'espèce, plus grand selon la taille.
export function drawShroom(c, x, y, m, color) {
  const k = m.size === 'l' ? 1.7 : m.size === 'm' ? 1.3 : 1, px = x * T + 8, py = y * T + 12;
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(px - 4 * k, py + 1, 8 * k, 2);
  c.fillStyle = '#f4ead8'; c.fillRect(px - 1 * k, py - 4 * k, 2 * k, 5 * k);
  c.fillStyle = color; c.beginPath(); c.ellipse(px, py - 4 * k, 4.5 * k, 3 * k, 0, Math.PI, 0); c.fill();
  c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(px - 2 * k, py - 6 * k, 1.5 * k, 1.2 * k);
}
