// Lot 10 : carte de la région refaite comme docs/carte-region-farmwest.jpg, pré-rendue en grand (88 × 48 cases de 16 px,
// 1408 × 768 px) avec les mêmes peintres que le jeu : herbe en brins, terre ocre, chemins de sable, rivière et ponts,
// falaises en terrasses, forêts en canopée continue, montagnes en 3/4 enneigées, caverne, mini-bâtiments, étiquettes western.
// Une fois par saison (cache). Le DOM n'est utilisé que pour créer le canvas.
import { rng } from '../world/map.js';
import { shade, disc } from './pixel.js';
import { paintGrass, paintOchre, paintRoad, paintRiver, paintBridge, paintCliff, paintPlanks, autotile, WEST_GRASS } from './terrain.js';
import { treeSprite, pineSprite, cactusSprite } from './sprites.js';
import { FARM_LOTS } from '../data/buildings.js';

export const RW = 88, RH = 48, RT = 16;
// Où se trouve chaque zone du jeu sur la carte (en cases), pour le repère du joueur.
export const FARM_RECT = l => ({ x: 37 + l.c * 8, y: 2 + l.r * 8, w: 7, h: 6 });
export const REGION_POS = {
  gare: [9, 19], town: [24, 20], resto: [24, 20], bar: [24, 20], rondpoint: [44, 20], quartier: [50, 23], ranch: [51, 30],
  parc: [46, 39], plage: [25, 40], port: [74, 40], foret: [62, 9], wild: [79, 5], montagne: [78, 20]
};
export function regionPos(S) {
  const p = REGION_POS[S.scene];
  if (p) return { x: p[0] + .5, y: p[1] + .5 };
  const l = FARM_LOTS[S.farmLot || 0] || FARM_LOTS[0], R = FARM_RECT(l);   // la ferme et ses intérieurs (maison, grange…)
  return { x: R.x + R.w / 2, y: R.y + R.h / 2 };
}
export const LABELS = [
  ['Les 4 Fermes', 44, 1.1], ['Forêt', 62, 7], ['Caverne Sombre', 79, 1.2], ['Montagne', 79, 13.2], ['Gare', 9, 16],
  ['Centre-ville', 24, 25], ['Zone Résidentielle', 51, 24.6], ['Ranch du Maire', 51, 27.6], ['Fête Foraine', 47, 40.6],
  ['Station Balnéaire', 25, 44.8], ['Zone Portuaire', 74, 46.2]
];

// ---------- plan en cases ----------
// g herbe, s terre ocre, . chemin, w eau (rivière, mer), = pont, b sable, ^ falaise, r voie ferrée, k roche (caverne),
// p planches (quais, promenade), F forêt (herbe + arbres), u champ cultivé
export function regionLayout() {
  const m = Array.from({ length: RH }, () => Array(RW).fill('s'));
  const set = (c, x0, y0, x1, y1) => { for (let y = Math.max(0, y0); y <= Math.min(RH - 1, y1); y++) for (let x = Math.max(0, x0); x <= Math.min(RW - 1, x1); x++) m[y][x] = c; };
  const at = (x, y) => (m[y] || [])[x];
  // prairie verte à l'ouest et au sud-ouest, herbe sur le plateau du centre-ville et au nord
  set('g', 0, 21, 12, 47); set('g', 15, 31, 36, 38); set('g', 15, 4, 30, 12);
  // forêts (canopée continue)
  set('F', 0, 0, 2, 47); set('F', 6, 0, 10, 13); set('F', 16, 5, 29, 10); set('F', 19, 0, 27, 2);
  set('F', 52, 0, 72, 17); set('F', 47, 15, 51, 17); set('F', 58, 21, 61, 29); set('F', 64, 21, 70, 28); set('F', 70, 29, 87, 33);
  set('F', 6, 25, 11, 47); set('F', 3, 35, 5, 47); set('F', 26, 31, 37, 36); set('F', 58, 31, 63, 36); set('F', 66, 30, 72, 36);
  for (let y = 0; y < RH; y++) for (let x = 0; x < RW; x++) if (m[y][x] === 'F' && (x * 7 + y * 13) % 23 === 0) m[y][x] = at(x, y) === 'F' && y < 21 ? 's' : 'g';   // quelques trouées
  // caverne : plateau rocheux au nord-est
  set('k', 73, 0, 87, 9);
  // le plateau du centre-ville (falaise au sud)
  set('s', 16, 13, 31, 27); set('^', 16, 28, 33, 29);
  // rivières : à l'ouest jusqu'à la mer, et autour du centre-ville
  set('w', 12, 0, 14, 47); set('w', 30, 0, 32, 11); set('w', 33, 11, 34, 31); set('w', 15, 30, 34, 31);
  // la mer au sud, le sable, la baie du port
  for (let x = 13; x < RW; x++) { const top = x < 60 ? 45 + Math.round(Math.sin(x / 5)) : x < 66 ? 44 - (x - 60) : 38; set('w', x, top, x, 47); set('b', x, top - 3, x, top - 1); }
  set('p', 18, 40, 36, 40);   // promenade en planches de la station balnéaire
  set('p', 64, 36, 87, 37); for (const x of [67, 72, 77, 82]) set('p', x, 38, x + 1, 44);   // quais et pontons du port
  // chemins de sable
  set('.', 3, 19, 69, 20);              // grande route est-ouest (gare → centre-ville → rond-point → est)
  set('.', 43, 1, 44, 38);              // route nord-sud (les 4 fermes → rond-point → fête foraine)
  set('.', 36, 8, 51, 8);               // allée entre les fermes
  set('.', 63, 9, 64, 40); set('.', 63, 9, 78, 10);   // vers la forêt et la caverne, puis le port
  set('.', 23, 13, 24, 30); set('.', 17, 2, 29, 3); set('.', 16, 3, 16, 12);   // rue du centre-ville, chemin du nord
  set('.', 38, 22, 58, 22); set('.', 45, 34, 63, 34);
  for (let y = 16; y <= 24; y++) for (let x = 40; x <= 48; x++) if (Math.hypot(x - 43.5, y - 19.5) < 4.2) m[y][x] = '.';   // rond-point
  // ponts
  set('=', 12, 19, 14, 20); set('=', 30, 2, 32, 3); set('=', 33, 19, 34, 20); set('=', 23, 30, 24, 31);
  // voie ferrée jusqu'à la gare
  set('r', 4, 0, 4, 17); set('r', 4, 18, 8, 18);
  // champs des 4 fermes
  for (const l of FARM_LOTS) { const R = FARM_RECT(l); set('s', R.x, R.y, R.x + R.w - 1, R.y + R.h - 1); set('u', R.x + 3, R.y + 1, R.x + R.w - 1, R.y + R.h - 1); }
  return m.map(r => r.join(''));
}

// ---------- peintres ----------
function house(g, x, y, w, h, wall, roof, opt = {}) {   // bâtiment en 3/4 : toit avec volume, façade, porte, fenêtres
  const R = (a, b, c, d, col) => { g.fillStyle = col; g.fillRect(Math.round(a), Math.round(b), c, d); };
  const rh = Math.round(h * .5), dk = shade(roof, .72), lt = shade(roof, 1.18);
  R(x + 2, y + h, w, 3, 'rgba(40,20,10,.3)');                       // ombre portée
  R(x, y + rh, w, h - rh, wall); R(x, y + rh, 1, h - rh, shade(wall, 1.15)); R(x + w - 2, y + rh, 2, h - rh, shade(wall, .78));
  for (let k = y + rh + 3; k < y + h; k += 3) R(x + 1, k, w - 3, 1, shade(wall, .9));   // planches
  R(x - 2, y + 2, w + 4, rh, roof); R(x - 2, y + 2, w + 4, 2, lt); R(x - 2, y + rh, w + 4, 2, dk);   // toit
  for (let k = y + 6; k < y + rh; k += 3) R(x - 1, k, w + 2, 1, dk);   // rangées de bardeaux
  if (opt.peak) { g.fillStyle = roof; g.beginPath(); g.moveTo(x - 2, y + 3); g.lineTo(x + w / 2, y - 4); g.lineTo(x + w + 2, y + 3); g.fill(); R(x + w / 2 - 1, y - 3, 2, 3, lt); }
  const dw = Math.max(3, w / 5 | 0); R(x + w / 2 - dw / 2, y + h - 6, dw, 6, '#3a2414'); R(x + w / 2 - dw / 2, y + h - 6, dw, 1, '#6a4426');
  if (w >= 12) for (const fx of [x + 2, x + w - 6]) { R(fx, y + rh + 3, 4, 3, '#ffd98a'); R(fx, y + rh + 3, 4, 1, '#3a2a20'); }
  if (opt.sign) { R(x + w / 2 - 6, y + rh - 3, 12, 4, '#e8d4ac'); R(x + w / 2 - 5, y + rh - 2, 10, 1, '#5b3a22'); }
  if (opt.chimney) { R(x + w - 6, y - 2, 3, 6, '#7a4a3a'); R(x + w - 6, y - 2, 3, 1, '#a86a52'); }
  g.strokeStyle = shade(roof, .5); g.lineWidth = 1; g.strokeRect(x - 1.5, y + 2.5, w + 3, rh - 1);
}
function mountain(g, cx, base, w, hgt, season) {   // montagne en 3/4 : versant éclairé à gauche, ombre à droite, neige au sommet
  const top = base - hgt, tri = (pts, col) => { g.fillStyle = col; g.beginPath(); pts.forEach(([a, b], i) => i ? g.lineTo(a, b) : g.moveTo(a, b)); g.closePath(); g.fill(); };
  tri([[cx - w / 2, base], [cx, top], [cx, base]], '#9a7a6a'); tri([[cx, top], [cx + w / 2, base], [cx, base]], '#6a4e44');
  for (let k = 1; k < 4; k++) { const yy = top + hgt * k / 4; g.fillStyle = 'rgba(60,40,30,.35)'; g.fillRect(cx - w * k / 8 + 2, yy, w * k / 8 - 2, 1); }
  const sn = hgt * (season === 3 ? .55 : .28);
  tri([[cx - w / 2 * sn / hgt, top + sn], [cx, top], [cx + w / 2 * sn / hgt, top + sn], [cx + 3, top + sn - 3], [cx - 2, top + sn + 2]], '#eef3f8');
  tri([[cx, top], [cx + w / 2 * sn / hgt, top + sn], [cx + 3, top + sn - 3]], '#c8d4e2');
  g.strokeStyle = 'rgba(50,30,24,.6)'; g.lineWidth = 1; g.beginPath(); g.moveTo(cx - w / 2, base); g.lineTo(cx, top); g.lineTo(cx + w / 2, base); g.stroke();
}
function ship(g, x, y, s) {   // voilier (2 mâts, voiles claires)
  const R = (a, b, c, d, col) => { g.fillStyle = col; g.fillRect(Math.round(a), Math.round(b), c, d); };
  R(x - 2, y + 10 * s, 34 * s, 3, 'rgba(10,40,80,.35)');
  g.fillStyle = '#6a3e1e'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 32 * s, y); g.lineTo(x + 27 * s, y + 9 * s); g.lineTo(x + 4 * s, y + 9 * s); g.fill();
  R(x, y, 32 * s, 2, '#a86a3a');
  for (const [mx, h] of [[10, 30], [21, 26]]) { R(x + mx * s, y - h * s, 2, h * s, '#4a2a14'); g.fillStyle = '#f4ead2'; g.beginPath(); g.moveTo(x + mx * s + 2, y - h * s + 2); g.lineTo(x + mx * s + 2, y - 4 * s); g.lineTo(x + (mx + 9) * s, y - 6 * s); g.fill(); g.fillStyle = '#d8cbb0'; g.fillRect(x + mx * s + 2, y - 8 * s, 6 * s, 2); }
}

export function buildRegionMap(season = 0) {
  const L = regionLayout(), c = document.createElement('canvas');
  c.width = RW * RT; c.height = RH * RT;
  const g = c.getContext('2d'), r = rng(1408 + season);
  const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  const at = (x, y) => (L[y] || '')[x] || '';
  const B = WEST_GRASS[season];
  // 1. sols
  for (let y = 0; y < RH; y++) for (let x = 0; x < RW; x++) {
    const ch = L[y][x], px = x * RT, py = y * RT;
    if (ch === 'g' || ch === 'F') paintGrass(R, r, px, py, x, y, shade(B, ch === 'F' ? .8 : 1), season);
    else if (ch === 's') paintOchre(R, r, px, py, x, y, season);
    else if (ch === '.') { paintRoad(R, r, px, py, x, y, at(x - 1, y) === '.' && at(x + 1, y) === '.' ? 1 : at(x, y - 1) === '.' && at(x, y + 1) === '.' ? 2 : 0); }
    else if (ch === 'w') { paintRiver(R, r, px, py, x, y, L); if (y >= 38 && at(x, y - 1) === 'w') R(px, py, RT, RT, shade('#3a7ec0', 1 - (y - 38) * .02)), r() < .3 && R(px + (r() * 12 | 0), py + (r() * 14 | 0), 4, 1, '#7cc0ec'); }
    else if (ch === '=') paintBridge(R, r, px, py, x, y, L);
    else if (ch === '^') paintCliff(R, r, px, py, x, y, L, season);
    else if (ch === 'p') paintPlanks(R, r, px, py, x, y);
    else if (ch === 'b') { R(px, py, RT, RT, '#ecd39a'); for (let k = 0; k < 6; k++) R(px + (r() * 15 | 0), py + (r() * 15 | 0), 1, 1, r() < .5 ? '#d8b878' : '#fff0c8'); if (at(x, y + 1) === 'w') { R(px, py + RT - 3, RT, 2, '#f8f4e8'); R(px + (r() * 8 | 0), py + RT - 4, 6, 1, '#ffffff'); } }
    else if (ch === 'k') { R(px, py, RT, RT, '#6a5a50'); for (let k = 0; k < 4; k++) R(px + (r() * 12 | 0), py + (r() * 12 | 0), 4, 3, ['#5a4a42', '#7a6a5e', '#4e4038'][k % 3]); if (at(x, y + 1) !== 'k') { R(px, py + RT - 5, RT, 5, '#4e4038'); R(px, py + RT - 5, RT, 1, '#8a7a6e'); } }
    else if (ch === 'r') { paintOchre(R, r, px, py, x, y, season); const v = at(x, y - 1) === 'r' || at(x, y + 1) === 'r'; if (v) { for (let k = 0; k < RT; k += 4) R(px + 2, py + k, 12, 2, '#6a4a30'); R(px + 4, py, 1, RT, '#9aa0a8'); R(px + 11, py, 1, RT, '#9aa0a8'); } else { for (let k = 0; k < RT; k += 4) R(px + k, py + 2, 2, 12, '#6a4a30'); R(px, py + 4, RT, 1, '#9aa0a8'); R(px, py + 11, RT, 1, '#9aa0a8'); } }
    else if (ch === 'u') { R(px, py, RT, RT, '#7a5232'); for (let k = 1; k < RT; k += 4) R(px, py + k, RT, 2, '#5e3e24'); if ((x + y) % 3) for (let k = 2; k < RT; k += 4) for (let j = 1; j < RT; j += 3) R(px + j, py + k - 1, 2, 2, season === 2 ? '#e0b040' : season === 3 ? '#e8eef2' : '#6aa84a'); }
  }
  // lot 11a : bords propres herbe ↔ terre ↔ chemins ↔ sable
  autotile(g, RW, RH, (x, y) => { const ch = at(x, y); return ch === '.' ? 'chemin' : ch === 'b' ? 'sable' : ch === 's' || ch === 'r' ? 'ocre' : ch === 'g' ? 'herbe' : ch === 'F' ? 'foret' : null; }, { chemin: 1, sable: 1, ocre: 2, herbe: 3, foret: 4 }, { ocre: '#d4a868', herbe: B, foret: shade(B, .8) });
  // 2. le rond-point : fontaine
  { const cx = 44 * RT, cy = 20 * RT; disc(g, cx, cy + 2, 20, 'rgba(40,20,10,.25)'); disc(g, cx, cy, 20, '#a8a29a'); disc(g, cx, cy, 16, '#5aa0d8'); disc(g, cx - 3, cy - 3, 6, '#9ad0f0'); disc(g, cx, cy, 5, '#c8c2ba'); R(cx - 1, cy - 12, 2, 10, '#e8f4fc'); }
  // 3. caverne : entrée dans la roche, éboulis
  { const cx = 79 * RT, cy = 5 * RT; g.fillStyle = '#4e4038'; g.beginPath(); g.ellipse(cx, cy, 30, 26, 0, Math.PI, 0); g.fill(); g.fillStyle = '#16121a'; g.beginPath(); g.ellipse(cx, cy + 6, 18, 18, 0, Math.PI, 0); g.fill(); R(cx - 18, cy + 6, 36, 8, '#16121a');
    for (const [a, b] of [[-26, 8], [22, 10], [-12, 16], [14, 18]]) { disc(g, cx + a, cy + b, 4, '#7a6a5e'); disc(g, cx + a - 1, cy + b - 1, 2, '#9a8a7e'); } }
  // 4. montagnes en 3/4 (de l'arrière vers l'avant)
  const mts = [[73, 21, 100, 76], [80, 20, 130, 110], [87, 22, 100, 80], [71, 26, 90, 58], [76, 27, 110, 76], [83, 27, 110, 72], [88, 27, 70, 52], [79, 29, 90, 48]];
  for (const [mx, my, w, h] of mts) mountain(g, mx * RT, my * RT + 8, w, h, season);
  // 5. bâtiments
  for (const l of FARM_LOTS) { const F = FARM_RECT(l), x = F.x * RT, y = F.y * RT; house(g, x + 4, y + 18, 26, 26, '#b8432f', '#5a2a22', { peak: true }); house(g, x + 6, y + 64, 18, 20, '#9a6a3c', '#4a3a2a'); R(x + 2, y + 2, F.w * RT - 4, 2, '#8a5a32'); R(x + 2, y + F.h * RT - 3, F.w * RT - 4, 2, '#8a5a32'); }
  house(g, 7 * RT, 17 * RT - 4, 50, 34, '#a8703a', '#5a3a22', { sign: true, chimney: true });   // la gare
  R(6 * RT, 21 * RT - 4, 64, 10, '#a8774a'); for (let k = 0; k < 64; k += 4) R(6 * RT + k, 21 * RT - 4, 1, 10, '#7a5232');   // quai
  for (const [x, y, wall, roof] of [[17, 14, '#9a6aaa', '#4a3a5a'], [20, 14, '#c84a3a', '#5a2a22'], [26, 14, '#c98a4a', '#7a3a22'], [28, 14, '#d8b878', '#8a4a2a'], [17, 22, '#9a6a3c', '#5a3a22'], [20, 22, '#c86a6a', '#5a2a3a'], [26, 22, '#e0d8c8', '#3e5a7a'], [29, 22, '#5a6a8a', '#24324a']])
    { R(x * RT - 4, (y + 3) * RT, 52, 8, '#a8774a'); house(g, x * RT, y * RT, 40, 44, wall, roof, { sign: true }); }   // centre-ville (trottoirs en planches)
  for (const [x, wall, roof] of [[38, '#e8d8c0', '#b8432f'], [41, '#d8c2e8', '#7a5a8a'], [47, '#f4f6f2', '#5aa8a0'], [50, '#f2dce0', '#a83a32'], [53, '#c8d8e8', '#3e5a7a'], [56, '#e0c8a0', '#6a4a2a']]) house(g, x * RT, 21 * RT - 30, 30, 28, wall, roof, { peak: true, chimney: x % 2 === 0 });   // zone résidentielle
  for (const [x, y, wall, roof] of [[38, 25, '#c84a3a', '#5a2a22'], [38, 28, '#5a7aa8', '#24324a'], [41, 26, '#e0c8a0', '#8a4a2a']]) house(g, x * RT, y * RT, 26, 24, wall, roof, { peak: true });
  { // ranch du Maire : clôture, maison, grange, chevaux
    const x0 = 46 * RT, y0 = 28 * RT, w = 12 * RT, h = 5 * RT; R(x0, y0, w, h, '#b8925a');
    for (let k = 0; k < w; k += 8) { R(x0 + k, y0, 2, h, 'rgba(0,0,0,0)'); R(x0 + k, y0 - 2, 2, 6, '#6a4426'); R(x0 + k, y0 + h - 4, 2, 6, '#6a4426'); }
    R(x0, y0, w, 2, '#8a5a32'); R(x0, y0 + h - 2, w, 2, '#8a5a32'); R(x0, y0, 2, h, '#8a5a32'); R(x0 + w - 2, y0, 2, h, '#8a5a32');
    house(g, x0 + 70, y0 - 30, 44, 34, '#b8432f', '#5a2a22', { peak: true, chimney: true }); house(g, x0 + 130, y0 - 20, 34, 28, '#a83a2a', '#4a2a1a');
    for (const [a, b, col] of [[24, 40, '#6a4426'], [60, 56, '#f4ead2'], [120, 46, '#3a2a20'], [150, 60, '#a8774a']]) { R(x0 + a, y0 + b, 12, 6, col); R(x0 + a + 9, y0 + b - 4, 4, 6, col); R(x0 + a + 1, y0 + b + 6, 2, 4, '#3a2a20'); R(x0 + a + 9, y0 + b + 6, 2, 4, '#3a2a20'); }
  }
  { // fête foraine : grands chapiteaux en bois, tentes, stands
    for (const [x, y, wall, roof] of [[38, 35, '#7a5a3a', '#4a3a2a'], [44, 35, '#5a7aa8', '#2a3a5a'], [49, 35, '#8a6a4a', '#4a3a2a'], [53, 35, '#7a5a3a', '#3a2a1a']]) house(g, x * RT, y * RT, 60, 40, wall, roof, { peak: true, sign: true });
    for (const [x, y] of [[41, 39], [52, 39], [46, 41], [55, 41]]) { g.fillStyle = '#f4ead2'; g.beginPath(); g.moveTo(x * RT - 14, y * RT + 14); g.lineTo(x * RT, y * RT - 6); g.lineTo(x * RT + 14, y * RT + 14); g.fill(); R(x * RT - 1, y * RT - 8, 2, 4, '#a83a2a'); g.fillStyle = '#d8cbb0'; g.beginPath(); g.moveTo(x * RT, y * RT - 6); g.lineTo(x * RT + 14, y * RT + 14); g.lineTo(x * RT + 4, y * RT + 14); g.fill(); }
  }
  for (const x of [18, 21, 24, 27, 30]) house(g, x * RT, 36 * RT, 34, 32, '#9a6a3c', '#5a3a22', { peak: true });   // cabines de plage
  for (const [x, col] of [[19, '#e0402a'], [23, '#f2c832'], [26, '#4a7ae8'], [29, '#e070b0'], [33, '#e0402a']]) { const px = x * RT, py = 42 * RT; R(px, py - 10, 1, 14, '#5b3a22'); g.fillStyle = col; g.beginPath(); g.arc(px, py - 10, 9, Math.PI, 0); g.fill(); R(px - 4, py + 4, 9, 3, '#f4ead2'); }
  for (const [x, wall, roof] of [[65, '#a86a4a', '#5a3a22'], [69, '#c84a3a', '#5a2a22'], [73, '#e0c8a0', '#3e5a7a'], [77, '#5a7aa8', '#24324a'], [81, '#9a8a6a', '#4a3a2a'], [84, '#c8d8e8', '#3e5a7a']]) house(g, x * RT, 33 * RT, 44, 34, wall, roof, { sign: true });   // entrepôts du port
  for (const [x, y] of [[69, 40], [74, 39], [79, 41], [84, 39]]) { R(x * RT, y * RT, 20, 7, '#f4f6f2'); R(x * RT + 2, y * RT + 7, 16, 3, '#a83a32'); R(x * RT + 8, y * RT - 6, 1, 6, '#4a2a14'); }   // barques
  ship(g, 58 * RT, 46 * RT + 4, 1.4); ship(g, 79 * RT, 45 * RT + 4, 1.5);
  // 6. arbres : forêts en canopée continue (sapins et feuillus serrés), cactus dans la terre ocre ; triés de haut en bas
  const trees = [];
  for (let y = 0; y < RH; y++) for (let x = 0; x < RW; x++) {
    const ch = L[y][x];
    if (ch === 'F') for (const [dx, dy] of [[0, 0], [8, 8]]) trees.push([x * RT + dx - 9 + (r() * 6 | 0), y * RT + dy - 30 + (r() * 4 | 0), r() < .45 ? 'p' : 't', (x * 7 + y * 3) % 4]);
    else if (ch === 's' && r() < .03 && x >= 65 && y > 10 && y < 30) trees.push([x * RT - 4, y * RT - 20, 'c', (x + y) % 3]);
  }
  trees.sort((a, b) => a[1] - b[1]);
  for (const [x, y, k, v] of trees) g.drawImage(k === 'p' ? pineSprite(season, v) : k === 'c' ? cactusSprite(season, v) : treeSprite(season, v), x, y);
  // 7. lisière ombrée sous les forêts
  for (let y = 0; y < RH - 1; y++) for (let x = 0; x < RW; x++) if (L[y][x] === 'F' && L[y + 1][x] !== 'F') R(x * RT, (y + 1) * RT, RT, 3, 'rgba(20,30,10,.28)');
  return c;
}

// Étiquette en police western (Rye), lettres claires cernées de brun, ombre portée.
export function drawLabel(g, text, x, y, size) {
  g.font = `${size}px Rye, "Lilita One", serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineJoin = 'round'; g.lineWidth = Math.max(2, size / 5);
  g.strokeStyle = 'rgba(30,15,5,.55)'; g.strokeText(text, x + size / 12, y + size / 10);
  g.strokeStyle = '#3b2414'; g.strokeText(text, x, y);
  g.fillStyle = '#fff4dc'; g.fillText(text, x, y);
  g.textBaseline = 'alphabetic'; g.textAlign = 'start';
}
