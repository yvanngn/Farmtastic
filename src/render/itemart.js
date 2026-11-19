// 19/11 : icônes d'objets refaites en « pixel moderne » (32 × 32, comme les personnages) : formes vectorielles rendues en pixels
// par le moteur des personnages (4 tons par couleur, contour teinté, lumière en haut à gauche). Repère : 64 × 64.
// Les objets sans dessin ici gardent l'ancienne icône 16 × 16 (itemicons.js).
import { renderPixel } from './folk.js';

const P2 = f => { const p = new Path2D(); f(p); p.closePath(); return p; };
const E = (cx, cy, rx, ry) => P2(p => p.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2));
const RR = (x, y, w, h, r) => { const p = new Path2D(); p.roundRect(x, y, w, h, r); return p; };
const POLY = (...a) => P2(p => { p.moveTo(a[0], a[1]); for (let i = 2; i < a.length; i += 2) p.lineTo(a[i], a[i + 1]); });
const ROT = (path, a, cx, cy) => { const p = new Path2D(); p.addPath(path, new DOMMatrix().translate(cx, cy).rotate(a).translate(-cx, -cy)); return p; };

export const MUSH = { mousseron: ['#e8dcc0', '#f4efe2'], morille: ['#8a6a4a', '#efe6d0'], girolle: ['#f2b03a', '#f6d68a'], oronge: ['#e85a2a', '#f4f0e0'], cepe: ['#8a4a2a', '#ece0c0'], truffe_blanche: ['#e8e0cc', '#e8e0cc'] };
const FLOW = { paquerette: '#ffffff', violette: '#8a5ac8', muguet: '#f4f4ea', coquelicot: '#e0302a', bleuet: '#4a7ae0', lavande: '#a07ad8', bruyere: '#d070b0', souci: '#f0a020', colchique: '#c890e0', perce_neige: '#eef5f8', jonquille: '#f5d63a', tournesol: '#f5c020', rose: '#e04a6a', edelweiss: '#f4f4ec', camomille: '#ffffff' };
const FISHC = { fish: '#8aa8c0', gardon: '#a8b8a0', carpe: '#c8a050', brochet: '#6a8a4a', anguille: '#5a5a3a', sardine: '#9ab8d0', maquereau: '#4a7a9a', dorade: '#e0b0a0', thon: '#3a5a8a', omble: '#c88a6a', saumon: '#e88a6a', salmon: '#e88a6a', poulpe: '#c86a8a', pieuvre: '#c86a8a' };
const ORE = { copper_ore: '#d8783a', tin_ore: '#d8dce2', iron_ore: '#9aa4b0', gold_ore: '#f2c832' };
const SEED = { wheat_seed: '#e6c34a', corn_seed: '#f2d13b', carrot_seed: '#ef7b2a', hay_seed: '#c9b45a' };

function model(id) {
  const parts = [], feat = [], A = (path, mat, z) => parts.push({ path, mat, z }), M = {}, pat = {};
  const base = id.replace(/_[sml]$/, ''), size = { s: -4, m: 0, l: 4 }[id.slice(-1)] ?? 0;
  if (MUSH[base]) {
    const [cap, st] = MUSH[base], k = size;
    A(RR(26 - k / 2, 30, 12 + k, 24 + k / 2, 5), 'stem', 1);
    A(P2(p => { p.moveTo(8 - k, 34); p.bezierCurveTo(8 - k, 6 - k, 56 + k, 6 - k, 56 + k, 34); p.quadraticCurveTo(32, 40, 8 - k, 34); }), 'cap', 2);
    if (base === 'oronge') for (const [x, y] of [[20, 22], [34, 16], [44, 26], [27, 29]]) A(E(x, y, 3.5, 2.6), 'dot', 3);
    if (base === 'morille') for (let i = 0; i < 6; i++) A(E(16 + i * 6.5, 24 + (i % 2) * 5, 2.4, 3), 'dot', 3);
    Object.assign(M, { cap, stem: st, dot: base === 'morille' ? '#5a4430' : '#fff6ea' });
    return { parts, feat, mats: M, pattern: pat };
  }
  if (FLOW[id]) {
    A(RR(30, 30, 4, 28, 2), 'leafD', 1); A(ROT(E(42, 44, 9, 4), -30, 42, 44), 'leaf', 1.5); A(ROT(E(22, 48, 8, 3.5), 25, 22, 48), 'leaf', 1.5);
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; A(E(32 + Math.cos(a) * 11, 22 + Math.sin(a) * 11, 7.5, 7.5), 'petal', 2); }
    A(E(32, 22, 6, 6), 'heart', 3);
    Object.assign(M, { petal: FLOW[id], heart: id === 'coquelicot' ? '#2a1a1a' : '#f2c832', leaf: '#5aa040', leafD: '#3e8a34' });
    return { parts, feat, mats: M, pattern: pat };
  }
  if (FISHC[id]) {
    const f = FISHC[id];
    A(POLY(48, 32, 62, 18, 58, 32, 62, 46), 'fin', 1);   // queue
    A(E(29, 32, 22, 13), 'body', 2); A(P2(p => { p.moveTo(10, 34); p.quadraticCurveTo(29, 50, 48, 34); p.quadraticCurveTo(29, 40, 10, 34); }), 'belly', 2.5);
    A(POLY(22, 20, 32, 10, 40, 21), 'fin', 1.5); A(POLY(26, 40, 34, 50, 38, 40), 'fin', 2.6);
    A(P2(p => { p.moveTo(17, 22); p.quadraticCurveTo(22, 32, 17, 42); p.lineTo(15, 41); p.quadraticCurveTo(19, 32, 15, 23); }), 'gill', 3);
    feat.push({ t: 'px', x: 12, y: 27, w: 2, h: 2, col: '#1a1a24' }, { t: 'px', x: 12, y: 27, w: 1, h: 1, col: '#ffffff' });
    Object.assign(M, { body: f, belly: '#eef2f0', fin: f, gill: f });
    return { parts, feat, mats: M, pattern: { body: id === 'maquereau' ? { type: 'stripe', col: '#2a4a6a' } : null } };
  }
  if (ORE[id]) {
    A(P2(p => { p.moveTo(8, 44); p.lineTo(14, 22); p.lineTo(30, 12); p.lineTo(48, 16); p.lineTo(58, 34); p.lineTo(50, 54); p.lineTo(20, 56); }), 'rock', 1);
    for (const [x, y, r] of [[24, 30, 7], [40, 26, 6], [36, 44, 7], [20, 46, 4]]) A(POLY(x - r, y, x, y - r, x + r, y, x, y + r), 'ore', 2);
    if (id === 'gold_ore' || id === 'iron_ore') feat.push({ t: 'px', x: 38, y: 22, w: 1, h: 5, col: '#ffffff' }, { t: 'px', x: 36, y: 24, w: 5, h: 1, col: '#ffffff' });
    Object.assign(M, { rock: '#6a6672', ore: ORE[id] });
    return { parts, feat, mats: M, pattern: pat };
  }
  if (SEED[id]) {
    A(P2(p => { p.moveTo(14, 20); p.lineTo(50, 20); p.quadraticCurveTo(56, 40, 50, 58); p.lineTo(14, 58); p.quadraticCurveTo(8, 40, 14, 20); }), 'bag', 1);
    A(POLY(16, 20, 22, 8, 30, 16, 36, 6, 42, 16, 48, 20), 'bagD', 1.5); A(RR(14, 18, 36, 5, 2), 'string', 2);
    A(RR(20, 32, 24, 18, 3), 'label', 2.5); A(E(32, 41, 6, 6), 'seed', 3);
    Object.assign(M, { bag: '#d8c49a', bagD: '#c8b080', string: '#8a5a32', label: '#f4ead2', seed: SEED[id] });
    return { parts, feat, mats: M, pattern: pat };
  }
  const D = {
    tent: () => {   // tente violette, ouverture sombre, piquets
      A(POLY(4, 54, 32, 8, 60, 54), 'canvas', 1); A(POLY(32, 8, 60, 54, 44, 54), 'canvasD', 1.5);
      A(POLY(24, 54, 32, 26, 40, 54), 'door', 2); A(RR(31, 4, 2.5, 8, 1), 'pole', 2.5); A(POLY(33, 4, 42, 7, 33, 10), 'flag', 2.6);
      A(RR(2, 54, 60, 4, 2), 'ground', 0.5);
      Object.assign(M, { canvas: '#8a5ac8', canvasD: '#6a3ea8', door: '#2a1a30', pole: '#8a5a32', flag: '#f2c832', ground: '#6a8a3a' });
    },
    campfire: () => {   // bûches croisées et flammes vives
      A(ROT(RR(6, 44, 52, 9, 4), -14, 32, 48), 'log', 1); A(ROT(RR(6, 44, 52, 9, 4), 14, 32, 48), 'logD', 1.2);
      for (const [x, y] of [[10, 54], [22, 57], [42, 57], [54, 54]]) A(E(x, y, 5, 3.5), 'stone', 0.8);
      A(P2(p => { p.moveTo(16, 46); p.quadraticCurveTo(10, 26, 24, 14); p.quadraticCurveTo(22, 26, 30, 28); p.quadraticCurveTo(28, 12, 38, 4); p.quadraticCurveTo(36, 20, 46, 24); p.quadraticCurveTo(56, 34, 48, 46); }), 'flame', 2);
      A(P2(p => { p.moveTo(22, 46); p.quadraticCurveTo(20, 32, 30, 26); p.quadraticCurveTo(32, 34, 36, 30); p.quadraticCurveTo(44, 38, 42, 46); }), 'flameL', 3);
      A(E(32, 42, 5, 4), 'core', 4);
      Object.assign(M, { log: '#8a5a32', logD: '#6e4426', stone: '#7a7680', flame: '#e8502a', flameL: '#f6a020', core: '#fff0a0' });
    },
    wood: () => {   // fagot de 3 bûches, cernes visibles
      [[18, 1, 'bark'], [30, 2, 'bark2'], [42, 3, 'bark']].forEach(([y, z, b], i) => { A(RR(6 + i * 2, y - 7, 44, 13, 6), b, z); A(E(50 + i * 2, y - .5, 7, 6.5), 'ring', z + .2); A(E(50 + i * 2, y - .5, 3, 3), 'ringD', z + .3); });
      A(RR(24, 10, 5, 42, 2), 'rope', 4); Object.assign(M, { bark: '#8a5a32', bark2: '#74482a', ring: '#e0b07a', ringD: '#b07a48', rope: '#c8a060' });
    },
    stone: () => { A(P2(p => { p.moveTo(8, 46); p.quadraticCurveTo(6, 24, 26, 16); p.quadraticCurveTo(46, 10, 56, 30); p.quadraticCurveTo(60, 52, 40, 54); p.lineTo(16, 54); }), 'stone', 1); A(P2(p => { p.moveTo(20, 30); p.quadraticCurveTo(30, 22, 40, 26); p.lineTo(36, 30); p.quadraticCurveTo(28, 28, 22, 34); }), 'crack', 2); Object.assign(M, { stone: '#8a8692', crack: '#5a5662' }); },
    wheat: () => { for (const [x, a] of [[22, -12], [32, 0], [42, 12]]) { A(ROT(RR(x - 1.5, 26, 3, 32, 1), a, 32, 58), 'stalk', 1); for (let k = 0; k < 5; k++) A(ROT(E(x + (k % 2 ? 3 : -3), 8 + k * 5, 3.4, 4.6), a, 32, 58), 'grain', 2); } A(RR(24, 44, 16, 5, 2), 'tie', 3); Object.assign(M, { stalk: '#b8902a', grain: '#e6c34a', tie: '#c84a3a' }); },
    straw: () => { A(RR(6, 18, 52, 36, 6), 'bale', 1); for (const x of [18, 44]) A(RR(x, 16, 4, 40, 1), 'twine', 2); A(RR(6, 16, 52, 6, 3), 'top', 1.5); Object.assign(M, { bale: '#e0c060', top: '#f2d87a', twine: '#8a5a32' }); pat.bale = { type: 'planks' }; },
    hay: () => D.straw(),
    bread: () => { A(P2(p => { p.moveTo(6, 44); p.quadraticCurveTo(4, 18, 32, 16); p.quadraticCurveTo(60, 18, 58, 44); p.quadraticCurveTo(32, 54, 6, 44); }), 'crust', 1); for (const x of [20, 32, 44]) A(ROT(E(x, 28, 3, 8), 30, x, 28), 'cut', 2); Object.assign(M, { crust: '#d9963a', cut: '#f6d08a' }); },
    chest: () => { A(RR(6, 26, 52, 30, 3), 'wood', 1); A(P2(p => { p.moveTo(6, 30); p.quadraticCurveTo(6, 10, 32, 10); p.quadraticCurveTo(58, 10, 58, 30); }), 'lid', 2); for (const x of [10, 50]) A(RR(x, 12, 4, 44, 1), 'iron', 3); A(RR(6, 28, 52, 4, 1), 'iron', 3); A(RR(28, 26, 8, 10, 2), 'lock', 4); Object.assign(M, { wood: '#8a5a32', lid: '#a8703e', iron: '#5a5a66', lock: '#e8c26a' }); pat.wood = { type: 'planks' }; },
    berry: () => { [[22, 34], [40, 30], [32, 46], [44, 48], [20, 50]].forEach(([x, y], i) => A(E(x, y, 8.5, 8.5), i % 2 ? 'berry2' : 'berry', 2 + i * .1)); M.berry2 = '#3a48b0'; A(ROT(E(36, 14, 10, 5), -25, 36, 14), 'leaf', 3); Object.assign(M, { berry: '#4a5ac8', leaf: '#4fa040' }); for (const [x, y] of [[19, 30], [37, 26], [29, 42]]) feat.push({ t: 'px', x, y, w: 1, h: 1, col: '#c8d4ff' }); },
    mure: () => { [[26, 24], [36, 24], [22, 33], [32, 33], [42, 33], [26, 42], [36, 42], [31, 50]].forEach(([x, y], i) => A(E(x, y, 6, 6), i % 2 ? 'berry2' : 'berry', 2 + i * .1)); M.berry2 = '#5a2a6a'; A(ROT(E(32, 12, 10, 4), 10, 32, 12), 'leaf', 3); Object.assign(M, { berry: '#3a1a4a', leaf: '#4fa040' }); },
    egg: () => { A(P2(p => { p.moveTo(32, 6); p.bezierCurveTo(54, 6, 56, 56, 32, 58); p.bezierCurveTo(8, 56, 10, 6, 32, 6); }), 'egg', 1); feat.push({ t: 'px', x: 22, y: 16, w: 2, h: 3, col: '#ffffff' }); Object.assign(M, { egg: '#f6eedc' }); },
    bone: () => { A(ROT(RR(14, 28, 36, 8, 4), -35, 32, 32), 'bone', 1); for (const [x, y] of [[14, 46], [20, 52], [44, 12], [50, 18]]) A(E(x, y, 6, 6), 'bone', 2); Object.assign(M, { bone: '#f0e8d4' }); },
    backpack: () => { A(RR(12, 14, 40, 44, 10), 'pack', 1); A(RR(16, 34, 32, 18, 5), 'pocket', 2); A(P2(p => { p.moveTo(22, 14); p.quadraticCurveTo(32, 2, 42, 14); p.lineTo(38, 14); p.quadraticCurveTo(32, 8, 26, 14); }), 'strap', 2); A(RR(29, 30, 6, 8, 2), 'buckle', 3); Object.assign(M, { pack: '#8a5a32', pocket: '#a8774a', strap: '#5b3a22', buckle: '#e8c26a' }); },
    corn: () => { A(E(32, 30, 11, 22), 'cob', 2); A(P2(p => { p.moveTo(30, 58); p.quadraticCurveTo(10, 40, 18, 12); p.quadraticCurveTo(22, 40, 32, 50); }), 'husk', 3); A(P2(p => { p.moveTo(34, 58); p.quadraticCurveTo(54, 40, 46, 12); p.quadraticCurveTo(42, 40, 32, 50); }), 'huskD', 3); Object.assign(M, { cob: '#f2d13b', husk: '#64ad3c', huskD: '#4a8a2a' }); pat.cob = { type: 'check', col: '#d8b020' }; },
    carrot: () => { A(ROT(P2(p => { p.moveTo(20, 18); p.lineTo(44, 18); p.quadraticCurveTo(40, 40, 32, 60); p.quadraticCurveTo(24, 40, 20, 18); }), 25, 32, 36), 'root', 1); for (const a of [-20, 0, 20]) A(ROT(E(26, 10, 4, 10), a + 25, 26, 18), 'top', 2); Object.assign(M, { root: '#ef7b2a', top: '#4fa040' }); },
    wool: () => { for (const [x, y, r] of [[22, 30, 13], [40, 28, 13], [32, 42, 14], [20, 44, 9], [46, 44, 9]]) A(E(x, y, r, r * .9), 'wool', 2); Object.assign(M, { wool: '#f4f1ea' }); },
    rabbit_wool: () => { D.wool(); M.wool = '#f6dfe6'; },
    fence: () => { for (const x of [10, 44]) A(POLY(x, 58, x, 14, x + 5, 8, x + 10, 14, x + 10, 58), 'post', 2); for (const y of [22, 40]) A(RR(4, y, 56, 8, 2), 'rail', 1); Object.assign(M, { post: '#a8774a', rail: '#8a5a32' }); },
    ruby: () => { A(POLY(32, 6, 54, 24, 32, 58, 10, 24), 'gem', 1); A(POLY(32, 6, 42, 24, 32, 30, 22, 24), 'gemL', 2); Object.assign(M, { gem: '#d02040', gemL: '#ff6a80' }); },
    emerald: () => { A(POLY(22, 6, 42, 6, 52, 18, 52, 46, 42, 58, 22, 58, 12, 46, 12, 18), 'gem', 1); A(RR(24, 16, 16, 32, 2), 'gemL', 2); Object.assign(M, { gem: '#1a9a50', gemL: '#5ae08a' }); },
    slime: () => { A(P2(p => { p.moveTo(6, 54); p.quadraticCurveTo(4, 20, 32, 14); p.quadraticCurveTo(60, 20, 58, 54); }), 'slime', 1); feat.push({ t: 'px', x: 22, y: 34, w: 3, h: 4, col: '#1a3a1a' }, { t: 'px', x: 38, y: 34, w: 3, h: 4, col: '#1a3a1a' }, { t: 'px', x: 16, y: 22, w: 4, h: 1, col: '#c8ffc8' }); Object.assign(M, { slime: '#56c45a' }); },
    chaudron: () => { A(P2(p => { p.moveTo(8, 24); p.lineTo(56, 24); p.quadraticCurveTo(58, 56, 32, 56); p.quadraticCurveTo(6, 56, 8, 24); }), 'pot', 1); A(RR(4, 20, 56, 8, 4), 'rim', 2); A(E(32, 22, 24, 3), 'soup', 3); Object.assign(M, { pot: '#3a3a44', rim: '#5a5a66', soup: '#c87a3a' }); },
    bonnet: () => { A(P2(p => { p.moveTo(8, 44); p.quadraticCurveTo(8, 10, 32, 10); p.quadraticCurveTo(56, 10, 56, 44); }), 'knit', 1); A(RR(6, 40, 52, 12, 5), 'band', 2); A(E(32, 8, 7, 7), 'pom', 3); Object.assign(M, { knit: '#c84a4a', band: '#f4f0e6', pom: '#f4f0e6' }); pat.knit = { type: 'knit' }; },
  };
  if (D[id]) { D[id](); return { parts, feat, mats: M, pattern: pat }; }
  return null;
}

const CACHE = new Map();
// URL de l'icône 32 × 32, ou null si l'objet n'a pas de dessin moderne.
export function itemArt(id) {
  if (typeof document === 'undefined') return null;
  if (CACHE.has(id)) return CACHE.get(id);
  const m = model(id); let url = null;
  if (m) { const im = renderPixel(m, 32, 32, { s: .5, shade: 1, deep: true, selout: true, inner: true, q: 3 }); url = im.toDataURL(); }
  CACHE.set(id, url); return url;
}
