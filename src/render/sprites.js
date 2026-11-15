// Sprites pixel art procéduraux, ombrés et contourés, mis en cache.
import { CFG } from '../config.js';
import { CROPS } from '../data/crops.js';
import { cropProgress } from '../systems/farming.js';
import { shade, disc, canvas, outline, makeCache, groundShadow, hex6 } from './pixel.js';
import { rng } from '../world/map.js';
const T = CFG.T;
const cache = makeCache(400);
const SHOE = '#4a2e1e', EYE = '#2a1d18';

/* ---------------- Personnage (16×23, contour inclus) ---------------- */
// L.body : 'h' | 'f' ; L.bottom : 'pant' | 'skirt' ; L.hair : 0 court, 1 long, 2 épis, 3 chignon, 4 queue, 5 couettes.
function rawChar(c, L, d, f, blink) {
  const r = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(2 + x, 2 + y, w, h); };
  const S = hex6(L.skin), Sd = shade(S, .82), Sh = hex6(L.shirt), Shd = shade(Sh, .76), Shl = shade(Sh, 1.18);
  const P = hex6(L.pants), Pd = shade(P, .72), H = hex6(L.hairC), Hl = shade(H, 1.35), Hd = shade(H, .72);
  const fem = L.body === 'f', skirt = L.bottom === 'skirt', LIPS = '#d0606e';
  const bob = (f === 1 || f === 3) ? -1 : 0, st = L.hair, long = st === 1;
  const up = (x, y, w, h, col) => r(x, y + bob, w, h, col);

  if (d === 3) { // profil droit (le gauche = miroir)
    const off = [0, 1, 0, -1][f];
    if (skirt) {
      r(4 - off, 16, 2, 2, Sd); r(6 + off, 16, 2, 2, S);
      r(4 - off, 18, 3, 1, shade(SHOE, .8)); r(6 + off, 18, 3, 1, SHOE);
      up(3, 13, 6, 3, P); up(2, 15, 8, 1, Pd);
    } else {
      r(4 - off, 14, 3, 4, Pd); r(5 + off, 14, 3, 4, P);
      r(4 - off, 18, 4, 1, shade(SHOE, .8)); r(5 + off, 18, 4, 1, SHOE);
    }
    up(3, 9, 6, 5, Sh); up(3, 9, 1, 5, Shd); up(8, 9, 1, 4, Shl); if (!skirt) up(3, 13, 6, 1, Pd);
    const ax = 5 - off; up(ax, 10, 2, 4, Shd); up(ax, 14, 2, 1, S);
    up(3, 2, 7, 7, S); up(3, 8, 7, 1, Sd); up(10, 5, 1, 1, S); up(5, 5, 1, 2, Sd);
    up(8, blink ? 6 : 5, 1, blink ? 1 : 2, EYE); up(8, 7, 2, 1, fem ? LIPS : shade(S, .7));
    if (fem && !blink) up(9, 4, 1, 1, EYE);
    if (st === 3) { up(3, 1, 7, 2, H); up(1, 2, 3, 3, H); up(4, 1, 3, 1, Hl); return; }
    up(3, 1, 7, 3, H); up(5, 1, 3, 1, Hl);
    if (st === 4) { up(3, 1, 3, 4, H); up(1, 3, 2, 7, H); up(1, 3, 1, 7, Hd); return; }
    if (st === 5) { up(3, 1, 3, 4, H); up(3, 4, 2, 6, H); up(3, 8, 2, 1, '#e8c26a'); return; }
    up(3, 1, 3, long ? 9 : 5, H); up(3, 4, 1, long ? 6 : 2, Hd);
    if (st === 2) { up(4, 0, 1, 1, H); up(7, 0, 1, 1, H); up(9, 1, 1, 1, H); }
    return;
  }
  // face (0) / dos (1)
  const l1 = f === 1 ? 1 : 0, l2 = f === 3 ? 1 : 0;
  if (skirt) {
    r(3, 16 - l1, 2, 2, S); r(7, 16 - l2, 2, 2, Sd);
    r(3, 18 - l1, 3, 1, SHOE); r(6, 18 - l2, 3, 1, SHOE);
    up(2, 13, 8, 2, P); up(1, 15, 10, 1, Pd); up(2, 13, 1, 2, shade(P, 1.15));
  } else {
    r(3, 14 - l1, 3, 4, P); r(6, 14 - l2, 3, 4, Pd);
    r(3, 18 - l1, 3, 1, SHOE); r(6, 18 - l2, 3, 1, SHOE);
  }
  const tw = fem ? 1 : 0; // taille plus fine
  up(2 + tw, 9, 8 - tw * 2, 5, Sh); up(2, 9, 8, 2, Sh); up(2, 9, 1, 2, Shl); up(2 + tw, 11, 1, 3, Shl); up(9 - tw, 9, 1, 5, Shd);
  if (!skirt) up(2, 13, 8, 1, Pd);
  if (d === 0) { up(5, 9, 2, 1, S); if (fem) up(4, 9, 4, 1, S); }
  up(1, 10 + l2, 1, 4, Shd); up(10, 10 + l1, 1, 4, Shd); up(1, 14 + l2, 1, 1, S); up(10, 14 + l1, 1, 1, S);
  up(2, 2, 8, 7, S); up(9, 3, 1, 5, Sd); up(2, 8, 8, 1, Sd);
  if (d === 0) {
    if (blink) { up(3, 6, 2, 1, EYE); up(7, 6, 2, 1, EYE); }
    else { up(4, 5, 1, 2, EYE); up(7, 5, 1, 2, EYE); up(4, 5, 1, 1, '#fff8'); if (fem) { up(3, 4, 1, 1, EYE); up(8, 4, 1, 1, EYE); } }
    if (L.sad) { // air triste : sourcils tombants, bouche vers le bas, pas de joues roses
      up(3, 4, 2, 1, Hd); up(7, 4, 2, 1, Hd); up(4, 3, 1, 1, Hd); up(7, 3, 1, 1, Hd);
      up(5, 7, 2, 1, shade(S, .65)); up(4, 8, 1, 1, shade(S, .7)); up(7, 8, 1, 1, shade(S, .7));
    } else { up(5, 7, 2, 1, fem ? LIPS : shade(S, .7)); up(3, 7, 1, 1, '#ff6a6a66'); up(8, 7, 1, 1, '#ff6a6a66'); }
  }
  if (st === 3) {
    up(2, 1, 8, 2, H); up(4, -1, 4, 2, H); up(5, -1, 2, 1, Hl);
    if (d === 1) { up(2, 1, 8, 6, H); up(3, 2, 2, 1, Hl); }
    return;
  }
  up(2, 1, 8, 3, H); up(3, 1, 3, 1, Hl);
  if (st === 2) { up(2, 0, 1, 1, H); up(5, 0, 2, 1, H); up(9, 0, 1, 1, H); up(5, 0, 1, 1, Hl); }
  if (st === 4) { // queue de cheval
    if (d === 1) { up(2, 1, 8, 6, H); up(3, 2, 2, 3, Hl); up(5, 7, 2, 6, H); up(5, 7, 2, 1, '#e8c26a'); }
    else { up(2, 3, 1, 2, H); up(9, 3, 1, 2, H); up(10, 4, 1, 5, Hd); }
    return;
  }
  if (st === 5) { // couettes
    if (d === 1) { up(2, 1, 8, 6, H); up(3, 2, 2, 3, Hl); }
    else { up(2, 3, 1, 2, H); up(9, 3, 1, 2, H); }
    up(-1, 4, 2, 6, H); up(11, 4, 2, 6, H); up(-1, 4, 2, 1, '#e8c26a'); up(11, 4, 2, 1, '#e8c26a'); up(-1, 9, 1, 1, Hd); up(12, 9, 1, 1, Hd);
    return;
  }
  if (d === 1) { up(2, 1, 8, long ? 10 : 6, H); up(3, 2, 2, long ? 6 : 3, Hl); up(8, 2, 1, long ? 8 : 4, Hd); }
  else if (long) { up(1, 3, 2, 7, H); up(9, 3, 2, 7, H); up(1, 3, 1, 7, Hd); up(10, 3, 1, 7, Hd); }
  else { up(2, 3, 1, 2, H); up(9, 3, 1, 2, H); }
}

function charSprite(L, d, f, blink) {
  const k = 'c' + L.body + L.bottom + L.skin + L.hair + L.hairC + L.shirt + L.pants + (L.sad ? 's' : '') + d + f + blink;
  return cache(k, () => {
    const s = canvas(16, 23), c = s.getContext('2d');
    if (d === 2) { c.translate(16, 0); c.scale(-1, 1); }
    rawChar(c, L, d === 2 ? 3 : d, f, blink);
    return outline(s);
  });
}

// ox, oy : coin haut-gauche du personnage 12×20. t : horloge pour le clignement.
export function drawChar(c, ox, oy, L, d, f, t = 0) {
  groundShadow(c, ox + 6, oy + 20, 5, 2);
  const blink = (t % 4200) < 130, spr = charSprite(L, d, f || 0, blink);
  if (L.tall) { // grand : le buste est allongé de 3 pixels
    c.drawImage(spr, 0, 0, spr.width, 14, ox - 2, oy - 5, spr.width, 14);
    c.drawImage(spr, 0, 11, spr.width, spr.height - 11, ox - 2, oy + 9, spr.width, spr.height - 11);
  } else c.drawImage(spr, ox - 2, oy - 2);
}

/* ---------------- Icônes pixel des outils (roues, bouton d'action) ---------------- */
// Renvoie une URL d'image 16×16 (null pour la main, qui garde son émoji).
export function toolIcon(id) {
  if (!TOOL_PIX[id]) return null;
  return cache('icon' + id, () => {
    const s = canvas(16, 16), c = s.getContext('2d');
    c.translate(id === 'sickle' ? 6 : 7, 13); TOOL_PIX[id](c); // pas de rotation : pixels nets
    return outline(s, '#1b1226').toDataURL();
  });
}

/* ---------------- Outils tenus en main (animation de coup) ---------------- */
const TOOL_PIX = {
  axe: c => { c.fillStyle = '#7a4f2e'; c.fillRect(-1, -1, 2, 9); c.fillStyle = '#9aa0a8'; c.fillRect(-1, -10, 5, 4); c.fillStyle = '#d6dbe0'; c.fillRect(3, -10, 1, 4); c.fillStyle = '#7a4f2e'; c.fillRect(-1, -7, 2, 6); },
  pick: c => { c.fillStyle = '#7a4f2e'; c.fillRect(-1, -8, 2, 16); c.fillStyle = '#9aa0a8'; c.fillRect(-5, -10, 10, 2); c.fillRect(-6, -9, 2, 2); c.fillRect(4, -9, 2, 2); c.fillStyle = '#d6dbe0'; c.fillRect(-4, -10, 8, 1); },
  sickle: c => { // lame en croissant au bout d'un manche court
    c.fillStyle = '#7a4f2e'; c.fillRect(-1, -1, 2, 9); c.fillStyle = '#5b3a22'; c.fillRect(0, 2, 1, 6);
    c.fillStyle = '#e8c26a'; c.fillRect(-1, -2, 2, 1);
    const B = [[0, -3], [1, -4], [2, -5], [3, -6], [4, -7], [4, -8], [4, -9], [3, -10], [2, -11], [1, -11], [0, -11], [-1, -10], [-2, -10]];
    c.fillStyle = '#7d828a'; for (const [x, y] of B) c.fillRect(x - 1, y, 1, 1);
    c.fillStyle = '#d6dbe0'; for (const [x, y] of B) c.fillRect(x, y, 1, 1);
    c.fillStyle = '#ffffff'; c.fillRect(4, -9, 1, 2); c.fillRect(1, -11, 2, 1);
  },
  shovel: c => { c.fillStyle = '#7a4f2e'; c.fillRect(-1, -6, 2, 14); c.fillStyle = '#5b3a22'; c.fillRect(-3, 6, 6, 2); c.fillStyle = '#9aa0a8'; c.fillRect(-3, -12, 6, 7); c.fillRect(-2, -13, 4, 1); c.fillStyle = '#d6dbe0'; c.fillRect(-2, -12, 2, 6); },
  sword: c => { c.fillStyle = '#5a3a22'; c.fillRect(-1, 2, 2, 4); c.fillStyle = '#e8c26a'; c.fillRect(-3, 1, 6, 1); c.fillStyle = '#d6dbe0'; c.fillRect(-1, -11, 2, 12); c.fillStyle = '#ffffff'; c.fillRect(-1, -11, 1, 11); },
  hand: null
};
// Hache, pioche, faucille, épée : arc de mouvement selon la direction (p de 0 à 1).
export function drawSwing(c, S, tool, p) {
  const draw = TOOL_PIX[tool]; if (!draw) return;
  const hx = [6, 6, 3, 9][S.dir], hy = [13, 10, 12, 12][S.dir];
  const e = p < .35 ? -(p / .35) * .3 : (p - .35) / .65; // petit élan puis coup
  const arcs = { 0: [-.3, 2.9], 1: [.2, -.3], 2: [.4, -1.8], 3: [-.4, 1.8] };
  const [a0, a1] = arcs[S.dir], a = a0 + (a1 - a0) * Math.max(0, e);
  const step = Math.round(a / (Math.PI / 8)) * (Math.PI / 8); // angles quantifiés : rendu pixel net
  c.save(); c.translate(Math.round(S.x * T - 6 + hx), Math.round(S.y * T - 19 + hy)); c.rotate(step);
  draw(c); c.restore();
}

/* ---------------- Arbres ---------------- */
const TREE_PAL = [
  ['#2c5f2a', '#4a8f36', '#78bd4a', '#f3a6c4'],
  ['#234f25', '#3b7f31', '#62a73f', null],
  ['#7e3417', '#c25e1d', '#eea13a', null],
  ['#4f5d63', '#7d9096', '#eef5f7', null]
];
export function treeSprite(season, v) {
  return cache('t' + season + v, () => {
    const s = canvas(34, 44), c = s.getContext('2d'), p = TREE_PAL[season], r = rng(v * 97 + 3);
    // tronc + racines
    c.fillStyle = '#5b3a22'; c.fillRect(14, 26, 6, 16); c.fillRect(11, 39, 12, 3);
    c.fillStyle = '#7a4f2e'; c.fillRect(15, 26, 2, 15);
    c.fillStyle = '#3f2615'; c.fillRect(19, 27, 1, 14); c.fillRect(16, 32, 1, 2);
    // feuillage en grappes
    const cx = 17 + (v % 3) - 1;
    for (const [x, y, rad] of [[cx, 19, 12], [cx - 8, 22, 8], [cx + 8, 22, 8], [cx, 11, 10]]) disc(c, x, y, rad, p[0]);
    for (const [x, y, rad] of [[cx - 1, 17, 10], [cx - 8, 20, 6], [cx + 7, 20, 6], [cx - 1, 10, 8]]) disc(c, x, y, rad, p[1]);
    for (const [x, y, rad] of [[cx - 4, 9, 4], [cx - 9, 18, 3], [cx + 3, 14, 3], [cx + 6, 18, 2]]) disc(c, x, y, rad, p[2]);
    // tramage pour la texture
    for (let i = 0; i < 40; i++) { const x = 6 + r() * 22 | 0, y = 2 + r() * 26 | 0; c.fillStyle = r() < .5 ? p[0] : p[2]; if (c.getImageData(x, y, 1, 1).data[3]) c.fillRect(x, y, 1, 1); }
    if (p[3]) for (let i = 0; i < 8; i++) { const x = 6 + r() * 22 | 0, y = 4 + r() * 20 | 0; if (c.getImageData(x, y, 1, 1).data[3]) { c.fillStyle = p[3]; c.fillRect(x, y, 2, 2); } }
    return outline(s, '#1e2a17');
  });
}
// Sapin : étages de branches en triangle, reste vert l'hiver (neige sur les branches).
const PINE_PAL = [['#1f4a34', '#2f6b47', '#4f9461'], ['#1c4530', '#2b6342', '#468a58'], ['#1f4a34', '#2f6b47', '#5a9461'], ['#1f4234', '#2c5c45', '#eef5f7']];
export function pineSprite(season, v) {
  return cache('p' + season + v, () => {
    const s = canvas(34, 46), c = s.getContext('2d'), p = PINE_PAL[season], r = rng(v * 53 + 11);
    c.fillStyle = '#5b3a22'; c.fillRect(15, 34, 4, 10); c.fillStyle = '#7a4f2e'; c.fillRect(15, 34, 1, 10);
    for (let k = 0; k < 4; k++) {
      const top = 2 + k * 8, h = 13, half = 6 + k * 3;
      for (let y = 0; y < h; y++) {
        const w = Math.round(1 + (y / h) * half);
        c.fillStyle = p[0]; c.fillRect(17 - w, top + y, w * 2, 1);
        c.fillStyle = p[1]; c.fillRect(17 - w, top + y, w, 1);
        if (y === h - 1 || y === h - 2) { c.fillStyle = p[2]; c.fillRect(17 - w + 1, top + y, Math.max(1, w - 2), 1); }
      }
    }
    for (let i = 0; i < 30; i++) { const x = 4 + r() * 26 | 0, y = 4 + r() * 34 | 0; if (c.getImageData(x, y, 1, 1).data[3]) { c.fillStyle = r() < .5 ? p[0] : p[2]; c.fillRect(x, y, 1, 1); } }
    return outline(s, '#13281c');
  });
}
// Bouleau : tronc blanc tacheté de noir, feuillage léger et clair.
const BIRCH_PAL = [['#4f8a35', '#79b54a', '#b4dc6e'], ['#47802f', '#6fa843', '#a2d062'], ['#b8761a', '#e6ad2c', '#ffe07a'], [null, null, null]];
export function birchSprite(season, v) {
  return cache('b' + season + v, () => {
    const s = canvas(34, 46), c = s.getContext('2d'), p = BIRCH_PAL[season], r = rng(v * 31 + 7);
    c.fillStyle = '#e9e4d6'; c.fillRect(15, 18, 4, 26); c.fillStyle = '#c9c2b0'; c.fillRect(18, 18, 1, 26);
    c.fillStyle = '#2d2a26'; for (const [a, b] of [[15, 22], [17, 27], [16, 32], [15, 37], [17, 41]]) c.fillRect(a, b, 2, 1);
    c.fillStyle = '#e9e4d6'; c.fillRect(19, 24, 5, 1); c.fillRect(11, 28, 4, 1);
    if (p[0]) {
      const cx = 17 + (v % 3) - 1;
      for (const [x, y, rad] of [[cx, 14, 10], [cx - 7, 19, 7], [cx + 7, 18, 7], [cx + 1, 6, 7]]) disc(c, x, y, rad, p[0]);
      for (const [x, y, rad] of [[cx - 1, 12, 8], [cx - 7, 17, 5], [cx + 6, 16, 5], [cx, 5, 5]]) disc(c, x, y, rad, p[1]);
      for (let i = 0; i < 34; i++) { const x = 6 + r() * 22 | 0, y = 1 + r() * 24 | 0; if (c.getImageData(x, y, 1, 1).data[3]) { c.fillStyle = p[2]; c.fillRect(x, y, 1, 1); } }
    } else {
      c.strokeStyle = '#8a8478'; c.lineWidth = 1; c.beginPath();
      for (const [a, b, d, e] of [[17, 18, 9, 6], [17, 20, 26, 8], [17, 14, 14, 2], [17, 16, 22, 3], [12, 11, 7, 7]]) { c.moveTo(a, b); c.lineTo(d, e); }
      c.stroke(); c.fillStyle = '#eef5f7'; for (const [x, y] of [[9, 6], [25, 8], [14, 2], [21, 3]]) c.fillRect(x - 1, y, 3, 1);
    }
    return outline(s, '#1e2a17');
  });
}
export const KIND_SPRITE = { oak: treeSprite, pine: pineSprite, birch: birchSprite };
const KIND_IDS = ['oak', 'pine', 'birch'];
// Jeune arbre : pousse (jour 0), arbuste (jour 1), petit arbre (jour 2), puis adulte.
function saplingSprite(kind, stage, season) {
  return cache('s' + kind + stage + season, () => {
    const s = canvas(20, 26), c = s.getContext('2d');
    const leaf = kind === 'pine' ? PINE_PAL[season][1] : kind === 'birch' ? (BIRCH_PAL[season][1] || '#8a8478') : (TREE_PAL[season][1]);
    const light = kind === 'pine' ? PINE_PAL[season][2] : kind === 'birch' ? (BIRCH_PAL[season][2] || '#eef5f7') : TREE_PAL[season][2];
    const trunk = kind === 'birch' ? '#e9e4d6' : '#6b4429';
    if (stage === 0) {
      c.fillStyle = '#4a3020'; c.fillRect(7, 23, 6, 2);
      c.fillStyle = leaf; c.fillRect(9, 18, 2, 6); c.fillRect(6, 17, 3, 2); c.fillRect(11, 16, 3, 2);
      c.fillStyle = light; c.fillRect(6, 17, 1, 1); c.fillRect(13, 16, 1, 1);
    } else if (stage === 1) {
      c.fillStyle = trunk; c.fillRect(9, 15, 2, 10);
      if (kind === 'pine') for (let y = 0; y < 12; y++) { const w = 1 + (y / 2 | 0); c.fillStyle = leaf; c.fillRect(10 - w, 5 + y, w * 2, 1); }
      else { disc(c, 10, 11, 5, leaf); disc(c, 9, 10, 3, light); }
    } else {
      c.fillStyle = trunk; c.fillRect(9, 12, 3, 13);
      if (kind === 'pine') for (let y = 0; y < 18; y++) { const w = 1 + (y / 2 | 0) % 6 + (y / 6 | 0); c.fillStyle = y % 6 > 3 ? light : leaf; c.fillRect(10 - w, 1 + y, w * 2, 1); }
      else { disc(c, 10, 8, 7, leaf); disc(c, 6, 11, 4, leaf); disc(c, 14, 11, 4, leaf); disc(c, 9, 7, 4, light); }
    }
    return outline(s, '#1e2a17');
  });
}
export function drawTree(c, x, y, o, season, t = 0) {
  const px = x * T, py = y * T, sh = o.shake > 0 ? Math.round(Math.sin(o.shake * 40) * 1.5) : 0;
  const kind = o.k || KIND_IDS[(x * 7 + y * 3) % 3], g = o.g ?? 3;
  if (g < 3) {
    groundShadow(c, px + 8, py + 14, 3 + g * 2, 1 + (g > 0), .25);
    c.drawImage(saplingSprite(kind, g, season), px - 2 + sh, py - 10);
    return;
  }
  groundShadow(c, px + 8, py + 14, 9, 3, .3);
  c.drawImage(KIND_SPRITE[kind](season, (x * 7 + y * 3) % 4), px - 9 + sh, py - (kind === 'oak' ? 28 : 30));
}

/* ---------------- Rochers ---------------- */
function boulderSprite() {
  return cache('bould', () => {
    const s = canvas(24, 20), c = s.getContext('2d');
    disc(c, 12, 12, 9, '#4d4955'); disc(c, 11, 11, 8, '#76727f'); disc(c, 8, 8, 4, '#a7a2ad'); disc(c, 15, 13, 3, '#5d5966');
    c.fillStyle = '#3c3843'; c.fillRect(13, 7, 1, 5); c.fillRect(14, 12, 3, 1); c.fillRect(7, 14, 4, 1);
    c.fillStyle = '#c98a4a'; c.fillRect(6, 11, 2, 1); c.fillRect(16, 9, 1, 2);
    return outline(s, '#25222b');
  });
}
function bigRockSprite(v) {
  return cache('rb' + v, () => {
    const s = canvas(22, 18), c = s.getContext('2d');
    disc(c, 11, 11, 7, '#524e5a'); disc(c, 10, 10, 6, '#7b7784'); disc(c, 15, 12, 4, '#6a6672'); disc(c, 7, 7, 3, '#aba6b2');
    c.fillStyle = '#423e48'; c.fillRect(12, 6, 1, 4); c.fillRect(13, 10, 3, 1); c.fillRect(6, 13, 3, 1);
    if (v) { c.fillStyle = '#6f9a45'; c.fillRect(3, 15, 4, 1); c.fillRect(17, 15, 3, 1); c.fillRect(4, 14, 1, 1); }
    return outline(s, '#27232c');
  });
}
function rockSprite(v) {
  return cache('r' + v, () => {
    const s = canvas(18, 15), c = s.getContext('2d');
    disc(c, 9, 9, 6, '#57535e'); disc(c, 8, 8, 5, '#827e8a'); disc(c, 6, 6, 2, '#b4afba');
    c.fillStyle = '#4a4650'; c.fillRect(10, 7, 1, 3); c.fillRect(11, 10, 2, 1);
    if (v) { c.fillStyle = '#6f9a45'; c.fillRect(4, 12, 3, 1); c.fillRect(5, 11, 1, 1); }
    return outline(s, '#2a2630');
  });
}
export function drawRock(c, x, y, o) {
  if (o.t === 'boulder') {
    const px = x * T + (o.shake > 0 ? Math.round(Math.sin(o.shake * 40)) : 0), py = y * T;
    groundShadow(c, px + 8, py + 14, 10, 3, .3);
    c.drawImage(boulderSprite(), px - 4, py - 5);
    return;
  }
  const px = x * T + (o.shake > 0 ? Math.round(Math.sin(o.shake * 40)) : 0), py = y * T;
  if (o.t === 'rock_big') { groundShadow(c, px + 8, py + 14, 8, 2, .28); c.drawImage(bigRockSprite((x + y) % 2), px - 3, py - 2); return; }
  groundShadow(c, px + 8, py + 13, 7, 2, .25);
  c.drawImage(rockSprite((x + y) % 2), px - 1, py);
}

/* ---------------- Cultures ---------------- */
const STEM = '#3f7a28', LEAF = '#64ad3c', LEAF_L = '#8fd05a';
export function drawCrop(c, x, y, p, now) {
  const pr = cropProgress(p, now), px = x * T, py = y * T, R = (a, b, w, h, col) => { c.fillStyle = col; c.fillRect(px + a, py + b, w, h); };
  if (pr < .25) { R(5, 10, 6, 2, '#5e391e'); R(7, 9, 2, 1, '#94643a'); return; }
  if (pr < .6) { R(7, 7, 2, 5, STEM); R(4, 6, 3, 2, LEAF); R(9, 5, 3, 2, LEAF); R(4, 6, 1, 1, LEAF_L); return; }
  const ripe = pr >= 1, b = ripe && Math.sin(now / 220 + x * 1.7) > .8 ? -1 : 0;
  if (p.crop === 'wheat') {
    const col = ripe ? '#d9a93a' : '#8fb84a', head = ripe ? '#f2d16b' : '#a9cc5c';
    for (const sx of [3, 6, 9, 12]) { R(sx, 3 + b, 1, 10, col); R(sx - 1, 1 + b, 2, 4, head); if (ripe) R(sx, 2 + b, 1, 1, '#a8781e'); }
  } else if (p.crop === 'corn') {
    R(7, -6 + b, 2, 18, STEM); R(3, 2, 4, 2, LEAF); R(9, -1, 4, 2, LEAF); R(4, 7, 3, 1, LEAF_L);
    if (ripe) { R(9, -5 + b, 3, 6, '#f2d13b'); R(9, -5 + b, 1, 6, '#c9a320'); R(12, -4 + b, 1, 5, LEAF); }
  } else if (p.crop === 'hay') {
    const col = ripe ? '#c9b04a' : '#7fae4a', top = ripe ? '#e6d27a' : '#a6cc66';
    for (const [sx, h] of [[2, 9], [4, 11], [6, 8], [8, 12], [10, 9], [12, 10]]) { R(sx, 13 - h + b, 1, h, col); R(sx, 13 - h + b, 1, 2, top); }
  } else {
    R(4, 2 + b, 2, 7, LEAF); R(7, 0 + b, 2, 9, LEAF_L); R(10, 2 + b, 2, 7, LEAF); R(6, 4 + b, 4, 3, LEAF);
    if (ripe) { R(5, 9, 6, 3, '#ef7b2a'); R(5, 9, 6, 1, '#f9a35b'); }
  }
  if (ripe && ((now / 260 | 0) + x) % 6 === 0) { R(12, 0, 1, 1, '#fff'); R(11, 1, 3, 1, '#fff9'); }
}

/* ---------------- Poule ---------------- */
function chickenSprite(flip) {
  return cache('k' + flip, () => {
    const s = canvas(14, 14), c = s.getContext('2d');
    if (flip) { c.translate(14, 0); c.scale(-1, 1); }
    const R = (a, b, w, h, col) => { c.fillStyle = col; c.fillRect(a, b, w, h); };
    R(2, 6, 9, 5, '#fbf6ec'); R(2, 10, 9, 1, '#d9cfbd'); R(4, 7, 4, 3, '#e6dccb'); R(1, 5, 2, 3, '#efe7d8');
    R(8, 2, 4, 5, '#fbf6ec'); R(9, 0, 2, 2, '#d8342a'); R(12, 4, 2, 1, '#f0a020'); R(10, 3, 1, 1, '#2a1d18'); R(10, 6, 1, 2, '#d8342a');
    R(5, 11, 1, 2, '#e08a1a'); R(8, 11, 1, 2, '#e08a1a');
    return outline(s, '#3a2a20');
  });
}
export function drawChicken(c, a, now) {
  const px = Math.round(a.x * T), py = Math.round(a.y * T + (a.moving ? Math.sin(now / 80) : 0));
  groundShadow(c, px, py + 5, 5, 2);
  c.drawImage(chickenSprite(!!a.f), px - 7, py - 8);
  if (a.produced) { bubble(c, px, py - 14); c.fillStyle = '#fdf6e3'; c.fillRect(px - 2, py - 18, 4, 5); c.fillRect(px - 1, py - 19, 2, 1); }
  if (a.heart > 0) { const hy = py - 14 - (1 - a.heart) * 8; c.fillStyle = '#ff5a7a'; c.fillRect(px - 3, hy, 2, 2); c.fillRect(px + 1, hy, 2, 2); c.fillRect(px - 3, hy + 1, 6, 2); c.fillRect(px - 2, hy + 3, 4, 1); c.fillRect(px - 1, hy + 4, 2, 1); }
}
function bubble(c, x, y) {
  c.fillStyle = '#2b1b14'; c.fillRect(x - 5, y - 7, 10, 9);
  c.fillStyle = '#fff6e0'; c.fillRect(x - 4, y - 6, 8, 7); c.fillRect(x - 1, y + 1, 2, 2);
}

/* ---------------- Slime ---------------- */
function slimeSprite(hit) {
  return cache('s' + hit, () => {
    const s = canvas(16, 13), c = s.getContext('2d'), base = hit ? '#ffffff' : '#56c45a';
    disc(c, 8, 9, 6, shade(base, .8)); disc(c, 8, 8, 5, base); disc(c, 6, 6, 2, shade(base, 1.3));
    c.fillRect(2, 9, 12, 3); c.fillStyle = shade(base, .7); c.fillRect(2, 11, 12, 1);
    c.fillStyle = '#123'; c.fillRect(5, 7, 2, 2); c.fillRect(9, 7, 2, 2);
    return outline(s, '#1d3a1e');
  });
}
export function drawSlime(c, e, now) {
  const px = Math.round(e.x * T), py = Math.round(e.y * T), b = Math.round(Math.abs(Math.sin(now / 180 + e.x)) * 3);
  groundShadow(c, px, py + 4, 6 - b / 2, 2);
  c.globalAlpha = .92; c.drawImage(slimeSprite(e.hit > 0), px - 8, py - 9 - b); c.globalAlpha = 1;
}

/* ---------------- Lapin, mouton, chat ---------------- */
function animalSprite(type, flip, sit) {
  return cache('a' + type + flip + sit, () => {
    const s = canvas(18, 16), c = s.getContext('2d');
    if (flip) { c.translate(18, 0); c.scale(-1, 1); }
    const R = (a, b, w, h, col) => { c.fillStyle = col; c.fillRect(a, b, w, h); };
    if (type === 'rabbit') {
      R(4, 8, 8, 5, '#e9e2d6'); R(4, 12, 8, 1, '#c9bfae'); R(3, 9, 2, 3, '#f5f0e8');
      R(10, 5, 5, 5, '#e9e2d6'); R(11, 0, 2, 6, '#e9e2d6'); R(13, 1, 2, 5, '#d6cbb9'); R(11, 1, 1, 4, '#f2b8c6');
      R(13, 7, 1, 1, '#2a1d18'); R(15, 8, 1, 1, '#f08aa0'); R(5, 13, 2, 1, '#c9bfae'); R(9, 13, 2, 1, '#c9bfae');
    } else if (type === 'sheep') {
      for (const [x, y, r] of [[6, 8, 4], [10, 7, 4], [8, 10, 4], [4, 10, 3], [12, 10, 3]]) disc(c, x, y, r, '#f4f1ea');
      disc(c, 7, 7, 2, '#ffffff'); disc(c, 11, 11, 2, '#dcd6ca');
      R(13, 6, 4, 5, '#3b3440'); R(13, 6, 4, 1, '#f4f1ea'); R(15, 8, 1, 1, '#f5f0e8'); R(12, 6, 1, 2, '#3b3440');
      R(5, 13, 2, 2, '#3b3440'); R(10, 13, 2, 2, '#3b3440');
    } else if (type === 'pig') {
      const p = '#f2a7b4', d = '#d98394', l = '#ffc8d2';
      R(2, 7, 11, 6, p); R(3, 6, 9, 1, p); R(2, 12, 11, 1, d); R(3, 7, 6, 2, l);
      R(12, 6, 5, 6, p); R(16, 8, 2, 3, d); R(16, 9, 1, 1, '#8a4a58'); R(14, 7, 1, 1, '#2a1d18'); R(12, 5, 2, 2, d); R(15, 5, 1, 2, d);
      R(1, 8, 1, 2, d); R(0, 7, 1, 1, d);
      R(3, 13, 2, 2, d); R(6, 13, 2, 2, d); R(9, 13, 2, 2, d); R(12, 12, 2, 2, d);
    } else { // chat roux tigré
      const o = '#e08a3a', d = '#b8642a';
      if (sit) { R(5, 7, 7, 7, o); R(6, 8, 1, 5, d); R(8, 8, 1, 5, d); R(3, 12, 3, 2, o); R(2, 10, 2, 3, o); }
      else { R(3, 8, 10, 4, o); R(5, 8, 1, 4, d); R(8, 8, 1, 4, d); R(4, 12, 2, 2, o); R(10, 12, 2, 2, o); R(1, 5, 2, 4, o); R(2, 4, 1, 2, d); }
      R(11, 4, 5, 5, o); R(11, 3, 1, 2, o); R(15, 3, 1, 2, o); R(12, 4, 1, 1, '#f2b8a0'); R(14, 4, 1, 1, '#f2b8a0');
      R(12, 6, 1, 1, '#2a6a2a'); R(14, 6, 1, 1, '#2a6a2a'); R(13, 7, 1, 1, '#f08aa0'); R(16, 7, 2, 1, '#fff8'); R(11, 8, 5, 1, '#f5e2c8');
    }
    return outline(s, '#3a2a20');
  });
}

const PROD_COL = { egg: '#fdf6e3', wool: '#ffffff', rabbit_wool: '#f6dfe6', truffle: '#6b4a36' };
export function drawAnimal(c, a, now, def) {
  if (a.type === 'chicken') return drawChicken(c, a, now);
  const px = Math.round(a.x * T), py = Math.round(a.y * T + (a.moving ? Math.sin(now / (a.type === 'rabbit' ? 60 : 110)) * (a.type === 'rabbit' ? 2 : 1) : 0));
  groundShadow(c, px, py + 5, a.type === 'sheep' ? 7 : 5, 2);
  c.drawImage(animalSprite(a.type, !!a.f, !a.moving && a.type === 'cat' ? 1 : 0), px - 9, py - 10);
  if (a.produced && def && def.prod) { bubble(c, px, py - 15); c.fillStyle = PROD_COL[def.prod] || '#fff'; c.fillRect(px - 3, py - 20, 6, 4); }
  if (a.heart > 0) { const hy = py - 15 - (1 - a.heart) * 8; c.fillStyle = '#ff5a7a'; c.fillRect(px - 3, hy, 2, 2); c.fillRect(px + 1, hy, 2, 2); c.fillRect(px - 3, hy + 1, 6, 2); c.fillRect(px - 2, hy + 3, 4, 1); c.fillRect(px - 1, hy + 4, 2, 1); }
}
