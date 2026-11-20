// 20/11 (demande de l'utilisateur) : avec un outil en main, on vise la cible la plus proche devant soi (pas seulement la case
// pile en face) ; sans cible, l'outil donne quand même un coup dans le vide. Logique pure.
import { TOOL_FOR } from './resources.js';
import { natureAt } from './nature.js';
import { forestTreeAt } from './foret.js';
import { forestOpen } from './blockers.js';
import { doorAt } from '../world/scenes.js';
const DIRS = [[0, 1], [0, -1], [-1, 0], [1, 0]];
// Y a-t-il quelque chose à frapper avec cet outil sur cette case ?
export function hittable(S, x, y, tool) {
  const sc = S.scene || 'farm', k = x + ',' + y;
  if (sc === 'farm' && S.objs && S.objs[k] && TOOL_FOR[S.objs[k].t] === tool) return true;
  if (tool === 'pick') { const N = natureAt(S, sc); if (N && N.rocks && N.rocks[k]) return true; if (sc === 'wild' && S.wild && S.wild.rocks && S.wild.rocks[k]) return true; }
  if (tool === 'axe') { if (forestTreeAt(S, x, y)) return true; const d = doorAt(sc, x, y); if (d && !forestOpen(S) && (d.to === 'edge:E' || d.to === 'foret')) return true; }
  return false;
}
// Case visée : celle d'en face si elle convient, sinon la plus proche (≤ 1,9 case) du côté où l'on regarde.
export function aimTile(S, tool, ft) {
  if (hittable(S, ft.tx, ft.ty, tool)) return ft;
  const [dx, dy] = DIRS[S.dir || 0], px = S.x + dx * .6, py = S.y - .2 + dy * .6; let best = null;
  for (let y = Math.floor(S.y) - 2; y <= Math.floor(S.y) + 2; y++) for (let x = Math.floor(S.x) - 2; x <= Math.floor(S.x) + 2; x++) {
    const cx = x + .5, cy = y + .5, d = Math.hypot(cx - px, cy - py);
    if (d > 1.9 || (cx - S.x) * dx + (cy - S.y) * dy < -.3) continue;   // pas derrière soi
    if (hittable(S, x, y, tool) && (!best || d < best.d)) best = { tx: x, ty: y, d };
  }
  return best;
}
