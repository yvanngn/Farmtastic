// Couche statique pré-rendue (sol texturé, rivages, clôtures, bâtiments).
// Reconstruite uniquement au changement de saison. L'eau animée est dessinée à part.
import { CFG } from '../config.js';
import { ground, isFence, isPond, rng } from '../world/map.js';
import { shade, disc } from './pixel.js';
import { BUILDINGS } from '../data/buildings.js';
import { signBoard } from './pixfont.js';
const T = CFG.T;

export const GRASS = ['#6bb64a', '#58a23c', '#a8a347', '#e4ecef'];
export const WATER = '#3a7cc2';
// Fenêtres de la maison et du poulailler (px monde) : éclairées la nuit.
export const LIGHTS = [{ x: 51, y: 60, r: 46 }, { x: 384, y: 116, r: 26 }, { x: 303, y: 484, r: 30 }];

export function buildGround(season, built = {}, fixed = { house: true, grange: true }) {
  const c = document.createElement('canvas'); c.width = CFG.W * T; c.height = CFG.H * T;
  const g = c.getContext('2d'), r = rng(99 + season);
  const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  const B = GRASS[season], tones = [B, B, B, shade(B, .93), shade(B, 1.06)];
  const water = (x, y) => isPond(x, y);

  for (let y = 0; y < CFG.H; y++) for (let x = 0; x < CFG.W; x++) {
    const t0 = ground(x, y), t = t0 === 'soil' ? 'grass' : t0, px = x * T, py = y * T; // le champ est en herbe tant qu'il n'est pas bêché
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
  drawHouse(g, R); if (!fixed.house) drawRuins(R, 2 * T + 4, 6 * T + 12, 10, 80, 'house');
  drawBin(R);
  drawGrange(R); if (!fixed.grange) drawRuins(R, 10 * T, 14 * T, 1 * T + 10 - 18, 5 * T, 'grange');
  drawStation(R);
  // panneau au bout de la route de l'est : « Centre-ville → »
  R(44 * T + 7, 6 * T + 6, 2, 12, '#5b3a22'); signBoard(R, 44 * T + 8, 6 * T + 2, 'CENTRE-VILLE →');
  drawFieldStakes(R);
  if (built.coop) drawCoop(R); else drawLot(g, R, 'coop');
  if (built.pigsty) drawPigsty(R); else drawLot(g, R, 'pigsty');
  if (built.barn) drawBarn(R); else drawLot(g, R, 'barn');
  if (built.kennel) drawKennel(R); else drawLot(g, R, 'kennel');
  return c;
}

// Portail vers le quartier, en bas du chemin (tuile 16,35). La route du village part à l'est (47,5).
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

// Entrée de la forêt (x0, y19-21) : arche de branches et petit panneau.
// Bâtiment délabré : trous dans le toit, planches clouées, porte arrachée, débris au sol.
function drawRuins(R, x0, x1, top, bot, kind) {
  const w = x1 - x0, hole = '#14100e';
  // toit percé et affaissé
  R(x0 + w * .18, top + 6, w * .2, 9, hole); R(x0 + w * .2, top + 6, w * .16, 2, '#4a2a1a');
  R(x0 + w * .55, top + 2, w * .14, 12, hole); R(x0 + w * .5, top + 13, w * .26, 2, '#5a3a22');
  for (let i = 0; i < 4; i++) R(x0 + w * .2 + i * 4, top + 8 + (i % 2) * 2, 2, 6, '#7a4f2e');   // chevrons à nu
  // murs : planches arrachées, mousse
  R(x0 + 4, bot - 26, 10, 6, hole); R(x0 + w - 16, bot - 20, 8, 9, hole);
  for (let i = 0; i < 6; i++) R(x0 + 2 + i * (w / 6), bot - 4, 4, 2, '#4e7a34');
  // ouvertures condamnées : planches en croix
  const dx = kind === 'house' ? 76 : 12 * T - 1, dw = kind === 'house' ? 16 : 18, dy = bot - 24;
  R(dx, dy, dw, 24, '#0e0c0c');
  for (let i = 0; i < 3; i++) R(dx - 2, dy + 4 + i * 7, dw + 4, 3, i % 2 ? '#8a6a48' : '#9c7a52');
  if (kind === 'house') { R(43, 51, 17, 14, '#2a2420'); R(41, 54, 21, 3, '#9c7a52'); R(41, 60, 21, 3, '#8a6a48'); }
  // débris devant
  R(x0 + 6, bot + 3, 12, 2, '#7a4f2e'); R(x0 + 10, bot + 6, 3, 3, '#8f887f'); R(x1 - 20, bot + 4, 10, 2, '#6a4426'); R(x1 - 8, bot + 7, 4, 2, '#9a958c');
}

// Gare de l'ouest : voie ferrée (x0, dès y13 jusqu'en bas), petit bâtiment (x1-3, y14-16), quai (x1-2, y17-23).
function drawStation(R) {
  for (let y = 13 * T; y < CFG.H * T; y += 4) R(1, y, 14, 2, '#6a4a30');                 // traverses
  R(3, 13 * T, 2, (CFG.H - 13) * T, '#8c8f96'); R(11, 13 * T, 2, (CFG.H - 13) * T, '#8c8f96');
  R(3, 13 * T, 1, (CFG.H - 13) * T, '#c2c6cc'); R(11, 13 * T, 1, (CFG.H - 13) * T, '#c2c6cc');
  R(1, 13 * T - 2, 14, 6, '#a8302b'); R(1, 13 * T - 2, 14, 2, '#d8443a');                // butoir
  const qx = 1 * T, qy = 17 * T;                                                          // quai
  R(qx, qy, 2 * T, 7 * T, '#a9a29a'); R(qx, qy, 2, 7 * T, '#f2d13b');
  for (let y = qy; y < qy + 7 * T; y += 8) R(qx + 2, y, 2 * T - 2, 1, '#8f887f');
  for (let x = qx + 8; x < qx + 2 * T; x += 8) R(x, qy, 1, 7 * T, '#8f887f');
  const bx = 1 * T, by = 14 * T, bw = 3 * T, bh = 3 * T;                                  // bâtiment
  R(bx, by + 10, bw, bh - 10, '#b5654a'); for (let y = by + 14; y < by + bh; y += 4) R(bx, y, bw, 1, '#94503a');
  R(bx - 3, by, bw + 6, 12, '#3e5a7a'); R(bx - 3, by, bw + 6, 2, '#5a7ea4'); R(bx - 3, by + 11, bw + 6, 2, '#2a4058');
  R(bx + 6, by + 22, 10, 10, '#f0e6d0'); R(bx + 7, by + 23, 8, 8, '#7fb6d9');
  R(bx + 26, by + 22, 12, bh - 22, '#4a2414'); R(bx + 27, by + 23, 10, bh - 23, '#7a4426');
  R(bx + 8, by + 14, 30, 6, '#f4ead2'); R(bx + 10, by + 16, 26, 1, '#3e5a7a'); R(bx + 10, by + 18, 18, 1, '#3e5a7a');   // panneau « GARE »
  R(qx + 4, qy + 5 * T, 22, 4, '#7a4f2e'); R(qx + 5, qy + 5 * T + 4, 2, 4, '#5b3a22'); R(qx + 23, qy + 5 * T + 4, 2, 4, '#5b3a22');   // banc
}

// Maison de Myst (x40-45, y1-3, porche y4) : vieille maison sombre à deux étages, toit mansardé, fenêtres hautes.
export function drawMystHouse(R) {
  const x0 = 40 * T, x1 = 46 * T, top = 1 * T - 4, bot = 4 * T + 6;
  R(x0 - 2, bot, x1 - x0 + 4, 4, 'rgba(10,8,12,.35)');
  R(x0 + 4, top + 16, x1 - x0 - 8, bot - top - 16, '#5e5a62');                          // façade
  for (let y = top + 20; y < bot; y += 4) R(x0 + 4, y, x1 - x0 - 8, 1, '#4a4650');
  R(x0, top + 2, x1 - x0, 16, '#2e2a34'); R(x0, top + 2, x1 - x0, 2, '#46404e');           // toit mansardé
  for (let i = 0; i < 4; i++) R(x0 + 2 + i * 2, top - 6 + i * 2, x1 - x0 - 4 - i * 4, 2, '#24212a');
  R(x0 + 30, top - 14, 34, 10, '#2e2a34'); R(x0 + 36, top - 20, 22, 6, '#24212a');         // tourelle centrale
  R(x0 + 44, top - 12, 6, 7, '#d8c070'); R(x0 + 46, top - 12, 1, 7, '#3a3440');            // une lucarne éclairée
  for (const wx of [x0 + 10, x0 + 30, x0 + 58, x0 + 76]) {                                // fenêtres hautes de l'étage
    R(wx - 1, top + 22, 10, 16, '#d8d2c4'); R(wx, top + 23, 8, 14, '#2a2834'); R(wx + 3, top + 23, 1, 14, '#d8d2c4');
  }
  for (const wx of [x0 + 10, x0 + 76]) { R(wx - 1, top + 44, 10, 14, '#d8d2c4'); R(wx, top + 45, 8, 12, '#3a3646'); }
  R(x0 + 4, top + 40, x1 - x0 - 8, 3, '#3a3640');                                          // corniche
  R(x0 + 4, bot - 10, x1 - x0 - 8, 3, '#7d7680');                                          // porche
  for (const px of [x0 + 6, x0 + 28, x0 + 62, x0 + 84]) R(px, bot - 22, 3, 14, '#d8d2c4');
  R(x0 + 4, bot - 24, x1 - x0 - 8, 3, '#3a3640');
  R(42 * T + 3, bot - 26, 10, 19, '#1c1418'); R(42 * T + 4, bot - 25, 8, 17, '#3a2420'); R(42 * T + 10, bot - 17, 1, 2, '#c9a330');   // porte
  R(42 * T, bot - 8, 16, 3, '#8f887f'); R(42 * T, bot - 5, 16, 3, '#77716a');               // marches
}

function drawForestArch(R) {
  const x = 0, y = 9 * T;
  R(x, y - 6, 6, 3 * T + 6, '#5b3a22'); R(x, y - 8, 14, 5, '#3e7a34'); R(x, y + 3 * T - 2, 14, 4, '#3e7a34');
  R(x + 2, y + T - 4, 22, 9, '#3f2615'); R(x + 3, y + T - 3, 20, 7, '#e8c26a');
  R(x + 6, y + T - 1, 12, 1, '#5b3a22'); R(x + 6, y + T + 1, 9, 1, '#5b3a22');
  R(x + 22, y + T + 5, 2, 10, '#5b3a22');
}

// Tout à l'est (x47, y16-20) : l'entrée de la Caverne sombre (la « mine »).
function drawWildGate(R) {   // entrée de la Caverne sombre : bloc rocheux, bouche noire, vieille grille
  const x = 47 * T, y = 16 * T;
  R(x - 10, y - 6, 26, 5 * T + 8, '#5a5560'); for (let k = 0; k < 5 * T; k += 6) R(x - 10 + (k % 12), y + k, 22, 1, '#46424c');
  R(x - 12, y - 8, 22, 6, '#6e6a76'); R(x - 8, y + 5 * T - 2, 24, 4, '#3a3640');
  R(x - 6, y + T + 6, 20, 2 * T + 6, '#0c0a10'); R(x - 4, y + T + 2, 16, 4, '#0c0a10'); R(x - 6, y + T + 6, 20, 2, '#2a2630');
  for (let k = 0; k < 4; k++) R(x - 4 + k * 5, y + T + 6, 1, 2 * T + 6, '#6a5a48');
  R(x - 6, y + 2 * T + 6, 20, 1, '#6a5a48'); R(x + 3, y + 2 * T + 8, 4, 4, '#c9a330');
}

// Piquets aux quatre coins du champ (x4-13, y8-13) : on voit où bêcher.
function drawFieldStakes(R) {
  for (const [x, y] of [[4 * T - 3, 8 * T - 4], [14 * T, 8 * T - 4], [4 * T - 3, 14 * T - 6], [14 * T, 14 * T - 6]]) { R(x, y, 3, 10, '#8a5a32'); R(x, y, 3, 2, '#c99560'); R(x - 1, y + 2, 5, 2, '#e8dcc0'); }
}
// Terre bêchée, dessinée par-dessus l'herbe (seulement les cases visibles).
export function drawSoil(c, x, y) {
  const px = x * T, py = y * T, R = (a, b, w, h, col) => { c.fillStyle = col; c.fillRect(px + a, py + b, w, h); };
  R(0, 0, T, T, '#7a4c2a');
  for (let k = 2; k < T; k += 4) { R(1, k, T - 2, 1, '#5e391e'); R(1, k + 1, T - 2, 1, '#94643a'); }
  R(0, 0, T, 1, '#5e391e'); R(0, 0, 1, T, '#5e391e');
}

// Grange de la maison (x10-13, y1-4) : vieille grange de planches grises, porte entrouverte sur le noir.
function drawGrange(R) {
  const x0 = 10 * T, x1 = 14 * T, top = 1 * T + 10, bot = 5 * T;
  R(x0 - 2, bot, x1 - x0 + 4, 3, 'rgba(20,12,8,.3)');
  R(x0, top, x1 - x0, bot - top, '#8a7a68'); for (let x = x0; x < x1; x += 5) R(x, top, 1, bot - top, '#6e604f');
  R(x0, top, x1 - x0, 2, '#a8987f');
  for (let i = 0; i < 10; i++) { const inset = i * 3; R(x0 - 4 + inset, top - i * 2 - 2, x1 - x0 + 8 - inset * 2, 2, i % 2 ? '#5a4a3e' : '#6e5c4c'); }
  R(x0 + 3, top + 10, 6, 5, '#3b3028'); R(x0 + 4, top + 11, 4, 3, '#22201e');
  const dx = 12 * T; R(dx - 1, top + 14, 18, bot - top - 14, '#3b3028'); R(dx + 1, top + 16, 14, bot - top - 16, '#0e0c0c');
  R(dx + 11, top + 16, 5, bot - top - 16, '#7a6a58'); R(dx + 12, top + 18, 1, bot - top - 20, '#5a4e40');
  R(dx - 2, bot, 20, 3, '#9a958c');
  R(x1 - 10, top + 30, 8, 6, '#c9a330'); R(x1 - 10, top + 30, 8, 2, '#f5dd7a');
}

// Maison de Franck (x25-29, y29-31) : maison grise et bleue, volets (dessinés à part), banc devant.
export function drawFranckHouse(R) {
  const x0 = 25 * T, x1 = 30 * T, top = 29 * T + 6, bot = 32 * T;
  R(x0 - 2, bot, x1 - x0 + 4, 3, 'rgba(20,12,8,.3)');
  R(x0, top, x1 - x0, bot - top, '#b8bcc4'); for (let y = top + 4; y < bot; y += 5) R(x0, y, x1 - x0, 1, '#9ca0aa');
  R(x0, bot - 3, x1 - x0, 3, '#7e828c');
  for (let i = 0, y = top - 26; y < top; i++, y += 4) {
    const inset = Math.max(0, 12 - i * 2), lx = x0 - 6 + inset, w = x1 - x0 + 12 - inset * 2;
    R(lx, y, w, 4, '#3e5a7a'); R(lx, y, w, 1, '#5a7a9a'); for (let sx = lx + (i % 2 ? 3 : 0); sx < lx + w; sx += 6) R(sx, y + 1, 1, 3, '#2a4058');
  }
  R(x0 - 7, top - 2, x1 - x0 + 14, 3, '#2a3a4e');
  R(x0 + 6, top + 6, 14, 12, '#e8e4dc'); R(x0 + 8, top + 8, 10, 8, '#3a3a4a');
  const dx = 27 * T; R(dx, top + 8, 16, bot - top - 8, '#2a3a4e'); R(dx + 2, top + 10, 12, bot - top - 10, '#4a5f7a'); R(dx + 11, top + 22, 2, 2, '#c9c2b0');
  R(dx - 2, bot, 20, 3, '#9a958c');
  // banc devant la maison
  const bx = 27 * T + 2, by = 33 * T + 4; R(bx - 6, by, 26, 3, '#8a5a32'); R(bx - 6, by, 26, 1, '#c99560'); R(bx - 6, by - 5, 26, 2, '#7a4f2e'); R(bx - 4, by + 3, 2, 5, '#3f2615'); R(bx + 16, by + 3, 2, 5, '#3f2615');
}

// Maison de Luna (x18-22, y29-31) : petite maison mauve, cartons devant, boîte aux lettres.
export function drawLunaHouse(R) {
  const x0 = 18 * T, x1 = 23 * T, top = 29 * T + 6, bot = 32 * T;
  R(x0 - 2, bot, x1 - x0 + 4, 3, 'rgba(20,12,8,.3)');
  R(x0, top, x1 - x0, bot - top, '#e8d8c0'); for (let y = top + 4; y < bot; y += 5) R(x0, y, x1 - x0, 1, '#cdb898');
  R(x0, top, 2, bot - top, '#d4c2a4'); R(x1 - 2, top, 2, bot - top, '#b8a482'); R(x0, bot - 3, x1 - x0, 3, '#9a8466');
  for (let i = 0, y = top - 26; y < top; i++, y += 4) {
    const inset = Math.max(0, 12 - i * 2), lx = x0 - 6 + inset, w = x1 - x0 + 12 - inset * 2;
    R(lx, y, w, 4, '#7a5a9a'); R(lx, y, w, 1, '#9a7aba'); for (let sx = lx + (i % 2 ? 3 : 0); sx < lx + w; sx += 6) R(sx, y + 1, 1, 3, '#5a3a7a');
  }
  R(x0 - 7, top - 2, x1 - x0 + 14, 3, '#4a2c5a');
  R(x0 + 6, top + 6, 14, 12, '#f4ead8'); R(x0 + 8, top + 8, 10, 8, '#ffd98a'); R(x0 + 12, top + 8, 1, 8, '#f4ead8'); R(x0 + 8, top + 11, 10, 1, '#f4ead8');
  R(x0 + 5, top + 18, 16, 3, '#8a5a32'); for (const [fx, col] of [[7, '#c9a0ff'], [11, '#ffffff'], [15, '#c9a0ff']]) R(x0 + fx, top + 16, 2, 2, col);
  const dx = 20 * T; R(dx, top + 8, 16, bot - top - 8, '#4a2c5a'); R(dx + 2, top + 10, 12, bot - top - 10, '#7a5a9a'); R(dx + 11, top + 22, 2, 2, '#f2cf73');
  R(dx - 2, bot, 20, 3, '#9a958c'); R(dx - 2, bot, 20, 1, '#c2bdb4');
  R(x1 - 12, top + 26, 9, 8, '#b8875a'); R(x1 - 12, top + 26, 9, 2, '#d4a878'); R(x1 - 8, top + 26, 1, 8, '#e8dcc0');
  R(x1 + 4, bot - 10, 2, 12, '#5b3a22'); R(x1 + 1, bot - 15, 8, 6, '#c9a0ff'); R(x1 + 1, bot - 15, 8, 1, '#e0c8ff'); R(x1 + 7, bot - 18, 1, 4, '#d8443a');
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

// Chenil (x31-32) : niche en bois au toit rouge, gamelle devant.
function drawKennel(R) {
  const x = 31 * T, y = 100, w = 2 * T;
  R(x, y + 26, w, 3, 'rgba(20,12,8,.3)');
  R(x + 2, y + 10, w - 4, 16, '#a8774a'); for (let i = 0; i < w; i += 4) R(x + 2 + i, y + 10, 1, 16, '#8a5a32');
  for (let i = 0; i < 8; i++) R(x + 8 - i, y + 2 + i, w - 16 + i * 2, 1, i % 2 ? '#a83a2a' : '#c8452f');
  R(x + 10, y + 15, 12, 11, '#2a1d18'); R(x + 12, y + 12, 8, 3, '#2a1d18');
  R(x + 2, y + 28, 7, 3, '#7a8aa0'); R(x + 3, y + 28, 5, 1, '#c99560');
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
