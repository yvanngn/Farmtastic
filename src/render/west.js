import { decor, drawDecor } from './decors.js';
// Farmwest (lot 2) : décors pré-rendus des nouvelles zones — rond-point, ranch du Maire, zone portuaire.
// Style de docs/carte-region-farmwest.jpg : terre ocre, chemins de sable, planches, eau bleue. Dessiné une fois par saison.
import { fountainSprite, houseSprite , blit } from './props.js';
import { CFG } from '../config.js';
import { LAYOUTS } from '../world/scenes.js';
import { rng } from '../world/map.js';
import { shade, disc } from './pixel.js';
import { signBoard } from './pixfont.js';
import { autotile, canopy, paintRiver, dress, roofFor, softPatches } from './terrain.js';
import { GRASS } from './ground.js';
import { treeSprite, pineSprite, cactusSprite, pebbleSprite } from './sprites.js';

const T = CFG.T;
// Panneaux du rond-point : position → texte (vers quelle zone mène la sortie la plus proche)
const SIGNS = {};   // lot 8 : plus de panneaux indicateurs (pas naturel)

const DESERT = ['gare', 'rondpoint', 'ranch'];
export function buildWest(name, season) {
  const L = LAYOUTS[name], H = L.length, W = L[0].length;
  const c = document.createElement('canvas'); c.width = W * T; c.height = H * T;
  const g = c.getContext('2d'), r = rng(name.length * 31 + season);
  const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  const at = (x, y) => (L[y] && L[y][x]) || 'T';
  const SAND = season === 3 ? '#e4dcd0' : '#d4a868', GR = shade(GRASS[season], .92);
  // 1. sols
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const ch = at(x, y), px = x * T, py = y * T;
    if (ch === 'w') { paintRiver(R, r, px, py, x, y, L); continue; }   // lot 11d : mer (dégradé de profondeur, écume, reflets)
    if (ch === '=') {   // planches du quai et des pontons
      R(px, py, T, T, '#a8774a');
      for (let k = 0; k < T; k += 4) { R(px, py + k, T, 1, '#7a5232'); R(px + ((y * 5 + k) % 12), py + k + 1, 1, 3, '#7a5232'); }
      R(px, py, T, 1, '#c99560');
      if (at(x, y + 1) === 'w') { R(px, py + T - 3, T, 3, '#5b3a22'); R(px + 2, py + T, 2, 6, '#4a2e1a'); R(px + 12, py + T, 2, 6, '#4a2e1a'); }   // poteaux
      continue;
    }
    if (ch === 'r') {   // voie ferrée : ballast, traverses, rails
      R(px, py, T, T, '#8a7a68'); for (let k = 0; k < 6; k++) R(px + (r() * 15 | 0), py + (r() * 15 | 0), 2, 1, '#6a5a4a');
      for (let k = 2; k < T; k += 5) R(px, py + k, T, 2, '#5b3a22');
      R(px + (x % 2 ? 2 : 11), py, 2, T, '#b8bcc4'); R(px + (x % 2 ? 2 : 11), py, 1, T, '#e8ecf0');
      continue;
    }
    if (ch === 'g') {   // herbe de l'enclos
      R(px, py, T, T, GR);
      for (let k = 0; k < 9; k++) { const bx = px + (r() * 16 | 0), by = py + 1 + (r() * 14 | 0); R(bx, by, 1, 1 + (r() * 3 | 0), shade(GR, r() < .6 ? .82 : 1.14)); }
      continue;
    }
    // terre ocre : variations douces, cailloux, touffes sèches
    const base = SAND;   // (17/11 : teinte unie, nappes rondes après)
    R(px, py, T, T, base);
    for (let k = 0; k < 6; k++) R(px + (r() * 16 | 0), py + (r() * 16 | 0), 1, 1, shade(base, r() < .5 ? .88 : 1.08));
    if (ch === 's' && r() < .12) { const sx = px + 3 + (r() * 9 | 0), sy = py + 5 + (r() * 7 | 0); R(sx, sy, 1, 3, '#9a7a3a'); R(sx + 2, sy - 1, 1, 4, '#b8923e'); R(sx + 4, sy, 1, 3, '#9a7a3a'); }
    if (ch === 's' && r() < .05) { R(px + 6, py + 9, 4, 2, '#a08a6a'); R(px + 6, py + 9, 2, 1, '#d4c0a0'); }
    if (ch === '.' || ch === 'D' || ch === 'F') {   // chemin de sable tassé (et sous la fontaine du rond-point)
      R(px, py, T, T, '#e8cf98');
      for (let k = 0; k < 5; k++) R(px + (r() * 15 | 0), py + (r() * 15 | 0), 2, 1, r() < .5 ? '#d4b47a' : '#f4e0b4');
    }
  }
  softPatches(g, W, H, (x, y) => { const ch = (L[y] || '')[x]; return ch === 's' || ch === 'T' ? 'ocre' : ch === 'g' ? 'herbe' : null; }, { ocre: SAND, herbe: GR });
  // lot 11a : bords propres herbe ↔ terre ocre ↔ chemins (coins arrondis)
  autotile(g, W, H, (x, y) => { const ch = (L[y] || '')[x]; return ch == null ? null : ch === '.' || ch === 'D' || ch === 'F' ? 'chemin' : ch === 's' || ch === 'T' ? 'ocre' : ch === 'g' ? 'herbe' : null; }, { chemin: 1, ocre: 2, herbe: 3 }, { ocre: SAND, herbe: GR });
  // 2. fontaine du rond-point (disque de pierre, eau, jet)
  if (name === 'rondpoint' && !decor('fontaine')) {
    const cx = 12.5 * T + 8, cy = 8.5 * T + 8, im = fountainSprite(34);   // 18/11 (soir) : fontaine « pixel moderne » (src/render/props.js)
    if (im) g.drawImage(im, Math.round(cx - im.width / 2), Math.round(cy + 34 * .62 + 4 - im.height + 4));
    else { disc(g, cx, cy, 34, '#a89a88'); disc(g, cx, cy, 27, '#3f86c4'); }
  }
  // 3. clôtures de ranch (deux lisses + poteaux)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (at(x, y) === 'f') {
    const px = x * T, py = y * T, hz = at(x - 1, y) === 'f' || at(x + 1, y) === 'f', vt = at(x, y - 1) === 'f' || at(x, y + 1) === 'f';
    if (hz) { R(px, py + 5, T, 2, '#a8774a'); R(px, py + 10, T, 2, '#a8774a'); R(px, py + 7, T, 1, '#5b3a22'); R(px, py + 12, T, 1, '#5b3a22'); }
    if (vt) { R(px + 7, py, 2, T, '#a8774a'); R(px + 9, py, 1, T, '#5b3a22'); }
    R(px + 6, py + 2, 4, 13, '#6a4426'); R(px + 6, py + 2, 1, 13, '#8a5a32'); R(px + 5, py + 14, 6, 2, 'rgba(30,15,5,.25)');
  }
  // 4. bâtiments : maison du ranch, grange, entrepôts du port (bois de l'Ouest, toits colorés)
  const block = ch => { let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; const out = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (at(x, y) === ch && !out.some(b => x >= b[0] && x <= b[2] && y >= b[1] && y <= b[3])) {
      let xe = x; while (at(xe + 1, y) === ch) xe++; let ye = y; while (at(x, ye + 1) === ch) ye++; out.push([x, y, xe, ye]); }
    return out; };
  const planks = (x, y, w, h, wall, dark) => { R(x, y, w, h, wall); for (let k = 3; k < h; k += 4) R(x, y + k, w, 1, dark); for (let k = 0; k < w; k += 9) R(x + k, y, 1, h, shade(wall, .9)); };
  const roof = (x, y, w, h, col) => roofFor(R, x, y, w, h, col);   // (avant : pan qui rétrécissait vers le bas, à l'envers)
  const win = (x, y) => { R(x, y, 10, 9, '#5b3a22'); R(x + 1, y + 1, 8, 7, '#ffd98a'); R(x + 5, y + 1, 1, 7, '#5b3a22'); R(x + 1, y + 4, 8, 1, '#5b3a22'); };
  for (const [x0, y0, x1, y1] of block('H')) {   // maison du ranch : véranda, toit rouge
    const px = x0 * T, py = y0 * T, w = (x1 - x0 + 1) * T, h = (y1 - y0 + 1) * T;
    R(px - 2, py + h, w + 4, 3, 'rgba(30,15,5,.3)');
    { const F = houseSprite({ w, h: h - 16, wall: '#c49060', trim: '#7a4a2a', roof: '#a8432f', roofH: 22, windows: [[10, 12], [w - 22, 12]], lit: true, porch: true, posts: [-2, w / 2 - 14, w / 2 + 12, w - 1], door: { x: w / 2 - 7, w: 14, h: 24 }, gableWin: true });
      if (F) blit(g, F.im, px + F.ox, py + 16 + F.oy); }   // 18/11 (soir) : maison du ranch « pixel moderne »
    if (!name.startsWith('farm:')) signBoard(R, px + w / 2, py + 17, 'MAIRIE');   // 19/11 : pas d'enseigne sur les fermes voisines
  }
  for (const [x0, y0, x1, y1] of block('B')) {   // grange rouge à croix blanches
    const px = x0 * T, py = y0 * T, w = (x1 - x0 + 1) * T, h = (y1 - y0 + 1) * T;
    R(px - 2, py + h, w + 4, 3, 'rgba(30,15,5,.3)');
    { const F = houseSprite({ w, h: h - 18, wall: '#b8432f', trim: '#f4ead2', roof: '#5a2a22', roofH: 22, planks: true, door: { x: w / 2 - 14, w: 28, h: 30, cross: true }, doorCol: '#8f3224', gableWin: true, lit: true });
      if (F) blit(g, F.im, px + F.ox, py + 18 + F.oy); }   // 18/11 (soir) : grange « pixel moderne » (croix blanches)
  }
  for (const [x0, y0, x1, y1] of block('G')) {   // gare de l'Ouest : planches, auvent sur le quai, horloge, enseigne
    const px = x0 * T, py = y0 * T, w = (x1 - x0 + 1) * T, h = (y1 - y0 + 1) * T;
    R(px - 2, py + h, w + 4, 3, 'rgba(30,15,5,.3)');
    { const F = houseSprite({ w, h: h - 14, wall: '#b88a5a', trim: '#5b3a22', roof: '#3e5a7a', roofH: 24, windows: [[8, 16], [w - 20, 16]], door: { x: w / 2 - 7, w: 14, h: 24 } });
      if (F) blit(g, F.im, px + F.ox, py + 14 + F.oy); }   // 18/11 (soir) : gare « pixel moderne »
    disc(g, px + w / 2, py + 6, 6, '#3f2615'); disc(g, px + w / 2, py + 6, 5, '#f4ead2'); R(px + w / 2, py + 2, 1, 4, '#3b2414'); R(px + w / 2, py + 6, 3, 1, '#3b2414');   // horloge
    signBoard(R, px + w / 2, py + 14, 'GARE DE FARMWEST');   // enseigne réécrite nette à l'écran
    R(3 * T, py + h - 4, 3 * T, 4, '#6a4426'); for (let k = 0; k < 3; k++) R(3 * T + 4 + k * 16, py + h, 2, 10, '#5b3a22');   // auvent du quai
    for (const bx of [3 * T + 6, 5 * T + 2]) { R(bx, 10 * T, 10, 4, '#8a5a32'); R(bx, 10 * T + 4, 1, 3, '#5b3a22'); R(bx + 9, 10 * T + 4, 1, 3, '#5b3a22'); }   // bancs
  }
  const ROOFS = ['#3e6a8a', '#a8432f', '#5a8a4a'];
  block('E').forEach(([x0, y0, x1, y1], i) => {   // entrepôts du port
    const px = x0 * T, py = y0 * T, w = (x1 - x0 + 1) * T, h = (y1 - y0 + 1) * T;
    R(px - 2, py + h, w + 4, 3, 'rgba(30,15,5,.3)');
    { const F = houseSprite({ w, h: h - 14, wall: '#9a7050', trim: '#5a3a22', roof: ROOFS[i % 3], roofH: 20, planks: true, door: { x: w / 2 - 12, w: 24, h: 26 }, doorCol: '#6a4426' });
      if (F) blit(g, F.im, px + F.ox, py + 14 + F.oy); }   // 18/11 (soir) : entrepôt « pixel moderne »
    for (const bx of [px + 6, px + w - 18]) { R(bx, py + h - 12, 12, 12, '#a8774a'); R(bx, py + h - 12, 12, 1, '#c99560'); R(bx + 5, py + h - 12, 1, 12, '#7a5232'); }   // caisses
  });
  for (const [x0, y0, x1, y1] of block('K')) drawPlankPile(R, x0 * T, y0 * T, (x1 - x0 + 1) * T, (y1 - y0 + 1) * T);   // 19/11 : tas de planches (fermes voisines)
  for (const [x0, y0, x1, y1] of block('!')) {   // 19/11 : le grand panneau d'affichage de la place (calendrier, météo)
    const px = x0 * T, py = y0 * T, w = (x1 - x0 + 1) * T, h = (y1 - y0 + 1) * T;
    R(px - 2, py + h - 2, w + 4, 4, 'rgba(30,15,5,.3)');
    R(px + 6, py - 4, 4, h + 2, '#5b3a22'); R(px + w - 10, py - 4, 4, h + 2, '#5b3a22');   // pieds
    R(px - 2, py - 22, w + 4, 30, '#3f2615'); R(px, py - 20, w, 26, '#c99560'); R(px - 4, py - 25, w + 8, 4, '#8a5a32'); R(px - 4, py - 25, w + 8, 1, '#b07a48');   // planche + petit toit
    for (let k = 0; k < 7; k++) { const cx = px + 3 + k * 8.5; R(cx, py - 14, 7, 7, '#f4ead2'); R(cx, py - 14, 7, 2, k === 0 ? '#c8402e' : '#7a8a9a'); }   // cases du calendrier
    for (let k = 0; k < 4; k++) { const cx = px + 6 + k * 14; R(cx, py - 4, 10, 8, '#e8f0f4'); R(cx + 3, py - 2, 4, 4, k % 2 ? '#9aa4b0' : '#f2c040'); }   // météo J à J+3
    signBoard(R, px + w / 2, py - 27, 'CALENDRIER');
  }
  // 5. panneaux indicateurs
  for (const [k, txt] of Object.entries(SIGNS[name] || {})) {
    const [x, y] = k.split(',').map(Number), px = x * T, py = y * T;
    g.font = 'bold 5px Georgia'; const tw = Math.ceil(g.measureText(txt).width) + 6;   // planche à la taille du texte
    R(px + 7, py + 4, 2, 12, '#5b3a22'); R(px + 8 - tw / 2 - 1, py - 2, tw + 2, 9, '#3f2615'); R(px + 8 - tw / 2, py - 1, tw, 7, '#c99560');
    g.fillStyle = '#3b2414'; g.textAlign = 'center'; g.fillText(txt, px + 8, py + 4.5); g.textAlign = 'start';
  }
  // 5 bis (7d) : petites pierres ocre éparses sur les sols de terre (décor, sans collision)
  if (DESERT.includes(name)) for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (at(x, y) === 'g' && r() < .035) g.drawImage(pebbleSprite((x + y) % 2), x * T + (r() * 6 | 0), y * T + 4 + (r() * 4 | 0));
  // 5 ter (lot 32) : cactus et broussailles un peu partout sur la terre ocre et l'herbe (décor, sans collision)
  { const spots = []; for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) { const ch = at(x, y); if ((ch === 's' || ch === 'g') && at(x, y - 1) !== '.' && at(x, y + 1) !== '.' && at(x - 1, y) !== '.' && at(x + 1, y) !== '.' && ((x * 31 + y * 17) % (DESERT.includes(name) ? 19 : 41)) === 0) spots.push([x, y]); }
    for (const [x, y] of spots) { const k = (x * 7 + y) % 5, n = k < 2 ? 'broussaille' : k < 4 ? 'cactus_petit' : 'cactus_grand'; drawDecor(g, n, x * T + 8, y * T + 15, n === 'broussaille' ? 13 : n === 'cactus_petit' ? 9 : 12); } }
  // 6. arbres (bords et bosquets), triés de haut en bas
  canopy(g, W, H, (x, y) => (L[y] || '')[x] === 'T' && [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([a, b]) => (L[y + b] || '')[x + a] === 'T').length >= 2, season);   // lot 11b : canopée continue
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (at(x, y) === 'T') {
    const v = (x * 7 + y * 3) % 4;
    // 7d : côté désert (gare, rond-point, ranch), des cactus se mêlent aux arbres de bordure
    if (DESERT.includes(name) && (x * 5 + y * 3) % 4 === 0) { if (drawDecor(g, (x + y) % 3 ? 'cactus_grand' : 'cactus_petit', x * T + 8, y * T + 15, (x + y) % 3 ? 13 : 9)) continue; g.drawImage(cactusSprite(season, v), x * T - 3, y * T - 18); continue; }
    const im = (x + y) % 2 ? pineSprite(season, v) : treeSprite(season, v);
    g.drawImage(im, x * T - 9, y * T - 26);
  }
  // 7. décor : chevaux dans l'enclos, abreuvoir, voiliers au port
  if (name === 'ranch') {
    R(18 * T, 17 * T + 4, 3 * T, 8, '#6a4426'); R(18 * T + 2, 17 * T + 5, 3 * T - 4, 4, '#4a92d0');   // abreuvoir
    for (const [hx, hy, col] of [[9, 13, '#7a4a2a'], [14, 15, '#3a2a20'], [20, 12, '#c8a070']]) drawHorse(R, hx * T, hy * T, col);
  }
  if (name === 'port') for (const [bx, by] of [[3, 15], [12, 16], [22, 14], [31, 16]]) drawBoat(R, bx * T, by * T);
  // lot 11f : décor dense
  dress(g, W, H, (x, y) => 'sg'.includes((L[y] || '')[x] || '-'), (x, y) => 'HBEG'.includes((L[y] || '')[x] || '-'), name.length);
  return c;
}

function drawHorse(R, x, y, col) {
  const dk = shade(col, .7);
  R(x, y + 14, 22, 3, 'rgba(30,15,5,.25)');
  R(x + 2, y + 4, 16, 8, col); R(x + 15, y - 2, 5, 8, col); R(x + 17, y - 4, 6, 5, col); R(x + 22, y - 2, 2, 2, dk);   // corps, cou, tête
  R(x + 14, y - 3, 3, 9, dk); R(x, y + 4, 3, 7, dk);   // crinière, queue
  for (const lx of [3, 6, 13, 16]) R(x + lx, y + 12, 2, 4, dk);
  R(x + 20, y - 3, 1, 1, '#1a1010');
}
function drawBoat(R, x, y) {
  R(x - 2, y + 10, 36, 3, 'rgba(10,30,60,.35)');
  R(x, y + 4, 32, 6, '#6a4426'); R(x + 2, y + 10, 28, 2, '#4a2e1a'); R(x, y + 4, 32, 1, '#a8774a');   // coque
  R(x + 15, y - 22, 2, 26, '#5b3a22');   // mât
  for (let k = 0; k < 20; k++) R(x + 17, y - 20 + k, Math.round(k * .7) + 1, 1, '#f4ead2');   // voile
  for (let k = 0; k < 14; k++) R(x + 14 - Math.round(k * .6), y - 14 + k, Math.round(k * .6) + 1, 1, '#e8dcc0');
  R(x + 16, y - 24, 6, 3, '#a8302b');   // fanion
}
// 19/11 : tas de planches à la place de la cabane (fermes autres que la principale). Partagé avec le sol de la ferme.
export function drawPlankPile(R, px, py, w, h) {
  R(px + 4, py + h - 10, w - 8, 6, 'rgba(30,15,5,.25)');
  const by = py + h - 16, cols = ['#a8774a', '#c99560', '#8a5a32'];
  for (let k = 0; k < 5; k++) { const off = (k % 2) * 6, len = w - 20 - (k * 4), y = by - k * 5; R(px + 10 + off, y, len, 5, cols[k % 3]); R(px + 10 + off, y, len, 1, '#e0b884'); R(px + 10 + off, y + 4, len, 1, '#5b3a22'); for (let j = 14; j < len; j += 22) R(px + 10 + off + j, y + 2, 1, 1, '#3b2414'); }   // planches empilées (clous)
  R(px + 2, by + 2, 26, 4, '#b07a48'); R(px + w - 30, by - 3, 24, 4, '#8a5a32');   // planches éparses au sol
  R(px + w - 18, by - 30, 3, 10, '#6a4426'); R(px + w - 22, by - 30, 11, 2, '#6a4426');   // poutre dressée
}
