// Farmwest (lot 2) : décors pré-rendus des nouvelles zones — rond-point, ranch du Maire, zone portuaire.
// Style de docs/carte-region-farmwest.jpg : terre ocre, chemins de sable, planches, eau bleue. Dessiné une fois par saison.
import { CFG } from '../config.js';
import { LAYOUTS } from '../world/scenes.js';
import { rng } from '../world/map.js';
import { shade, disc } from './pixel.js';
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
    if (ch === 'w') {   // mer : bleu profond, reflets, écume au bord du quai
      R(px, py, T, T, y > 15 ? '#2f6aa8' : '#3a7ec0');
      for (let k = 0; k < 2; k++) R(px + (r() * 12 | 0), py + (r() * 14 | 0), 4, 1, '#7cc0ec');
      if (at(x, y - 1) !== 'w') { R(px, py, T, 2, '#e8f4fc'); R(px, py + 2, T, 1, '#9ad0f0'); }
      continue;
    }
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
    const wave = Math.sin(x * .5) + Math.cos(y * .43), base = shade(SAND, 1 + wave * .03);
    R(px, py, T, T, base);
    for (let k = 0; k < 6; k++) R(px + (r() * 16 | 0), py + (r() * 16 | 0), 1, 1, shade(base, r() < .5 ? .88 : 1.08));
    if (ch === 's' && r() < .12) { const sx = px + 3 + (r() * 9 | 0), sy = py + 5 + (r() * 7 | 0); R(sx, sy, 1, 3, '#9a7a3a'); R(sx + 2, sy - 1, 1, 4, '#b8923e'); R(sx + 4, sy, 1, 3, '#9a7a3a'); }
    if (ch === 's' && r() < .05) { R(px + 6, py + 9, 4, 2, '#a08a6a'); R(px + 6, py + 9, 2, 1, '#d4c0a0'); }
    if (ch === '.' || ch === 'D') {   // chemin de sable tassé, bords adoucis
      R(px, py, T, T, '#e8cf98');
      for (let k = 0; k < 5; k++) R(px + (r() * 15 | 0), py + (r() * 15 | 0), 2, 1, r() < .5 ? '#d4b47a' : '#f4e0b4');
      for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
        const n = at(x + dx, y + dy); if (n === '.' || n === 'D' || n === 'F' || n === 'P') continue;
        for (let k = 0; k < T; k += 2) { const len = r() < .6 ? 1 + (r() * 2 | 0) : 0; if (!len) continue;
          if (dy) R(px + k, dy < 0 ? py : py + T - len, 1, len, base); else R(dx < 0 ? px : px + T - len, py + k, len, 1, base); }
      }
    }
  }
  // 2. fontaine du rond-point (disque de pierre, eau, jet)
  if (name === 'rondpoint') {
    const cx = 12.5 * T + 8, cy = 8.5 * T + 8;
    disc(g, cx, cy + 3, 34, 'rgba(60,40,20,.25)'); disc(g, cx, cy, 34, '#a89a88'); disc(g, cx, cy, 31, '#c8bca8'); disc(g, cx, cy, 27, '#3f86c4'); disc(g, cx, cy, 24, '#4a92d0');
    for (let k = 0; k < 8; k++) R(cx - 20 + k * 5, cy - 6 + (k % 3) * 6, 3, 1, '#9ad0f0');
    disc(g, cx, cy, 9, '#a89a88'); disc(g, cx, cy, 7, '#c8bca8'); R(cx - 2, cy - 18, 4, 14, '#c8bca8'); disc(g, cx, cy - 19, 5, '#d8ccb8'); disc(g, cx, cy - 20, 3, '#bfe3f5');
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
  const roof = (x, y, w, h, col) => { for (let k = 0; k < h; k++) R(x - 3 + k, y + k, w + 6 - k * 2, 1, k % 3 === 0 ? shade(col, .8) : col); R(x - 3, y + h, w + 6, 2, shade(col, .6)); };
  const win = (x, y) => { R(x, y, 10, 9, '#5b3a22'); R(x + 1, y + 1, 8, 7, '#ffd98a'); R(x + 5, y + 1, 1, 7, '#5b3a22'); R(x + 1, y + 4, 8, 1, '#5b3a22'); };
  for (const [x0, y0, x1, y1] of block('H')) {   // maison du ranch : véranda, toit rouge
    const px = x0 * T, py = y0 * T, w = (x1 - x0 + 1) * T, h = (y1 - y0 + 1) * T;
    R(px - 2, py + h, w + 4, 3, 'rgba(30,15,5,.3)');
    planks(px, py + 16, w, h - 16, '#c49060', '#9a6a3c'); roof(px, py - 4, w, 20, '#a8432f');
    win(px + 12, py + 30); win(px + w - 22, py + 30);
    R(px + w / 2 - 7, py + h - 24, 14, 24, '#5b3a22'); R(px + w / 2 - 5, py + h - 22, 10, 22, '#8a5a32'); R(px + w / 2 + 2, py + h - 12, 2, 2, '#e8c26a');
    R(px - 2, py + h - 6, w + 4, 6, '#8a5a32'); for (let k = 0; k < w; k += 12) R(px + k, py + h - 22, 2, 16, '#6a4426');   // véranda
    R(px + w / 2 - 16, py + 18, 32, 8, '#f4ead2'); g.fillStyle = '#5a2a22'; g.font = 'bold 6px Georgia'; g.textAlign = 'center'; g.fillText('MAIRE', px + w / 2, py + 24); g.textAlign = 'start';
  }
  for (const [x0, y0, x1, y1] of block('B')) {   // grange rouge à croix blanches
    const px = x0 * T, py = y0 * T, w = (x1 - x0 + 1) * T, h = (y1 - y0 + 1) * T;
    R(px - 2, py + h, w + 4, 3, 'rgba(30,15,5,.3)');
    planks(px, py + 18, w, h - 18, '#b8432f', '#8f3224'); roof(px, py - 2, w, 20, '#5a2a22');
    const dx = px + w / 2 - 14, dy = py + h - 30; R(dx, dy, 28, 30, '#f4ead2'); R(dx + 2, dy + 2, 24, 28, '#8f3224');
    for (let k = 0; k < 24; k++) { R(dx + 2 + k, dy + 2 + k * 1.15, 1, 1, '#f4ead2'); R(dx + 25 - k, dy + 2 + k * 1.15, 1, 1, '#f4ead2'); }
    R(px + w / 2 - 6, py + 6, 12, 8, '#f4ead2'); R(px + w / 2 - 5, py + 7, 10, 6, '#ffd77a');
  }
  for (const [x0, y0, x1, y1] of block('G')) {   // gare de l'Ouest : planches, auvent sur le quai, horloge, enseigne
    const px = x0 * T, py = y0 * T, w = (x1 - x0 + 1) * T, h = (y1 - y0 + 1) * T;
    R(px - 2, py + h, w + 4, 3, 'rgba(30,15,5,.3)');
    planks(px, py + 14, w, h - 14, '#b88a5a', '#8a6a3c'); roof(px, py - 6, w, 20, '#3e5a7a');
    win(px + 10, py + 30); win(px + w - 20, py + 30);
    R(px + w / 2 - 7, py + h - 24, 14, 24, '#5b3a22'); R(px + w / 2 - 5, py + h - 22, 10, 22, '#8a5a32');
    disc(g, px + w / 2, py + 6, 6, '#3f2615'); disc(g, px + w / 2, py + 6, 5, '#f4ead2'); R(px + w / 2, py + 2, 1, 4, '#3b2414'); R(px + w / 2, py + 6, 3, 1, '#3b2414');   // horloge
    R(px + w / 2 - 18, py + 15, 36, 9, '#3f2615'); R(px + w / 2 - 17, py + 16, 34, 7, '#e8c26a');
    g.fillStyle = '#3b2414'; g.font = 'bold 6px Georgia'; g.textAlign = 'center'; g.fillText('FARMWEST', px + w / 2, py + 22); g.textAlign = 'start';
    R(3 * T, py + h - 4, 3 * T, 4, '#6a4426'); for (let k = 0; k < 3; k++) R(3 * T + 4 + k * 16, py + h, 2, 10, '#5b3a22');   // auvent du quai
    for (const bx of [3 * T + 6, 5 * T + 2]) { R(bx, 10 * T, 10, 4, '#8a5a32'); R(bx, 10 * T + 4, 1, 3, '#5b3a22'); R(bx + 9, 10 * T + 4, 1, 3, '#5b3a22'); }   // bancs
  }
  const ROOFS = ['#3e6a8a', '#a8432f', '#5a8a4a'];
  block('E').forEach(([x0, y0, x1, y1], i) => {   // entrepôts du port
    const px = x0 * T, py = y0 * T, w = (x1 - x0 + 1) * T, h = (y1 - y0 + 1) * T;
    R(px - 2, py + h, w + 4, 3, 'rgba(30,15,5,.3)');
    planks(px, py + 14, w, h - 14, '#9a7050', '#6a4a30'); roof(px, py - 4, w, 18, ROOFS[i % 3]);
    R(px + w / 2 - 12, py + h - 26, 24, 26, '#4a2e1a'); R(px + w / 2 - 10, py + h - 24, 20, 24, '#6a4426'); R(px + w / 2, py + h - 24, 1, 24, '#4a2e1a');
    for (const bx of [px + 6, px + w - 18]) { R(bx, py + h - 12, 12, 12, '#a8774a'); R(bx, py + h - 12, 12, 1, '#c99560'); R(bx + 5, py + h - 12, 1, 12, '#7a5232'); }   // caisses
  });
  // 5. panneaux indicateurs
  for (const [k, txt] of Object.entries(SIGNS[name] || {})) {
    const [x, y] = k.split(',').map(Number), px = x * T, py = y * T;
    g.font = 'bold 5px Georgia'; const tw = Math.ceil(g.measureText(txt).width) + 6;   // planche à la taille du texte
    R(px + 7, py + 4, 2, 12, '#5b3a22'); R(px + 8 - tw / 2 - 1, py - 2, tw + 2, 9, '#3f2615'); R(px + 8 - tw / 2, py - 1, tw, 7, '#c99560');
    g.fillStyle = '#3b2414'; g.textAlign = 'center'; g.fillText(txt, px + 8, py + 4.5); g.textAlign = 'start';
  }
  // 5 bis (7d) : petites pierres ocre éparses sur les sols de terre (décor, sans collision)
  if (DESERT.includes(name)) for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (at(x, y) === 'g' && r() < .035) g.drawImage(pebbleSprite((x + y) % 2), x * T + (r() * 6 | 0), y * T + 4 + (r() * 4 | 0));
  // 6. arbres (bords et bosquets), triés de haut en bas
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (at(x, y) === 'T') {
    const v = (x * 7 + y * 3) % 4;
    // 7d : côté désert (gare, rond-point, ranch), des cactus se mêlent aux arbres de bordure
    if (DESERT.includes(name) && (x * 5 + y * 3) % 4 === 0) { g.drawImage(cactusSprite(season, v), x * T - 3, y * T - 18); continue; }
    const im = (x + y) % 2 ? pineSprite(season, v) : treeSprite(season, v);
    g.drawImage(im, x * T - 9, y * T - 26);
  }
  // 7. décor : chevaux dans l'enclos, abreuvoir, voiliers au port
  if (name === 'ranch') {
    R(18 * T, 17 * T + 4, 3 * T, 8, '#6a4426'); R(18 * T + 2, 17 * T + 5, 3 * T - 4, 4, '#4a92d0');   // abreuvoir
    for (const [hx, hy, col] of [[9, 13, '#7a4a2a'], [14, 15, '#3a2a20'], [20, 12, '#c8a070']]) drawHorse(R, hx * T, hy * T, col);
  }
  if (name === 'port') for (const [bx, by] of [[3, 15], [12, 16], [22, 14], [31, 16]]) drawBoat(R, bx * T, by * T);
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
