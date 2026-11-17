// Farmwest (lot 7a) : palette Far West et peintres de sol partagés par toutes les zones (pré-rendu, une fois par saison).
// Style de docs/carte-region-farmwest.jpg : herbe chaude en brins, terre ocre, chemins de sable tassé avec ornières,
// trottoirs en planches dans le centre-ville. Chaque peintre dessine UNE case de 16 px : (R, r, px, py, x, y, ...).
import { shade } from './pixel.js';

export const T = 16;
// Herbe (une teinte par saison) : plus chaude et plus sèche que l'ancienne herbe « verte prairie ».
export const WEST_GRASS = ['#86ae46', '#9aac44', '#b2a048', '#e4ecef'];
export const OCHRE = ['#d4a868', '#d8ae6c', '#c9a062', '#e2dacd'];        // terre ocre (hiver : gelée)
export const ROAD = '#e2c48a', ROAD_D = '#c8a46a', ROAD_L = '#f0dcae';     // chemin de sable tassé
export const PLANK = '#a8774a', PLANK_D = '#7a5232', PLANK_L = '#c99560';   // planches (trottoirs, quais)

// Variation douce d'une case à l'autre : de grandes nappes de tons, sans damier.
const wave = (x, y) => Math.sin(x * .55) + Math.cos(y * .47) + Math.sin((x + y) * .23) * 1.4;

// Herbe en brins : nappe de ton, brins fins (ombre en bas, pointe claire), touffes et trèfles.
export function paintGrass(R, r, px, py, x, y, B, season = 0) {
  const base = shade(B, 1 + wave(x, y) * .028);
  R(px, py, T, T, base);
  if (r() < .3) { const cx = px + 3 + (r() * 10 | 0), cy = py + 3 + (r() * 10 | 0), dk = shade(base, .93); R(cx - 3, cy - 1, 7, 3, dk); R(cx - 2, cy - 2, 5, 5, dk); }
  for (let k = 0; k < 12; k++) {
    const bx = px + (r() * 16 | 0), by = py + 1 + (r() * 14 | 0), h = 1 + (r() * 3 | 0), t = r();
    R(bx, by, 1, h, shade(base, t < .5 ? .82 : t < .8 ? .9 : 1.12));
    if (t >= .8) R(bx, by, 1, 1, shade(base, 1.22));
  }
  if (r() < .2) { const sx = px + 2 + (r() * 10 | 0), sy = py + 4 + (r() * 8 | 0), d = shade(base, .74), l = shade(base, 1.2); R(sx, sy + 1, 1, 3, d); R(sx + 2, sy, 1, 4, d); R(sx + 4, sy + 1, 1, 3, d); R(sx + 2, sy, 1, 1, l); R(sx - 1, sy + 4, 7, 1, 'rgba(20,40,10,.18)'); }
  if (season < 2 && r() < .04) { const col = ['#ffffff', '#f5e050', '#f07ab0', '#9ab8ff'][r() * 4 | 0], fx = px + 4 + (r() * 8 | 0), fy = py + 4 + (r() * 8 | 0); R(fx - 1, fy, 3, 1, col); R(fx, fy - 1, 1, 3, col); R(fx, fy, 1, 1, '#f2c230'); }
}
// Terre ocre : grains, cailloux, touffes sèches.
export function paintOchre(R, r, px, py, x, y, season = 0) {
  const base = shade(OCHRE[season] || OCHRE[0], 1 + wave(x, y) * .03);
  R(px, py, T, T, base);
  for (let k = 0; k < 6; k++) R(px + (r() * 16 | 0), py + (r() * 16 | 0), 1, 1, shade(base, r() < .5 ? .88 : 1.08));
  if (r() < .12) { const sx = px + 3 + (r() * 9 | 0), sy = py + 5 + (r() * 7 | 0); R(sx, sy, 1, 3, '#9a7a3a'); R(sx + 2, sy - 1, 1, 4, '#b8923e'); R(sx + 4, sy, 1, 3, '#9a7a3a'); }
  if (r() < .05) { R(px + 6, py + 9, 4, 2, '#a08a6a'); R(px + 6, py + 9, 2, 1, '#d4c0a0'); }
}
// Chemin de sable tassé (rue du centre-ville, allées) : ornières de roues si horizontal / vertical.
export function paintRoad(R, r, px, py, x, y, ruts = 0) {
  R(px, py, T, T, ROAD);
  for (let k = 0; k < 6; k++) R(px + (r() * 15 | 0), py + (r() * 15 | 0), 2, 1, r() < .5 ? ROAD_D : ROAD_L);
  if (r() < .15) { R(px + 5, py + 8, 3, 2, '#b89a68'); R(px + 5, py + 8, 2, 1, '#e8d4ac'); }
  if (ruts === 1) { R(px, py + 4, T, 1, ROAD_D); R(px, py + 11, T, 1, ROAD_D); }   // ornières est-ouest
  if (ruts === 2) { R(px + 4, py, 1, T, ROAD_D); R(px + 11, py, 1, T, ROAD_D); }   // ornières nord-sud
}
// Bord adouci entre un chemin et l'herbe / la terre : liseré + brins qui débordent sur le chemin.
export function softEdge(R, r, px, py, side, col) {
  for (let k = 0; k < T; k += 2) {
    const len = r() < .6 ? 1 + (r() * 2 | 0) : 0; if (!len) continue;
    if (side === 'n') R(px + k, py, 1, len, col); else if (side === 's') R(px + k, py + T - len, 1, len, col);
    else if (side === 'w') R(px, py + k, len, 1, col); else R(px + T - len, py + k, len, 1, col);
  }
}
// Trottoir en planches (devant les commerces de l'Ouest).
export function paintPlanks(R, r, px, py, x, y) {
  R(px, py, T, T, PLANK);
  for (let k = 0; k < T; k += 4) { R(px, py + k, T, 1, PLANK_D); R(px + ((y * 5 + k * 3 + x * 7) % 12), py + k + 1, 1, 3, PLANK_D); }
  R(px, py, T, 1, PLANK_L);
  if (r() < .2) R(px + 3 + (r() * 9 | 0), py + 2 + (r() * 10 | 0), 1, 1, '#3a2a20');   // tête de clou
}

// ---------- Lot 7b : rivière, ponts en bois, falaises en terrasses ----------
const at = (L, x, y) => (L[y] || '')[x] || '';
// Rivière : bleu avec reflets, berge claire et écume du côté de la terre ferme.
export function paintRiver(R, r, px, py, x, y, L) {
  R(px, py, T, T, '#3a7ec0');
  for (let k = 0; k < 3; k++) R(px + (r() * 12 | 0), py + (r() * 14 | 0), 4, 1, '#7cc0ec');
  const land = c => c && c !== 'w' && c !== '=';
  if (land(at(L, x, y - 1))) { R(px, py, T, 2, '#c9a66a'); R(px, py + 2, T, 1, '#e8f4fc'); }
  if (land(at(L, x, y + 1))) { R(px, py + T - 2, T, 2, '#8a6a3a'); }
  if (land(at(L, x - 1, y))) { R(px, py, 2, T, '#c9a66a'); R(px + 2, py, 1, T, '#e8f4fc'); }
  if (land(at(L, x + 1, y))) { R(px + T - 2, py, 2, T, '#8a6a3a'); R(px + T - 3, py, 1, T, '#e8f4fc'); }
}
// Pont en bois : planches dans le sens de la traversée, garde-corps de chaque côté, eau visible dessous.
export function paintBridge(R, r, px, py, x, y, L) {
  const horiz = at(L, x - 1, y) === 'w' || at(L, x + 1, y) === 'w' ? false : true;   // l'eau à gauche / droite → on traverse de haut en bas
  R(px, py, T, T, '#2f6aa8');
  if (horiz) {   // traversée est-ouest : planches verticales, garde-corps en haut et en bas
    R(px, py + 2, T, 12, PLANK); for (let k = 0; k < T; k += 4) R(px + k, py + 2, 1, 12, PLANK_D);
    R(px, py + 1, T, 2, '#5b3a22'); R(px, py + 13, T, 2, '#5b3a22'); R(px + 2, py - 2, 2, 4, '#5b3a22'); R(px + 12, py + 12, 2, 4, '#5b3a22');
  } else {         // traversée nord-sud
    R(px + 2, py, 12, T, PLANK); for (let k = 0; k < T; k += 4) R(px + 2, py + k, 12, 1, PLANK_D);
    R(px + 1, py, 2, T, '#5b3a22'); R(px + 13, py, 2, T, '#5b3a22');
  }
}
// Falaise en terrasses (terre rouge de l'Ouest) : strates, arête claire en haut, ombre au pied, touffes sur les replats.
export function paintCliff(R, r, px, py, x, y, L, season = 0) {
  const top = at(L, x, y - 1) !== '^', foot = at(L, x, y + 1) !== '^';
  R(px, py, T, T, '#a8603e');
  for (let k = 2; k < T; k += 5) { R(px, py + k, T, 2, '#8a4a30'); R(px + ((x * 7 + k) % 12), py + k - 1, 4, 1, '#c27a50'); }
  for (let k = 0; k < 3; k++) R(px + (r() * 13 | 0), py + (r() * 13 | 0), 3, 2, r() < .5 ? '#7a4028' : '#c88a5a');
  if (top) { R(px, py, T, 3, season === 3 ? '#eef3f8' : '#86ae46'); R(px, py + 3, T, 1, '#6a3a24'); }   // replat herbeux (ou enneigé)
  if (foot) { R(px, py + T - 3, T, 3, 'rgba(40,20,10,.35)'); }   // ombre au pied de la falaise
}
