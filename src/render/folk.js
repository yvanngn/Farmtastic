// Personnages en « pixel moderne » (32 × 64), validés le 18/11 d'après la planche de référence (docs/personnages-reference.jpg).
// Chaque personnage est décrit en quelques lignes (CAST : silhouette, coiffure, chapeau, vêtements, couleurs) ; un même moteur
// le dessine en formes vectorielles puis en pixels : 4 tons par couleur (ombres vers le violet, lumières vers le jaune),
// ombres portées sous les cheveux et les cols, contour teinté. Vues : face, dos, profil (gauche = miroir), marche en 4 temps.
// Chaque image n'est calculée qu'une fois (cache). Le héros suit sa personnalisation (couleurs, coiffure, chapeau).
const P2 = f => { const p = new Path2D(); f(p); p.closePath(); return p; };
const E = (cx, cy, rx, ry) => P2(p => p.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2));
const RR = (x, y, w, h, r) => { const p = new Path2D(); p.roundRect(x, y, w, h, r); return p; };
const POLY = (...a) => P2(p => { p.moveTo(a[0], a[1]); for (let i = 2; i < a.length; i += 2) p.lineTo(a[i], a[i + 1]); });
const lock = (x, y, w, len, bend) => P2(p => { p.moveTo(x - w, y); p.quadraticCurveTo(x - w * .6 + bend * .3, y + len * .7, x + bend, y + len); p.quadraticCurveTo(x + w * .4 + bend * .6, y + len * .45, x + w, y); });

// ---------- couleurs ----------
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const toHex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
export function tones(base) {
  const c = hex(base);
  return { hi: toHex(mix(c, [255, 240, 190], .32)), base, sh: toHex(mix(c, [60, 40, 110], .32)), dk: toHex(mix(c, [40, 20, 60], .55)), ol: toHex(mix(c, [30, 14, 34], .72)) };
}


// ---------- rendu en pixels ----------
let probe = null;
export function renderPixel(m, W, H, opt = {}) {
  probe ||= document.createElement('canvas').getContext('2d');
  m.pattern ||= {};
  const s = opt.s || W / 64, sorted = [...m.parts].sort((a, b) => b.z - a.z);
  const at = (mx, my) => { for (const p of sorted) if (probe.isPointInPath(p.path, mx, my)) return p; return null; };
  const id = [];
  for (let j = 0; j < H; j++) { id.push([]); for (let i = 0; i < W; i++) id[j].push(at((i + .5) / s, (j + .5) / s)); }
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const T = {}; for (const k in m.mats) T[k] = tones(m.mats[k]);
  const P = (i, j) => (id[j] && id[j][i]) || null;
  const o = opt.shade || 1;
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const p = id[j][i]; if (!p) continue;
    const t = T[p.mat] || (T[p.mat] = tones('#ff00ff')); let col = t.base;
    const same = q => q && q.mat === p.mat, br = P(i + o, j + o), tl = P(i - o, j - o);
    if (!same(br)) col = t.sh; else if (!same(tl)) col = t.hi;
    if (opt.deep && !same(P(i + 2 * o, j + 2 * o)) && !same(P(i + o, j))) col = t.dk;
    // ombre portée : une pièce plus haute juste au-dessus (frange, col, bras)
    const up = P(i, j - o), up2 = P(i - 1, j - o);
    if ((up && up.z > p.z && up.mat !== p.mat) || (opt.deep && up2 && up2.z > p.z && up2.mat !== p.mat && up2.path !== p.path)) col = t.sh;
    const pt = m.pattern[p.mat] || (p.mat === 'hair' && !opt.noStrands ? { type: 'strands' } : null), ptype = pt && (pt.type || 'plaid');
    if (ptype === 'strands' && col === t.base && (i * 2 + j) % 5 === 0) col = t.sh;   // mèches
    if (ptype === 'plaid') { const q = opt.q || 4, a = i % q === 0, b = j % q === 0; if (a && b) col = t.dk; else if (a || b) col = col === t.hi ? t.base : t.sh; }
    else if (ptype === 'check') { if (((i >> 1) + (j >> 1)) % 2) col = pt.col; }
    else if (ptype === 'knit') { if (i % 3 === 0) col = col === t.hi ? t.base : t.sh; if ((j + (i % 3 === 1 ? 1 : 0)) % 4 === 0 && i % 3 === 1) col = t.hi; }
    else if (ptype === 'flowers') { const h = (i * 7 + j * 13) % 11; if (h === 0) col = pt.col; else if (h === 5) col = pt.col2 || pt.col; }
    else if (ptype === 'stripe') { if (j % 3 === 0) col = pt.col; }
    else if (ptype === 'planks') { if (i % 5 === 0) col = t.sh; else if (i % 5 === 1 && col === t.base && (j * 7 + i) % 13 === 0) col = t.hi; }   // planches verticales
    else if (ptype === 'boards') { if (j % 4 === 0) col = t.sh; else if (j % 4 === 1 && col === t.base) col = t.hi; }   // bardage à clin
    else if (ptype === 'awning') { if (i % 8 >= 4) col = pt.col; }
    // contour : bord de la silhouette (plus clair côté lumière)
    const edge = !P(i - 1, j) || !P(i + 1, j) || !P(i, j - 1) || !P(i, j + 1);
    if (edge) col = (!P(i - 1, j) || !P(i, j - 1)) && opt.selout ? t.dk : t.ol;
    else if (opt.inner) { const n = [P(i + 1, j), P(i, j + 1)].find(q => q && q.mat !== p.mat && q.z > p.z); if (n) col = t.dk; }
    g.fillStyle = col; g.fillRect(i, j, 1, 1);
  }
  // visage (pixels posés à la main selon la taille)
  const px = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x * s), Math.round(y * s), w, h); };
  for (const f of m.feat) {
    if (f.t === 'eyes') for (const sx of [-1, 1]) {
      const x = f.x + sx * f.gap;
      if (W <= 16) { px(x - 2, f.y - 4, 1, 2, '#2a1c2c'); }
      else { px(x - 2, f.y - 4, 2, 3, '#2a1c2c'); px(x - 2, f.y - 4 + 2 / s, 2, 1, f.col); px(x - 2 + (sx < 0 ? 1 : 0) / s, f.y - 4, 1, 1, '#ffffff'); if (f.sleepy) px(x - 2, f.y - 4 - 1 / s, 2, 1, '#2a2632'); }
    }
    if (f.t === 'mouth') { if (W <= 16) px(f.x - 2, f.y - 2, 1, 1, '#b4524a'); else { px(f.x - 3, f.y - 2, f.smile ? 3 : 2, 1, '#9a3e3a'); if (f.smile) px(f.x - 3, f.y - 4, 1, 1, '#9a3e3a'); } }
    if (f.t === 'brows' && W > 16) for (const sx of [-1, 1]) { px(f.x + sx * f.gap - 2.5, f.y - 2, 3, 1, f.col); if (f.sad) px(f.x + sx * f.gap - 2.5 + (sx < 0 ? 4 : -2), f.y - 4, 1, 1, f.col); }
    if (f.t === 'nose' && W > 16) px(f.x, f.y - 2, 1, 1, '#d08a6a');
    if (f.t === 'blush' && W > 16) for (const sx of [-1, 1]) px(f.x + sx * f.gap - 3, f.y - 2, 2, 1, '#f08a7a');
    if (f.t === 'btn') px(f.x - 1, f.y - 1, W > 16 ? (f.w || 2) : 1, W > 16 ? (f.h || 2) : 1, f.col || '#f2c94c');
    if (f.t === 'px') px(f.x, f.y, f.w || 1, f.h || 1, f.col);
    if (f.t === 'eye1') { px(f.x - 2, f.y - 4, 2, 3, '#2a1c2c'); px(f.x - 2, f.y - 4 + 2 / s, 2, 1, f.col); px(f.x - 2, f.y - 4, 1, 1, '#ffffff'); if (f.sleepy) px(f.x - 2, f.y - 4 - 1 / s, 2, 1, '#2a2632'); }
    if (f.t === 'brow1') { px(f.x - 3, f.y - 2, 3, 1, f.col); if (f.sad) px(f.x - 3, f.y - 4, 1, 1, f.col); }
    if (f.t === 'mouth1') px(f.x - 2, f.y - 2, 2, 1, '#9a3e3a');
  }
  return c;
}


// ---------- face et dos ----------
function buildFront(c, back, s) {
  const parts = [], feat = [];
  let tag = null; const add = (path, mat, z) => parts.push({ path, mat, z, tag });
  const G0 = c.garments || [], FRONT_ONLY = ['vest', 'lapels', 'bolo', 'stetho', 'pocket', 'pipe', 'chef', 'scarf', 'apronBib'];
  c = { ...c, garments: back ? G0.filter(x => !FRONT_ONLY.includes(x)) : G0 };
  const cx = 32, H = { cy: 37, rx: c.kid ? 18.5 : 16.5, ry: c.kid ? 18.5 : 17 };   // proportions validées (1re comparaison Cloud / Myst)
  const { cy, rx, ry } = H, top = cy - ry;
  const neckY = cy + ry - 2, shY = neckY + 2, hipY = 96, footY = 128;
  const bw = c.bw || (c.stout ? 36 : c.muscle ? 38 : c.f ? 28 : c.kid ? 28 : 31), bwb = c.stout ? bw + 2 : c.muscle ? bw - 8 : bw - 4;
  const legW = c.legW || (c.stout ? 11 : 9.5), footW = legW + 2, footH = 8;
  const armL = c.armL || 30, armW = c.muscle ? 11 : c.stout ? 10 : 9;
  // ---- jambes et chaussures
  if (!c.noFeet) { tag = 'L'; add(RR(cx - 2 - footW, footY - footH, footW, footH, 3), 'shoe', 1); tag = 'R'; add(RR(cx + 2, footY - footH, footW, footH, 3), 'shoe', 1); tag = null; }
  if (c.socks) { tag = 'L'; add(RR(cx - 2.5 - legW + 1, footY - footH - 7, legW - 2, 8, 1), 'sock', 1.5); tag = 'R'; add(RR(cx + 3.5, footY - footH - 7, legW - 2, 8, 1), 'sock', 1.5); tag = null; }
  const legTop = hipY - 6, legH = footY - footH + 2 - legTop;
  if (c.shorts) { tag = 'L'; add(RR(cx - 2.5 - legW + 1, legTop, legW - 2, legH, 2), 'skin', 2); tag = 'R'; add(RR(cx + 3.5, legTop, legW - 2, legH, 2), 'skin', 2); tag = null; add(RR(cx - 2.5 - legW, legTop - 2, 2 * legW + 5, 12, 3), 'over', 2.5); }
  else if (!c.dress) { tag = 'L'; add(RR(cx - 2.5 - legW, legTop, legW, legH, 2), 'pant', 2); tag = 'R'; add(RR(cx + 2.5, legTop, legW, legH, 2), 'pant', 2); tag = null; }
  // ---- buste, bras, mains
  const torso = P2(p => { p.moveTo(cx - bw / 2, shY + 6); p.quadraticCurveTo(cx - bw / 2, shY, cx - bw / 2 + 6, shY); p.lineTo(cx + bw / 2 - 6, shY); p.quadraticCurveTo(cx + bw / 2, shY, cx + bw / 2, shY + 6); p.lineTo(cx + bwb / 2, hipY + 2); p.lineTo(cx - bwb / 2, hipY + 2); });
  add(torso, 'top', 3);
  if (c.dress) add(P2(p => { p.moveTo(cx - bwb / 2, hipY - 14); p.lineTo(cx + bwb / 2, hipY - 14); p.quadraticCurveTo(cx + bwb / 2 + 6, hipY + 10, cx + bwb / 2 + 8, footY - (c.noFeet ? 0 : 7)); p.lineTo(cx - bwb / 2 - 8, footY - (c.noFeet ? 0 : 7)); p.quadraticCurveTo(cx - bwb / 2 - 6, hipY + 10, cx - bwb / 2, hipY - 14); }), 'dress', 3.5);
  const arm = (x, out) => P2(p => { p.moveTo(x, shY + 4); p.quadraticCurveTo(x, shY + 1, x + armW / 2, shY + 1); p.quadraticCurveTo(x + armW, shY + 1, x + armW, shY + 4); p.lineTo(x + armW + out, shY + armL); p.lineTo(x + out, shY + armL); });
  const aL = cx - bw / 2 - armW + 2, aR = cx + bw / 2 - 2;
  const sleeve = c.sleeve || 'top';
  tag = 'aL'; if (c.bareArms || c.rolled) add(arm(aL, -1.5), 'skin', 4); else add(arm(aL, -1.5), sleeve, 4);
  if (c.bareArms) add(RR(aL + armW - 3, shY - .5, 4, 6, 2), sleeve, 4.2); else if (c.rolled) add(RR(aL - .5, shY + 1, armW + .5, armL * .55, 3), sleeve, 4.2);
  tag = 'aR'; if (c.bareArms || c.rolled) add(arm(aR, 1.5), 'skin', 4); else add(arm(aR, 1.5), sleeve, 4);
  if (c.bareArms) add(RR(aR, shY - .5, 4, 6, 2), sleeve, 4.2); else if (c.rolled) add(RR(aR, shY + 1, armW + .5, armL * .55, 3), sleeve, 4.2); tag = null;
  if (c.puffy) { add(E(aL + armW / 2, shY + 5, armW / 2 + 2.5, 6), 'top', 4.3); add(E(aR + armW / 2, shY + 5, armW / 2 + 2.5, 6), 'top', 4.3); }
  const hr = c.gloves ? 5.6 : 4.6, hy = shY + armL + 2;
  tag = 'aL'; add(E(aL + armW / 2 - 1.5, hy, hr, hr * 1.05), c.gloves ? 'glove' : 'skin', 5); tag = 'aR'; add(E(aR + armW / 2 + 1.5, hy, hr, hr * 1.05), c.gloves ? 'glove' : 'skin', 5); tag = null;
  // ---- surcouches
  const g = c.garments || [];
  if (g.includes('coat')) {   // long manteau évasé (Myst, cocher)
    add(P2(p => { p.moveTo(cx - bw / 2 - 1, shY + 6); p.quadraticCurveTo(cx - bw / 2 - 1, shY - 1, cx - bw / 2 + 6, shY - 1); p.lineTo(cx + bw / 2 - 6, shY - 1); p.quadraticCurveTo(cx + bw / 2 + 1, shY - 1, cx + bw / 2 + 1, shY + 6);
      p.quadraticCurveTo(cx + bw / 2 + 3, hipY, cx + bw / 2 + 7, hipY + 16); p.lineTo(cx + 3, hipY + 17); p.lineTo(cx + 2, shY + 12); p.lineTo(cx - 2, shY + 12); p.lineTo(cx - 3, hipY + 17); p.lineTo(cx - bw / 2 - 7, hipY + 16); p.quadraticCurveTo(cx - bw / 2 - 3, hipY, cx - bw / 2 - 1, shY + 6); }), 'coat', 6);
    tag = 'aL'; add(arm(aL - 1, -1.5), 'coat', 6.5); tag = 'aR'; add(arm(aR + 1, 1.5), 'coat', 6.5); tag = null;
  }
  if (g.includes('jacket')) {   // veste de costume courte, ouverte (Manu)
    add(P2(p => { p.moveTo(cx - bw / 2 - 1, shY + 6); p.quadraticCurveTo(cx - bw / 2 - 1, shY - 1, cx - bw / 2 + 6, shY - 1); p.lineTo(cx - 4, shY - 1); p.lineTo(cx - 3, hipY + 6); p.lineTo(cx - bwb / 2 - 2, hipY + 6); }), 'coat', 6);
    add(P2(p => { p.moveTo(cx + bw / 2 + 1, shY + 6); p.quadraticCurveTo(cx + bw / 2 + 1, shY - 1, cx + bw / 2 - 6, shY - 1); p.lineTo(cx + 4, shY - 1); p.lineTo(cx + 3, hipY + 6); p.lineTo(cx + bwb / 2 + 2, hipY + 6); }), 'coat', 6);
    tag = 'aL'; add(arm(aL - 1, -1.5), 'coat', 6.5); tag = 'aR'; add(arm(aR + 1, 1.5), 'coat', 6.5); tag = null;
  }
  if (g.includes('vest')) { add(POLY(cx - 8, shY + 4, cx - 1, shY + 20, cx - 1, hipY, cx - 11, hipY), 'vest', 5.5); add(POLY(cx + 8, shY + 4, cx + 1, shY + 20, cx + 1, hipY, cx + 11, hipY), 'vest', 5.5); feat.push({ t: 'btn', x: cx - 3, y: shY + 26, col: '#e8d8a0', w: 1, h: 1 }, { t: 'btn', x: cx - 3, y: shY + 32, col: '#e8d8a0', w: 1, h: 1 }); }
  if (g.includes('lapels')) { add(POLY(cx - 10, shY - 3, cx - 3, shY + 2, cx - 1, shY + 22, cx - 8, shY + 9), 'lapel', 7); add(POLY(cx + 10, shY - 3, cx + 3, shY + 2, cx + 1, shY + 22, cx + 8, shY + 9), 'lapel', 7); }
  if (g.includes('fur')) { add(E(cx - 9, shY + 1, 9, 6), 'fur', 8); add(E(cx + 9, shY + 1, 9, 6), 'fur', 8); add(POLY(cx - 5, shY + 4, cx - 1, shY + 4, cx - 2, hipY + 16, cx - 5, hipY + 16), 'fur', 7); add(POLY(cx + 5, shY + 4, cx + 1, shY + 4, cx + 2, hipY + 16, cx + 5, hipY + 16), 'fur', 7); }
  if (g.includes('overalls') && back) { add(RR(cx - bwb / 2 + 1, hipY - 7, bwb - 2, 12, 3), 'over', 6); add(POLY(cx - bw / 2 + 3, shY - .5, cx - bw / 2 + 8, shY - .5, cx + 9, hipY - 6, cx + 4, hipY - 6), 'over', 6); add(POLY(cx + bw / 2 - 3, shY - .5, cx + bw / 2 - 8, shY - .5, cx - 9, hipY - 6, cx - 4, hipY - 6), 'over', 6); }
  else if (g.includes('overalls')) {
    add(POLY(cx - 10, shY + 11, cx + 10, shY + 11, cx + 11, hipY, cx - 11, hipY), 'over', 6); add(RR(cx - bwb / 2 + 1, hipY - 7, bwb - 2, 12, 3), 'over', 6);
    add(POLY(cx - 9, shY + 12, cx - bw / 2 + 3, shY - .5, cx - bw / 2 + 8, shY - .5, cx - 5, shY + 12), 'over', 6); add(POLY(cx + 9, shY + 12, cx + bw / 2 - 3, shY - .5, cx + bw / 2 - 8, shY - .5, cx + 5, shY + 12), 'over', 6);
    if (c.pocket === 'heart') add(P2(p => { p.moveTo(cx, shY + 24); p.bezierCurveTo(cx - 6, shY + 19, cx - 4, shY + 14, cx, shY + 17); p.bezierCurveTo(cx + 4, shY + 14, cx + 6, shY + 19, cx, shY + 24); }), 'heart', 7);
    else add(RR(cx - 5, shY + 16, 10, 7, 2), 'overD', 7);
    feat.push({ t: 'btn', x: cx - 7, y: shY + 13 }, { t: 'btn', x: cx + 7, y: shY + 13 });
  }
  if (g.includes('apron') && back) { add(RR(cx - 7, hipY - 9, 14, 3, 1), 'apron', 6.8); add(POLY(cx - 2, hipY - 7, cx - 6, hipY + 4, cx - 3, hipY + 4), 'apron', 6.9); add(POLY(cx + 2, hipY - 7, cx + 6, hipY + 4, cx + 3, hipY + 4), 'apron', 6.9); }
  else if (g.includes('apron')) add(P2(p => { p.moveTo(cx - (c.f ? 9 : 10), c.f ? hipY - 12 : shY + 6); p.lineTo(cx + (c.f ? 9 : 10), c.f ? hipY - 12 : shY + 6); p.lineTo(cx + (c.f ? 15 : 13), c.f ? footY - 18 : hipY + 18); p.quadraticCurveTo(cx, c.f ? footY - 14 : hipY + 21, cx - (c.f ? 15 : 13), c.f ? footY - 18 : hipY + 18); }), 'apron', 6.8);
  if (g.includes('apronBib')) add(RR(cx - 8, shY + 4, 16, 18, 3), 'apron', 6.8);
  if (g.includes('suspenders')) { add(POLY(cx - 9, shY - .5, cx - 6, shY - .5, cx - 5, hipY, cx - 8, hipY), 'susp', 6); add(POLY(cx + 9, shY - .5, cx + 6, shY - .5, cx + 5, hipY, cx + 8, hipY), 'susp', 6); }
  if (g.includes('backpack') && back) { add(RR(cx - 11, shY + 3, 22, 26, 5), 'pack', 8); add(RR(cx - 8, shY + 16, 16, 9, 3), 'pack', 8.5); }
  else if (g.includes('backpack')) { add(POLY(cx - 12, shY - .5, cx - 8, shY - .5, cx - 9, shY + 24, cx - 12, shY + 24), 'pack', 7.5); add(POLY(cx + 12, shY - .5, cx + 8, shY - .5, cx + 9, shY + 24, cx + 12, shY + 24), 'pack', 7.5); }
  if (g.includes('belt') || g.includes('toolbelt')) add(RR(cx - bwb / 2 - 1, hipY - 6, bwb + 2, 4, 1), 'belt', 7);
  if (g.includes('toolbelt')) { add(RR(cx - bwb / 2 - 2, hipY - 4, 8, 9, 2), 'belt', 7.2); add(RR(cx + bwb / 2 - 6, hipY - 4, 8, 9, 2), 'belt', 7.2); feat.push({ t: 'px', x: cx + bwb / 2 - 4, y: hipY - 9, w: 1, h: 3, col: '#9aa0a8' }); }
  if (g.includes('belt')) feat.push({ t: 'btn', x: cx, y: hipY - 4, col: '#e8c050' });
  if (g.includes('hoodie') && back) add(P2(p => { p.moveTo(cx - 12, shY + 1); p.quadraticCurveTo(cx, shY - 6, cx + 12, shY + 1); p.quadraticCurveTo(cx + 6, shY + 16, cx, shY + 18); p.quadraticCurveTo(cx - 6, shY + 16, cx - 12, shY + 1); }), 'topD', 12);
  else if (g.includes('hoodie')) { add(E(cx, shY + 1, 13, 5), 'top', 7); add(RR(cx - 10, hipY - 14, 20, 9, 3), 'topD', 7); feat.push({ t: 'px', x: cx - 3, y: shY + 4, w: 1, h: 4, col: '#f4f4f0' }, { t: 'px', x: cx + 2.5, y: shY + 4, w: 1, h: 4, col: '#f4f4f0' }); }
  if (g.includes('chef')) { add(POLY(cx - bw / 2 + 2, shY - 1, cx + 6, shY - 1, cx + 2, hipY + 2, cx - bwb / 2, hipY + 2), 'top', 5); for (let k = 0; k < 3; k++) feat.push({ t: 'btn', x: cx + 5, y: shY + 10 + k * 9, col: '#c8c4bc' }, { t: 'btn', x: cx - 4, y: shY + 10 + k * 9, col: '#c8c4bc' }); }
  if (g.includes('scarf')) add(POLY(cx - 9, shY - 2, cx + 9, shY - 2, cx + 2, shY + 9, cx - 2, shY + 9), 'scarf', 9);
  if (g.includes('bolo')) feat.push({ t: 'px', x: cx, y: shY + 2, w: 1, h: 7, col: '#3a2418' }, { t: 'btn', x: cx, y: shY + 3, col: '#c8a8e8' });
  if (g.includes('stetho')) feat.push({ t: 'px', x: cx - 8, y: shY + 1, w: 1, h: 12, col: '#4a5a6a' }, { t: 'px', x: cx + 7, y: shY + 1, w: 1, h: 10, col: '#4a5a6a' }, { t: 'btn', x: cx + 8, y: shY + 21, col: '#b8c4d0' }, { t: 'px', x: cx - 8, y: shY + 13, w: 3, h: 1, col: '#4a5a6a' });
  if (g.includes('towel')) add(RR(cx + bw / 2 - 9, shY - 3, 10, 15, 3), 'towel', 9);
  if (g.includes('pocket')) add(RR(cx - 11, shY + 9, 7, 6, 1), 'topD', 6);
  if (g.includes('staff')) add(RR(aR + armW / 2 + 1.5 - 1.5, shY - 14, 3, footY - shY + 12, 1.5), 'staff', 5.5);   // bâton noueux (lot 13)
  if (g.includes('pipe')) feat.push({ t: 'px', x: cx + 4, y: cy + 13, w: 4, h: 1, col: '#5a3a22' }, { t: 'px', x: cx + 8, y: cy + 10, w: 2, h: 3, col: '#5a3a22' });
  // ---- tête
  add(RR(cx - 4, neckY - 6, 8, 10, 2), 'skin', 9);
  add(E(cx - rx + .5, cy + 3, 3.6, 4.6), 'skin', 9); add(E(cx + rx - .5, cy + 3, 3.6, 4.6), 'skin', 9);
  add(P2(p => { p.moveTo(cx - rx, cy); p.bezierCurveTo(cx - rx, top - 1, cx + rx, top - 1, cx + rx, cy); p.bezierCurveTo(cx + rx, cy + ry * .75, cx + rx * .45, cy + ry, cx, cy + ry); p.bezierCurveTo(cx - rx * .45, cy + ry, cx - rx, cy + ry * .75, cx - rx, cy); }), 'skin', 10);
  // coiffures
  const cap = (low = 6) => P2(p => { p.moveTo(cx - rx - 1.5, cy + 4); p.bezierCurveTo(cx - rx - 2.5, top - 6, cx + rx + 2.5, top - 6, cx + rx + 1.5, cy + 4); p.lineTo(cx + rx - 1.5, cy + 3);
    p.quadraticCurveTo(cx + rx - 3, cy - low + 1, cx + rx - 7, cy - low); p.lineTo(cx - rx + 7, cy - low); p.quadraticCurveTo(cx - rx + 3, cy - low + 1, cx - rx + 1.5, cy + 3); });
  const hs = c.hair;
  if (hs === 'messy') {
    add(P2(p => { p.moveTo(cx - rx - 1.5, cy + 5); p.quadraticCurveTo(cx - rx - 4, cy - 10, cx - rx + 2, top + 2); p.quadraticCurveTo(cx - 13, top - 8, cx - 6, top - 2); p.quadraticCurveTo(cx - 3, top - 10, cx + 3, top - 2); p.quadraticCurveTo(cx + 9, top - 9, cx + 12, top + 1);
      p.quadraticCurveTo(cx + rx + 4, cy - 12, cx + rx + 1.5, cy + 5); p.lineTo(cx + rx - 1.5, cy + 4); p.quadraticCurveTo(cx + rx - 3, cy - 5, cx + rx - 7, cy - 6.5); p.lineTo(cx - rx + 7, cy - 6.5); p.quadraticCurveTo(cx - rx + 3, cy - 5, cx - rx + 1.5, cy + 4); }), 'hair', 11);
    for (const [x, w, len, bend] of [[cx - 9, 5, 6, -2], [cx - 1, 6, 7, 1], [cx + 8, 5, 5.5, 3]]) add(lock(x, cy - 7, w, len, bend), 'hair', 12);
  } else if (hs === 'spiky') {
    add(P2(p => { p.moveTo(cx - rx - 3, cy + 7); p.quadraticCurveTo(cx - rx - 6, cy - 10, cx - rx + 1, top + 2); p.lineTo(cx - rx - 4, top - 6); p.lineTo(cx - 9, top - 3); p.lineTo(cx - 7, top - 12); p.lineTo(cx - 1, top - 4); p.lineTo(cx + 4, top - 13); p.lineTo(cx + 8, top - 4); p.lineTo(cx + 16, top - 9); p.lineTo(cx + rx - 1, top + 1); p.lineTo(cx + rx + 5, top + 2);
      p.quadraticCurveTo(cx + rx + 5, cy - 6, cx + rx + 3, cy + 6); p.lineTo(cx + rx - 1, cy + 4); p.quadraticCurveTo(cx + rx - 3, cy - 6, cx + rx - 8, cy - 8); p.lineTo(cx - rx + 6, cy - 8); p.quadraticCurveTo(cx - rx + 2, cy - 4, cx - rx + 1, cy + 6); }), 'hair', 11);
    for (const [x, w, len, bend] of [[cx - 10, 4, 10, -3], [cx - 4, 5, 12, -2], [cx + 3, 5, 10, 1], [cx + 10, 4, 8, 3]]) add(lock(x, cy - 9, w, len, bend), 'hair', 12);
  } else if (hs === 'short') {
    add(cap(5), 'hair', 11); for (const [x, b] of [[cx - 12, -2], [cx + 12, 2]]) add(lock(x, cy - 6, 4, 5, b), 'hair', 12); add(lock(cx - 6, cy - 6, 7, 5, 3), 'hair', 12); add(lock(cx + 6, cy - 6, 6, 3, 2), 'hair', 12);
  } else if (hs === 'bun' || hs === 'pigtails' || hs === 'braid') {
    add(cap(4), 'hair', 11); add(lock(cx - 6, cy - 5, 8, 4, -3), 'hair', 12); add(lock(cx + 6, cy - 5, 8, 4, 3), 'hair', 12);
    for (const [x, y, b] of [[cx - 10, top + 4, -2], [cx + 9, top + 4, 2], [cx, top + 1, 1]]) add(lock(x, y, 4, 7, b), 'hair', 11.2);
    add(E(cx - rx + 1, cy + 6, 3, 7), 'hair', 11.5); add(E(cx + rx - 1, cy + 6, 3, 7), 'hair', 11.5);
    if (hs === 'bun') add(E(cx + 1, top - 4, 7.5, 6.5), 'hair', 12.5);
    if (hs === 'braid') { add(E(cx, top - 3, 8, 6), 'hair', 12.5); for (let k = 0; k < 3; k++) add(E(cx + rx - 1, cy + 12 + k * 7, 3.6, 4), 'hair', 13); }
    if (hs === 'pigtails') { add(E(cx - rx - 4, cy - 2, 6, 8), 'hair', 10.5); add(E(cx + rx + 4, cy - 2, 6, 8), 'hair', 10.5); add(E(cx - rx - 1, cy - 9, 3, 2.4), 'ribbon', 12); add(E(cx + rx + 1, cy - 9, 3, 2.4), 'ribbon', 12); }
    if (c.pencil) feat.push({ t: 'px', x: cx - 2, y: top - 8, w: 1, h: 6, col: '#f2c94c' }, { t: 'px', x: cx - 2, y: top - 9, w: 1, h: 1, col: '#e88aa0' });
  } else if (hs === 'long') {
    add(cap(4), 'hair', 11); add(lock(cx - 6, cy - 5, 8, 5, -3), 'hair', 12); add(lock(cx + 6, cy - 5, 8, 5, 3), 'hair', 12);
    add(P2(p => { p.moveTo(cx - rx - 2, cy); p.quadraticCurveTo(cx - rx - 6, shY + 20, cx - rx + 2, shY + 30); p.lineTo(cx - rx + 6, shY + 4); p.lineTo(cx - rx + 2, cy); }), 'hair', 8);
    add(P2(p => { p.moveTo(cx + rx + 2, cy); p.quadraticCurveTo(cx + rx + 6, shY + 20, cx + rx - 2, shY + 30); p.lineTo(cx + rx - 6, shY + 4); p.lineTo(cx + rx - 2, cy); }), 'hair', 8);
  }
  if (back && hs !== 'bald' && hs) add(E(cx, cy - 1, rx + 1.5, ry - .5), 'hair', 12.6);   // de dos : l'arrière de la tête
  if (back && hs === 'long') add(P2(p => { p.moveTo(cx - rx - 1, cy); p.lineTo(cx + rx + 1, cy); p.quadraticCurveTo(cx + rx + 3, shY + 24, cx + rx - 3, shY + 32); p.lineTo(cx - rx + 3, shY + 32); p.quadraticCurveTo(cx - rx - 3, shY + 24, cx - rx - 1, cy); }), 'hair', 12.7);
  if (back && hs === 'braid') for (let k = 0; k < 4; k++) add(E(cx, cy + 14 + k * 7, 3.8, 4.2), 'hair', 12.8);
  // barbes et moustaches
  if (c.beard && !back) add(P2(p => { p.moveTo(cx - rx + 1, cy + 1); p.quadraticCurveTo(cx - rx + 2, cy + ry + (c.beard === 'big' ? 9 : 3), cx, cy + ry + (c.beard === 'big' ? 11 : 4)); p.quadraticCurveTo(cx + rx - 2, cy + ry + (c.beard === 'big' ? 9 : 3), cx + rx - 1, cy + 1); p.lineTo(cx + rx - 4, cy + 4); p.quadraticCurveTo(cx + 6, cy + 9, cx, cy + 10); p.quadraticCurveTo(cx - 6, cy + 9, cx - rx + 4, cy + 4); }), 'beard', 13);
  if ((c.mustache || c.beard) && !back) add(P2(p => { p.moveTo(cx, cy + 9); p.quadraticCurveTo(cx - 6, cy + 7, cx - 10, cy + 12); p.quadraticCurveTo(cx - 6, cy + 11, cx, cy + 12); p.quadraticCurveTo(cx + 6, cy + 11, cx + 10, cy + 12); p.quadraticCurveTo(cx + 6, cy + 7, cx, cy + 9); }), 'beard', 14);
  // chapeaux
  const hat = c.hat;
  if (hat === 'cowboy') { add(E(cx, top + 6, rx + 11, 5), 'hat', 15); add(P2(p => { p.moveTo(cx - 12, top + 6); p.quadraticCurveTo(cx - 13, top - 12, cx - 5, top - 10); p.quadraticCurveTo(cx, top - 6, cx + 5, top - 10); p.quadraticCurveTo(cx + 13, top - 12, cx + 12, top + 6); }), 'hat', 16); add(RR(cx - 12, top + 1, 24, 3.5, 1), 'hatBand', 17); }
  if (hat === 'cap') { add(P2(p => { p.moveTo(cx - rx - 1, cy - 3); p.quadraticCurveTo(cx - rx, top - 5, cx, top - 5); p.quadraticCurveTo(cx + rx, top - 5, cx + rx + 1, cy - 3); }), 'hat', 15); add(E(cx, cy - 4, rx - 2, 3.4), 'hatBand', 16); }
  if (hat === 'flat') { add(P2(p => { p.moveTo(cx - rx - 3, cy - 3); p.quadraticCurveTo(cx - rx - 2, top - 3, cx + 2, top - 3); p.quadraticCurveTo(cx + rx + 4, top - 2, cx + rx + 3, cy - 3); }), 'hat', 15); add(E(cx, cy - 4, rx - 1, 3), 'hatBand', 16); }
  if (hat === 'bowler') { add(E(cx, cy - 7, rx + 4, 3.6), 'hat', 15); add(P2(p => { p.moveTo(cx - rx + 2, cy - 7); p.quadraticCurveTo(cx - rx + 1, top - 9, cx, top - 9); p.quadraticCurveTo(cx + rx - 1, top - 9, cx + rx - 2, cy - 7); }), 'hat', 16); add(RR(cx - rx + 2, cy - 11, 2 * rx - 4, 3, 1), 'hatBand', 17); }
  if (hat === 'toque') { add(RR(cx - rx + 2, top - 2, 2 * rx - 4, 10, 2), 'hat', 15); for (const [x, y, r] of [[cx - 9, top - 9, 9], [cx + 1, top - 13, 10], [cx + 10, top - 8, 8]]) add(E(x, y, r, r * .85), 'hat', 15.5); }
  if (hat === 'pointy') { add(E(cx, top + 5, rx + 7, 4), 'hat', 15); add(POLY(cx - 12, top + 5, cx + 12, top + 5, cx + 6, top - 14, cx + 13, top - 22, cx + 1, top - 16), 'hat', 16); }   // lot 13 : chapeau pointu de l'ermite
  if (hat === 'band') { add(RR(cx - rx - .5, cy - 12, 2 * rx + 1, 5, 2), 'hat', 15); add(E(cx + rx + 1, cy - 9, 3, 2.4), 'hat', 15.5); }
  // visage (pas de dos)
  const eyeY = cy + 4, gap = 6.5;
  if (back) feat.length = 0; else {
  feat.push({ t: 'brows', x: cx, y: eyeY - 6, gap, col: c.browC || '#3a2418', sad: c.sad });
  feat.push({ t: 'eyes', x: cx, y: eyeY, gap, col: c.eye || '#4a3a2a', sleepy: c.sleepy });
  if (!c.beard) feat.push({ t: 'mouth', x: cx, y: cy + 12, smile: !c.sad && !c.serious });
  if (!c.beard && !c.mustache) feat.push({ t: 'nose', x: cx, y: cy + 8 });
  if (c.blush) feat.push({ t: 'blush', x: cx, y: cy + 8, gap: gap + 4 });
  }
  if (back) for (let i = feat.length - 1; i >= 0; i--) if (feat[i].t !== 'px' || true) feat.splice(i, 1);
  // marche (de face / de dos) : une jambe se lève, le corps rebondit, les bras se balancent
  const lift = { L: s === 1 ? 4 : 0, R: s === 3 ? 4 : 0 }, sw = s === 1 ? 2.5 : s === 3 ? -2.5 : 0, bob = s % 2 ? -2 : 0;
  let out0 = parts.map(q => {
    let dy = q.tag === 'L' ? -lift.L : q.tag === 'R' ? -lift.R : q.z >= 3 ? bob : 0;
    if (q.tag === 'aL' && q.z === 5) dy -= sw * .4; if (q.tag === 'aR' && q.z === 5) dy += sw * .4;   // seules les mains se balancent un peu (les épaules suivent le corps)
    if (!dy) return q; const p = new Path2D(); p.addPath(q.path, new DOMMatrix().translate(0, dy)); return { ...q, path: p };
  });
  for (const f of feat) f.y += bob;
  // enfant : tout un peu plus petit (pieds au sol)
  let out = out0;
  const k = c.kid ? .78 : 1, sx = c.thin ? k * .92 : k;
  if (k !== 1 || sx !== 1) {
    const M = new DOMMatrix().translate(32, 128).scale(sx, k).translate(-32, -128);
    out = out0.map(q => { const p = new Path2D(); p.addPath(q.path, M); return { ...q, path: p }; });
    for (const f of feat) { const pt = M.transformPoint({ x: f.x, y: f.y }); f.x = pt.x; f.y = pt.y; if (f.gap) f.gap *= sx; }
  }
  return { parts: out, feat, mats: c.mats, pattern: c.pattern || {} };
}



// Profil (tourné vers la droite ; la gauche = miroir). s = étape de marche 0..3.
function buildSide(c, s) {
  const parts = [], feat = [], add = (path, mat, z) => parts.push({ path, mat, z });
  const cx = 31, cy = 37, rx = c.kid ? 17 : 15.5, ry = c.kid ? 18.5 : 17, top = cy - ry;
  const neckY = cy + ry - 2, shY = neckY + 2, hipY = 96, footY = 128;
  const g = c.garments || [], legW = c.legW || (c.stout ? 12.5 : 11.5), footH = 8;   // 19/11 : profil plus épais (jambes, buste, bras)
  const tw = (c.stout ? 31 : c.muscle ? 29 : c.f || c.kid ? 23 : 26), belly = c.stout ? 5 : 0;
  // 19/11 : vraie foulée de profil (4 temps, façon Stardew) : contact (jambes écartées, corps bas) → passage (une jambe repliée
  // qui se lève, corps haut) → contact inverse → passage. Les jambes pivotent à la hanche, les bras à l'épaule, à l'opposé.
  const ang = [.34, 0, -.34, 0][s] || 0, bob = s % 2 ? -2 : 0, liftNear = s === 3 ? 5 : 0, liftFar = s === 1 ? 5 : 0;
  const swing = 0;
  const leg = (dx, z, mat) => { // jambe + pied (bout vers la droite)
    const x = cx - legW / 2 + dx, n0 = parts.length;
    if (!c.dress || c.noFeet) { if (!c.dress) add(RR(x, hipY - 6, legW, footY - footH + 2 - (hipY - 6), 2), mat, z); }
    if (c.shorts) add(RR(x, hipY - 6, legW, 12, 3), 'over', z + .1);
    if (c.socks) add(RR(x + 1, footY - footH - 7, legW - 2, 8, 1), 'sock', z + .2);
    if (!c.noFeet) add(P2(p => { p.moveTo(x - 1, footY - footH); p.lineTo(x + legW - 1, footY - footH); p.quadraticCurveTo(x + legW + 5, footY - footH + 1, x + legW + 5, footY - 2); p.lineTo(x + legW + 5, footY); p.lineTo(x - 1, footY); }), 'shoe', z + .3);
    if (c.dress) return;
    const a = z < 2 ? -ang : ang, up = z < 2 ? liftFar : liftNear, hx = x + legW / 2, hy = hipY - 4;
    const M = new DOMMatrix().translate(hx, hy).rotate(a * 57.3).translate(-hx, -hy - up);
    for (let i = n0; i < parts.length; i++) { const q = new Path2D(); q.addPath(parts[i].path, M); parts[i] = { ...parts[i], path: q }; }
  };
  const legMat = c.shorts ? 'skin' : 'pant';
  leg(-2, 1, legMat); leg(2, 2, legMat);
  // buste
  const torso = P2(p => { p.moveTo(cx - tw / 2, shY + 5); p.quadraticCurveTo(cx - tw / 2, shY, cx - tw / 2 + 5, shY); p.lineTo(cx + tw / 2 - 4, shY); p.quadraticCurveTo(cx + tw / 2 + belly, shY + 4, cx + tw / 2 + belly, hipY - 14); p.quadraticCurveTo(cx + tw / 2 + belly, hipY + 2, cx + tw / 2 - 2, hipY + 2); p.lineTo(cx - tw / 2 + 1, hipY + 2); });
  add(torso, 'top', 3);
  if (c.dress) add(P2(p => { p.moveTo(cx - tw / 2, hipY - 14); p.lineTo(cx + tw / 2, hipY - 14); p.quadraticCurveTo(cx + tw / 2 + 6, hipY + 10, cx + tw / 2 + 7, footY - (c.noFeet ? 0 : 7)); p.lineTo(cx - tw / 2 - 7, footY - (c.noFeet ? 0 : 7)); p.quadraticCurveTo(cx - tw / 2 - 6, hipY + 10, cx - tw / 2, hipY - 14); }), 'dress', 3.5);
  if (g.includes('coat')) add(P2(p => { p.moveTo(cx - tw / 2 - 1, shY + 5); p.quadraticCurveTo(cx - tw / 2 - 1, shY - 1, cx - tw / 2 + 5, shY - 1); p.lineTo(cx + tw / 2 - 3, shY - 1); p.quadraticCurveTo(cx + tw / 2 + belly + 2, shY + 6, cx + tw / 2 + belly + 2, hipY); p.lineTo(cx + tw / 2 + 4, hipY + 16); p.lineTo(cx - tw / 2 - 8, hipY + 16); p.quadraticCurveTo(cx - tw / 2 - 3, hipY, cx - tw / 2 - 1, shY + 5); }), 'coat', 6);
  if (g.includes('jacket')) add(P2(p => { p.moveTo(cx - tw / 2 - 1, shY + 5); p.quadraticCurveTo(cx - tw / 2 - 1, shY - 1, cx - tw / 2 + 5, shY - 1); p.lineTo(cx + tw / 2 - 5, shY - 1); p.lineTo(cx + tw / 2 - 2, hipY + 6); p.lineTo(cx - tw / 2 - 2, hipY + 6); }), 'coat', 6);
  if (g.includes('fur')) add(E(cx, shY + 1, tw / 2 + 2, 5.5), 'fur', 8);
  if (g.includes('overalls')) { add(RR(cx + tw / 2 - 7 + belly, shY + 11, 7, hipY - shY - 11, 2), 'over', 6); add(RR(cx - tw / 2 + 1, hipY - 7, tw - 2 + belly, 12, 3), 'over', 6); add(POLY(cx + 1, shY - .5, cx + 5, shY - .5, cx + tw / 2 - 2 + belly, shY + 12, cx + tw / 2 - 6 + belly, shY + 12), 'over', 6); }
  if (g.includes('vest')) add(POLY(cx + 1, shY, cx + tw / 2 - 2 + belly, shY + 8, cx + tw / 2 + belly, hipY, cx + 1, hipY), 'vest', 5.5);
  if (g.includes('apron')) add(P2(p => { const y0 = c.f ? hipY - 12 : shY + 6, y1 = c.f ? footY - 18 : hipY + 18; p.moveTo(cx + tw / 2 - 5 + belly, y0); p.lineTo(cx + tw / 2 + 1 + belly, y0); p.lineTo(cx + tw / 2 + 5 + belly, y1); p.lineTo(cx + tw / 2 - 4, y1); }), 'apron', 6.8);
  if (g.includes('suspenders')) add(POLY(cx + 2, shY - .5, cx + 5, shY - .5, cx + 6 + belly, hipY, cx + 3 + belly, hipY), 'susp', 6);
  if (g.includes('backpack')) { add(RR(cx - tw / 2 - 8, shY + 2, 10, 26, 4), 'pack', 2.5); add(POLY(cx - 2, shY - .5, cx + 2, shY - .5, cx + 1, shY + 24, cx - 2, shY + 24), 'pack', 7.5); }
  if (g.includes('belt') || g.includes('toolbelt')) add(RR(cx - tw / 2 - 1, hipY - 6, tw + 2 + belly, 4, 1), 'belt', 7);
  if (g.includes('toolbelt')) add(RR(cx + tw / 2 - 5 + belly, hipY - 4, 8, 9, 2), 'belt', 7.2);
  if (g.includes('hoodie')) add(E(cx - tw / 2 + 2, shY + 1, 7, 6), 'top', 7);
  if (g.includes('towel')) add(RR(cx - 4, shY - 3, 10, 7, 3), 'towel', 9);
  if (g.includes('scarf')) add(POLY(cx + 2, shY - 2, cx + tw / 2 + 2, shY - 2, cx + tw / 2 + 1, shY + 8), 'scarf', 9);
  if (g.includes('chef')) for (let k = 0; k < 3; k++) feat.push({ t: 'btn', x: cx + tw / 2 - 3, y: shY + 10 + k * 9, col: '#c8c4bc' });
  if (g.includes('pipe')) feat.push({ t: 'px', x: cx + rx + 2, y: cy + 11, w: 3, h: 1, col: '#5a3a22' }, { t: 'px', x: cx + rx + 6, y: cy + 8, w: 2, h: 3, col: '#5a3a22' });
  // bras (le bras proche, qui se balance à l'opposé de la jambe proche)
  const armW = c.muscle ? 12.5 : c.stout ? 11.5 : 11, armL = c.armL || 30, ax = cx - armW / 2 - 1, as = -ang * 22;
  const armP = P2(p => { p.moveTo(ax, shY + 4); p.quadraticCurveTo(ax, shY + 1, ax + armW / 2, shY + 1); p.quadraticCurveTo(ax + armW, shY + 1, ax + armW, shY + 4); p.lineTo(ax + armW + as, shY + armL); p.lineTo(ax + as, shY + armL); });
  const sleeveMat = g.includes('coat') || g.includes('jacket') ? 'coat' : (c.sleeve || 'top');
  const armMat = c.bareArms || c.rolled ? 'skin' : sleeveMat, AM = '_' + armMat, SM = '_' + sleeveMat;   // le bras a sa propre matière : un trait le détache du buste
  add(armP, AM, 8.6);
  if (c.bareArms) add(RR(ax, shY - .5, armW, 6, 2), SM, 8.7); else if (c.rolled) add(RR(ax - .5, shY + 1, armW + 1, armL * .55, 3), SM, 8.7);
  if (c.puffy) add(E(ax + armW / 2, shY + 5, armW / 2 + 2.5, 6), 'top', 8.8);
  add(E(ax + armW / 2 + as, shY + armL + 2, c.gloves ? 5.6 : 4.6, c.gloves ? 5.8 : 4.8), c.gloves ? 'glove' : 'skin', 8.9);
  // tête de profil : nez, oreille, menton
  add(RR(cx - 3, neckY - 6, 8, 10, 2), 'skin', 9);
  add(P2(p => { p.moveTo(cx - rx, cy); p.bezierCurveTo(cx - rx, top - 1, cx + rx, top - 1, cx + rx, cy - 2); p.quadraticCurveTo(cx + rx + 1, cy + 3, cx + rx + 3, cy + 6); p.lineTo(cx + rx, cy + 8); p.bezierCurveTo(cx + rx, cy + ry * .8, cx + rx * .4, cy + ry, cx, cy + ry); p.bezierCurveTo(cx - rx * .5, cy + ry, cx - rx, cy + ry * .7, cx - rx, cy); }), 'skin', 10);
  add(E(cx - 3, cy + 3, 3.4, 4.4), 'skin', 10.5);
  const hs = c.hair;
  const backMass = (low = 4) => P2(p => { p.moveTo(cx + rx + 1, cy - 4); p.bezierCurveTo(cx + rx + 2, top - 6, cx - rx - 3, top - 6, cx - rx - 2, cy + 2); p.quadraticCurveTo(cx - rx - 1, cy + ry - 4, cx - 6, cy + ry - 3); p.lineTo(cx - 1, cy + low); p.lineTo(cx + 2, cy - 7); p.lineTo(cx + rx - 2, cy - 8); });
  if (hs === 'messy') { add(backMass(6), 'hair', 11); for (const [x, y, r] of [[cx - 9, top + 1, 5], [cx - 1, top - 1, 5], [cx + 7, top, 4]]) add(E(x, y, r, r * .8), 'hair', 11.5); add(lock(cx + 9, cy - 8, 5, 6, 4), 'hair', 12); }
  else if (hs === 'spiky') { add(backMass(8), 'hair', 11); for (const [x, y, w, len, b] of [[cx - 12, top + 1, 4, 9, -6], [cx - 4, top - 2, 4, 10, -3], [cx + 5, top - 1, 4, 8, 1]]) add(lock(x, y, w, -len, b), 'hair', 11.5); add(lock(cx + 8, cy - 9, 6, 11, 4), 'hair', 12); }
  else if (hs && hs !== 'bald') {
    add(backMass(2), 'hair', 11); add(lock(cx + 8, cy - 7, 6, 5, 4), 'hair', 12);
    if (hs === 'bun') add(E(cx - 6, top - 2, 7, 6), 'hair', 10.8);
    if (hs === 'braid') { add(E(cx - 8, top, 6.5, 5.5), 'hair', 10.8); for (let k = 0; k < 3; k++) add(E(cx - rx + 1, cy + 12 + k * 7, 3.6, 4), 'hair', 11.2); }
    if (hs === 'pigtails') { add(E(cx - rx - 2, cy - 2, 6, 8), 'hair', 10.6); add(E(cx - rx + 1, cy - 9, 3, 2.4), 'ribbon', 12); }
    if (hs === 'long') add(P2(p => { p.moveTo(cx - rx - 2, cy); p.quadraticCurveTo(cx - rx - 5, shY + 22, cx - rx + 4, shY + 30); p.lineTo(cx - 2, shY + 4); p.lineTo(cx - 2, cy); }), 'hair', 8);
    if (c.pencil) feat.push({ t: 'px', x: cx - 7, y: top - 8, w: 1, h: 6, col: '#f2c94c' });
  }
  if (c.beard) add(P2(p => { p.moveTo(cx - 4, cy + 3); p.quadraticCurveTo(cx - 4, cy + ry + (c.beard === 'big' ? 9 : 3), cx + 6, cy + ry + (c.beard === 'big' ? 10 : 3)); p.quadraticCurveTo(cx + rx + 1, cy + ry, cx + rx + 1, cy + 9); p.lineTo(cx + rx - 3, cy + 8); p.lineTo(cx, cy + 5); }), 'beard', 13);
  if (c.mustache || c.beard) add(E(cx + rx - 1, cy + 9.5, 4.5, 2), 'beard', 14);
  // chapeaux
  const hat = c.hat;
  if (hat === 'cowboy') { add(E(cx, top + 6, rx + 11, 3.5), 'hat', 15); add(P2(p => { p.moveTo(cx - 11, top + 6); p.quadraticCurveTo(cx - 12, top - 12, cx - 3, top - 10); p.quadraticCurveTo(cx + 2, top - 7, cx + 5, top - 10); p.quadraticCurveTo(cx + 12, top - 12, cx + 11, top + 6); }), 'hat', 16); add(RR(cx - 11, top + 1, 22, 3.5, 1), 'hatBand', 17); }
  if (hat === 'cap') { add(P2(p => { p.moveTo(cx - rx - 1, cy - 3); p.quadraticCurveTo(cx - rx, top - 5, cx, top - 5); p.quadraticCurveTo(cx + rx, top - 5, cx + rx + 1, cy - 3); }), 'hat', 15); add(E(cx + rx + 3, cy - 4, 8, 2.4), 'hatBand', 16); }
  if (hat === 'flat') { add(P2(p => { p.moveTo(cx - rx - 2, cy - 3); p.quadraticCurveTo(cx - rx - 1, top - 3, cx + 2, top - 3); p.quadraticCurveTo(cx + rx + 5, top - 2, cx + rx + 6, cy - 3); }), 'hat', 15); add(E(cx + rx + 3, cy - 3.5, 6, 2), 'hatBand', 16); }
  if (hat === 'bowler') { add(E(cx, cy - 7, rx + 4, 2.8), 'hat', 15); add(P2(p => { p.moveTo(cx - rx + 2, cy - 7); p.quadraticCurveTo(cx - rx + 1, top - 9, cx, top - 9); p.quadraticCurveTo(cx + rx - 1, top - 9, cx + rx - 2, cy - 7); }), 'hat', 16); add(RR(cx - rx + 2, cy - 11, 2 * rx - 4, 3, 1), 'hatBand', 17); }
  if (hat === 'toque') { add(RR(cx - rx + 2, top - 2, 2 * rx - 4, 10, 2), 'hat', 15); add(E(cx - 1, top - 10, 13, 9), 'hat', 15.5); }
  if (hat === 'pointy') { add(E(cx, top + 5, rx + 7, 4), 'hat', 15); add(POLY(cx - 12, top + 5, cx + 12, top + 5, cx + 6, top - 14, cx + 13, top - 22, cx + 1, top - 16), 'hat', 16); }   // lot 13 : chapeau pointu de l'ermite
  if (hat === 'band') { add(RR(cx - rx - .5, cy - 12, 2 * rx + 1, 5, 2), 'hat', 15); add(E(cx - rx - 1, cy - 9, 3, 2.4), 'hat', 15.5); }
  // visage : un œil, un sourcil, la bouche
  const ex = cx + 9;
  feat.push({ t: 'eye1', x: ex, y: cy + 4, col: c.eye || '#4a3a2a', sleepy: c.sleepy }, { t: 'brow1', x: ex, y: cy - 2, col: c.browC || '#3a2418', sad: c.sad });
  if (!c.beard && !c.mustache) feat.push({ t: 'mouth1', x: cx + rx - 2, y: cy + 12, smile: !c.sad && !c.serious });
  if (c.blush) feat.push({ t: 'px', x: cx + 6, y: cy + 8, w: 2, h: 1, col: '#f08a7a' });
  // marche : rebond du haut du corps
  let out = parts.map(q => { if (q.z < 3 || !bob) return q; const p = new Path2D(); p.addPath(q.path, new DOMMatrix().translate(0, bob)); return { ...q, path: p }; });
  for (const f of feat) f.y += bob;
  const k = c.kid ? .78 : 1, sx = c.thin ? k * .92 : k;
  if (k !== 1 || sx !== 1) {
    const M = new DOMMatrix().translate(32, 128).scale(sx, k).translate(-32, -128);
    out = out.map(q => { const p = new Path2D(); p.addPath(q.path, M); return { ...q, path: p }; });
    for (const f of feat) { const pt = M.transformPoint({ x: f.x, y: f.y }); f.x = pt.x; f.y = pt.y; }
  }
  const mats = { ...c.mats, [AM]: c.mats[armMat], [SM]: c.mats[sleeveMat] }, pattern = { ...(c.pattern || {}) }; if (pattern[armMat]) pattern[AM] = pattern[armMat]; if (pattern[sleeveMat]) pattern[SM] = pattern[sleeveMat];
  return { parts: out, feat, mats, pattern };
}

// ---------- la distribution ----------
const skin = '#f4c8a0';
const CAST_LIST = [
  { id: 'heros', n: 'Le héros', hair: 'messy', eye: '#3a6aa8', blush: 1, garments: ['overalls', 'backpack'], mats: { skin, hair: '#8a4f28', top: '#c0342e', over: '#3f62a8', overD: '#33508a', pant: '#4a6aaa', shoe: '#6a3e22', pack: '#7a5232' }, pattern: { top: { type: 'plaid' } } },
  { id: 'myst', n: 'Myst', hair: 'spiky', eye: '#7ab4d8', sleepy: 1, serious: 1, tall: 1, thin: 1, garments: ['coat', 'lapels'], mats: { skin: '#eedcd0', hair: '#24202c', top: '#22202a', coat: '#2e2a38', lapel: '#3e3a4c', pant: '#3a3844', shoe: '#4a3426' } },
  { id: 'luna', n: 'Luna', f: 1, hair: 'bun', pencil: 1, eye: '#5a7a4a', blush: 1, garments: ['hoodie'], mats: { skin, hair: '#7a4a2a', top: '#2a6ad0', topD: '#2256b0', pant: '#7a9ac8', shoe: '#f0f0f4' } },
  { id: 'franck', n: 'Franck', hair: 'short', sad: 1, eye: '#5a4a3a', garments: [], mats: { skin, hair: '#7a4a2a', top: '#c8b48a', pant: '#6a4a2a', shoe: '#4a3020' }, pattern: { top: { type: 'knit' } } },
  { id: 'hailey', n: 'Hailey', f: 1, hair: 'bun', eye: '#4a6a8a', blush: 1, garments: ['stetho', 'pocket'], mats: { skin: '#f6d0b0', hair: '#8a5a32', top: '#f4f2ec', topD: '#dcd8d0', pant: '#2a2a4a', shoe: '#3a3a44' } },
  { id: 'manu', n: 'Manu', hair: 'short', hat: 'cowboy', mustache: 1, stout: 1, eye: '#4a3a2a', garments: ['jacket', 'vest', 'bolo'], mats: { skin: '#eab48c', hair: '#5a3a22', beard: '#6a4428', top: '#f6f0e2', coat: '#efe6d2', vest: '#7a2a3a', pant: '#efe6d2', shoe: '#5a2a22', hat: '#f2ecde', hatBand: '#7a2a3a' } },
  { id: 'igor', n: 'Igor', hat: 'band', beard: 'short', muscle: 1, bareArms: 1, gloves: 1, serious: 1, eye: '#3a2a20', garments: ['apron'], sleeve: 'top', mats: { skin: '#d9a07a', top: '#9a9aa0', apron: '#7a4a2a', glove: '#3a2a20', pant: '#4a3a2e', shoe: '#2a2220', hat: '#2a2428', beard: '#6a6460' } },
  { id: 'ed', n: 'Ed', hair: 'short', hat: 'cap', beard: 'big', stout: 1, rolled: 1, eye: '#3a2a20', garments: ['suspenders', 'towel'], mats: { skin: '#eab48c', hair: '#5a3a22', beard: '#5a3420', top: '#9a9ca4', susp: '#5a3420', pant: '#6a5034', shoe: '#3a2a1e', hat: '#2a5aa8', hatBand: '#1e4488', towel: '#f4f2ec' } },
  { id: 'suzie', n: 'Suzie', f: 1, dress: 1, hair: 'braid', eye: '#4a6a9a', blush: 1, garments: ['apron'], mats: { skin, hair: '#d8b070', top: '#9ab8e0', dress: '#9ab8e0', apron: '#f6eee0', shoe: '#6a4a30' }, pattern: { apron: { type: 'flowers', col: '#e88aa0', col2: '#7ab860' } } },
  { id: 'jade', n: 'Jade', kid: 1, hair: 'pigtails', eye: '#4a2a1c', blush: 1, shorts: 1, socks: 1, puffy: 1, pocket: 'heart', garments: ['overalls'], mats: { skin: '#f3c9a6', hair: '#6a3a22', ribbon: '#e0405a', top: '#f8f6f0', over: '#3a6ab0', overD: '#2a5090', heart: '#e0405a', sock: '#f4f2ec', shoe: '#d0402e' }, pattern: { sock: { type: 'stripe', col: '#e0405a' } } },
  { id: 'remy', n: 'Remy Gusto', hair: 'short', hat: 'toque', mustache: 1, eye: '#3a2a20', garments: ['chef', 'scarf'], mats: { skin: '#eab48c', hair: '#2a2420', beard: '#2a2420', top: '#f6f4ee', pant: '#3a3a40', shoe: '#1e1e22', hat: '#f8f6f0', scarf: '#d0302a' }, pattern: { pant: { type: 'check', col: '#f2f0ea' } } },
  { id: 'harry', n: 'Harry Fordson', hair: 'short', hat: 'flat', eye: '#4a6a8a', serious: 1, garments: ['toolbelt'], mats: { skin, hair: '#b8642a', top: '#c0302e', pant: '#3a5a8a', shoe: '#5a3a22', belt: '#7a4a26', hat: '#7a7a80', hatBand: '#5a5a62' }, pattern: { top: { type: 'plaid' } } },
  { id: 'esprit', n: "L'esprit", f: 1, dress: 1, noFeet: 1, hair: 'long', sad: 1, eye: '#e8fcff', garments: [], ghost: 1, mats: { skin: '#bff0f4', hair: '#8adce8', top: '#a4e8f0', dress: '#a4e8f0' } },
  { id: 'rouky', n: 'Rouky', hair: 'short', hat: 'cap', beard: 'short', stout: 1, eye: '#4a6a8a', garments: ['overalls'], mats: { skin: '#e2b08a', hair: '#e8e4dc', beard: '#e8e4dc', top: '#5a7aa8', over: '#6a5a3a', overD: '#4a3e28', pant: '#6a5a3a', shoe: '#4a3a2a', hat: '#2a4a7a', hatBand: '#1e365a' } },   // lot 12 (pas sur la planche : d'après sa description)
  { id: 'golgolas', n: 'Golgolas', hat: 'pointy', beard: 'big', dress: 1, serious: 1, eye: '#6a8a4a', garments: ['staff'], mats: { skin: '#e8c8a8', hair: '#f0ece4', beard: '#f0ece4', top: '#7a5a3a', dress: '#7a5a3a', shoe: '#4a3020', hat: '#5a4a6a', staff: '#6a4426' }, pattern: { dress: { type: 'flowers', col: '#9a7a52', col2: '#5a3e26' } } },   // lot 13 : vieil elfe ermite (robe rapiécée)
  { id: 'cocher', n: 'Le cocher', hat: 'bowler', beard: 'short', stout: 1, serious: 1, eye: '#3a2a20', garments: ['coat', 'fur', 'pipe'], mats: { skin: '#e2a888', top: '#5a3a2a', coat: '#7a5232', fur: '#d8c4a0', pant: '#3a3036', shoe: '#2a2020', hat: '#2a2428', hatBand: '#4a3a30', beard: '#8a8680' } }
];


export const CAST = Object.fromEntries(CAST_LIST.map(c => [c.id, c]));

// Le héros : options de personnalisation (18/11 au soir : sexe et plus de choix) et traduction en description de personnage.
export const HERO_OPTS = {
  body: { h: 'Homme', f: 'Femme' },
  skin: ['#f8d8bc', '#f4c8a0', '#e2a882', '#c08060', '#8a5a3a'],
  eye: ['#3a6aa8', '#4a8a4a', '#6a4a2a', '#5a5a6a', '#8a5aa8'],
  hair: { messy: 'En bataille', short: 'Courts', spiky: 'En épis', long: 'Longs', bun: 'Chignon', braid: 'Tresse', pigtails: 'Couettes', bald: 'Rasé' },
  hairC: ['#8a4f28', '#2a2026', '#5a3a22', '#d8a850', '#b8482a', '#e8e0d0', '#6a6a72'],
  beard: { '': 'Aucune', mustache: 'Moustache', short: 'Courte', big: 'Grande' },
  hat: { '': 'Aucun', cowboy: 'Cow-boy', paille: 'Paille', cap: 'Casquette', flat: 'Gavroche', bowler: 'Melon' },
  hatC: ['#8a4a26', '#efe6d2', '#2a2428', '#3a6ab0', '#7a7a80'],
  top: { plaid: 'Carreaux', plain: 'Unie', knit: 'Pull', hoodie: 'Sweat' },
  shirt: ['#c0342e', '#2f7a46', '#3a5a9a', '#e8dcc4', '#6a3a7a', '#c88a2a', '#3a3a44'],
  extra: { '': 'Rien', overalls: 'Salopette', vest: 'Gilet', jacket: 'Veste', coat: 'Manteau', apron: 'Tablier' },
  extraC: ['#3f62a8', '#7a4a26', '#2e2a38', '#4a6a3a', '#7a2a3a', '#d8c8a8'],
  scarf: ['', '#d0302a', '#2a5aa8', '#e8b030', '#2a2428'],
  bottom: { pant: 'Pantalon', skirt: 'Robe' },
  pants: ['#4a6aaa', '#3a3a44', '#6a5034', '#8a3a2a', '#a8b8d8', '#4a6a3a'],
  shoes: ['#6a3e22', '#2a2220', '#8a5a32', '#e8e8ec'],
  backpack: { 0: 'Non', 1: 'Oui' }
};
const OLD_HAIR = { 0: 'messy', 1: 'long', 3: 'bun', 4: 'braid', 5: 'pigtails' };
export const heroHair = L => (typeof L.hair === 'string' && HERO_OPTS.hair[L.hair]) ? L.hair : OLD_HAIR[L.hair] || 'messy';
export function heroSpec(L) {
  const hair = heroHair(L), f = L.body === 'f', skirt = L.bottom === 'skirt', extra = L.extra !== undefined ? L.extra : (L.overalls ? 'overalls' : '');
  const exC = L.extraC || L.overalls || '#3f62a8', hatC = L.hat === 'paille' ? '#e6c870' : (L.hatC || '#8a4a26');
  const garments = [];
  if (extra === 'overalls') garments.push('overalls'); if (extra === 'vest') garments.push('vest'); if (extra === 'jacket') garments.push('jacket', 'lapels'); if (extra === 'coat') garments.push('coat', 'lapels'); if (extra === 'apron') garments.push('apron');
  if (L.top === 'hoodie') garments.push('hoodie'); if (L.scarf) garments.push('scarf'); if (L.backpack !== 0 && L.backpack !== false) garments.push('backpack');
  const pattern = L.top === 'plain' || L.top === 'hoodie' ? {} : L.top === 'knit' ? { top: { type: 'knit' } } : { top: { type: 'plaid' } };
  return { id: 'heros', hair: hair === 'bald' ? undefined : hair, eye: L.eye || '#3a6aa8', blush: 1, f, dress: skirt,
    hat: L.hat === 'paille' ? 'cowboy' : L.hat || undefined, beard: !f && (L.beard === 'short' || L.beard === 'big') ? L.beard : undefined, mustache: !f && L.beard === 'mustache',
    garments, pattern,
    mats: { skin: L.skin || '#f4c8a0', hair: L.hairC || '#8a4f28', beard: L.hairC || '#8a4f28', top: L.shirt || '#c0342e', topD: darken(L.shirt || '#c0342e'),
      over: exC, overD: darken(exC), vest: exC, coat: exC, lapel: darken(exC), apron: exC, scarf: L.scarf || '#d0302a',
      pant: L.pants || '#4a6aaa', dress: L.pants || '#4a6aaa', shoe: L.shoes || '#6a3e22', pack: '#7a5232', hat: hatC, hatBand: L.hat === 'paille' ? '#b8302a' : darken(hatC) } };
}
const darken = h => tones(h).sh;
// Description du personnage pour un look du jeu : un habitant (look.folk), le héros (look.doll / look.hero), sinon rien.
export function folkSpec(L) {
  if (!L) return null;
  if (L.folk) return CAST[L.folk] || null;
  if (L.doll || L.hero) return heroSpec(L);
  return null;
}
const CACHE = new Map();
// Image 32 × 64 d'un personnage : d 0 face, 1 dos, 2 gauche, 3 droite ; f 0 arrêt, 1..8 marche.
export function folkSprite(spec, d = 0, f = 0) {
  if (typeof document === 'undefined') return null;
  probe ||= document.createElement('canvas').getContext('2d');
  const s = f ? (f - 1) % 4 : 0, key = JSON.stringify(spec) + '|' + d + '|' + s;
  let im = CACHE.get(key);
  if (im) return im;
  const m = d >= 2 ? buildSide(spec, s) : buildFront(spec, d === 1, s);
  im = renderPixel(m, 32, 64, { shade: 1, deep: true, selout: true, inner: true, q: 4 });
  if (d === 2) { const o = document.createElement('canvas'); o.width = 32; o.height = 64; const g = o.getContext('2d'); g.translate(32, 0); g.scale(-1, 1); g.drawImage(im, 0, 0); im = o; }
  if (spec.ghost) im = ghostly(im);
  CACHE.set(key, im);
  return im;
}
function ghostly(im) {   // l'esprit : translucide, lumineux, le bas de la robe se dissipe
  const o = document.createElement('canvas'); o.width = im.width; o.height = im.height; const g = o.getContext('2d');
  g.shadowColor = '#7ae8ff'; g.shadowBlur = 3; g.globalAlpha = .82; g.drawImage(im, 0, 0);
  const d = g.getImageData(0, 0, o.width, o.height);
  for (let y = 50; y < o.height; y++) for (let x = 0; x < o.width; x++) d.data[(y * o.width + x) * 4 + 3] *= Math.max(0, (64 - y) / 14);
  g.putImageData(d, 0, 0); return o;
}
export const FOLK_SCALE = .75;   // 32 × 64 → 24 × 48 pixels du monde
// Dessine le personnage : (ox, oy) = coin haut-gauche de l'ancienne case 12 × 20 (pieds à oy + 19).
export function drawFolk(c, ox, oy, L, d, f) {
  const spec = folkSpec(L), im = spec && folkSprite(spec, d, f);
  if (!im) return false;
  const w = 32 * FOLK_SCALE, h = 64 * FOLK_SCALE;
  c.drawImage(im, Math.round(ox + 6 - w / 2), Math.round(oy + 20 - h), w, h);
  return true;
}
// Portrait (haut du corps, de face) pour les fiches des habitants.
export function folkPortrait(L) {
  const spec = folkSpec(L), im = spec && folkSprite(spec, 0, 0);
  if (!im) return null;
  const key = 'pp' + JSON.stringify(spec); if (CACHE.has(key)) return CACHE.get(key);
  const top = spec.kid ? 16 : 1, h = 34, c = document.createElement('canvas'); c.width = 32; c.height = h; c.getContext('2d').drawImage(im, 0, top, 32, h, 0, 0, 32, h);
  const r = { url: c.toDataURL(), w: 32, h }; CACHE.set(key, r); return r;
}
