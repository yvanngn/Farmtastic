// 19/11 : décors de la carrière (gravier gris-beige, parois en terrasses) et de la carrière profonde (canyon de grès rouge,
// sol veiné, cristaux dans les parois). Les bouches de tunnel « % » se dessinent comme la paroi ; celle du jour est ouverte
// par-dessus, dans le rendu (renderer.js).
import { LAYOUTS } from '../world/scenes.js';
import { rng } from '../world/map.js';
import { T, paintCliff } from './terrain.js';
import { shade } from './pixel.js';

export function buildQuarry(name, season) {
  const L0 = LAYOUTS[name], L = L0.map(r => r.replace(/%/g, '^')), H = L.length, W = L[0].length, deep = name === 'dedale';   // 21/11 : le style « canyon » servira au dédale profond (lot 30)
  const c = document.createElement('canvas'); c.width = W * T; c.height = H * T;
  const g = c.getContext('2d'), r = rng(name.length * 53 + season);
  const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  const BASE = deep ? '#c47a4e' : season === 3 ? '#d8d4cc' : '#b8ac96', D = shade(BASE, .82), Lt = shade(BASE, 1.12);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const ch = L[y][x], px = x * T, py = y * T;
    if (ch === '^') { paintCliff(R, r, px, py, x, y, L, deep ? 1 : season); continue; }
    R(px, py, T, T, BASE);
    for (let k = 0; k < 7; k++) R(px + (r() * 15 | 0), py + (r() * 15 | 0), 1 + (r() * 2 | 0), 1, r() < .5 ? D : Lt);   // gravier
    if (r() < .18) { const a = px + (r() * 10 | 0), b = py + (r() * 10 | 0); R(a, b, 4, 3, shade(BASE, .7)); R(a, b, 3, 1, shade(BASE, 1.2)); }   // petit éclat
    if (deep && (x * 3 + y * 5) % 7 === 0) R(px, py + 6 + (x % 3), T, 1, shade(BASE, .86));   // veines du grès
    if (ch === 'D') { R(px, py, T, T, shade(BASE, .9)); for (let k = 0; k < T; k += 4) R(px + 2, py + k, 12, 2, shade(BASE, .78)); }   // marches
  }
  if (deep) {   // canyon : parois teintées de rouge sombre, cristaux qui brillent dans les parois
    g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(200,90,110,.55)';
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (L[y][x] === '^') g.fillRect(x * T, y * T, T, T);
    g.restore();
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (L[y][x] === '^' && (x * 7 + y * 11) % 9 === 0) { const px = x * T + 4 + (x % 3) * 2, py = y * T + 6; R(px, py, 3, 5, '#8ad8f0'); R(px + 1, py - 2, 2, 3, '#c8f4ff'); R(px + 1, py, 1, 1, '#ffffff'); }
  } else {   // carrière : wagonnet et rails abandonnés, panneau
    for (let x = 3; x < 9; x++) { R(x * T, 18 * T + 4, T, 2, '#6a5a4a'); R(x * T, 18 * T + 11, T, 2, '#6a5a4a'); for (let k = 2; k < T; k += 5) R(x * T + k, 18 * T + 3, 2, 11, '#5b3a22'); }
    const wx = 4 * T, wy = 17 * T + 6; R(wx, wy + 12, 22, 3, 'rgba(30,20,10,.3)'); R(wx, wy, 22, 12, '#5a5a66'); R(wx + 1, wy, 20, 3, '#7a7a86'); R(wx + 3, wy - 3, 16, 4, '#8a8478'); R(wx + 4, wy + 11, 4, 4, '#2a2a30'); R(wx + 14, wy + 11, 4, 4, '#2a2a30');
  }
  return c;
}
