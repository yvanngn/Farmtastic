// Farmwest (18/11) : « poupée » des personnages dessinée par le code, dans le style validé sur Manu.
// Chaque pièce (tête, ventre, bras, chapeau…) est une forme que le code éclaire tout seul (lumière en haut à gauche,
// 4 tons + tramage léger), avec un contour coloré (jamais noir) et un trait sombre là où deux pièces se chevauchent.
// Tout vient du `look` : on change un vêtement ou une couleur en une ligne (personnalisation du héros, tenues des PNJ).
// Cadre 36 × 60 pixels « d'art », affiché à 0,75 (27 × 45 pixels du monde) : à l'écran, le détail reste visible.
// Vues : 0 face, 1 dos, 3 profil droit (2 = miroir). Marche : f = 1..8 (0 = arrêt), profil en 8 images
// (cuisse + tibia, genou qui plie, bras opposés, rebond ; skill animation-marche-pixel).
import { makeCache } from './pixel.js';

export const PD_W = 36, PD_H = 60, PD_SCALE = 0.75;
const cache = makeCache(900);   // chaque pose n'est dessinée qu'une fois, puis réutilisée comme un sprite
const hexA = c => { c = c.length === 4 ? '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3] : c; return [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)); };
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const toHex = a => '#' + a.map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
const RAMPS = new Map();
// 5 tons : lumière (vers jaune chaud), base, ombre, ombre profonde (vers violet), contour
function ramp(c) {
  let r = RAMPS.get(c); if (r) return r;
  const b = hexA(c);
  r = [mix(b, [255, 244, 214], .32), b, mix(mix(b, [0, 0, 0], .22), [70, 40, 110], .12), mix(mix(b, [0, 0, 0], .45), [60, 30, 100], .18), mix(mix(b, [0, 0, 0], .62), [50, 20, 70], .2)];
  RAMPS.set(c, r); return r;
}
// peau : ombres chaudes (vers le rose orangé), jamais grises
function rampSkin(c) {
  const key = 'w' + c; let r = RAMPS.get(key); if (r) return r;
  const b = hexA(c);
  r = [mix(b, [255, 240, 225], .3), b, mix(b, [200, 110, 90], .22), mix(b, [160, 80, 70], .38), mix(b, [90, 40, 40], .6)];
  RAMPS.set(key, r); return r;
}
export const darker = (c, k = .25) => toHex(mix(hexA(c), [20, 12, 24], k));

function Doll() {
  const W = PD_W, H = PD_H, px = new Array(W * H).fill(null), edges = [];
  let part = 0;
  const set = (x, y, r, t) => { x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= W || y >= H) return null; const p = { r, t, part }; px[y * W + x] = p; return p; };
  const tone = (nx, ny, x, y) => {
    const l = -(nx * .55 + ny * .85);
    if (l > .5) return 0; if (l > .44) return (x % 2 && y % 2) ? 1 : 0;
    if (l > -.3) return 1; if (l > -.4) return (x % 2 && y % 2) ? 2 : 1;
    if (l > -.72) return 2; return 3;
  };
  const put = (x, y, col, t, o) => {   // motif éventuel (carreaux, maille…) : o.pat(x, y) → [couleur, ton] ou null
    const pv = o.pat && o.pat(Math.round(x), Math.round(y), t);
    if (o.skin) return set(x, y, rampSkin(col), o.soft ? Math.min(2, t) : t);   // peau : ombres chaudes ; visage : jamais l'ombre profonde
    return pv ? set(x, y, ramp(pv[0]), pv[1]) : set(x, y, ramp(col), t);
  };
  const D = {
    px,
    ell(cx, cy, rx, ry, col, o = {}) { if (!col) return; part++; const cells = [];
      for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
        const nx = (x + .5 - cx) / rx, ny = (y + .5 - cy) / ry; if (nx * nx + ny * ny > 1 || (o.clip && !o.clip(x, y))) continue;
        put(x, y, col, o.flat != null ? o.flat : tone(o.soft ? nx * .6 : nx, o.soft ? ny * .6 - .15 : ny, x, y), o); cells.push([x, y]); }
      if (o.edge) edges.push({ cells, part }); },
    rect(x0, y0, w, h, col, o = {}) { if (!col || w <= 0 || h <= 0) return; part++; const cells = [];
      for (let y = Math.round(y0); y < y0 + h; y++) for (let x = Math.round(x0); x < x0 + w; x++) {
        if (o.clip && !o.clip(x, y)) continue;
        const nx = (x + .5 - (x0 + w / 2)) / (w / 2), ny = o.round ? (y + .5 - (y0 + h / 2)) / (h / 2) * .6 : -.15;
        put(x, y, col, o.flat != null ? o.flat : tone(nx, ny, x, y), o); cells.push([x, y]); }
      if (o.edge) edges.push({ cells, part }); },
    rows(y0, spans, col, t = 1, o = {}) { part++; const cells = []; spans.forEach(([a, b], i) => { for (let x = a; x <= b; x++) { put(x, y0 + i, col, t, o); cells.push([x, y0 + i]); } }); if (o.edge) edges.push({ cells, part }); },
    limb(x0, y0, ang, len, w, col, o = {}) { part++; const cells = [], dx = Math.sin(ang), dy = Math.cos(ang);
      for (let k = 0; k <= len; k += .5) for (let s = -w / 2; s < w / 2; s += .5) {
        const x = x0 + dx * k + dy * s, y = y0 + dy * k - dx * s, X = Math.round(x), Y = Math.round(y);
        put(X, Y, col, o.flat != null ? o.flat : tone(s / (w / 2), -.2, X, Y), o); cells.push([X, Y]); }
      if (o.edge) edges.push({ cells, part }); return [x0 + dx * len, y0 + dy * len]; },
    dot(x, y, col, t = 1, skin) { if (!col) return; part++; set(x, y, skin ? rampSkin(col) : ramp(col), t); },
    line(x0, y0, x1, y1, col, t = 3) { if (!col) return; part++; const r = ramp(col), n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1; for (let k = 0; k <= n; k++) set(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n, r, t); },
    // rendu : bords des pièces qui se chevauchent assombris, puis contour coloré autour de la silhouette
    render(flip) {
      for (const e of edges) for (const [x, y] of e.cells) {
        const p = px[y * W + x]; if (!p || p.part !== e.part) continue;
        if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => { const q = px[(y + b) * W + x + a]; return q && q.part < e.part && q.part !== e.part; })) p.t = Math.max(p.t, 3);
      }
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const k = cv.getContext('2d'), img = k.createImageData(W, H);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const p = px[y * W + x]; let c = null;
        if (p) c = p.r[p.t];
        else { const n = (x > 0 && px[y * W + x - 1]) || (x < W - 1 && px[y * W + x + 1]) || (y > 0 && px[(y - 1) * W + x]) || (y < H - 1 && px[(y + 1) * W + x]); if (n) c = n.r[4]; }
        if (!c) continue;
        img.data.set([c[0], c[1], c[2], 255], (y * W + (flip ? W - 1 - x : x)) * 4);
      }
      k.putImageData(img, 0, 0); return cv;
    }
  };
  return D;
}

// ---------- mesures selon la silhouette ----------
function body(L) {
  const kid = !!L.kid, tall = !!L.tall && !kid, fem = L.body === 'f', stout = !!L.stout, muscle = !!L.muscle;
  const foot = 59, legLen = kid ? 7 : tall ? 12 : 10, boot = kid ? 4 : 5;
  const legTop = foot - boot - legLen, torsoH = kid ? 9 : tall ? 13 : 12, T = legTop - 1 - torsoH;
  const rx = stout ? 10.5 : muscle ? 9 : kid ? 6.5 : fem ? 7.2 : 8.2;
  return { kid, tall, fem, stout, muscle, foot, legLen, boot, legTop, torsoH, T, belt: legTop - 1, rx, Hy: T - (kid ? 8.6 : 7.8), hr: kid ? 9 : 7.4, armX: Math.round(rx) + 1.2 };
}
export const HATC = { cowboy: '#8a4a26', blanc: '#efe8da', paille: '#e6c870', melon: '#2a2630', cap: '#3a6ab0', plat: '#8a8a90', toque: '#f6f4ee', bandeau: '#2a2428' };
const BAND = { cowboy: '#5a2a16', blanc: '#7a2a3a', paille: '#a83a2a', melon: '#7a2a2a' };
const plaid = (col, k = 4) => (x, y, t) => (x % k === 0 && y % k === 0) ? [col, 3] : (x % k === 0 || y % k === 0) ? [col, Math.min(3, t + 1)] : null;
const knit = col => (x, y, t) => y % 3 === 0 ? [col, Math.min(3, t + 1)] : null;
const check = (a, b) => (x, y) => (((x >> 1) + (y >> 1)) % 2 ? [a, 1] : [b, 1]);
const SKIN = L => L.skin || '#f1c7a5', HAIR = L => L.hairC || '#5a3a22', BOOTS = L => L.shoes || '#6a3a1e';
const shirtPat = L => L.plaid || L.top === 'plaid' ? plaid(darker(L.shirt || '#b8302a', .2)) : L.knit ? knit(L.shirt) : null;
const legCol = L => L.overalls || L.pants || '#3a4a8a';

// ---------- tête ----------
function eyeCols(L) { const e = L.eye || '#2a1a20'; return [e, toHex(mix(hexA(e), [170, 110, 60], .55))]; }
function headFront(D, L, B, back, y) {
  const S = SKIN(L), Hc = HAIR(L), Hy = B.Hy + y, hr = B.hr, hair = L.bald ? -1 : (L.hair ?? 0), cute = B.kid || B.fem;
  const L0 = 18 - hr, R0 = 18 + hr;
  if (!back && hair === 1) D.rect(L0 - 1, Hy - 2, hr * 2 + 2, 12, Hc, { flat: 2 });   // cheveux longs : derrière la tête
  if (hair === 5) for (const sx of [L0 - 2.2, R0 + 2.2]) D.ell(sx, Hy + 3, 3.2, 5.4, Hc, { edge: 1 });   // couettes (derrière les épaules)
  if (L.hood) D.ell(18, Hy + 1, hr + 2.5, hr + 1.5, L.shirt, { edge: 1 });
  D.ell(L0 - .4, Hy + .8, 1.6, 2.1, S, { skin: 1 }); D.ell(R0 + .4, Hy + .8, 1.6, 2.1, S, { skin: 1 });   // oreilles
  D.ell(18, Hy, hr + .3, hr + .2, back && hair >= 0 ? Hc : S, { edge: 1, skin: !(back && hair >= 0), soft: 1 });
  if (!back) {
    const [eye, iris] = eyeCols(L), ed = B.kid ? 4.4 : 3.6, ew = B.kid ? 3 : 2, eh = B.kid ? 4 : 3, ey = Math.round(Hy - (B.kid ? 1 : 1.5));
    const brow = hair >= 0 ? Hc : darker(S, .4);
    for (const sgn of [-1, 1]) {   // grands yeux : pupille sombre, iris clair en bas, reflet blanc, cils
      const x0 = Math.round(18 + sgn * ed - ew / 2);
      D.rect(x0, ey, ew, eh, eye, { flat: 3 }); D.rect(x0, ey + eh - 1, ew, 1, iris, { flat: 1 });
      D.dot(x0, ey, '#ffffff', 0); if (B.kid) D.dot(x0 + ew - 1, ey + eh - 2, '#ffffff', 1);
      if (cute) { D.line(x0 - (sgn < 0 ? 1 : 0), ey - 1, x0 + ew - (sgn < 0 ? 1 : 0), ey - 1, eye, 3); D.dot(sgn < 0 ? x0 - 1 : x0 + ew, ey, eye, 3); }
      D.line(x0 - (sgn < 0 ? 1 : 0), ey - (cute ? 3 : 2), x0 + ew - (sgn < 0 ? 1 : 0) - (sgn > 0 ? 0 : 0), ey - (cute ? 3 : 2), brow, 2);   // sourcils
      // joues roses (tramées)
      const cx = Math.round(18 + sgn * (ed + (B.kid ? 1.5 : 1))), cy = ey + eh + 1;
      D.dot(cx, cy, '#f2848c', 1); if (cute) { D.dot(cx + sgn, cy, '#f2848c', 1); D.dot(cx, cy + 1, '#f6a0a0', 1); }
    }
    D.dot(18, ey + eh, S, 2, 1);   // petit nez
    if (L.beard) {
      D.ell(18, Hy + 5.5, hr + .6, 4.6, L.beard, { edge: 1 });
      for (let k = 0; k < 14; k++) D.dot(Math.round(L0 + (k * 7) % (hr * 2)), Hy + 3 + (k * 5) % 6, L.beard, (k % 3) ? 2 : 0);
    }
    const mus = L.mustache || L.beard, my = Math.round(Hy + (B.kid ? 5 : 4));
    if (mus) { D.rect(14, my - 1, 8, 2, mus, { flat: 2 }); D.dot(14, my + 1, mus, 2); D.dot(21, my + 1, mus, 2); }
    if (L.sad) D.rows(my + 1, [[16, 19]], '#7a3a3a', 2);
    else if (mus) { D.rect(16, my + 1, 4, 1, '#ffffff', { flat: 0 }); D.rect(15, my + 2, 6, 1, '#6a2a2a', { flat: 2 }); }
    else if (B.kid) { D.rows(my, [[16, 20], [17, 19]], '#8a2a32', 2); D.dot(18, my + 1, '#f08090', 1); }   // sourire ouvert
    else { D.dot(16, my, '#8a3a3a', 2); D.rect(17, my + 1, 2, 1, '#8a3a3a', { flat: 2 }); D.dot(19, my, '#8a3a3a', 2); }
  } else if (L.beard) { D.ell(L0 + 1, Hy + 3, 1.6, 2.5, L.beard); D.ell(R0 - 1, Hy + 3, 1.6, 2.5, L.beard); }
  if (hair >= 0) {   // coiffures : 0 court, 1 long, 2 épis, 3 chignon, 4 queue, 5 couettes ; curly : boucles
    D.ell(18, Hy - 2.6, hr + .9, hr * .72, Hc, { edge: 1, clip: (x, yy) => back ? true : yy < Hy - 2.5 || x < L0 + 1 || x > R0 - 1 });
    if (!back) {
      D.rect(L0 - .5, Hy - 4, 2, 5, Hc, { flat: 1 }); D.rect(R0 - 1.5, Hy - 4, 2, 5, Hc, { flat: 2 });
      if (cute && !L.curly) for (const bx of [-hr * .55, 0, hr * .55]) D.ell(18 + bx, Hy - 3.6, hr * .34, 2.2, Hc, { edge: 1 });   // frange en festons
      for (let x = Math.round(L0 + 3); x < R0 - 2; x += 2) D.dot(x, Math.round(Hy - hr * .8), Hc, 0);   // reflet des cheveux
    }
    if (L.curly) for (const [cx, cy] of [[L0, Hy - 2], [R0, Hy - 2], [L0 + 2, Hy - 6], [R0 - 2, Hy - 6], [18, Hy - 8], [L0 - 1, Hy + 2], [R0 + 1, Hy + 2]]) D.ell(cx, cy, 2.4, 2.4, Hc, { edge: 1 });
    if (hair === 2) for (const x of [12, 15, 18, 21, 24]) D.rows(Math.round(Hy - hr - 3), [[x, x], [x - 1, x + 1], [x - 1, x + 1]], Hc, 1);
    if (hair === 3) { D.ell(18, Hy - hr - 1.5, 3.4, 3, Hc, { edge: 1 }); if (L.pencil) D.line(20, Hy - hr - 5, 23, Hy - hr - 1, '#e8c04a', 1); }
    if (hair === 1 && back) D.rect(L0, Hy, hr * 2, 10, Hc, { edge: 1 });
    if (hair === 4 && back) { D.ell(18, Hy + 6, 2.4, 5, Hc, { edge: 1 }); if (L.braid) for (let k = 0; k < 4; k++) D.dot(18, Hy + 3 + k * 2, Hc, 3); }
    if (L.ribbons && !L.hat) for (const sx of [L0 - .5, R0 + .5]) { D.ell(sx - 1.8, Hy - 4, 1.8, 1.4, L.ribbons, { edge: 1 }); D.ell(sx + 1.8, Hy - 4, 1.8, 1.4, L.ribbons, { edge: 1 }); D.dot(Math.round(sx), Math.round(Hy - 4.5), L.ribbons, 2); }
  }
}
function headSide(D, L, B, y, lag) {
  const S = SKIN(L), Hc = HAIR(L), Hy = B.Hy + y, hr = B.hr, hair = L.bald ? -1 : (L.hair ?? 0), cute = B.kid || B.fem, cx = 18.5;
  if (hair === 1) D.rect(cx - hr - 1 - lag, Hy - 2, 6, 12, Hc, { edge: 1 });
  if (hair === 4) { D.limb(cx - hr + .5, Hy + 1, -.25 - lag * .08, 7, 3.4, Hc, { edge: 1 }); }
  if (hair === 5) D.ell(cx - hr - 1.5 - lag, Hy + 3, 3, 5.2, Hc, { edge: 1 });
  if (L.hood) D.ell(cx - 2.5, Hy + 1, hr + 1.5, hr + 1.5, L.shirt, { edge: 1 });
  D.ell(cx, Hy, hr + .2, hr + .2, S, { edge: 1, skin: 1, soft: 1 });
  D.ell(cx + hr - .2, Hy + 1.5, 1.4, 1.6, S, { flat: 1, skin: 1 });   // nez rond
  const [eye, iris] = eyeCols(L), ex = Math.round(cx + hr * .45), eh = B.kid ? 4 : 3, ey = Math.round(Hy - (B.kid ? 1 : 1.5));
  D.rect(ex, ey, 2, eh, eye, { flat: 3 }); D.rect(ex, ey + eh - 1, 2, 1, iris, { flat: 1 }); D.dot(ex, ey, '#ffffff', 0);
  if (cute) { D.line(ex, ey - 1, ex + 2, ey - 1, eye, 3); D.dot(ex + 2, ey, eye, 3); }
  D.line(ex - 1, ey - (cute ? 3 : 2), ex + 2, ey - (cute ? 3 : 2), hair >= 0 ? Hc : darker(S, .4), 2);
  D.dot(ex - 1, ey + eh + 1, '#f2848c', 1); if (cute) D.dot(ex, ey + eh + 1, '#f2848c', 1);
  if (L.beard) { D.ell(cx + 2.5, Hy + 5, hr * .75, 4.4, L.beard, { edge: 1 }); for (let k = 0; k < 9; k++) D.dot(17 + (k * 5) % 8, Hy + 3 + (k * 3) % 5, L.beard, k % 2 ? 2 : 0); }
  const mus = L.mustache || L.beard, my = Math.round(Hy + (B.kid ? 5 : 4)); if (mus) D.rect(cx + 2.5, my - 2, 4, 2, mus, { flat: 2 });
  D.dot(Math.round(cx + hr * .55), my, L.sad ? '#7a3a3a' : '#8a3a3a', 2); if (B.kid) D.dot(Math.round(cx + hr * .55) - 1, my, '#8a3a3a', 2);
  D.ell(cx - 2.5, Hy + 1, 1.5, 2, S, { flat: 2, skin: 1 });   // oreille
  if (hair >= 0) {
    D.ell(cx - 1.5, Hy - 2.6, hr + .7, hr * .72, Hc, { edge: 1, clip: (x, yy) => yy < Hy - 2.5 || x < cx - 1.5 });
    D.ell(cx - hr * .6, Hy, hr * .55, hr * .7, Hc, { clip: x => x < cx - 1.5 });
    if (cute && !L.curly) D.ell(cx + hr * .55, Hy - 3.8, hr * .4, 2.2, Hc, { edge: 1 });   // frange
    for (let x = Math.round(cx - hr + 2); x < cx + hr - 3; x += 2) D.dot(x, Math.round(Hy - hr * .8), Hc, 0);
    if (L.curly) for (const [qx, qy] of [[cx - hr + 1, Hy - 3], [cx - hr + 3, Hy - 7], [cx + .5, Hy - 8], [cx - hr + 1, Hy + 2]]) D.ell(qx, qy, 2.4, 2.4, Hc, { edge: 1 });
    if (hair === 2) for (const x of [13, 16, 19, 22]) D.rows(Math.round(Hy - hr - 3), [[x - 1, x - 1], [x - 1, x], [x - 1, x + 1]], Hc, 1);
    if (hair === 3) { D.ell(cx - 4.5, Hy - hr + .5, 3.2, 3, Hc, { edge: 1 }); if (L.pencil) D.line(12, Hy - hr - 3, 16, Hy - hr + 2, '#e8c04a', 1); }
    if (L.ribbons && !L.hat) { const bx = cx - hr + .5; D.ell(bx, Hy - 6, 1.6, 1.8, L.ribbons, { edge: 1 }); D.ell(bx, Hy - 2.6, 1.6, 1.8, L.ribbons, { edge: 1 }); }
  }
}
function hat(D, L, y, side) {
  const h = L.hat; if (!h) return;
  const B = body(L), k = B.hr / 6.7, Hy = B.Hy + y, col = L.hatC || HATC[h] || HATC.cowboy, band = BAND[h] || darker(col, .5), cx = side ? 17.5 : 18;
  const Y = v => Hy - v * k, W2 = v => v * k;
  if (h === 'cowboy' || h === 'blanc' || h === 'paille') {
    const wide = h === 'paille' ? 1.2 : 0, pat = h === 'paille' ? (x, yy, t) => ((x + yy) % 3 === 0 ? [col, Math.min(3, t + 1)] : null) : null;
    D.ell(18, Y(6), W2((side ? 11.5 : 12.5) + wide), side ? 2.3 : 2.8, col, { edge: 1, pat });
    D.ell(cx, Y(9.5), W2(6.8), W2(4.8), col, { edge: 1, pat, clip: (x, yy) => yy < Y(6) });
    D.rect(18 - W2(6.5), Y(8), W2(13), 2, band, { flat: 2 });
    if (!side && h !== 'paille') for (const x of [-3, 0, 3]) D.dot(Math.round(18 + x * k), Math.round(Y(8)), '#e0a040', 0);
    D.line(18 - W2(3), Y(13), 18 + W2(3), Y(13), col, 3);
  } else if (h === 'melon') {
    D.ell(18, Y(5.2), W2(side ? 9 : 8.6), 1.7, col, { edge: 1 }); D.ell(cx, Y(8.5), W2(6.4), W2(5.2), col, { edge: 1, clip: (x, yy) => yy < Y(5) }); D.rect(18 - W2(6.2), Y(7), W2(12.4), 1.6, band, { flat: 2 });
  } else if (h === 'cap') {
    D.ell(cx, Y(5), W2(7.4), W2(4.4), col, { edge: 1, clip: (x, yy) => yy < Y(3) });
    if (side) D.ell(18 + W2(6), Y(3.6), W2(4.4), 1.5, darker(col, .15), { edge: 1 }); else D.ell(18, Y(3), W2(6.4), 1.8, darker(col, .15), { edge: 1, clip: (x, yy) => yy >= Y(3.5) });
    D.dot(18, Math.round(Y(9)), '#ffffff', 1);
  } else if (h === 'plat') {
    D.ell(cx + (side ? 1 : 0), Y(5), W2(side ? 8.4 : 7.8), W2(3.6), col, { edge: 1, clip: (x, yy) => yy < Y(3) });
    if (side) D.ell(18 + W2(6.5), Y(3.6), W2(3.4), 1.3, darker(col, .2), { edge: 1 }); else D.rect(18 - W2(6), Y(4), W2(12), 1, darker(col, .3), { flat: 2 });
  } else if (h === 'toque') {
    D.rect(18 - W2(6.5), Y(8), W2(13), W2(4), col, { edge: 1 }); D.ell(cx, Y(12), W2(7.4), W2(5), col, { edge: 1 }); D.ell(cx - W2(3), Y(13), W2(3.4), W2(3), col); D.ell(cx + W2(3), Y(13), W2(3.4), W2(3), col);
  } else if (h === 'bandeau') {
    D.rect(18 - W2(6.6), Y(4), W2(13.2), 2.2, col, { flat: 1 }); if (side) { D.line(18 - W2(6), Y(3), 18 - W2(8), Hy + 1, col, 1); D.line(18 - W2(6), Y(3), 18 - W2(9), Hy, col, 2); }
  }
}

// ---------- corps ----------
function legsFront(D, L, B, f, back) {
  const ph = f ? (f - 1) / 8 * Math.PI * 2 : 0, s = f ? Math.sin(ph) : 0, lift = [s > .3 ? 2 : 0, s < -.3 ? 2 : 0];
  const PC = legCol(L), pat = L.checkPants ? check('#2a2a32', '#e8e8e8') : null, robe = L.bottom === 'robe', skirt = L.bottom === 'skirt';
  const lw = B.kid ? 5 : 6, x1 = 18 - lw - 1, x2 = 19;
  [x1, x2].forEach((x, i) => {
    const up = lift[i], y0 = B.legTop - up;
    if (L.shorts) { D.rect(x, y0, lw + 1, B.legLen, SKIN(L), { edge: 1, skin: 1 }); D.rect(x, y0, lw + 1, Math.ceil(B.legLen * .45), PC, { edge: 1, pat }); }
    else D.rect(x, y0, lw + 1, B.legLen, skirt || robe ? SKIN(L) : PC, { edge: 1, pat });
    if (L.socks) D.rect(x, B.foot - B.boot - 2 - up, lw + 1, 2, '#ffffff', { edge: 1 });
    if (L.chaps) { D.rect(x, y0 + 1, 2, B.legLen - 1, '#8a5a32', { flat: 1 }); D.rect(x + lw - 1, y0 + 1, 2, B.legLen - 1, '#8a5a32', { flat: 2 }); }
    const by = B.foot - B.boot - up;
    D.rect(x - 1, by, lw + 2, B.boot, BOOTS(L), { round: 1, edge: 1 }); D.rect(x - 1, B.foot - up, lw + 2, 1, BOOTS(L), { flat: 3 });
    if (!back && L.socks) { D.line(x - 1, by + 1, x + lw, by + 1, BOOTS(L), 3); D.dot(x, by + 2, '#ffffff', 0); }   // chaussure à bride
    else if (!back) { D.dot(x + 2, by + 1, '#e8d0a0', 1); D.dot(x + lw - 1, by + 1, '#e8d0a0', 1); }
    if (L.spurs) D.dot(i ? x + lw + 1 : x - 2, B.foot - 1 - up, '#e8c26a', 0);
  });
  if (skirt) D.rows(B.belt, [[11, 25], [10, 26], [10, 26], [9, 27], [9, 27], [9, 27]], PC, 1, { edge: 1 });
  if (robe) { const sp = []; for (let k = 0; k < B.legLen + 1; k++) sp.push([Math.round(11 - k * .45), Math.round(25 + k * .45)]); D.rows(B.belt, sp, PC, 1, { edge: 1, pat: (x, y, t) => (y === B.belt + sp.length - 1 ? ['#f4ead2', 1] : x % 4 === 0 && y > B.belt + 3 ? [PC, 2] : null) }); }
}
function torsoFront(D, L, B, y, back) {
  const sh = L.coat ? L.shirt : L.shirt || '#b8302a', T = B.T + y, cyT = T + B.torsoH / 2 + 1.5, ry = B.torsoH / 2 + 1.8;
  const top = L.vest ? L.vest : sh;
  if (L.backpack && !back) { D.rect(7, T + 2, 3, 9, L.backpack, { flat: 2 }); D.rect(26, T + 2, 3, 9, L.backpack, { flat: 2 }); }
  D.ell(18, cyT, B.rx, ry, top, { edge: 1, pat: L.vest ? null : shirtPat(L) });
  if (L.coat) D.rect(18 - B.rx + .5, B.belt, B.rx * 2 - 1, B.legLen - 2, sh, { edge: 1 });   // pans du long manteau
  if (back) {
    if (L.vest) D.line(18, T + 3, 18, B.belt - 1, L.vest, 2);
    if (L.overalls) { D.line(14, T + 1, 21, B.belt - 3, L.overalls, 1); D.line(22, T + 1, 15, B.belt - 3, L.overalls, 1); }
    if (L.suspenders) { D.line(15, T + 1, 18, B.belt - 3, L.suspenders, 1); D.line(21, T + 1, 18, B.belt - 3, L.suspenders, 1); }
    if (L.apron) { D.rect(14, B.belt - 1, 8, 1, L.apron, { flat: 2 }); D.dot(17, B.belt, L.apron, 1); D.dot(19, B.belt, L.apron, 1); }
    if (L.backpack) { D.rect(12, T + 2, 12, 10, L.backpack, { edge: 1, round: 1 }); D.rect(13, T + 6, 10, 1, darker(L.backpack, .3), { flat: 2 }); D.dot(18, T + 7, '#e0a040', 0); }
    if (L.bandana) D.rows(T, [[16, 20], [17, 19]], L.bandana, 1);
    return;
  }
  if (L.vest || L.coat) {   // col en V qui laisse voir la chemise
    const inner = L.coat ? '#e8e2d6' : sh;
    D.rows(T, [[15, 21], [16, 20], [16, 20], [17, 19], [18, 18]], inner, 1, { pat: L.coat ? null : shirtPat(L) });
    D.line(18, T + 5, 18, B.belt - 1, top, 3);
    if (L.vest) { for (let k = T + 6; k < B.belt - 1; k += 3) { D.dot(19, k, '#e0a040', 1); D.dot(19, k - 1, '#e0a040', 0); } D.line(18 - B.rx + 3, T + 9, 18 - B.rx + 6, T + 9, top, 3); D.line(18 + B.rx - 6, T + 9, 18 + B.rx - 3, T + 9, top, 3); }
    if (L.coat) { D.line(17, T + 5, 14, T + 1, darker(sh, -.2), 1); D.line(19, T + 5, 22, T + 1, darker(sh, -.2), 1); }
  } else if (L.tank) { D.rows(T, [[15, 21], [16, 20]], SKIN(L), 1); }
  else if (L.buttons) { for (let k = T + 3; k < B.belt; k += 3) { D.dot(16, k, '#c8c8c0', 2); D.dot(20, k, '#c8c8c0', 2); } }
  else { D.rows(T, [[16, 20], [17, 19]], sh, 0); D.line(18, T + 2, 18, B.belt - 1, sh, 2); }
  if (L.knit) D.rows(T, [[15, 21]], darker(sh, .2), 1);
  if (L.overalls) { const O = L.overalls; D.rect(14, T + 4, 9, B.belt - T - 3, O, { edge: 1 }); D.line(14, T + 4, 13, T, O, 1); D.line(22, T + 4, 23, T, O, 1); D.dot(14, T + 4, '#e0a040', 0); D.dot(22, T + 4, '#e0a040', 0); D.rect(16, T + 6, 5, 3, darker(O, .15), { flat: 2 }); if (L.pocket === 'heart') { D.dot(17, T + 7, '#e0405a', 1); D.dot(19, T + 7, '#e0405a', 1); D.dot(18, T + 8, '#e0405a', 1); } }
  if (L.suspenders) { D.line(14, T, 14, B.belt - 1, L.suspenders, 1); D.line(22, T, 22, B.belt - 1, L.suspenders, 1); }
  if (L.stetho) { D.line(15, T, 15, T + 5, '#3a3a44', 2); D.line(21, T, 21, T + 5, '#3a3a44', 2); D.line(15, T + 5, 21, T + 5, '#3a3a44', 2); D.dot(18, T + 7, '#c8ccd4', 0); D.dot(18, T + 6, '#3a3a44', 2); }
  if (L.apron) {
    const A = L.apron, flowers = L.apronFlowers;
    D.rect(12.5, T + 4, 11, B.belt - T - 4 + Math.min(7, B.legLen - 2), A, { edge: 1, pat: flowers ? (x, yy) => ((x * 3 + yy * 5) % 11 === 0 ? ['#e07ab0', 1] : (x * 5 + yy * 3) % 13 === 0 ? ['#5aa04a', 1] : null) : null });
    D.line(14, T + 4, 15, T, A, 2); D.line(22, T + 4, 21, T, A, 2);
  }
  if (L.bandana) D.rows(T, [[14, 22], [15, 21], [16, 20], [17, 19], [18, 18]], L.bandana, 1, { edge: 1 });
  if (L.towel) D.rect(23, T + 1, 3, 6, '#e8e8e8', { flat: 1 });
  // ceinture
  const belt = L.toolbelt ? '#7a4a26' : '#4a2a18';
  if (!L.coat && !(L.bottom === 'robe') && !L.apron) { D.rect(18 - B.rx + 2, B.belt - 1, B.rx * 2 - 3, 2, belt, { flat: 2 }); D.rect(17, B.belt - 1, 3, 2, '#e0a040', { flat: 1 }); }
  if (L.toolbelt) { D.rect(11, B.belt, 4, 4, '#8a5a32', { round: 1 }); D.rect(22, B.belt, 4, 4, '#8a5a32', { round: 1 }); D.line(26, B.belt - 3, 26, B.belt + 4, '#9aa0a8', 1); }
}
function armsFront(D, L, B, y, f) {
  const s = f ? Math.sin((f - 1) / 8 * Math.PI * 2) : 0, sleeve = L.coat ? L.shirt : L.tank ? SKIN(L) : L.shirt || '#b8302a';
  const ax = B.armX, ry = B.torsoH / 2 + 1.5, cy = B.T + y + ry;
  [[18 - ax, s * 1.2], [18 + ax, -s * 1.2]].forEach(([x, dy]) => {
    if (L.puffy) { D.ell(x, cy + dy, 2.8, ry, SKIN(L), { edge: 1, skin: 1 }); D.ell(x, B.T + y + 2.6, 3.6, 3.2, sleeve, { edge: 1 }); }   // manches bouffantes, bras nus
    else D.ell(x, cy + dy, B.muscle ? 3.6 : 3.3, ry * (B.muscle ? .9 : 1), sleeve, { edge: 1, skin: !!L.tank, pat: L.vest || L.coat || L.tank ? null : shirtPat(L) });
    D.ell(x, cy + ry + dy, 2.5, 2.3, L.gloves || SKIN(L), { edge: 1, skin: !L.gloves });
  });
}
function front(L, d, f) {
  const D = Doll(), back = d === 1, B = body(L), s = f ? Math.sin((f - 1) / 8 * Math.PI * 2) : 0, bob = Math.abs(s) > .7 ? 1 : 0;
  if (back && L.hair === 1 && !L.bald) D.rect(11, B.Hy + bob, 14, 12, HAIR(L), { edge: 1 });
  legsFront(D, L, B, f, back);
  torsoFront(D, L, B, bob, back);
  armsFront(D, L, B, bob, f);
  headFront(D, L, B, back, bob);
  hat(D, L, bob, false);
  return D;
}
function side(L, f) {
  const D = Doll(), B = body(L), ph = f ? (f - 1) / 8 * Math.PI * 2 : 0, walking = !!f, bob = walking && Math.abs(Math.sin(ph)) > .7 ? 1 : 0;
  const lag = walking ? Math.round(Math.sin(2 * ph - 1) * .8) : 0, PC = legCol(L), pat = L.checkPants ? check('#2a2a32', '#e8e8e8') : null;
  const skirtish = L.bottom === 'skirt' || L.bottom === 'robe';
  const T = B.T + bob, cyT = T + B.torsoH / 2 + 1.5, ry = B.torsoH / 2 + 1.8, sh = L.shirt || '#b8302a', top = L.vest || sh;
  const arm = (sign, dark) => {   // bras opposés aux jambes, avant-bras légèrement plié
    const a = walking ? sign * Math.sin(ph) * (sign < 0 ? .6 : .55) : 0, col = L.coat ? sh : L.tank ? SKIN(L) : sh;
    const c = dark ? darker(col, .25) : col, sleevePat = dark || L.coat || L.tank ? null : shirtPat(L);
    const armC = L.puffy ? (dark ? darker(SKIN(L), .2) : SKIN(L)) : c;
    const [ex, ey] = D.limb(17, T + 2, a, B.torsoH * .45, B.muscle ? 5.5 : 4.6, armC, { edge: 1, skin: !!L.puffy, pat: L.puffy ? null : sleevePat });
    const [hx, hy] = D.limb(ex, ey, a * .6 + .15, B.torsoH * .4, B.muscle ? 5 : 4.2, armC, { edge: 1, skin: !!L.puffy, pat: L.puffy ? null : sleevePat });
    if (L.puffy) D.ell(17 + Math.sin(a) * 1.5, T + 2.6, 3.4, 3.2, c, { edge: 1 });
    D.ell(hx, hy + .5, 2.3, 2.2, dark ? darker(L.gloves || SKIN(L), .25) : L.gloves || SKIN(L), { edge: 1, skin: !L.gloves });
  };
  const leg = (p, dark) => {   // cuisse + tibia : le genou plie quand la jambe revient vers l'avant ; botte au sol
    const a1 = walking ? Math.sin(p) * .55 : 0, a2 = a1 - (walking ? Math.max(0, -Math.cos(p)) * .7 : 0), lift = walking && -Math.cos(p) > .3 ? 1 : 0;
    const c = skirtish ? SKIN(L) : PC, col = dark ? darker(c, .25) : c, w = B.kid ? 5 : 6;
    const skinC = dark ? darker(SKIN(L), .2) : SKIN(L);
    const [kx, ky] = D.limb(17, B.legTop + bob, a1, B.legLen * .5, w, col, { edge: 1, pat: dark ? null : pat });
    const [fx, fy] = D.limb(kx, ky, a2, B.legLen * .5 + 1, w - .5, L.shorts ? skinC : col, { edge: 1, skin: !!L.shorts, pat: dark || L.shorts ? null : pat });
    if (L.socks) D.limb(fx - Math.sin(a2) * 2, fy - Math.cos(a2) * 2, a2, 2, w - .5, dark ? '#e0dcd4' : '#ffffff', { edge: 1 });
    if (L.chaps) D.limb(kx - 1, ky - 3, a2, 5, 2, dark ? '#6a4426' : '#8a5a32', { flat: 1 });
    const bc = dark ? darker(BOOTS(L), .25) : BOOTS(L), bx = Math.round(fx) - 3, byy = Math.min(B.foot - B.boot, Math.round(fy)) - lift;
    D.rect(bx, byy, 8, B.boot, bc, { round: 1, edge: 1 }); D.rect(bx, byy + B.boot, 8, 1, bc, { flat: 3 });
    if (L.spurs) D.dot(bx - 1, byy + B.boot - 1, '#e8c26a', 0);
  };
  if (L.backpack) D.rect(9, T + 2, 5, 10, L.backpack, { edge: 1, round: 1 });
  arm(1, true); leg(ph + Math.PI, true); leg(ph, false);
  if (L.bottom === 'skirt') D.rows(B.belt + bob, [[12, 23], [11, 24], [11, 24], [10, 25], [10, 25]], PC, 1, { edge: 1 });
  if (L.bottom === 'robe') { const sp = []; for (let k = 0; k < B.legLen; k++) sp.push([Math.round(12 - k * .4), Math.round(23 + k * .4)]); D.rows(B.belt + bob, sp, PC, 1, { edge: 1 }); }
  // buste (le ventre ressort devant)
  D.ell(B.stout ? 19 : 18, cyT, B.rx * (B.stout ? .86 : .72), ry, top, { edge: 1, pat: L.vest ? null : shirtPat(L) });
  if (L.coat) D.rect(12, B.belt + bob, 12, B.legLen - 2, sh, { edge: 1 });
  if (L.vest) { D.dot(18 + B.rx * .7, T + 5, sh, 1); D.line(18 + B.rx * .7, T + 6, 18 + B.rx * .7, B.belt - 1 + bob, top, 3); }
  if (L.overalls) { const O = L.overalls; D.rect(19, T + 4, 5, B.belt - T - 3 + bob, O, { edge: 1 }); D.line(20, T + 4, 18, T, O, 1); D.dot(20, T + 4, '#e0a040', 0); }
  if (L.suspenders) D.line(19, T, 20, B.belt - 1 + bob, L.suspenders, 1);
  if (L.apron) D.rect(20, T + 4, 4, B.belt - T - 4 + Math.min(7, B.legLen - 2) + bob, L.apron, { edge: 1 });
  if (L.bandana) D.rows(T, [[19, 23], [20, 22], [21, 22]], L.bandana, 1);
  if (L.stetho) D.line(19, T, 21, T + 5, '#3a3a44', 2);
  if (!L.coat && L.bottom !== 'robe' && !L.apron) D.rect(18 - B.rx * .7 + 1, B.belt - 1 + bob, B.rx * 1.45, 2, L.toolbelt ? '#7a4a26' : '#4a2a18', { flat: 2 });
  if (L.toolbelt) D.rect(14, B.belt + bob, 5, 4, '#8a5a32', { round: 1 });
  headSide(D, L, B, bob, lag);
  hat(D, L, bob, true);
  arm(-1, false);
  return D;
}

// Image (36 × 60) d'un personnage : d 0 face, 1 dos, 2 gauche, 3 droite ; f 0..8
export function paperDoll(L, d, f = 0) {
  const k = 'pd' + JSON.stringify(L) + d + (f || 0);
  return cache(k, () => (d >= 2 ? side(L, f) : front(L, d, f)).render(d === 2));
}
// Dessine le personnage : (ox, oy) = coin haut-gauche de l'ancienne case 12 × 20 (pieds à oy + 19).
export function drawPaperDoll(c, ox, oy, L, d, f) {
  if (typeof document === 'undefined') return false;
  const im = paperDoll(L, d, f), w = PD_W * PD_SCALE, h = PD_H * PD_SCALE;
  c.drawImage(im, 0, 0, PD_W, PD_H, Math.round(ox + 6 - w / 2), Math.round(oy + 20 - h), w, h);
  return true;
}
// Portrait (haut du corps, de face) en data URL, pour les fiches des habitants.
export function dollPortrait(L) {
  return cache('pp' + JSON.stringify(L), () => {
    const im = paperDoll(L, 0, 0), B = body(L), top = Math.max(0, Math.floor(B.Hy - 15)), h = Math.min(PD_H - top, 28);
    const c = document.createElement('canvas'); c.width = PD_W; c.height = h; c.getContext('2d').drawImage(im, 0, top, PD_W, h, 0, 0, PD_W, h);
    return { url: c.toDataURL(), w: PD_W, h };
  });
}
