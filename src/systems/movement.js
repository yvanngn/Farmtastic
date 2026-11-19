import { isSolid } from '../world/map.js';
import { ADMIN, ADMIN_SPEED } from './admin.js';

export const SPEED = 4.5; // tuiles / s
const R = 0.3;

export function blocked(S, x, y) {
  return isSolid(S, Math.floor(x - R), Math.floor(y)) || isSolid(S, Math.floor(x + R), Math.floor(y))
    || isSolid(S, Math.floor(x - R), Math.floor(y - 0.25)) || isSolid(S, Math.floor(x + R), Math.floor(y - 0.25));
}

// Déplacement avec glissement le long des obstacles (axe par axe).
export function tryMove(S, dx, dy) {
  if (!blocked(S, S.x + dx, S.y)) S.x += dx;
  if (!blocked(S, S.x, S.y + dy)) S.y += dy;
}

// 0 bas, 1 haut, 2 gauche, 3 droite
export const dirFrom = (dx, dy) => Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 2 : 3) : (dy < 0 ? 1 : 0);

// Tuile juste devant le joueur (bouton d'action).
export function facingTile(S) {
  const [dx, dy] = [[0, 1], [0, -1], [-1, 0], [1, 0]][S.dir];
  // tuile occupée par les pieds, puis la voisine dans la direction regardée
  return { tx: Math.floor(S.x + dx * 0.8), ty: Math.floor(S.y - 0.1) + dy };
}

// keys : {up,down,left,right} ou analogique {ax,ay} (joystick). onArrive(tx,ty) appelé quand la cible est atteinte.
export function updatePlayer(g, dt, keys, onArrive) {
  const S = g.S, P = g.player;
  let dx = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
  let dy = (keys.down ? 1 : 0) - (keys.up ? 1 : 0);
  const analog = !!(keys.ax || keys.ay);
  if (analog) { dx = keys.ax; dy = keys.ay; }
  if (dx || dy) P.target = null;
  if (P.target) {
    const tx = P.target.tx + 0.5, ty = P.target.ty + 0.8, d = Math.hypot(tx - S.x, ty - S.y);
    if (d < P.target.reach) {
      const t = P.target; P.target = null;
      S.dir = dirFrom(t.tx + 0.5 - S.x, t.ty + 0.5 - S.y);
      onArrive && onArrive(t.tx, t.ty);
    } else { dx = (tx - S.x) / d; dy = (ty - S.y) / d; }
  }
  if (dx || dy) {
    const l = Math.hypot(dx, dy), sp = SPEED * (ADMIN.on ? ADMIN_SPEED : 1) * dt * (analog ? Math.min(1, l) : 1), bx = S.x, by = S.y;
    tryMove(S, dx / l * sp, dy / l * sp);
    if (P.target && Math.hypot(S.x - bx, S.y - by) < sp * 0.1) P.target = null; // bloqué
    S.dir = dirFrom(dx, dy);
    P.walkT += dt; P.walkFrame = 1 + ((P.walkT * 1000 / 105 | 0) % 8);   // 7e : cycle de 8 images ; 19/11 : une pose toutes les 105 ms (foulée de 420 ms, façon Stardew)
  } else P.walkFrame = 0;
}
