import { ITEMS } from '../data/items.js';
import { SPAWN } from '../world/map.js';
import { add, has } from './inventory.js';

export function useEnergy(g, n) {
  if (g.S.energy < n) { g.bus.emit('toast', 'Trop fatigué… allez dormir 🛏️'); g.bus.emit('sfx', 'denied'); return false; }
  g.S.energy -= n;
  return true;
}

export function damage(g, n) {
  const S = g.S;
  S.hp -= n;
  g.bus.emit('sfx', 'hurt');
  g.bus.emit('pop', { t: '-' + n, x: S.x, y: S.y - 1, c: '#f44' });
  if (S.hp <= 0) knockout(g);
}

export function knockout(g) {
  const S = g.S;
  S.hp = Math.round(S.maxHp / 2);
  S.money = Math.round(S.money * 0.9);
  S.x = SPAWN.x; S.y = SPAWN.y; S.scene = 'farm';
  g.enemies.length = 0; if (g.shots) g.shots.length = 0;
  g.bus.emit('toast', "K.O. ! Ramené à la maison (-10% d'argent)");
}

// Manger / boire un objet consommable.
export function consume(g, id) {
  const e = ITEMS[id] && ITEMS[id].eat;
  if (!e || !has(g.S, id)) return false;
  add(g, id, -1);
  g.S.energy = Math.min(g.S.maxE, g.S.energy + (e.e || 0));
  g.S.hp = Math.min(g.S.maxHp, g.S.hp + (e.h || 0));
  return true;
}
