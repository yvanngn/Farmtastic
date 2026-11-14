// Centre du village pré-rendu : place pavée, halle du marché, panneau d'affichage,
// fontaine, lampadaires, bancs, jardinières et arbres. Reconstruit à chaque saison.
import { CFG } from '../config.js';
import { LAYOUTS } from '../world/scenes.js';
import { rng } from '../world/map.js';
import { shade, disc } from './pixel.js';
import { GRASS } from './ground.js';
import { treeSprite } from './sprites.js';
const T = CFG.T;

// Lampadaires allumés la nuit (px du village).
export const TOWN_LIGHTS = [[3, 7], [20, 7], [3, 12], [20, 12]].map(([x, y]) => ({ x: x * T + 8, y: y * T - 6, r: 40 }));

export function buildTown(season) {
  const L = LAYOUTS.town, H = L.length, W = L[0].length;
  const c = document.createElement('canvas'); c.width = W * T; c.height = H * T;
  const g = c.getContext('2d'), r = rng(31 + season);
  const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  const B = GRASS[season];

  // sol : herbe en bordure, pavés sur la place
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const px = x * T, py = y * T, ch = L[y][x];
    if (ch === 'g' || ch === 'T' || (ch === 'D')) {
      for (let by = 0; by < T; by += 4) for (let bx = 0; bx < T; bx += 4) R(px + bx, py + by, 4, 4, [B, B, shade(B, .93), shade(B, 1.06)][r() * 4 | 0]);
      if (ch === 'D') { R(px, py, T, T, '#c9a66a'); R(px + 3, py + 4, 5, 3, '#dcc394'); }
      continue;
    }
    R(px, py, T, T, '#a9a29a');
    for (let k = 0; k < 4; k++) {
      const sx = px + (k % 2) * 8 + ((y % 2) * 4), sy = py + (k >> 1) * 8;
      R(sx + 1, sy + 1, 6, 6, ['#bcb5ac', '#b3aca2', '#c6c0b7'][r() * 3 | 0]); R(sx + 1, sy + 6, 6, 1, '#8f887f'); R(sx + 1, sy + 1, 6, 1, '#d4cec6');
    }
  }
  // bordure de la place
  R(2 * T, T - 1, 20 * T, 2, '#8f887f'); R(2 * T, 15 * T - 1, 20 * T, 2, '#8f887f');

  // halle du marché (x4-10, y2-4) : socle de pierre, poteaux, auvent rayé, étal garni
  const mx = 4 * T, my = 2 * T, mw = 7 * T;
  R(mx - 2, my - 22, mw + 4, 3, '#6b2a1e');
  for (let i = 0; i < 7; i++) R(mx - 2 + i * 2, my - 22 + 3 + i * 2, mw + 4 - i * 4, 2, i % 2 ? '#8a3a2a' : '#a8453a');
  R(mx, my - 6, mw, 8, '#3f2615');
  for (let k = 0; k < mw; k += 8) { R(mx + k, my - 6, 4, 10, '#d8443a'); R(mx + k + 4, my - 6, 4, 10, '#f4ead2'); }
  for (let k = 0; k < mw; k += 8) { disc(g, mx + k + 2, my + 4, 2, '#d8443a'); disc(g, mx + k + 6, my + 4, 2, '#f4ead2'); }
  for (const px of [mx + 1, mx + mw - 4]) { R(px, my + 4, 3, 40, '#5b3a22'); R(px, my + 4, 1, 40, '#7a4f2e'); }
  R(mx + 4, my + 26, mw - 8, 14, '#7a4f2e'); R(mx + 4, my + 26, mw - 8, 3, '#b07a48'); R(mx + 4, my + 40, mw - 8, 4, '#5b3a22');
  const goods = ['#f2d13b', '#ef7b2a', '#e6c34a', '#fdf6e3', '#f4f1ea', '#d8443a', '#64ad3c'];
  for (let k = 0; k < 7; k++) {
    const bx = mx + 8 + k * 14; R(bx, my + 18, 12, 9, '#8a5a32'); R(bx, my + 18, 12, 2, '#a8774a');
    for (let j = 0; j < 5; j++) disc(g, bx + 3 + (j % 3) * 3, my + 17 - (j > 2 ? 2 : 0), 2, goods[(k + j) % goods.length]);
  }
  R(mx + mw / 2 - 22, my - 16, 44, 11, '#3f2615'); R(mx + mw / 2 - 21, my - 15, 42, 9, '#e8c26a');
  g.fillStyle = '#3b2414'; g.font = 'bold 8px Georgia'; g.textAlign = 'center'; g.fillText('MARCHÉ', mx + mw / 2, my - 8);

  // panneau d'affichage (x14-16, y3) : toit, cadre, affiches épinglées
  const qx = 14 * T, qy = 3 * T;
  R(qx + 4, qy + 2, 3, 14, '#5b3a22'); R(qx + 3 * T - 7, qy + 2, 3, 14, '#5b3a22');
  R(qx + 1, qy - 22, 3 * T - 2, 26, '#5b3a22'); R(qx + 3, qy - 20, 3 * T - 6, 22, '#c9955a');
  for (let k = 0; k < 3 * T - 6; k += 3) R(qx + 3 + k, qy - 20, 1, 22, '#b48450');
  R(qx - 2, qy - 27, 3 * T + 4, 5, '#6b2a1e'); R(qx - 2, qy - 27, 3 * T + 4, 1, '#a8453a');
  for (let k = 0; k < 6; k++) {
    const ax = qx + 6 + (k % 3) * 14, ay = qy - 18 + (k >> 1 ? 9 : 0) + (k > 2 ? 0 : 0);
    R(ax, ay + (k > 2 ? 9 : 0), 10, 8, ['#fdf6e3', '#f6e7b0', '#e8f0f8'][k % 3]); R(ax + 2, ay + 2 + (k > 2 ? 9 : 0), 6, 1, '#8a7a6a'); R(ax + 2, ay + 4 + (k > 2 ? 9 : 0), 4, 1, '#8a7a6a'); R(ax + 4, ay - 1 + (k > 2 ? 9 : 0), 2, 2, '#d8443a');
  }

  // fontaine (x11-13, y8-10)
  const fx = 11 * T + 24, fy = 8 * T + 24;
  disc(g, fx, fy + 2, 23, '#6f6a73'); disc(g, fx, fy, 22, '#9a958c'); disc(g, fx, fy, 18, '#3a7cc2'); disc(g, fx - 4, fy - 5, 6, '#6aa8e0');
  disc(g, fx, fy, 6, '#9a958c'); R(fx - 2, fy - 14, 4, 12, '#b4afb8'); disc(g, fx, fy - 15, 4, '#bfe3f5');
  for (const [a, b] of [[-9, 6], [8, -7], [10, 9], [-11, -4]]) R(fx + a, fy + b, 3, 1, '#e1f4ff');

  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const ch = L[y][x], px = x * T, py = y * T;
    if (ch === 'b') { R(px + 1, py + 6, 14, 3, '#a8774a'); R(px + 1, py + 6, 14, 1, '#c99560'); R(px + 1, py + 2, 14, 2, '#8a5a32'); R(px + 2, py + 9, 2, 5, '#3f2615'); R(px + 12, py + 9, 2, 5, '#3f2615'); }
    if (ch === 'f') { R(px + 1, py + 8, 14, 7, '#8a5a32'); R(px + 1, py + 8, 14, 2, '#a8774a'); for (let k = 0; k < 5; k++) { R(px + 2 + k * 3, py + 5, 2, 3, '#3e8a34'); R(px + 2 + k * 3, py + 4, 2, 2, ['#f07ab0', '#f5e050', '#ffffff', '#9ab8ff'][k % 4]); } }
    if (ch === 'L') { R(px + 7, py - 10, 2, 25, '#2b2730'); R(px + 5, py + 13, 6, 2, '#2b2730'); R(px + 4, py - 16, 8, 7, '#2b2730'); R(px + 5, py - 15, 6, 5, '#ffd98a'); R(px + 3, py - 17, 10, 2, '#3a3540'); }
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (L[y][x] === 'T') g.drawImage(treeSprite(season, (x + y) % 4), x * T - 9, y * T - 28);
  return c;
}
