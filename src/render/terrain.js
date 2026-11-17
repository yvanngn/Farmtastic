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
// Rivière (lot 11d) : profondeur en dégradé (plus sombre au milieu), reflets, berge de sable humide, écume dentelée
// le long de la terre ferme, coins de berge arrondis.
export function paintRiver(R, r, px, py, x, y, L) {
  const land = c => c && c !== 'w' && c !== '=';
  const n = land(at(L, x, y - 1)), s = land(at(L, x, y + 1)), w = land(at(L, x - 1, y)), e = land(at(L, x + 1, y));
  let d = 3; for (let k = 1; k <= 3; k++) if ([[k, 0], [-k, 0], [0, k], [0, -k]].some(([a, b]) => land(at(L, x + a, y + b)))) { d = k - 1; break; }
  const base = ['#4690ce', '#3f86c6', '#3a7ec0', '#3678ba'][d];
  R(px, py, T, T, base);
  for (let k = 0; k < 3; k++) { const rx = px + (r() * 12 | 0), ry = py + 1 + (r() * 13 | 0); R(rx, ry, 4, 1, '#7cc0ec'); if (r() < .3) R(rx + 1, ry, 1, 1, '#e8f6ff'); }   // reflets
  const foam = (hz, x0, y0, dir) => { for (let k = 0; k < T; k++) { const l = 1 + (hash(x0, y0, k) * 2 | 0); if (hz) R(px + k, dir > 0 ? y0 : y0 - l + 1, 1, l, hash(x0 + 3, y0, k) < .7 ? '#e8f4fc' : '#bfe3f5'); else R(dir > 0 ? x0 : x0 - l + 1, py + k, l, 1, hash(x0, y0 + 3, k) < .7 ? '#e8f4fc' : '#bfe3f5'); } };
  if (n) { R(px, py, T, 3, '#c9a66a'); R(px, py + 3, T, 1, '#a8864e'); foam(true, px, py + 4, 1); }
  if (s) { R(px, py + T - 2, T, 2, '#8a6a3a'); R(px, py + T - 4, T, 2, '#2a5a90'); }   // berge en surplomb : ombre sur l'eau
  if (w) { R(px, py, 3, T, '#c9a66a'); R(px + 3, py, 1, T, '#a8864e'); foam(false, px + 4, py, 1); }
  if (e) { R(px + T - 3, py, 3, T, '#a8864e'); R(px + T - 4, py, 1, T, '#8a6a3a'); foam(false, px + T - 5, py, -1); }
  for (const [cx, cy, a, b] of [[0, 0, n, w], [1, 0, n, e], [0, 1, s, w], [1, 1, s, e]]) if (a && b) for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) if (i * i + j * j < 20) R(cx ? px + T - 1 - i : px + i, cy ? py + T - 1 - j : py + j, 1, 1, '#c9a66a');   // coins de berge arrondis
  if (!n && !w && land(at(L, x - 1, y - 1))) for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (i + j < 4) R(px + i, py + j, 1, 1, '#c9a66a');
  if (!n && !e && land(at(L, x + 1, y - 1))) for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (i + j < 4) R(px + T - 1 - i, py + j, 1, 1, '#c9a66a');
  if (d >= 2 && r() < .08) { R(px + 5, py + 6, 5, 3, '#4a8a3a'); R(px + 6, py + 6, 2, 1, '#6aaa4a'); R(px + 9, py + 6, 1, 1, '#f2b8d0'); }   // nénuphar
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
// Falaise en terrasses (lot 11c) : paroi de terre rouge texturée (strates, fissures, lumière à gauche, ombre à droite),
// bord herbeux qui déborde en touffes, ombre portée au pied.
export function paintCliff(R, r, px, py, x, y, L, season = 0) {
  const isC = (a, b) => at(L, a, b) === '^', top = !isC(x, y - 1), foot = !isC(x, y + 1), lft = !isC(x - 1, y), rgt = !isC(x + 1, y);
  R(px, py, T, T, '#a8603e');
  for (let k = 2; k < T; k += 5) { R(px, py + k, T, 2, '#8a4a30'); R(px + ((x * 7 + k) % 12), py + k - 1, 4, 1, '#c27a50'); }   // strates
  for (let k = 0; k < 2; k++) { const cx = px + 2 + (hash(x, y, k) * 12 | 0); R(cx, py + 4, 1, 6 + (hash(x, y, k + 5) * 5 | 0), '#6a3420'); R(cx + 1, py + 4, 1, 3, '#c88a5a'); }   // fissures
  for (let k = 0; k < 3; k++) R(px + (r() * 13 | 0), py + (r() * 13 | 0), 3, 2, r() < .5 ? '#7a4028' : '#c88a5a');
  if (lft) R(px, py, 2, T, '#c88a5a'); if (rgt) R(px + T - 3, py, 3, T, '#6a3420');   // lumière en haut à gauche
  if (top) {   // replat herbeux (ou enneigé) qui déborde en touffes sur la paroi
    const G = season === 3 ? '#eef3f8' : '#86ae46', GD = season === 3 ? '#c8d4e2' : '#5e8a34';
    R(px, py, T, 3, G); R(px, py + 3, T, 1, '#6a3a24');
    for (let k = 0; k < T; k += 2) { const l = hash(x, y, k + 20) < .5 ? 2 : 1 + (hash(x, y, k + 30) * 3 | 0); R(px + k, py + 3, 2, l, G); R(px + k, py + 3 + l, 2, 1, GD); }
  }
  if (foot) { R(px, py + T - 4, T, 4, 'rgba(40,20,10,.38)'); R(px, py + T - 1, T, 1, 'rgba(40,20,10,.5)'); }   // ombre portée au pied
}

// ---------- Lot 11a : auto-tuilage des sols ----------
// Passe à faire après les sols : là où deux matières se touchent, la matière « au-dessus » (rang le plus haut :
// herbe > terre > sable / chemin) déborde sur sa voisine en un liseré irrégulier, avec des coins arrondis
// (coins extérieurs en quart de disque, coins intérieurs comblés), au lieu d'un bord droit case par case.
// mat(x, y) → nom de matière (ou null hors carte / à ignorer, ex. l'eau qui a ses propres berges).
// rank = { matière: rang } ; col = { matière: couleur de base } ; tip = couleur des pointes (herbe), facultatif.
const hash = (x, y, k) => { let h = (x * 374761393 + y * 668265263 + k * 2246822519) >>> 0; h = (h ^ (h >>> 13)) * 1274126177 >>> 0; return (h >>> 0) / 4294967296; };
export function autotile(g, W, H, mat, rank, col, tip = {}) {
  const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const m = mat(x, y); if (m == null || rank[m] == null) continue;
    const px = x * T, py = y * T, up = new Set();
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]]) { const n = mat(x + dx, y + dy); if (n != null && rank[n] != null && rank[n] > rank[m]) up.add(n); }
    for (const N of [...up].sort((a, b) => rank[a] - rank[b])) {
      const is = (dx, dy) => mat(x + dx, y + dy) === N, C = col[N], D = shade(C, .86), L = tip[N] || shade(C, 1.14);
      const n = is(0, -1), s = is(0, 1), w = is(-1, 0), e = is(1, 0);
      for (let k = 0; k < T; k++) {   // liserés : 2 à 5 px qui débordent, bord dentelé, pointes claires
        const d = (side, j) => 2 + (hash(x * 4 + side, y, j) * 4 | 0);
        if (n) { const h = d(0, k); R(px + k, py, 1, h, C); R(px + k, py + h - 1, 1, 1, hash(x, y, k + 9) < .4 ? L : D); }
        if (s) { const h = d(1, k); R(px + k, py + T - h, 1, h, C); R(px + k, py + T - h, 1, 1, hash(x, y, k + 19) < .4 ? L : D); }
        if (w) { const h = d(2, k); R(px, py + k, h, 1, C); R(px + h - 1, py + k, 1, 1, D); }
        if (e) { const h = d(3, k); R(px + T - h, py + k, h, 1, C); R(px + T - h, py + k, 1, 1, D); }
      }
      const corner = (cx, cy) => { for (let a = 0; a < 6; a++) for (let b = 0; b < 6; b++) if (a * a + b * b < 26) R(cx > 0 ? px + T - 1 - a : px + a, cy > 0 ? py + T - 1 - b : py + b, 1, 1, C); };
      // coins intérieurs (deux côtés voisins) : comblés en arrondi ; coins extérieurs (diagonale seule) : petit quart de disque
      for (const [cx, cy, a, b] of [[-1, -1, n, w], [1, -1, n, e], [-1, 1, s, w], [1, 1, s, e]]) {
        if (a && b) corner(cx, cy);
        else if (!a && !b && is(cx, cy)) for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if (i * i + j * j < 12) R(cx > 0 ? px + T - 1 - i : px + i, cy > 0 ? py + T - 1 - j : py + j, 1, 1, C);
      }
    }
  }
}

// ---------- Lot 11b : forêts denses ----------
// Canopée continue sous les arbres d'une bordure ou d'un bosquet : grands disques de feuillage fusionnés
// (lumière en haut à gauche), puis lisière ombrée là où la forêt s'arrête. À peindre AVANT les sprites d'arbres.
export const CANOPY = [['#2c5a2a', '#3f7a32', '#5a9a46'], ['#285426', '#3a722e', '#529240'], ['#7a4a1e', '#a8642a', '#d0903a'], ['#2c4a3a', '#3e5e4a', '#e8eef2']];
export function canopy(g, W, H, isTree, season = 0) {
  const P = CANOPY[season] || CANOPY[0], R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const disc = (cx, cy, rad, c) => { g.fillStyle = c; for (let dy = -rad; dy <= rad; dy++) { const w = Math.floor(Math.sqrt(rad * rad - dy * dy)); g.fillRect(cx - w, cy + dy, 2 * w + 1, 1); } };
  const cells = []; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (isTree(x, y)) cells.push([x, y]);
  for (const [x, y] of cells) disc(x * T + 8, y * T + 2, 12, P[0]);
  for (const [x, y] of cells) disc(x * T + 6, y * T, 9, P[1]);
  for (const [x, y] of cells) { disc(x * T + 3 + (hash(x, y, 1) * 4 | 0), y * T - 3, 4, P[2]); if (hash(x, y, 2) < .5) R(x * T + 10, y * T + 4, 2, 2, P[2]); }
  for (const [x, y] of cells) if (!isTree(x, y + 1) && y + 1 < H) R(x * T - 2, y * T + T, T + 4, 4, 'rgba(20,30,10,.3)');   // lisière ombrée
}

// ---------- Lot 11f : décor dense ----------
// Petits objets peints (sans collision) : tonneaux et caisses au pied des bâtiments, fleurs et cailloux dans l'herbe ou la terre.
export function barrel(R, x, y) { R(x + 1, y + 11, 10, 2, 'rgba(30,15,5,.3)'); R(x, y, 10, 12, '#7a4a26'); R(x + 1, y, 2, 12, '#a8703a'); R(x + 8, y, 2, 12, '#5a321a'); R(x, y + 2, 10, 1, '#5a5a66'); R(x, y + 9, 10, 1, '#5a5a66'); R(x + 1, y - 1, 8, 2, '#5a321a'); }
export function crate(R, x, y) { R(x + 1, y + 9, 11, 2, 'rgba(30,15,5,.3)'); R(x, y, 11, 10, '#b8864e'); R(x, y, 11, 1, '#d8a868'); R(x + 10, y, 1, 10, '#7a5232'); R(x, y, 1, 10, '#8a5a32'); R(x + 1, y + 4, 9, 1, '#8a5a32'); R(x + 5, y + 1, 1, 8, '#8a5a32'); }
export function dress(g, W, H, ground, building, seed = 1) {
  const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const px = x * T, py = y * T, v = hash(x + seed, y, 77);
    if (building(x, y) && !building(x, y + 1)) {   // pied de façade : tonneau ou caisses dans les coins
      if (!building(x - 1, y) && v < .7) barrel(R, px + 1, py + 2);
      else if (!building(x + 1, y) && v < .7) { crate(R, px + 4, py + 4); if (v < .35) crate(R, px + 6, py - 5); }
    } else if (ground(x, y) && v < .05) {   // fleurs ou petits cailloux
      const k = hash(x, y, 78);
      if (k < .5) { const c = ['#f2e8f0', '#f5d040', '#e06a9a', '#8ab0ff'][k * 8 | 0]; for (const [a, b] of [[4, 6], [9, 9], [6, 11]]) { R(px + a, py + b + 2, 1, 2, '#4a7a2a'); R(px + a - 1, py + b, 3, 1, c); R(px + a, py + b - 1, 1, 3, c); } }
      else { R(px + 5, py + 9, 5, 3, '#8a8078'); R(px + 5, py + 9, 3, 1, '#c2bab0'); R(px + 10, py + 11, 2, 2, '#9a9088'); }
    }
  }
}

// ---------- Toits (refaits : avant, les toits étaient « à l'envers ») ----------
// A — pan de toit façon Stardew : grand pan d'ardoises sur toute la largeur (débord de 3 px), faîtage clair en haut,
// rangées de plus en plus sombres vers l'avant-toit, avant-toit dans l'ombre et ombre portée sur la façade.
// B — pignon pointu : triangle vers le haut, rives sombres, petite lucarne. roofFor choisit : grandes maisons → A, petites → B.
export function roofSlab(R, x, y, w, h, base) {
  R(x - 4, y, w + 8, h, shade(base, .5));
  R(x - 3, y + 1, w + 6, h - 2, base);
  for (let r = 0; r < h - 5; r += 4) { const f = 1.12 - r / h * .35; R(x - 3, y + 3 + r, w + 6, 3, shade(base, f)); R(x - 3, y + 6 + r, w + 6, 1, shade(base, f * .72)); for (let k = (r / 4 % 2) * 3; k < w + 6; k += 6) R(x - 3 + k, y + 3 + r, 1, 3, shade(base, f * .78)); }
  R(x - 3, y + 1, w + 6, 2, shade(base, 1.3));
  R(x - 4, y + h - 3, w + 8, 3, shade(base, .55));
  R(x - 4, y + h, w + 8, 2, 'rgba(20,12,8,.28)');
}
export function roofGable(R, x, y, w, h, base, lucarne = true) {
  const cx = x + w / 2;
  for (let r = 0; r < h; r++) {
    const half = Math.max(1, Math.round((w / 2 + 4) * (r + 1) / h));
    R(Math.round(cx - half), y + r, half * 2, 1, shade(base, 1.12 - r / h * .3 - (r % 4 === 3 ? .22 : 0)));
    R(Math.round(cx - half) - 1, y + r, 2, 1, shade(base, .5)); R(Math.round(cx + half) - 1, y + r, 2, 1, shade(base, .5));
    if (r > 2) R(Math.round(cx - half) + 2, y + r, 1, 1, shade(base, 1.25));   // rive éclairée à gauche
  }
  R(Math.round(cx) - 1, y - 1, 2, 2, shade(base, .5));
  if (lucarne && h >= 16) { R(cx - 5, y + h - 13, 10, 8, '#f4ead8'); R(cx - 4, y + h - 12, 8, 6, '#ffd98a'); R(cx, y + h - 12, 1, 6, '#f4ead8'); }
  R(x - 4, y + h, w + 8, 2, 'rgba(20,12,8,.28)');
}
export const roofFor = (R, x, y, w, h, base) => w >= 72 ? roofSlab(R, x, y, w, h, base) : roofGable(R, x, y, w, h, base);
