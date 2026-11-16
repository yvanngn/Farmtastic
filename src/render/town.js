// Centre du village pré-rendu : place pavée, halle du marché, panneau d'affichage,
// fontaine, lampadaires, bancs, jardinières et arbres. Reconstruit à chaque saison.
import { CFG } from '../config.js';
import { LAYOUTS, QUARTIER, TOWN_B, TOWN_LAMPS, PARC_B } from '../world/scenes.js';
import { rng } from '../world/map.js';
import { shade, disc } from './pixel.js';
import { GRASS, drawLunaHouse, drawFranckHouse, drawMystHouse } from './ground.js';
import { treeSprite } from './sprites.js';
import { signBoard } from './pixfont.js';
const T = CFG.T;

// Lampadaires allumés la nuit (px du village).
export const TOWN_LIGHTS = TOWN_LAMPS.map(([x, y]) => ({ x: x * T + 8, y: y * T - 6, r: 40 }));

export function buildTown(season) {
  const L = LAYOUTS.town, H = L.length, W = L[0].length;
  const c = document.createElement('canvas'); c.width = W * T; c.height = H * T;
  const g = c.getContext('2d'), r = rng(31 + season);
  const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  const B = GRASS[season];

  // sol : herbe en bordure, pavés sur la place
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const px = x * T, py = y * T, ch = L[y][x];
    if (ch === 'g' || ch === 'T' || ch === 'D' || ch === 'W') {
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

  // halle du marché (x4-10, y2-4) : socle de pierre, poteaux, auvent rayé, étal garni
  const mx = TOWN_B.M.x * T, my = TOWN_B.M.y * T, mw = 7 * T;
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
  signBoard(R, mx + mw / 2, my - 16, 'MARCHÉ', 44);

  // panneau d'affichage (x14-16, y3) : toit, cadre, affiches épinglées
  const qx = TOWN_B.Q.x * T, qy = TOWN_B.Q.y * T;
  R(qx + 4, qy + 2, 3, 14, '#5b3a22'); R(qx + 3 * T - 7, qy + 2, 3, 14, '#5b3a22');
  R(qx + 1, qy - 22, 3 * T - 2, 26, '#5b3a22'); R(qx + 3, qy - 20, 3 * T - 6, 22, '#c9955a');
  for (let k = 0; k < 3 * T - 6; k += 3) R(qx + 3 + k, qy - 20, 1, 22, '#b48450');
  R(qx - 2, qy - 27, 3 * T + 4, 5, '#6b2a1e'); R(qx - 2, qy - 27, 3 * T + 4, 1, '#a8453a');
  for (let k = 0; k < 6; k++) {
    const ax = qx + 6 + (k % 3) * 14, ay = qy - 18 + (k >> 1 ? 9 : 0) + (k > 2 ? 0 : 0);
    R(ax, ay + (k > 2 ? 9 : 0), 10, 8, ['#fdf6e3', '#f6e7b0', '#e8f0f8'][k % 3]); R(ax + 2, ay + 2 + (k > 2 ? 9 : 0), 6, 1, '#8a7a6a'); R(ax + 2, ay + 4 + (k > 2 ? 9 : 0), 4, 1, '#8a7a6a'); R(ax + 4, ay - 1 + (k > 2 ? 9 : 0), 2, 2, '#d8443a');
  }

  // magasin d'amélioration (x17-20, y2-4) : échoppe en bois, toit d'ardoise, enseigne, sacs et caisses
  const ux = TOWN_B.U.x * T, uy = TOWN_B.U.y * T, uw = 4 * T;
  R(ux + 2, uy - 4, uw - 4, 3 * T + 2, '#8a5a32');
  for (let k = 0; k < 3 * T; k += 4) R(ux + 2, uy - 4 + k, uw - 4, 1, '#74482a');
  R(ux + uw - 12, uy - 4, 10, 3 * T + 2, '#6e4426');
  for (let i = 0; i < 9; i++) R(ux - 3 + (8 - i) * 2, uy - 24 + i * 2, uw + 6 - (8 - i) * 4, 2, i % 2 ? '#4f5a74' : '#5f6b88'); // toit : pointe en haut
  R(ux - 4, uy - 6, uw + 8, 3, '#3b4258');
  R(ux + 24, uy + 14, 16, 26, '#4a2c18'); R(ux + 26, uy + 16, 12, 24, '#6e4426'); R(ux + 35, uy + 28, 2, 2, '#e8c26a');
  R(ux + 6, uy + 8, 14, 12, '#3b2414'); R(ux + 7, uy + 9, 12, 10, '#ffd98a'); R(ux + 12, uy + 9, 1, 10, '#3b2414'); R(ux + 7, uy + 13, 12, 1, '#3b2414');
  R(ux + 44, uy + 8, 14, 12, '#3b2414'); R(ux + 45, uy + 9, 12, 10, '#ffd98a'); R(ux + 50, uy + 9, 1, 10, '#3b2414'); R(ux + 45, uy + 13, 12, 1, '#3b2414');
  // sacs et caisses devant
  disc(g, ux + 8, uy + 38, 5, '#c9a66a'); R(ux + 6, uy + 32, 4, 2, '#8a6a3a'); disc(g, ux + 9, uy + 37, 2, '#dcc394');
  R(ux + 46, uy + 32, 12, 10, '#a8774a'); R(ux + 46, uy + 32, 12, 2, '#c99560'); R(ux + 51, uy + 32, 2, 10, '#7a4f2e');
  signBoard(R, ux + uw / 2, uy - 3, 'AMÉLIORATIONS');

  // échoppe générique : murs de planches, toit, fenêtres, enseigne
  function shop(x0, y0, w, roofA, roofB, sign, deco) {
    const ux = x0 * T, uy = y0 * T, uw = w * T;
    R(ux + 2, uy - 4, uw - 4, 3 * T + 2, '#9a6a3c');
    for (let k = 0; k < 3 * T; k += 4) R(ux + 2, uy - 4 + k, uw - 4, 1, '#7e5430');
    R(ux + uw - 10, uy - 4, 8, 3 * T + 2, '#7a4e2a');
    for (let i = 0; i < 9; i++) R(ux - 3 + (8 - i) * 2, uy - 24 + i * 2, uw + 6 - (8 - i) * 4, 2, i % 2 ? roofA : roofB); // pointe en haut
    R(ux - 4, uy - 6, uw + 8, 3, '#3b2414');
    const dx = ux + uw / 2 - 8; R(dx, uy + 14, 16, 26, '#4a2c18'); R(dx + 2, uy + 16, 12, 24, '#6e4426'); R(dx + 11, uy + 28, 2, 2, '#e8c26a');
    R(ux + 5, uy + 8, 12, 12, '#3b2414'); R(ux + 6, uy + 9, 10, 10, '#ffd98a'); R(ux + 10, uy + 9, 1, 10, '#3b2414');
    if (w > 3) { R(ux + uw - 19, uy + 8, 12, 12, '#3b2414'); R(ux + uw - 18, uy + 9, 10, 10, '#ffd98a'); R(ux + uw - 14, uy + 9, 1, 10, '#3b2414'); }
    signBoard(R, ux + uw / 2, uy - 3, sign);
    deco(ux, uy, uw);
  }
  // charpentier (x4-7, y11-13) : planches empilées, scie, rondins
  shop(TOWN_B.J.x, TOWN_B.J.y, 4, '#7a3a22', '#94482a', 'CHARPENTIER', (ux, uy, uw) => {
    for (let k = 0; k < 3; k++) { R(ux - 2, uy + 36 - k * 3, 18, 3, ['#c99560', '#b07a48', '#d9a870'][k]); R(ux - 2, uy + 36 - k * 3, 18, 1, '#e8c08a'); }
    for (const [x, y] of [[uw - 6, 38], [uw - 1, 38], [uw - 4, 34]]) { disc(g, ux + x, uy + y, 3, '#7a4f2e'); disc(g, ux + x, uy + y, 2, '#c99560'); R(ux + x, uy + y, 1, 1, '#7a4f2e'); }
    R(ux + 20, uy + 22, 10, 3, '#c2c7cc'); for (let k = 0; k < 10; k += 2) R(ux + 20 + k, uy + 25, 1, 1, '#8a8f96'); R(ux + 30, uy + 21, 4, 5, '#7a4f2e');
  });
  // marchand d'animaux (x17-19, y11-13) : botte de foin, abreuvoir, fer à cheval
  shop(TOWN_B.A.x, TOWN_B.A.y, 3, '#2f5a3a', '#3b7048', 'ANIMAUX', (ux, uy, uw) => {
    R(ux - 3, uy + 32, 14, 10, '#e6c34a'); R(ux - 3, uy + 32, 14, 2, '#f5dd7a'); for (let k = 0; k < 14; k += 3) R(ux - 3 + k, uy + 35, 1, 6, '#c9a330');
    R(ux + uw - 12, uy + 36, 14, 6, '#7a4f2e'); R(ux + uw - 11, uy + 37, 12, 3, '#5a9ad0');
    R(ux + uw / 2 - 3, uy + 10, 6, 1, '#9aa0a8'); R(ux + uw / 2 - 3, uy + 10, 1, 4, '#9aa0a8'); R(ux + uw / 2 + 2, uy + 10, 1, 4, '#9aa0a8');
  });

  // boulangerie (x4-7, y16-18) : pains en vitrine, auvent crème
  shop(TOWN_B.O.x, TOWN_B.O.y, 4, '#c98a4a', '#e0a560', 'BOULANGERIE', (ux, uy, uw) => {
    R(ux + 4, uy + 22, 14, 6, '#8a5a32'); for (let k = 0; k < 3; k++) { disc(g, ux + 7 + k * 4, uy + 22, 2, '#d9a050'); R(ux + 6 + k * 4, uy + 21, 3, 1, '#f2c88a'); }
    R(ux + uw - 14, uy + 34, 10, 8, '#7a4f2e'); R(ux + uw - 13, uy + 32, 8, 3, '#e8c08a'); R(ux + uw - 12, uy + 31, 6, 1, '#f5dcae');
  });
  // boucherie (x10-13, y16-18) : auvent rayé rouge, jambons suspendus
  shop(TOWN_B.V.x, TOWN_B.V.y, 4, '#a83a32', '#f0e6d0', 'BOUCHERIE', (ux, uy, uw) => {
    for (const k of [6, 12]) { R(ux + k + 2, uy + 20, 1, 3, '#5b3a22'); disc(g, ux + k + 2, uy + 26, 3, '#c25a4a'); R(ux + k + 1, uy + 27, 3, 2, '#f0e6d0'); }
    R(ux + uw - 14, uy + 34, 12, 8, '#8a8f96'); R(ux + uw - 13, uy + 34, 10, 2, '#c2c7cc');
  });
  // poissonnerie (x17-20, y16-18) : auvent bleu, étal de glace et poissons
  shop(TOWN_B.Z.x, TOWN_B.Z.y, 4, '#2f5a8a', '#4a7cb0', 'POISSONNERIE', (ux, uy, uw) => {
    R(ux - 2, uy + 32, 20, 10, '#7a4f2e'); R(ux - 1, uy + 32, 18, 4, '#dff2fb');
    for (let k = 0; k < 3; k++) { R(ux + 1 + k * 6, uy + 33, 4, 2, ['#8aa8c0', '#e08a6a', '#a8b8c8'][k]); R(ux + 5 + k * 6, uy + 33, 1, 2, '#5a6a7a'); }
    R(ux + uw - 10, uy + 36, 8, 6, '#3a5a7a'); R(ux + uw - 9, uy + 37, 6, 2, '#6aa0c8');
  });

  // fontaine (x11-13, y8-10)
  const fx = TOWN_B.F.x * T + 24, fy = TOWN_B.F.y * T + 24;
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
  // panneau vers la forêt, près de la sortie est
  R(32 * T + 7, 8 * T + 6, 2, 12, '#5b3a22'); signBoard(R, 30 * T + 10, 8 * T + 2, 'FORÊT →');
  // villa de Manuel, le maire (x9-14, y22-25) : grande maison blanche, toit de tuiles, colonnes, haie taillée
  { const x0 = TOWN_B.W.x * T, x1 = (TOWN_B.W.x + 6) * T, top = TOWN_B.W.y * T, bot = (TOWN_B.W.y + 4) * T;
    R(x0 - 6, top - 4, x1 - x0 + 12, bot - top + 8, '#3e7a34'); R(x0 - 4, top - 2, x1 - x0 + 8, bot - top + 4, '#5a9a46');   // haie
    R(x0, top + 22, x1 - x0, bot - top - 22, '#f4efe4'); for (let y = top + 26; y < bot; y += 6) R(x0, y, x1 - x0, 1, '#ddd6c8');
    for (let i = 0; i < 8; i++) { const ins = Math.max(0, 12 - i * 2); R(x0 - 4 + ins, top + i * 3, x1 - x0 + 8 - ins * 2, 3, i % 2 ? '#b8432f' : '#c8553e'); }
    R(x0 - 5, top + 22, x1 - x0 + 10, 3, '#6b2a1e');
    for (const wx of [x0 + 8, x0 + 26, x1 - 34, x1 - 16]) { R(wx, top + 32, 10, 14, '#c8c0b0'); R(wx + 1, top + 33, 8, 12, '#7fb6d9'); R(wx + 1, top + 33, 8, 3, '#a9d3ec'); R(wx - 2, top + 32, 2, 14, '#3e5a7a'); R(wx + 10, top + 32, 2, 14, '#3e5a7a'); }
    const dx = (TOWN_B.W.x + 3) * T - 9; R(dx - 6, top + 26, 30, 4, '#e8e2d4');
    for (const cx of [dx - 5, dx + 20]) { R(cx, top + 30, 3, bot - top - 32, '#ffffff'); R(cx + 2, top + 30, 1, bot - top - 32, '#d8d2c4'); }
    R(dx, top + 40, 18, bot - top - 40, '#5a2e18'); R(dx + 1, top + 41, 8, bot - top - 42, '#7a4426'); R(dx + 9, top + 41, 8, bot - top - 42, '#7a4426'); R(dx + 7, top + 52, 2, 2, '#f2cf73'); R(dx + 10, top + 52, 2, 2, '#f2cf73');
    R(dx - 4, bot - 2, 26, 3, '#c2bdb4');
    for (const fx of [x0 + 4, x1 - 8]) { R(fx, bot - 8, 6, 6, '#8a5a32'); R(fx + 1, bot - 11, 4, 4, '#f07ab0'); } }
  return c;
}

// Quartier résidentiel (au sud de la ferme) : herbe, rue pavée, maisons de Luna et de Franck, arbres, bancs.
export function buildQuartier(season) {
  const L = LAYOUTS.quartier, H = L.length, W = L[0].length;
  const c = document.createElement('canvas'); c.width = W * T; c.height = H * T;
  const g = c.getContext('2d'), r = rng(57 + season);
  const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  const B = GRASS[season];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const px = x * T, py = y * T, ch = L[y][x];
    if (ch === '.' || ch === 'D') {
      R(px, py, T, T, '#a9a29a');
      for (let k = 0; k < 4; k++) { const sx = px + (k % 2) * 8 + ((y % 2) * 4), sy = py + (k >> 1) * 8; R(sx + 1, sy + 1, 6, 6, ['#bcb5ac', '#b3aca2', '#c6c0b7'][r() * 3 | 0]); R(sx + 1, sy + 6, 6, 1, '#8f887f'); }
      continue;
    }
    for (let by = 0; by < T; by += 4) for (let bx = 0; bx < T; bx += 4) R(px + bx, py + by, 4, 4, [B, B, shade(B, .93), shade(B, 1.06)][r() * 4 | 0]);
    if (r() < .06) { const col = ['#ffffff', '#f5e050', '#f07ab0'][r() * 3 | 0]; R(px + 7, py + 7, 3, 1, col); R(px + 8, py + 6, 1, 3, col); }
  }
  // haies et boîtes aux lettres devant chaque maison, bordure de trottoir
  for (const yy of [8, 17]) { R(T, yy * T - 1, (W - 2) * T, 2, '#8f887f'); R(T, (yy + 2) * T - 1, (W - 2) * T, 2, '#8f887f'); }
  const shift = (dx, dy) => (x, y, w, h, col) => R(x + dx, y + dy, w, h, col);
  const Q = QUARTIER;
  drawLunaHouse(shift((Q.luna.x - 18) * T, (Q.luna.y - 29) * T));
  drawFranckHouse(shift((Q.franck.x - 25) * T, (Q.franck.y - 29) * T));
  drawMystHouse(shift((Q.myst.x - 40) * T, (Q.myst.y - 1) * T));   // la maison de Myst, tout en bas à gauche, derrière les arbres
  // pancartes : qui habite là (à côté du perron)
  for (const [id, name] of [['luna', 'LUNA'], ['franck', 'FRANCK'], ['hailey', 'HAILEY'], ['myst', 'MYST']]) {
    const h = Q[id], rows = h.porch ? 4 : 3, sx = (h.door + 1) * T + 10, sy = (h.y + rows) * T + 2;
    R(sx - 1, sy + 4, 2, 10, '#5b3a22'); signBoard(R, sx, sy - 4, name);
  }
  // terrains libres pour de futurs habitants (piquets + panneau)
  { // clinique (x18-21, y4-6) : murs blancs, croix verte, auvent turquoise, porte vitrée (x19)
    const x0 = QUARTIER.clinique.x * T, y0 = QUARTIER.clinique.y * T, w = 4 * T;
    R(x0 + 1, y0 - 6, w - 2, 3 * T + 6, '#f4f6f2'); for (let k = 0; k < 3 * T; k += 6) R(x0 + 1, y0 - 6 + k, w - 2, 1, '#e2e6e0');
    for (let i = 0; i < 5; i++) R(x0 - 3 + i, y0 - 14 + i * 2, w + 6 - i * 2, 2, i % 2 ? '#4a8a84' : '#5aa8a0');
    R(x0 - 3, y0 - 5, w + 6, 2, '#2e5a56');
    R(x0 + w - 18, y0 - 2, 12, 12, '#ffffff'); R(x0 + w - 14, y0, 4, 8, '#3fbf6a'); R(x0 + w - 16, y0 + 2, 8, 4, '#3fbf6a');   // croix
    R(x0 + T + 2, y0 + 2 * T - 2, 14, 2 * T / 2 + 2, '#2e5a56'); R(x0 + T + 3, y0 + 2 * T - 1, 12, T, '#a8dce8'); R(x0 + T + 9, y0 + 2 * T - 1, 1, T, '#2e5a56');
    R(x0 + 4, y0 + 10, 12, 10, '#2e5a56'); R(x0 + 5, y0 + 11, 10, 8, '#a8dce8');
    R(x0 + T, y0 + 3 * T - 1, 16, 3, '#c2bdb4');
    signBoard(R, x0 + w / 2, y0 - 26, 'CLINIQUE');
  }
  { // maison de Hailey (x24-27, y4-6) : petite maison rose pâle, toit turquoise, jardinière, porte x25
    const x0 = QUARTIER.hailey.x * T, y0 = QUARTIER.hailey.y * T, w = 4 * T;
    R(x0 + 2, y0 - 4, w - 4, 3 * T + 4, '#f2dce0'); for (let k = 0; k < 3 * T; k += 5) R(x0 + 2, y0 - 4 + k, w - 4, 1, '#e4c8ce');
    for (let i = 0; i < 9; i++) R(x0 - 3 + (8 - i) * 2, y0 - 22 + i * 2, w + 6 - (8 - i) * 4, 2, i % 2 ? '#4a8a84' : '#5aa8a0');
    R(x0 - 4, y0 - 5, w + 8, 3, '#2e5a56');
    R(x0 + T + 2, y0 + 2 * T - 6, 12, T + 6, '#6a4a3e'); R(x0 + T + 3, y0 + 2 * T - 5, 10, T + 5, '#8a5e4a'); R(x0 + T + 10, y0 + 2 * T + 2, 2, 2, '#e8c26a');
    for (const wx of [x0 + 6, x0 + w - 18]) { R(wx, y0 + 8, 12, 11, '#6a4a3e'); R(wx + 1, y0 + 9, 10, 9, '#bfe3f5'); R(wx + 5, y0 + 9, 1, 9, '#6a4a3e'); R(wx - 1, y0 + 19, 14, 3, '#8a5a32'); R(wx, y0 + 17, 3, 2, '#f07ab0'); R(wx + 5, y0 + 17, 3, 2, '#f6d24a'); R(wx + 9, y0 + 17, 3, 2, '#f07ab0'); }
    R(x0 + T, y0 + 3 * T - 1, 16, 3, '#c2bdb4');
  }
  { const x0 = QUARTIER.lot.x * T, y0 = QUARTIER.lot.y * T; R(x0, y0, 4 * T, 3 * T, 'rgba(120,84,48,.18)'); for (const px of [x0, x0 + 4 * T - 2]) R(px, y0, 2, 8, '#8a5a32'); R(x0 + 2 * T - 1, y0 + T, 2, 12, '#5b3a22'); R(x0 + 2 * T - 9, y0 + T - 6, 18, 9, '#3f2615'); R(x0 + 2 * T - 8, y0 + T - 5, 16, 7, '#e8c26a'); }
  for (const x0 of []) { R(x0, 4 * T, 4 * T, 3 * T, 'rgba(120,84,48,.18)'); for (const px of [x0, x0 + 4 * T - 2]) R(px, 4 * T, 2, 8, '#8a5a32'); R(x0 + 2 * T - 1, 5 * T, 2, 12, '#5b3a22'); R(x0 + 2 * T - 9, 5 * T - 6, 18, 9, '#3f2615'); R(x0 + 2 * T - 8, 5 * T - 5, 16, 7, '#e8c26a'); }
  // bancs et lampadaires le long de la rue
  for (const [x, yb] of [[3 * T, 10], [33 * T, 10], [20 * T, 19], [28 * T, 19]]) { const by = yb * T; R(x, by + 6, 22, 3, '#8a5a32'); R(x, by + 6, 22, 1, '#c99560'); R(x + 1, by + 9, 2, 3, '#5b3a22'); R(x + 19, by + 9, 2, 3, '#5b3a22'); } for (const x of []) { R(x, 10 * T + 6, 22, 3, '#8a5a32'); R(x, 10 * T + 6, 22, 1, '#c99560'); R(x + 1, 10 * T + 9, 2, 3, '#5b3a22'); R(x + 19, 10 * T + 9, 2, 3, '#5b3a22'); }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (L[y][x] === 'T') g.drawImage(treeSprite(season, (x + y) % 4), x * T - 9, y * T - 28);
  return c;
}

// Montagne gelée et plage : sol par tuile (neige, sable, mer, lac gelé, sentier), sapins enneigés ou palmiers, grotte.
export function buildBiome(name, season) {
  const L = LAYOUTS[name], H = L.length, W = L[0].length;
  const c = document.createElement('canvas'); c.width = W * T; c.height = H * T;
  const g = c.getContext('2d'), r = rng(name === 'plage' ? 91 : 73);
  const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  const pal = { n: ['#eef3f8', '#e2eaf2', '#f8fbff'], s: ['#ecd9a4', '#e4cf94', '#f2e2b4'], a: ['#d2bc84', '#c8b078', '#dac690'], '.': ['#b08a5a', '#9c7848', '#bc966a'], T: null, D: null };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const ch = L[y][x], px = x * T, py = y * T;
    if (ch === 'w') {
      const lac = name === 'montagne';
      R(px, py, T, T, lac ? '#a8d4ec' : (y < 3 ? '#2f7ab8' : '#3f92cc'));
      for (let k = 0; k < 3; k++) R(px + (r() * 12 | 0), py + (r() * 14 | 0), 4, 1, lac ? '#d8eef8' : '#7cc0ec');
      if (lac && r() < .12) { R(px + 5, py + 5, 6, 5, '#2f6a9a'); R(px + 6, py + 6, 4, 3, '#4a8ac0'); }   // trou dans la glace
      continue;
    }
    if (ch === 'G') { R(px, py, T, T, '#5a5560'); R(px + (r() * 10 | 0), py + (r() * 10 | 0), 5, 4, '#6e6a76'); R(px, py, T, 2, '#f4f8fc'); continue; }
    const base = name === 'plage' ? (ch === '.' ? pal['.'] : ch === 'a' ? pal.a : pal.s) : (ch === '.' ? ['#c8d2dc', '#bcc6d2', '#d4dce4'] : pal.n);
    for (let by = 0; by < T; by += 4) for (let bx = 0; bx < T; bx += 4) R(px + bx, py + by, 4, 4, base[r() * 3 | 0]);
    if (name === 'plage' && ch === '.') { for (let k = 0; k < T; k += 4) R(px, py + k, T, 1, '#7a5a34'); }
    if (name === 'plage' && ch === 's' && r() < .05) { R(px + 6, py + 7, 3, 2, '#f4b0b8'); R(px + 7, py + 6, 1, 1, '#fff'); }   // coquillage
    if (name === 'montagne' && ch === 'n' && r() < .04) { R(px + 5, py + 8, 4, 3, '#9aa4b0'); R(px + 5, py + 8, 4, 1, '#ffffff'); }
  }
  if (name === 'plage') for (let x = 0; x < W * T; x += 3) R(x, 6 * T - 2 + Math.round(Math.sin(x / 9) * 2), 3, 3, '#ffffff');   // écume
  if (name === 'montagne') { // entrée de la grotte, fermée par des éboulis
    const gx = 28 * T, gy = 3 * T;
    R(gx - 6, gy - 8, 2 * T + 12, T + 12, '#3a3640'); R(gx - 2, gy - 4, 2 * T + 4, T + 8, '#0c0a10');
    for (const [a, b, w] of [[0, 10, 8], [10, 12, 9], [20, 9, 10], [5, 16, 7], [16, 17, 8]]) { R(gx + a - 2, gy + b, w, 6, '#7a7480'); R(gx + a - 2, gy + b, w, 1, '#a8a2ae'); }
    for (let k = 0; k < 8; k++) R(gx - 4 + k * 5, gy - 8, 3, 3 + (k % 3) * 2, '#d8eef8');   // stalactites de glace
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (L[y][x] === 'T') {
    const px = x * T, py = y * T;
    if (name === 'plage') { // palmier
      R(px + 7, py - 14, 3, 28, '#8a5a32'); for (let k = 0; k < 28; k += 4) R(px + 7, py - 14 + k, 3, 1, '#6a4426');
      for (const [dx, dy, w] of [[-8, -18, 10], [7, -18, 10], [-6, -22, 9], [5, -22, 9], [0, -24, 4]]) R(px + 5 + dx, py + dy, w, 3, '#3f8a34');
      R(px + 6, py - 16, 2, 2, '#6a4426'); R(px + 9, py - 15, 2, 2, '#6a4426');
    } else { // sapin enneigé
      R(px + 6, py + 8, 4, 8, '#5a3a22');
      for (let i = 0; i < 4; i++) { const w = 6 + i * 4; R(px + 8 - w / 2, py - 16 + i * 6, w, 6, '#2c5f4a'); R(px + 8 - w / 2, py - 16 + i * 6, w, 2, '#f4f8fc'); }
    }
  }
  return c;
}

// Parc d'attractions : pelouse, allées, guirlandes ; chaque attraction dessinée (la grande roue et le carrousel bougent : renderer).
export function buildParc(season) {
  const L = LAYOUTS.parc, H = L.length, W = L[0].length;
  const c = document.createElement('canvas'); c.width = W * T; c.height = H * T;
  const g = c.getContext('2d'), r = rng(303 + season);
  const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  const B = GRASS[season];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const px = x * T, py = y * T, ch = L[y][x];
    if (ch === '.' || ch === 'D') { R(px, py, T, T, (x + y) % 2 ? '#d8c8b0' : '#e4d6c0'); R(px, py, T, 1, '#c4b498'); continue; }
    for (let by = 0; by < T; by += 4) for (let bx = 0; bx < T; bx += 4) R(px + bx, py + by, 4, 4, [B, B, shade(B, .93), shade(B, 1.06)][r() * 4 | 0]);
  }
  const P = PARC_B, box = k => { const b = P[k]; return [b.x * T, b.y * T, b.w * T, b.h * T]; };
  { const [x, y, w, h] = box('R'); R(x + w / 2 - 14, y + h - 10, 28, 10, '#6a4a3a'); R(x + 6, y + h - 4, w - 12, 4, '#4a3a30'); }   // socle de la roue
  { const [x, y, w, h] = box('I'); R(x, y + h - 10, w, 10, '#a8302b'); for (let k = 0; k < w; k += 8) R(x + k, y + h - 10, 4, 10, '#f4ead2'); }   // plateau du carrousel
  { const [x, y, w, h] = box('x');   // montagnes russes : rails en bosses sur poteaux
    for (let k = 0; k <= w; k += 6) { const top = y + 14 + Math.round(Math.sin(k / 18) * 18 + Math.cos(k / 7) * 4); R(x + k, top + 4, 2, y + h - top - 4, '#8a5a32'); R(x + k - 3, top, 8, 3, '#c4342a'); R(x + k - 3, top + 3, 8, 1, '#3a2a28'); }
    R(x + 18, y + 2, 14, 8, '#3a8ae0'); R(x + 20, y + 4, 4, 3, '#ffe28a'); R(x + 26, y + 4, 4, 3, '#ffe28a'); }   // wagon
  { const [x, y, w, h] = box('y'); R(x, y, w, h, '#5a5560'); R(x + 2, y + 2, w - 4, h - 4, '#7a7480'); R(x, y, w, 4, '#f2c832');   // piste
    for (const [a, b, col] of [[10, 14, '#e8402a'], [40, 30, '#3a8ae0'], [70, 18, '#4ab04a']]) { R(x + a, y + b, 16, 10, col); R(x + a + 4, y + b + 2, 8, 4, '#bfe3f5'); R(x + a + 7, y + b - 10, 1, 10, '#2a2a30'); } }
  const booth = (k, roof, sign) => { const [x, y, w, h] = box(k); R(x, y + 8, w, h - 8, '#9a6a3c'); for (let i = 0; i < w; i += 8) R(x + i, y, 4, 9, roof), R(x + i + 4, y, 4, 9, '#f4ead2'); R(x + 4, y + 14, w - 8, 8, '#4a2a18'); signBoard(R, x + w / 2, y - 10, sign); };
  booth('z', '#e8402a', 'CHAMBOULE'); booth('q', '#3a8ae0', 'TIR');
  { const [x, y] = box('z'); for (const [a, b] of [[14, 15], [20, 15], [26, 15], [17, 11], [23, 11], [20, 7]]) R(x + a, y + b, 5, 4, ['#f2c832', '#4ab04a', '#e8402a'][(a + b) % 3]); }
  { const [x, y] = box('q'); for (let k = 0; k < 4; k++) { R(x + 6 + k * 9, y + 16, 6, 4, '#f2c832'); R(x + 10 + k * 9, y + 15, 2, 2, '#e8802a'); } }
  { const [x, y, w, h] = box('j');   // maison hantée
    R(x + 2, y + 14, w - 4, h - 14, '#4a4250'); for (let i = 0; i < 6; i++) R(x + 2 + i * 2, y + 14 - i * 3, w - 4 - i * 4, 3, '#2a2430');
    R(x + 10, y + 26, 10, 10, '#d8c070'); R(x + w - 20, y + 26, 10, 10, '#1a1420'); R(x + w / 2 - 6, y + h - 18, 12, 18, '#140e18');
    R(x + 14, y + 29, 2, 2, '#1a1420'); R(x + 18, y + 29, 2, 2, '#1a1420'); signBoard(R, x + w / 2, y - 6, 'FRISSONS'); }
  { const [x, y, w, h] = box('u'); R(x, y + 10, w, h - 10, '#f4b0c8'); for (let i = 0; i < w; i += 6) R(x + i, y + 4, 3, 7, '#f07ab0'), R(x + i + 3, y + 4, 3, 7, '#fff'); R(x + 6, y - 2, 8, 6, '#ffd0e8'); R(x + 9, y + 4, 1, 6, '#c9a330'); }
  for (let k = 0; k < W * T; k += 12) { R(k, 8 * T + 2 + Math.round(Math.sin(k / 30) * 3), 2, 2, ['#f2c832', '#e8402a', '#3a8ae0', '#4ab04a'][(k / 12 | 0) % 4]); }   // guirlande
  signBoard(R, 17 * T, 21 * T, 'FARM-LAND');
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (L[y][x] === 'T') g.drawImage(treeSprite(season, (x + y) % 4), x * T - 9, y * T - 28);
  return c;
}
