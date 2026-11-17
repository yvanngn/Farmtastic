import { paintGrass, canopy, CANOPY } from './terrain.js';
// Terres sauvages pré-rendues : herbe plus sombre et touffue, arbres serrés en bordure,
// rochers, sortie vers la ferme. Reconstruites à chaque saison.
import { CFG } from '../config.js';
import { LAYOUTS } from '../world/scenes.js';
import { rng } from '../world/map.js';
import { shade, disc } from './pixel.js';
import { GRASS } from './ground.js';
import { drawJelly, treeSprite, pineSprite } from './sprites.js';
const T = CFG.T;

// Caverne sombre : sol de pierre, parois rocheuses avec arêtes éclairées, piliers, cristaux,
// sortie lumineuse (D) et escalier qui descend (S).
function buildCave() {
  const L = LAYOUTS.wild, H = L.length, W = L[0].length;
  const c = document.createElement('canvas'); c.width = W * T; c.height = H * T;
  const g = c.getContext('2d'), r = rng(404);
  const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  const wall = (x, y) => x < 0 || y < 0 || x >= W || y >= H || L[y][x] === 'T';
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const px = x * T, py = y * T, ch = L[y][x];
    if (ch === 'T') {
      R(px, py, T, T, '#1d1a22');
      for (let k = 0; k < 4; k++) R(px + (r() * 12 | 0), py + (r() * 12 | 0), 4, 3, ['#2a2630', '#24212b', '#302b37'][k % 3]);
      if (!wall(x, y + 1)) { R(px, py + T - 6, T, 6, '#3e3846'); R(px, py + T - 6, T, 1, '#5a5266'); for (let k = 0; k < T; k += 5) R(px + k + (r() * 3 | 0), py + T - 5, 1, 4, '#2e2934'); }   // face de la paroi
      if (!wall(x, y - 1)) R(px, py, T, 2, '#4a4354');
      if (!wall(x - 1, y)) R(px, py, 2, T, '#3a3442');
      if (!wall(x + 1, y)) R(px + T - 2, py, 2, T, '#16141a');
      if (r() < .08) { R(px + 5, py + 4, 2, 4, '#7ad0e8'); R(px + 6, py + 3, 1, 1, '#d8f6ff'); }   // cristal dans la roche
      continue;
    }
    R(px, py, T, T, '#3a3540');
    for (let k = 0; k < 5; k++) R(px + (r() * 14 | 0), py + (r() * 14 | 0), 2, 1, ['#46404e', '#312d36', '#4e4856'][k % 3]);
    if (r() < .12) { R(px + 4 + (r() * 6 | 0), py + 9, 3, 2, '#5a5464'); R(px + 4, py + 9, 1, 1, '#6e6878'); }
    if (wall(x, y - 1)) R(px, py, T, 3, 'rgba(0,0,0,.35)');   // ombre au pied des parois
    if (ch === 'D') { R(px, py, T, T, '#c8b890'); R(px, py, 6, T, '#efe2b8'); R(px + 2, py + 4, 1, 8, '#fff6d8'); }
    if (ch === 'S') {   // escalier qui descend, encombré d'éboulis
      for (let k = 0; k < 4; k++) R(px + 2, py + 2 + k * 3, 12, 3, ['#24202a', '#1a171f', '#121016', '#09080b'][k]);
      R(px + 1, py + 1, 14, 1, '#5a5266'); R(px + 3, py + 9, 4, 3, '#6e6878'); R(px + 8, py + 11, 5, 3, '#5a5464'); R(px + 6, py + 7, 3, 2, '#7a7484');
    }
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (L[y][x] === '#') {   // piliers / stalagmites
    const px = x * T, py = y * T;
    R(px + 2, py + 12, 12, 3, 'rgba(0,0,0,.35)');
    R(px + 3, py + 2, 10, 12, '#4a4454'); R(px + 5, py - 4, 6, 8, '#4a4454'); R(px + 7, py - 8, 2, 5, '#5a5266');
    R(px + 3, py + 2, 2, 12, '#625a6e'); R(px + 11, py + 2, 2, 12, '#2e2934'); R(px + 5, py - 4, 1, 8, '#6e6680');
  }
  return c;
}

export function buildWild(season, name = 'wild') {
  if (name === 'wild') return buildCave();
  const L = LAYOUTS[name], H = L.length, W = L[0].length;
  const c = document.createElement('canvas'); c.width = W * T; c.height = H * T;
  const g = c.getContext('2d'), r = rng(77 + season);
  const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  const B = shade(GRASS[season], .88), tones = [B, B, shade(B, .9), shade(B, 1.08)];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const px = x * T, py = y * T;
    paintGrass(R, r, px, py, x, y, B, season);   // Farmwest (7a) : herbe en brins
    for (let k = 0; k < 0; k++) { const sx = px + 1 + (r() * 12 | 0), sy = py + 2 + (r() * 10 | 0), d = shade(B, .75); R(sx, sy + 1, 1, 2, d); R(sx + 2, sy + 1, 1, 2, d); R(sx + 1, sy, 1, 3, d); }
    if (L[y][x] === 'D') { R(px, py, T, T, '#5a4a3a'); R(px + 2, py + 2, 10, 12, '#2a2220'); R(px, py, T, 2, '#8a7a68'); }
  }
  // rochers (#) puis arbres (T), triés de haut en bas
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (L[y][x] === '#') {
    const px = x * T + 8, py = y * T + 9; disc(g, px, py + 1, 8, '#3c3843'); disc(g, px - 1, py, 7, '#6a6672'); disc(g, px - 3, py - 3, 3, '#9a96a2');
  }
  canopy(g, W, H, (x, y) => (L[y] || '')[x] === 'T' && (name !== 'foret' || x === 0 || y === 0 || x === W - 1 || y === H - 1), season);   // lot 11b : canopée continue sur la bordure
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (L[y][x] === 'T' && !(name === 'foret' && x > 0 && y > 0 && x < W - 1 && y < H - 1)) {   // forêt : arbres intérieurs dessinés à part (on peut les couper)
    const v = (x * 7 + y * 3) % 4, im = (x + y) % 3 === 0 || (name === 'foret' && (x * y) % 5 === 1) ? pineSprite(season, v) : treeSprite(season, v);
    g.drawImage(im, x * T - 9, y * T - 26);
  }
  return c;
}

// Monstres : slimes vert ou bleu, cochon qui tire (sanglier sombre au lance-pierre).
// Arbre de la forêt (coupable) : même dessin que le fond ; souche quand il est coupé.
export function drawForestTree(c, x, y, season, cut) {
  if (cut) { c.fillStyle = '#5b3a22'; c.fillRect(x * T + 5, y * T + 9, 6, 4); c.fillStyle = '#c08a54'; c.fillRect(x * T + 5, y * T + 8, 6, 2); c.fillStyle = '#8a5a32'; c.fillRect(x * T + 7, y * T + 8, 2, 1); return; }
  // lot 11 : murs du labyrinthe en gros buissons serrés (ils ne débordent plus sur les allées)
  const P = CANOPY[season] || CANOPY[0], px = x * T + 8, py = y * T + 7, v = (x * 7 + y * 3) % 3, d = (cx, cy, r, col) => { c.fillStyle = col; for (let k = -r; k <= r; k++) { const w = Math.floor(Math.sqrt(r * r - k * k)); c.fillRect(cx - w, cy + k, 2 * w + 1, 1); } };
  c.fillStyle = 'rgba(20,30,10,.3)'; c.fillRect(x * T, y * T + 13, T, 3);
  d(px, py + 1, 9, shade(P[0], .8)); d(px, py, 8, P[0]); d(px - 2 + v, py - 2, 6, P[1]); d(px - 3, py - 4, 3, P[2]); c.fillStyle = P[2]; c.fillRect(px + 3, py - 1, 2, 2); c.fillRect(px - 5 + v, py + 2, 1, 1);
}
export function drawMob(c, e, now) {
  const px = Math.round(e.x * T), py = Math.round(e.y * T), R = (a, b, w, h, col) => { c.fillStyle = col; c.fillRect(px + a, py + b, w, h); };
  if (e.type === 'pig') {
    c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(px - 6, py + 3, 12, 2);
    const f = e.hit > 0 ? '#ffffff' : '#9a6a6a', d = '#6e4648', bob = Math.round(Math.sin(now / 160 + e.x) * 1);
    R(-7, -8 + bob, 13, 9, f); R(-7, 0 + bob, 13, 1, d); R(3, -11 + bob, 7, 8, f); R(9, -8 + bob, 2, 4, d); R(10, -7 + bob, 1, 1, '#3a2020');
    R(5, -9 + bob, 1, 1, '#ffd84a'); R(3, -13 + bob, 2, 2, d); R(7, -13 + bob, 2, 2, d);
    R(-6, 1, 2, 3, d); R(-1, 1, 2, 3, d); R(3, 1, 2, 3, d);
    R(-9, -9 + bob, 3, 1, '#5b3a22'); R(-10, -11 + bob, 1, 3, '#5b3a22'); R(-8, -11 + bob, 1, 3, '#5b3a22'); // lance-pierre
    return;
  }
  drawJelly(c, px, py + 3, e.type === 'slime_b' ? '#4a8ae0' : '#56c45a', now, e.x, e.hit > 0, e.type === 'slime_b' ? 120 : 180);
}

export function drawZRock(c, x, y, o) {
  const px = x * T + 8 + (o.shake > 0 ? Math.round(Math.sin(o.shake * 40)) : 0), py = y * T + 9;
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(px - 7, py + 4, 14, 2);
  const base = o.t === 'zrock3' ? ['#3d5a7a', '#5a86b0', '#a8d8ff'] : o.t === 'zrock2' ? ['#5a4a5e', '#7e6a82', '#c9a0d8'] : ['#57535e', '#827e8a', '#b4afba'];
  disc(c, px, py, 6, base[0]); disc(c, px - 1, py - 1, 5, base[1]); disc(c, px - 3, py - 3, 2, base[2]);
  if (o.t !== 'zrock1') { c.fillStyle = o.t === 'zrock3' ? '#e0f6ff' : '#e05a8a'; c.fillRect(px + 1, py - 2, 2, 2); c.fillRect(px - 2, py + 1, 1, 1); }
}

// Champignons dessinés à la main, un motif par espèce (C chapeau, D ombre, H reflet, G lamelles, W/w pied,
// Y/y jaune, V volve, B noir). Petit = 1 pixel par case, moyen = 1,5, gros = 2.
const SHROOM_PIX = {
  cepe: ['  DDDD  ', ' DCCCCD ', 'DCHCCCCD', 'DCCCCCCD', ' GGGGGG ', '  WWWw  ', '  WWWw  ', ' WWWWww '],
  girolle: [' CC  CC ', 'CCHCCCCC', ' CCCCCC ', '  GCCG  ', '   CC   ', '   CD   ', '  CCCD  '],
  morille: ['   DD   ', '  DCDD  ', '  CDCD  ', ' DCDCDD ', ' CDCDCD ', ' DCDCDD ', '  WWWw  ', '  WWWw  '],
  oronge: [' DCCCCD ', 'DCHCCCCD', 'DCCCCCCD', ' YYYYYY ', '   YY   ', '   Yy   ', '  VVVV  '],
  truffe_blanche: ['  DCCD  ', ' CHCCCD ', 'DCCCDCCD', 'DCCCCCCD', ' DDDDDD '],
  pied_mouton: [' CCCCCC ', 'CHCCCCCC', 'CCCCCCCD', ' GGGGGG ', '  WWWw  ', '  WWWw  '],
  trompette: [' B    B ', ' BBBBBB ', '  BDDB  ', '  BDDB  ', '   BB   ', '   BB   '],
  mousseron: ['  DCCD  ', ' CHCCCC ', ' DDDDDD ', '   Ww   ', '   Ww   ', '   Ww   ']
};
const SHROOM_CACHE = {};
export function drawShroom(c, x, y, m, color) {
  const pat = SHROOM_PIX[m.sp] || SHROOM_PIX.cepe, k = m.size === 'l' ? 2 : m.size === 'm' ? 1.5 : 1, h = pat.length;
  const key = m.sp + m.size + color;
  let spr = SHROOM_CACHE[key];
  if (!spr) { // dessiné une seule fois, puis réutilisé
    spr = document.createElement('canvas'); spr.width = Math.ceil(8 * k) + 1; spr.height = Math.ceil(h * k) + 1;
    drawShroomPix(spr.getContext('2d'), pat, k, color); SHROOM_CACHE[key] = spr;
  }
  c.fillStyle = 'rgba(0,0,0,.28)'; c.fillRect(Math.round(x * T + 8 - 4 * k), Math.round(y * T + 13), Math.round(8 * k), 2);
  c.drawImage(spr, Math.round(x * T + 8 - 4 * k), Math.round(y * T + 14 - h * k));
}
function drawShroomPix(c, pat, k, color) {
  const col = { C: color, D: shade(color, .72), H: shade(color, 1.45), G: '#e8dcc0', W: '#f4ead8', w: '#d2c6ae', Y: '#f2d23a', y: '#c8a82a', V: '#f4f0e6', B: '#2a2228' };
  for (let r = 0; r < pat.length; r++) for (let q = 0; q < 8; q++) {
    const ch = pat[r][q]; if (ch === ' ') continue;
    c.fillStyle = col[ch]; c.fillRect(Math.round(q * k), Math.round(r * k), Math.ceil(k), Math.ceil(k));
  }
}
