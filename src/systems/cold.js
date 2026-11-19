// Froid de la montagne : sans manteau d'hiver, la vie descend doucement.
import { SCENES } from '../world/scenes.js';
import { knockout } from './player.js';
export const COLD_HP_PER_S = 1;   // 💡 1 point de vie par seconde (100 points : environ 1 min 40)
export const isWarm = S => (S.inv.manteau || 0) > 0 || (S.equip && S.equip.corps === 'manteau');   // 19/11 : porté (équipement) ou dans le sac
export function coldTick(g, dt) {
  const S = g.S, sc = SCENES[S.scene];
  if (!sc || !sc.cold || isWarm(S)) { g.coldAcc = 0; return false; }
  if (!g.coldTold) { g.coldTold = true; g.bus.emit('toast', '🥶 Brr… il fait glacial ! Sans manteau d’hiver, ta vie baisse doucement.'); }
  g.coldAcc = (g.coldAcc || 0) + dt * COLD_HP_PER_S;
  if (g.coldAcc >= 1) { const n = Math.floor(g.coldAcc); g.coldAcc -= n; S.hp -= n; if (S.hp <= 0) { knockout(g); g.coldTold = false; } }
  return true;
}
