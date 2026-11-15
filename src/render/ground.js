// Couche statique pré-rendue (sol texturé, rivages, clôtures, bâtiments).
// Reconstruite uniquement au changement de saison. L'eau animée est dessinée à part.
import { CFG } from '../config.js';
import { ground, isFence, isPond, rng } from '../world/map.js';
import { shade, disc } from './pixel.js';
import { BUILDINGS } from '../data/buildings.js';
const T = CFG.T;

export const GRASS = ['#6bb64a', '#58a23c', '#a8a347', '#e4ecef'];
export const WATER = '#3a7cc2';
// Fenêtres de la maison et du poulailler (px monde) : éclairées la nuit.
export const LIGHTS = [{ x: 51, y: 60, r: 46 }, { x: 384, y: 116, r: 26 }];

export function buildGround(season, built = {}) {
  const c = document.createElement('canvas'); c.width = CFG.W * T; c.height = CFG.H * T;
  const g = c.getContext('2d'), r = rng(99 + season);
  const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  const B = GRASS[season], tones = [B, B, B, shade(B, .93), shade(B, 1.06)];
  const water = (x, y) => isPond(x, y);

  for (let y = 0; y < CFG.H; y++) for (let x = 0; x < CFG.W; x++) {
    const t = ground(x, y), px = x * T, py = y * T;
    if (t === 'water') {
      const deep = water(x - 1, y) && water(x + 1, y) && water(x, y - 1) && water(x, y + 1);
      R(px, py, T, T, deep ? shade(WATER, .88) : WATER);
      if (!water(x, y - 1)) { R(px, py, T, 2, '#d8c38a'); R(px, py + 2, T, 1, '#bfe3f5'); }
      if (!water(x, y + 1)) R(px, py + T - 2, T, 2, shade(WATER, .75));
      if (!water(x - 1, y)) { R(px, py, 2, T, '#d8c38a'); R(px + 2, py, 1, T, '#bfe3f5'); }
      if (!water(x + 1, y)) { R(px + T - 2, py, 2, T, '#d8c38a'); R(px + T - 3, py, 1, T, '#bfe3f5'); }
      continue;
    }
    if (t === 'soil') {
      R(px, py, T, T, '#7a4c2a');
      for (let k = 2; k < T; k += 4) { R(px + 1, py + k, T - 2, 1, '#5e391e'); R(px + 1, py + k + 1, T - 2, 1, '#94643a'); }
      R(px, py, T, 1, '#5e391e'); R(px, py, 1, T, '#5e391e');
      continue;
    }
    if (t === 'path') {
      R(px, py, T, T, '#c9a66a');
      for (let k = 0; k < 6; k++) R(px + (r() * 15 | 0), py + (r() * 15 | 0), 1, 1, r() < .5 ? '#b08e56' : '#dcbf86');
      for (let k = 0; k < 2; k++) { const sx = px + 1 + (r() * 9 | 0), sy = py + 1 + (r() * 10 | 0); R(sx, sy, 5, 3, '#dcc394'); R(sx, sy + 3, 5, 1, '#a88650'); R(sx + 1, sy, 2, 1, '#eedcb2'); }
      continue;
    }
    // herbe : taches de tons + touffes + fleurs
    for (let by = 0; by < T; by += 4) for (let bx = 0; bx < T; bx += 4) R(px + bx, py + by, 4, 4, tones[r() * tones.length | 0]);
    for (let k = 0; k < 2; k++) {
      const sx = px + 1 + (r() * 12 | 0), sy = py + 2 + (r() * 10 | 0), d = shade(B, .78), l = shade(B, 1.18);
      R(sx, sy + 1, 1, 2, d); R(sx + 2, sy + 1, 1, 2, d); R(sx + 1, sy, 1, 3, d); R(sx + 1, sy, 1, 1, l);
    }
    if (season < 2 && r() < .05) {
      const col = ['#ffffff', '#f5e050', '#f07ab0', '#9ab8ff'][r() * 4 | 0], fx = px + 4 + (r() * 8 | 0), fy = py + 4 + (r() * 8 | 0);
      R(fx - 1, fy, 3, 1, col); R(fx, fy - 1, 1, 3, col); R(fx, fy, 1, 1, '#f2c230');
    }
    if (r() < .03) { R(px + 6, py + 9, 3, 2, '#9a958c'); R(px + 6, py + 9, 2, 1, '#c2bdb4'); }
    // berge sableuse au bord de l'eau
    if (water(x, y + 1)) R(px, py + T - 2, T, 2, '#d8c38a');
  }

  // clôtures
  for (let y = 0; y < CFG.H; y++) for (let x = 0; x < CFG.W; x++) {
    if (!isFence(x, y, built)) continue;
    const px = x * T, py = y * T;
    if (isFence(x - 1, y, built) || isFence(x + 1, y, built)) { R(px, py + 5, T, 2, '#b9864f'); R(px, py + 7, T, 1, '#6e4424'); R(px, py + 10, T, 2, '#b9864f'); R(px, py + 12, T, 1, '#6e4424'); }
    if (isFence(x, y - 1, built) || isFence(x, y + 1, built)) { R(px + 7, py, 2, T, '#b9864f'); R(px + 9, py, 1, T, '#6e4424'); }
    R(px + 5, py + 1, 6, 14, '#3f2615'); R(px + 6, py + 2, 4, 12, '#a8774a'); R(px + 6, py + 2, 1, 12, '#c99560'); R(px + 9, py + 2, 1, 12, '#7a4f2e');
    R(px + 5, py + 14, 6, 2, 'rgba(20,12,8,.25)');
  }

  drawGate(R);
  drawHouse(g, R);
  drawBin(R);
  if (built.coop) drawCoop(R); else drawLot(g, R, 'coop');
  if (built.pigsty) drawPigsty(R); else drawLot(g, R, 'pigsty');
  if (built.barn) drawBarn(R); else drawLot(g, R, 'barn');
  return c;
}

// Portail vers le village, en bas du chemin (tuile 16,35).
function drawGate(R) {
  const x = 16 * T, y = 35 * T;
  R(x - 6, y - 14, 3, 30, '#5b3a22'); R(x + T + 3, y - 14, 3, 30, '#5b3a22');
  R(x - 8, y - 18, T + 16, 4, '#7a4f2e'); R(x - 8, y - 18, T + 16, 1, '#a8774a');
  R(x - 2, y - 13, T + 4, 9, '#e8c26a'); R(x - 2, y - 13, T + 4, 1, '#fff0b0'); R(x - 2, y - 5, T + 4, 1, '#a8781e');
  R(x + 4, y - 11, 8, 1, '#5b3a22'); R(x + 4, y - 9, 6, 1, '#5b3a22'); R(x + 7, y - 7, 2, 1, '#5b3a22');
  R(x + 6, y + 2, 4, 8, '#dcc394'); R(x + 5, y + 8, 6, 2, '#dcc394'); R(x + 7, y + 10, 2, 2, '#dcc394');
}

function drawHouse(g, R) {
  const x0 = 36, x1 = 108, wallTop = 42, wallBot = 80;
  R(x0 - 2, wallBot, x1 - x0 + 4, 3, 'rgba(20,12,8,.3)');
  R(x0, wallTop, x1 - x0, wallBot - wallTop, '#c08552');
  for (let y = wallTop + 4; y < wallBot; y += 5) R(x0, y, x1 - x0, 1, '#9c6438');
  for (let y = wallTop; y < wallBot; y += 5) R(x0 + ((y * 7) % 30) + 6, y, 1, 5, '#9c6438');
  R(x0, wallTop, 2, wallBot - wallTop, '#a46a3c'); R(x1 - 2, wallTop, 2, wallBot - wallTop, '#8a552d');
  R(x0, wallBot - 3, x1 - x0, 3, '#7e5634');
  // toit en bardeaux
  for (let i = 0, y = 10; y < wallTop; i++, y += 4) {
    const inset = Math.max(0, 14 - i * 2), lx = x0 - 6 + inset, w = x1 - x0 + 12 - inset * 2;
    R(lx, y, w, 4, '#b8432f'); R(lx, y, w, 1, '#d4614a');
    for (let sx = lx + (i % 2 ? 3 : 0); sx < lx + w; sx += 6) R(sx, y + 1, 1, 3, '#8a2e22');
  }
  R(x0 - 7, wallTop - 2, x1 - x0 + 14, 3, '#6b2a1e');
  // cheminée
  R(92, 2, 9, 14, '#7d7680'); R(92, 2, 9, 2, '#a29ca6'); R(92, 7, 9, 1, '#5a545e'); R(95, 11, 1, 3, '#5a545e');
  // fenêtre + jardinière
  R(43, 51, 17, 14, '#f0e6d0'); R(45, 53, 13, 10, '#7fb6d9'); R(45, 53, 13, 3, '#a9d3ec'); R(51, 53, 1, 10, '#f0e6d0'); R(45, 57, 13, 1, '#f0e6d0');
  R(42, 65, 19, 4, '#8a5a32'); R(42, 65, 19, 1, '#a8774a');
  for (const [fx, col] of [[44, '#f07ab0'], [48, '#f5e050'], [52, '#ffffff'], [56, '#f07ab0']]) { R(fx, 63, 2, 2, col); R(fx, 65, 1, 1, '#4a8f36'); }
  // porte
  R(76, 56, 16, 24, '#4a2414'); R(78, 58, 12, 22, '#7a4426'); R(79, 60, 4, 8, '#8f5530'); R(85, 60, 4, 8, '#8f5530'); R(79, 70, 4, 8, '#8f5530'); R(85, 70, 4, 8, '#8f5530');
  R(87, 68, 2, 2, '#f2cf73'); R(74, 80, 20, 3, '#9a958c'); R(74, 80, 20, 1, '#c2bdb4');
}

function drawBin(R) {
  const x = 128, y = 66;
  R(x, y + 13, 16, 2, 'rgba(20,12,8,.3)');
  R(x, y + 2, 16, 12, '#3f2615'); R(x + 1, y + 3, 14, 10, '#9a6232');
  for (let i = 0; i < 3; i++) R(x + 1, y + 5 + i * 3, 14, 1, '#7a4a22');
  R(x - 1, y, 18, 4, '#3f2615'); R(x, y + 1, 16, 2, '#b87a40'); R(x, y + 1, 16, 1, '#d29a5c');
  R(x + 6, y + 7, 4, 3, '#f2cf73'); R(x + 6, y + 7, 4, 1, '#fff0b0');
}

function drawCoop(R) {
  const x = 366, y = 98;
  R(x, y + 26, 44, 3, 'rgba(20,12,8,.3)');
  R(x, y + 8, 44, 18, '#b8452f'); for (let i = 0; i < 44; i += 4) R(x + i, y + 8, 1, 18, '#93321f');
  R(x, y + 8, 44, 2, '#f0e6d0'); R(x, y + 24, 44, 2, '#f0e6d0');
  for (let i = 0; i < 8; i++) R(x - 3 + i * 3, y + 8 - i, 50 - i * 6, 1, i % 2 ? '#5a3a2a' : '#6e4a36');
  R(x + 16, y + 13, 12, 13, '#3b2414'); R(x + 16, y + 13, 12, 1, '#f0e6d0'); R(x + 21, y + 13, 1, 13, '#f0e6d0');
  R(x + 4, y + 13, 7, 6, '#f0e6d0'); R(x + 5, y + 14, 5, 4, '#7fb6d9');
}

// Emplacement vide : piquets, cordeau et petit panneau « charpentier ».
function drawLot(g, R, id) {
  const b = BUILDINGS[id], x = b.x0 * T, w = (b.x1 - b.x0 + 1) * T, y = 7 * T;
  R(x + 2, y + 2, w - 4, 12, 'rgba(120,84,48,.28)');
  for (const px of [x + 2, x + w - 4]) { R(px, y, 2, 8, '#8a5a32'); R(px, y, 2, 1, '#c99560'); }
  R(x + 3, y + 2, w - 6, 1, '#e8dcc0');
  const sx = x + w / 2 - 8; R(sx + 7, y + 4, 2, 10, '#5b3a22'); R(sx, y - 2, 16, 9, '#3f2615'); R(sx + 1, y - 1, 14, 7, '#e8c26a');
  R(sx + 3, y + 1, 10, 1, '#7a5a3a'); R(sx + 3, y + 3, 7, 1, '#7a5a3a');
}

// Porcherie (x19-21) : cabane de planches basse, toit de tôle, boue devant.
function drawPigsty(R) {
  const x = 19 * T - 1, y = 98, w = 3 * T + 2;
  R(x, y + 26, w, 3, 'rgba(20,12,8,.3)');
  R(x, y + 10, w, 16, '#9a6a3c'); for (let i = 0; i < w; i += 5) R(x + i, y + 10, 1, 16, '#7a4e2a');
  R(x, y + 10, w, 2, '#c99560');
  for (let i = 0; i < 6; i++) R(x - 3 + i, y + 9 - i, w + 6 - i * 2, 1, i % 2 ? '#8a9096' : '#a7adb3');
  R(x + 18, y + 15, 14, 11, '#3b2414'); R(x + 18, y + 15, 14, 1, '#c99560');
  R(x + 4, y + 14, 8, 6, '#3b2414'); R(x + 5, y + 15, 6, 4, '#ffd98a');
  R(x + 6, y + 28, w - 12, 6, '#6e4a2e'); R(x + 9, y + 29, 8, 2, '#8a5e3a'); R(x + 24, y + 30, 6, 2, '#8a5e3a');
}

// Bergerie (x27-30) : grange rouge à double pente, grande porte en croix.
function drawBarn(R) {
  const x = 27 * T - 1, y = 94, w = 4 * T + 2;
  R(x, y + 30, w, 3, 'rgba(20,12,8,.3)');
  R(x, y + 10, w, 20, '#b8452f'); for (let i = 0; i < w; i += 4) R(x + i, y + 10, 1, 20, '#93321f');
  R(x, y + 28, w, 2, '#f0e6d0');
  for (let i = 0; i < 10; i++) { const inset = i < 4 ? i : 4 + (i - 4) * 3; R(x - 3 + inset, y + 10 - i, w + 6 - inset * 2, 1, i % 2 ? '#5a3a2a' : '#6e4a36'); }
  R(x + 22, y + 15, 22, 15, '#f0e6d0'); R(x + 23, y + 16, 20, 14, '#6e2a1f');
  for (let k = 0; k < 14; k++) { R(x + 23 + k * 1.4, y + 16 + k, 2, 1, '#f0e6d0'); R(x + 42 - k * 1.4, y + 16 + k, 2, 1, '#f0e6d0'); }
  R(x + 4, y + 15, 10, 8, '#f0e6d0'); R(x + 5, y + 16, 8, 6, '#7fb6d9'); R(x + 9, y + 16, 1, 6, '#f0e6d0');
}

// Reflets animés sur l'eau, seulement pour les tuiles visibles.
export function drawWaterShimmer(c, x0, y0, x1, y1, t) {
  c.fillStyle = 'rgba(225,244,255,.6)';
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if (!isPond(x, y)) continue;
    const ph = Math.sin(t / 700 + x * 1.3 + y * .7);
    if (ph > .45) {
      const ox = 3 + ((t / 260 + x * 5) % 8 | 0), oy = 5 + ((x * 7 + y * 3) % 6);
      c.fillRect(x * T + ox, y * T + oy, ph > .8 ? 5 : 3, 1);
    }
  }
}
export { disc };
