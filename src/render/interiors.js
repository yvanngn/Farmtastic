// Intérieurs pré-rendus (maison, poulailler, porcherie, bergerie) à partir des plans de world/scenes.js.
import { CFG } from '../config.js';
import { LAYOUTS, SCENES } from '../world/scenes.js';
import { rng } from '../world/map.js';
import { shade, disc } from './pixel.js';
const T = CFG.T;

const THEME = {
  maison: { floor: '#b07a48', seam: '#8a5a32', wall: '#7fa36a', wallD: '#5f8450', trim: '#6b4226', beam: '#4a2c18' },   // la cabane agrandie
  house: { floor: '#b07a48', seam: '#8a5a32', wall: '#7fa36a', wallD: '#5f8450', trim: '#6b4226', beam: '#4a2c18' },
  coop: { floor: '#d9c27a', seam: '#b49a52', wall: '#b8452f', wallD: '#93321f', trim: '#f0e6d0', beam: '#5a3a2a' },
  grange: { floor: '#6e5236', seam: '#5a4028', wall: '#7a5a3a', wallD: '#5b3f26', trim: '#4a3220', beam: '#2e2622' },
  franck: { floor: '#8a6a4e', seam: '#6e5238', wall: '#9aa4b0', wallD: '#86909c', trim: '#5a5f6a', beam: '#2e2a30' },
  luna: { floor: '#c49a6a', seam: '#a07850', wall: '#d8c2e8', wallD: '#bca4d0', trim: '#7a5a8a', beam: '#4a2c3a' },
  pigsty: { floor: '#c9a66a', seam: '#a8854a', wall: '#9a6a3c', wallD: '#7a4e2a', trim: '#c99560', beam: '#4a2c18' },
  clinique: { floor: '#dfe6e4', seam: '#c4cecb', wall: '#eef4f2', wallD: '#d6e2de', trim: '#5aa8a0', beam: '#3a4a48' },
  hailey: { floor: '#c8a47a', seam: '#a8845a', wall: '#f2dce0', wallD: '#e2c4ca', trim: '#7cc8c0', beam: '#4a3a3e' },
  myst: { floor: '#4a3a3a', seam: '#3a2c2c', wall: '#3e3848', wallD: '#2e2a36', trim: '#8a7ab0', beam: '#1c181c' },
  rouky: { floor: '#9a7a58', seam: '#7a5a3a', wall: '#a8bcc8', wallD: '#8ca2b0', trim: '#5a7aa8', beam: '#3a2a20' },   // lot 12 : cabane du pêcheur
  remy: { floor: '#a87a50', seam: '#8a5e38', wall: '#dce8f0', wallD: '#c4d4e0', trim: '#a8432f', beam: '#3a2a20' },
  resto: { floor: '#b8946a', seam: '#9a7650', wall: '#f0dcc0', wallD: '#e0c8a8', trim: '#a8432f', beam: '#3a2a20' },
  ranch_maison: { floor: '#8a5a32', seam: '#6a4426', wall: '#c49060', wallD: '#a8774a', trim: '#a8432f', beam: '#3a2a20' },
  bar: { floor: '#6a4428', seam: '#4e3018', wall: '#7a3a4a', wallD: '#5a2a3a', trim: '#e8c26a', beam: '#2a1a14' },
  ed: { floor: '#b07a48', seam: '#8a5a32', wall: '#e8d8b8', wallD: '#d4c09c', trim: '#6a4a7a', beam: '#3a2a20' },
  ed_etage: { floor: '#c49a6a', seam: '#a07850', wall: '#f0d8e4', wallD: '#dcc0cc', trim: '#6a4a7a', beam: '#3a2a20' },
  barn: { floor: '#d4b870', seam: '#b0944c', wall: '#b8452f', wallD: '#93321f', trim: '#f0e6d0', beam: '#4a2c18' }
};

export function buildInterior(name, S = {}) {
  const L = LAYOUTS[name], { W, H } = SCENES[name], th = THEME[name];
  const c = document.createElement('canvas'); c.width = W * T; c.height = H * T;
  const g = c.getContext('2d'), r = rng(7);
  const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };

  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const t = L[y][x], px = x * T, py = y * T;
    if (t === '#' && name === 'grange') { // roche
      R(px, py, T, T, '#3a3230'); for (let k = 0; k < 5; k++) R(px + (r() * 13 | 0), py + (r() * 13 | 0), 3, 2, ['#4a403c', '#2e2826', '#544844'][k % 3]);
      continue;
    }
    if (t === '#') { R(px, py, T, T, th.beam); R(px, py + T - 2, T, 2, shade(th.beam, .7)); continue; }
    if (t === 'W') {
      R(px, py, T, T, th.wall);
      if (name === 'franck') { for (let k = 2; k < T; k += 5) R(px + k, py, 1, 11, th.wallD); R(px, py + 11, T, 5, th.trim); if (x % 4 === 2) { R(px + 2, py + 1, 12, 9, '#4a3a5a'); R(px + 3, py + 2, 4, 8, '#6a5a7a'); R(px + 9, py + 2, 4, 8, '#6a5a7a'); } continue; }
      if (name === 'house' || name === 'maison' || name === 'luna') { for (let k = 2; k < T; k += 5) R(px + k, py, 1, 11, th.wallD); }
      else for (let k = 0; k < T; k += 4) R(px + k, py, 1, T, th.wallD);
      R(px, py + 11, T, 5, th.trim); R(px, py + 11, T, 1, shade(th.trim, 1.25));
      if (name === 'grange') { if (x % 5 === 2) { R(px + 6, py + 2, 3, 6, '#5b3a22'); R(px + 5, py, 5, 3, '#ffb347'); R(px + 6, py - 1, 3, 2, '#ffe08a'); } continue; }
      if (x % 4 === 2) { R(px + 2, py + 1, 12, 9, '#f0e6d0'); R(px + 3, py + 2, 10, 7, '#8fc4e2'); R(px + 3, py + 2, 10, 2, '#bfe0f2'); R(px + 7, py + 2, 1, 7, '#f0e6d0'); R(px + 1, py + 9, 14, 2, th.trim); }   // fenêtre et rebord
      else if (x % 6 === 5) {   // 7f : petit tableau western (mesa au couchant) dans un cadre doré
        R(px + 3, py + 1, 10, 8, '#8a6a2a'); R(px + 4, py + 2, 8, 6, '#f2a85a'); R(px + 4, py + 2, 8, 2, '#f6d08a'); R(px + 5, py + 5, 4, 3, '#a8432f'); R(px + 9, py + 6, 3, 2, '#8a3a2a');
      } else if (x % 6 === 0 && name !== 'clinique') {   // étagère avec bocaux
        R(px + 1, py + 7, 14, 2, th.beam); R(px + 2, py + 3, 3, 4, '#e8c26a'); R(px + 6, py + 4, 3, 3, '#8ac06a'); R(px + 10, py + 2, 3, 5, '#c84a4a'); R(px + 2, py + 3, 3, 1, '#f4ead2'); R(px + 10, py + 2, 3, 1, '#f4ead2');
      }
      continue;
    }
    // sol
    if (name !== 'grange' && name !== 'clinique' && name !== 'coop' && name !== 'barn' && name !== 'pigsty') {   // 7f : parquet en lames décalées, clous, nuances
      R(px, py, T, T, th.floor);
      for (let k = 0; k < T; k += 4) {
        const row = y * 4 + k / 4, tone = ((row * 7 + x * 3) % 5) - 2;
        if (tone) R(px, py + k, T, 4, shade(th.floor, 1 + tone * .035));
        R(px, py + k, T, 1, th.seam);
        const cut = (row * 11) % T; R(px + cut, py + k, 1, 4, th.seam); R(px + cut + 2, py + k + 2, 1, 1, shade(th.seam, .8));
        if ((row + x) % 3 === 0) R(px + ((row * 5) % 14) + 1, py + k + 1, 2, 1, shade(th.floor, 1.12));
      }
    } else if (name === 'grange') {
      R(px, py, T, T, th.floor);
      for (let k = 0; k < 8; k++) R(px + (r() * 14 | 0), py + (r() * 15 | 0), 2, 1, r() < .5 ? th.seam : '#86684a');
      if ((t === 'p' || t === 'r' || t === 'E') && t === 'E') { R(px, py, T, T, '#3a3230'); for (let k = 0; k < 9; k++) { const a = r() * 12 | 0, b = r() * 12 | 0; R(px + a, py + b, 5, 4, ['#6a605a', '#544844', '#7a706a'][k % 3]); } }
      if (x <= 8 && y <= 5 && r() < .25) for (let k = 0; k < 4; k++) R(px + (r() * 12 | 0), py + (r() * 14 | 0), 3, 1, '#d9b84a');
    } else if (name === 'clinique') { // carrelage propre
      R(px, py, T, T, (x + y) % 2 ? th.floor : '#e8eeec'); R(px, py, T, 1, th.seam); R(px, py, 1, T, th.seam);
  } else {
      R(px, py, T, T, th.floor);
      for (let k = 0; k < 10; k++) R(px + (r() * 14 | 0), py + (r() * 15 | 0), 2, 1, r() < .5 ? th.seam : '#efd98f');
    }
    if (t === 'D') { R(px, py, T, T, '#3b2414'); R(px + 2, py + 2, 12, 12, '#5a3a22'); R(px + 3, py + 8, 10, 1, '#d6b46a'); R(px + 4, py + 10, 8, 4, '#8a3a2a'); }
  }
  // meubles (dessinés après le sol, par blocs)
  const seen = new Set();
  const block = ch => { const pts = []; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (L[y][x] === ch) pts.push([x, y]); return pts; };
  const bbox = pts => { const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]); return [Math.min(...xs) * T, Math.min(...ys) * T, (Math.max(...xs) - Math.min(...xs) + 1) * T, (Math.max(...ys) - Math.min(...ys) + 1) * T]; };
  const bedC = ([x, y, w, h]) => { R(x + 1, y + 2, w - 2, h - 3, '#c4cecb'); R(x + 2, y + 3, w - 4, h - 6, '#ffffff'); R(x + 3, y + 4, w - 6, 5, '#f4f8f7'); R(x + 2, y + 12, w - 4, h - 16, '#7cc8c0'); R(x + 1, y + h - 2, 2, 2, '#6a7472'); R(x + w - 3, y + h - 2, 2, 2, '#6a7472'); };
  const draw = {
    R: ([x, y, w, h]) => { R(x + 1, y + 1, w - 2, h - 2, '#a8392c'); R(x + 3, y + 3, w - 6, h - 6, '#d0573f'); R(x + 5, y + 5, w - 10, h - 10, '#e8c26a'); R(x + 7, y + 7, w - 14, h - 14, '#a8392c'); for (let k = x + 3; k < x + w - 3; k += 4) { R(k, y, 1, 2, '#e8c26a'); R(k, y + h - 2, 1, 2, '#e8c26a'); } },
    B: ([x, y, w, h]) => { if ((name === 'house' || name === 'maison') && S.bed === false) { R(x + 2, y + 2, w - 4, 1, 'rgba(0,0,0,.18)'); R(x + 2, y + h - 3, w - 4, 1, 'rgba(0,0,0,.18)'); R(x + 2, y + 2, 1, h - 4, 'rgba(0,0,0,.18)'); R(x + w - 3, y + 2, 1, h - 4, 'rgba(0,0,0,.18)'); return; } R(x, y, w, h, '#5a3a22'); R(x + 1, y + 1, w - 2, 7, '#f4efe4'); R(x + 2, y + 2, w - 4, 4, '#ffffff'); R(x + 1, y + 9, w - 2, h - 11, '#3f6fb0'); for (let k = 0; k < w - 4; k += 4) R(x + 2 + k, y + 10, 2, h - 13, '#5b8fd0'); R(x + 1, y + h - 3, w - 2, 2, '#2f548a'); },
    K: ([x, y, w, h]) => { R(x, y, w, h, '#6b4226'); R(x, y, w, 4, '#c9b28a'); R(x, y + 4, w, 1, '#8a6a46'); for (let k = x + 2; k < x + w - 4; k += 8) { R(k, y + 6, 6, 8, '#835330'); R(k + 4, y + 9, 1, 2, '#e8c26a'); } R(x + w - 10, y - 2, 7, 4, '#3a3a40'); R(x + w - 9, y - 4, 5, 2, '#5a5a62'); },
    T: ([x, y, w, h]) => { R(x + 1, y + 3, w - 2, h - 8, '#8a5a32'); R(x + 1, y + 3, w - 2, 2, '#b07a48'); R(x + 2, y + h - 5, 2, 5, '#5a3a22'); R(x + w - 4, y + h - 5, 2, 5, '#5a3a22'); disc(g, x + w / 2, y + 9, 3, '#f4efe4'); R(x + w / 2 - 1, y + 8, 2, 2, '#e08a3a'); },
    P: ([x, y, w, h]) => { R(x + 4, y + 9, 8, 7, '#b0603a'); R(x + 4, y + 9, 8, 2, '#c97a4f'); disc(g, x + 8, y + 5, 5, '#3e8a34'); disc(g, x + 6, y + 4, 2, '#6bb33f'); },
    C: ([x, y, w, h]) => { R(x + 1, y + 4, w - 2, h - 5, '#8a5a32'); R(x + 1, y + 4, w - 2, 4, '#b07a48'); R(x + 1, y + 8, w - 2, 1, '#e8c26a'); R(x + 7, y + 7, 2, 3, '#e8c26a'); },
    H: ([x, y, w, h]) => { R(x, y + 4, w, h - 6, '#6b4226'); R(x + 1, y + 5, w - 2, 5, '#e3c45e'); for (let k = x + 2; k < x + w - 2; k += 3) R(k, y + 4, 1, 2, '#f2d77a'); R(x, y + h - 3, w, 1, '#4a2c18'); },
    E: ([x, y, w, h]) => { // établi : cassé (planche tombée) tant qu'il n'est pas réparé
      const ok = S.workbench;
      R(x + 1, y + 4, w - 2, 4, ok ? '#a8774a' : '#8a6a4a'); R(x + 1, y + 4, w - 2, 1, ok ? '#c99560' : '#9a7a5a');
      R(x + 3, y + 8, 2, h - 9, '#5b3a22'); R(x + w - 5, y + 8, 2, ok ? h - 9 : h - 13, '#5b3a22');
      if (ok) { R(x + 6, y + 1, 6, 3, '#9aa0a8'); R(x + 14, y + 2, 2, 2, '#e8c26a'); R(x + w - 10, y, 3, 4, '#7a4f2e'); }
      else { R(x + w - 12, y + h - 4, 10, 2, '#7a5a3a'); R(x + 8, y + 6, 3, 1, '#3a2a20'); }
    },
    A: ([x, y, w, h]) => { R(x + 4, y + 2, w - 8, h - 6, '#5a6a7a'); R(x + 2, y + 6, 4, h - 8, '#4a5866'); R(x + w - 6, y + 6, 4, h - 8, '#4a5866'); R(x + 6, y + 8, w - 12, 6, '#6e7e8e'); R(x + 5, y + h - 4, 2, 4, '#3a2a20'); R(x + w - 7, y + h - 4, 2, 4, '#3a2a20'); },
    X: () => { for (const [cx, cy, s2] of [[1, 2, 13], [2, 2, 11], [1, 3, 12]]) { const x = cx * T + 1, y = cy * T + 2; R(x, y, s2, s2 - 2, '#b8875a'); R(x, y, s2, 3, '#d4a878'); R(x + s2 / 2 - 1, y, 2, s2 - 2, '#e8dcc0'); R(x, y + s2 - 3, s2, 1, '#8a5a32'); } },
    G: ([x, y, w, h]) => { R(x + 2, y + 2, w - 4, h - 4, '#6e4a2e'); R(x + 4, y + 4, w - 8, h - 8, '#7d5636'); for (const [a, b] of [[6, 6], [w - 14, 9], [12, h - 10]]) { R(x + a, y + b, 6, 2, '#8f6642'); R(x + a + 1, y + b, 3, 1, '#a07650'); } },
    Y: ([x, y, w, h]) => { R(x + 1, y + 3, w - 2, h - 4, '#c9a330'); R(x + 1, y + 3, w - 2, 3, '#f5dd7a'); for (let k = x + 2; k < x + w - 2; k += 3) R(k, y + 6, 1, h - 8, '#a8862a'); R(x + 1, y + h - 2, w - 2, 1, '#7a5f1e'); },
    m: bedC, n: bedC,
    O: ([x, y, w, h]) => {   // four du restaurant : en panne (froid, fissuré, fumée grise) ou réparé (feu qui brille)
      const ok = !!(S.resto && S.resto.oven);
      R(x + 1, y + 1, w - 2, h - 1, '#5a4a44'); R(x + 1, y + 1, w - 2, 2, '#7a6a64'); R(x + 3, y + 5, w - 6, 8, ok ? '#e8702a' : '#1e1a1a');
      if (ok) { R(x + 5, y + 7, w - 10, 4, '#ffd04a'); R(x + 7, y + 9, 2, 2, '#fff2a0'); } else { R(x + 4, y + 2, 1, 4, '#2a2220'); R(x + 5, y + 4, 1, 3, '#2a2220'); R(x + 10, y + 1, 3, 3, 'rgba(200,200,200,.5)'); }
      R(x + 4, y + h - 3, w - 8, 2, '#3a2e2a');
    },
    Z: ([x, y, w, h]) => { for (let k = 0; k < w; k += T) { R(x + k + 2, y + 2, 12, 13, '#7a4f2e'); R(x + k + 2, y + 4, 12, 1, '#3a2a20'); R(x + k + 2, y + 11, 12, 1, '#3a2a20'); R(x + k + 6, y + 7, 4, 2, '#c99560'); } },   // tonneaux (bar)
    e: ([x, y, w, h]) => { for (let k = 0; k < 4; k++) { R(x + 1, y + 2 + k * 3, w - 2, 3, k % 2 ? '#8a5a32' : '#a8774a'); R(x + 1, y + 2 + k * 3, w - 2, 1, '#c99560'); } R(x + w - 3, y, 2, h, '#5b3a22'); },   // escalier
    c: ([x, y, w, h]) => { R(x, y + 4, w, h - 6, '#e6ece9'); R(x, y + 4, w, 2, '#ffffff'); R(x, y + h - 3, w, 2, '#9aa8a4'); R(x + 4, y - 2, 10, 8, '#3a4a48'); R(x + 5, y - 1, 8, 5, '#8fd0e8'); R(x + 18, y + 2, 7, 4, '#ffffff'); R(x + 19, y + 3, 5, 1, '#9aa8a4'); },
    N: ([x, y, w, h]) => { R(x + 1, y + 2, w - 2, h - 4, '#5a3a22'); for (let k = 0; k < h - 6; k += 8) { disc(g, x + 8, y + 8 + k, 5, '#c9a64e'); disc(g, x + 8, y + 8 + k, 3, '#8a6a2e'); } }
  };
  for (const ch of Object.keys(draw)) {
    if (seen.has(ch)) continue; seen.add(ch);
    const pts = block(ch);
    if (!pts.length) continue;
    const bb = bbox(pts);
    if (!'XRD'.includes(ch)) { g.fillStyle = 'rgba(30,15,5,.22)'; g.fillRect(bb[0] + 2, bb[1] + bb[3] - 2, bb[2] - 1, 3); }   // 7f : ombre des meubles au sol
    draw[ch](bb);
  }
  return c;
}
