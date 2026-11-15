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
  R(2 * T, T - 1, 20 * T, 2, '#8f887f'); R(2 * T, 21 * T - 1, 20 * T, 2, '#8f887f');

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

  // magasin d'amélioration (x17-20, y2-4) : échoppe en bois, toit d'ardoise, enseigne, sacs et caisses
  const ux = 17 * T, uy = 2 * T, uw = 4 * T;
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
  R(ux + 4, uy - 2, uw - 8, 9, '#3f2615'); R(ux + 5, uy - 1, uw - 10, 7, '#e8c26a');
  g.fillStyle = '#3b2414'; g.font = 'bold 6px Georgia'; g.textAlign = 'center'; g.fillText('AMÉLIORATIONS', ux + uw / 2, uy + 5);

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
    R(ux + 4, uy - 2, uw - 8, 9, '#3f2615'); R(ux + 5, uy - 1, uw - 10, 7, '#e8c26a');
    g.fillStyle = '#3b2414'; g.font = 'bold 6px Georgia'; g.textAlign = 'center'; g.fillText(sign, ux + uw / 2, uy + 5);
    deco(ux, uy, uw);
  }
  // charpentier (x4-7, y11-13) : planches empilées, scie, rondins
  shop(4, 11, 4, '#7a3a22', '#94482a', 'CHARPENTIER', (ux, uy, uw) => {
    for (let k = 0; k < 3; k++) { R(ux - 2, uy + 36 - k * 3, 18, 3, ['#c99560', '#b07a48', '#d9a870'][k]); R(ux - 2, uy + 36 - k * 3, 18, 1, '#e8c08a'); }
    for (const [x, y] of [[uw - 6, 38], [uw - 1, 38], [uw - 4, 34]]) { disc(g, ux + x, uy + y, 3, '#7a4f2e'); disc(g, ux + x, uy + y, 2, '#c99560'); R(ux + x, uy + y, 1, 1, '#7a4f2e'); }
    R(ux + 20, uy + 22, 10, 3, '#c2c7cc'); for (let k = 0; k < 10; k += 2) R(ux + 20 + k, uy + 25, 1, 1, '#8a8f96'); R(ux + 30, uy + 21, 4, 5, '#7a4f2e');
  });
  // marchand d'animaux (x17-19, y11-13) : botte de foin, abreuvoir, fer à cheval
  shop(17, 11, 3, '#2f5a3a', '#3b7048', 'ANIMAUX', (ux, uy, uw) => {
    R(ux - 3, uy + 32, 14, 10, '#e6c34a'); R(ux - 3, uy + 32, 14, 2, '#f5dd7a'); for (let k = 0; k < 14; k += 3) R(ux - 3 + k, uy + 35, 1, 6, '#c9a330');
    R(ux + uw - 12, uy + 36, 14, 6, '#7a4f2e'); R(ux + uw - 11, uy + 37, 12, 3, '#5a9ad0');
    R(ux + uw / 2 - 3, uy + 10, 6, 1, '#9aa0a8'); R(ux + uw / 2 - 3, uy + 10, 1, 4, '#9aa0a8'); R(ux + uw / 2 + 2, uy + 10, 1, 4, '#9aa0a8');
  });

  // boulangerie (x4-7, y16-18) : pains en vitrine, auvent crème
  shop(4, 16, 4, '#c98a4a', '#e0a560', 'BOULANGERIE', (ux, uy, uw) => {
    R(ux + 4, uy + 22, 14, 6, '#8a5a32'); for (let k = 0; k < 3; k++) { disc(g, ux + 7 + k * 4, uy + 22, 2, '#d9a050'); R(ux + 6 + k * 4, uy + 21, 3, 1, '#f2c88a'); }
    R(ux + uw - 14, uy + 34, 10, 8, '#7a4f2e'); R(ux + uw - 13, uy + 32, 8, 3, '#e8c08a'); R(ux + uw - 12, uy + 31, 6, 1, '#f5dcae');
  });
  // boucherie (x10-13, y16-18) : auvent rayé rouge, jambons suspendus
  shop(10, 16, 4, '#a83a32', '#f0e6d0', 'BOUCHERIE', (ux, uy, uw) => {
    for (const k of [6, 12]) { R(ux + k + 2, uy + 20, 1, 3, '#5b3a22'); disc(g, ux + k + 2, uy + 26, 3, '#c25a4a'); R(ux + k + 1, uy + 27, 3, 2, '#f0e6d0'); }
    R(ux + uw - 14, uy + 34, 12, 8, '#8a8f96'); R(ux + uw - 13, uy + 34, 10, 2, '#c2c7cc');
  });
  // poissonnerie (x17-20, y16-18) : auvent bleu, étal de glace et poissons
  shop(17, 16, 4, '#2f5a8a', '#4a7cb0', 'POISSONNERIE', (ux, uy, uw) => {
    R(ux - 2, uy + 32, 20, 10, '#7a4f2e'); R(ux - 1, uy + 32, 18, 4, '#dff2fb');
    for (let k = 0; k < 3; k++) { R(ux + 1 + k * 6, uy + 33, 4, 2, ['#8aa8c0', '#e08a6a', '#a8b8c8'][k]); R(ux + 5 + k * 6, uy + 33, 1, 2, '#5a6a7a'); }
    R(ux + uw - 10, uy + 36, 8, 6, '#3a5a7a'); R(ux + uw - 9, uy + 37, 6, 2, '#6aa0c8');
  });

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
  // villa de Manuel, le maire (x9-14, y22-25) : grande maison blanche, toit de tuiles, colonnes, haie taillée
  { const x0 = 9 * T, x1 = 15 * T, top = 22 * T, bot = 26 * T;
    R(x0 - 6, top - 4, x1 - x0 + 12, bot - top + 8, '#3e7a34'); R(x0 - 4, top - 2, x1 - x0 + 8, bot - top + 4, '#5a9a46');   // haie
    R(x0, top + 22, x1 - x0, bot - top - 22, '#f4efe4'); for (let y = top + 26; y < bot; y += 6) R(x0, y, x1 - x0, 1, '#ddd6c8');
    for (let i = 0; i < 8; i++) { const ins = Math.max(0, 12 - i * 2); R(x0 - 4 + ins, top + i * 3, x1 - x0 + 8 - ins * 2, 3, i % 2 ? '#b8432f' : '#c8553e'); }
    R(x0 - 5, top + 22, x1 - x0 + 10, 3, '#6b2a1e');
    for (const wx of [x0 + 8, x0 + 26, x1 - 34, x1 - 16]) { R(wx, top + 32, 10, 14, '#c8c0b0'); R(wx + 1, top + 33, 8, 12, '#7fb6d9'); R(wx + 1, top + 33, 8, 3, '#a9d3ec'); R(wx - 2, top + 32, 2, 14, '#3e5a7a'); R(wx + 10, top + 32, 2, 14, '#3e5a7a'); }
    const dx = 12 * T - 9; R(dx - 6, top + 26, 30, 4, '#e8e2d4');
    for (const cx of [dx - 5, dx + 20]) { R(cx, top + 30, 3, bot - top - 32, '#ffffff'); R(cx + 2, top + 30, 1, bot - top - 32, '#d8d2c4'); }
    R(dx, top + 40, 18, bot - top - 40, '#5a2e18'); R(dx + 1, top + 41, 8, bot - top - 42, '#7a4426'); R(dx + 9, top + 41, 8, bot - top - 42, '#7a4426'); R(dx + 7, top + 52, 2, 2, '#f2cf73'); R(dx + 10, top + 52, 2, 2, '#f2cf73');
    R(dx - 4, bot - 2, 26, 3, '#c2bdb4');
    for (const fx of [x0 + 4, x1 - 8]) { R(fx, bot - 8, 6, 6, '#8a5a32'); R(fx + 1, bot - 11, 4, 4, '#f07ab0'); } }
  return c;
}
