import { toClinic } from './clinic.js';
import { ITEMS } from '../data/items.js';
import { SPAWN } from '../world/map.js';
import { add, has } from './inventory.js';

export function useEnergy(g, n) {
  if (g.S.energy < n) {
    if (g.S.energy <= 0) { toClinic(g); return false; }
    g.bus.emit('toast', 'Trop fatigué… allez dormir 🛏️'); g.bus.emit('sfx', 'denied'); return false;
  }
  g.S.energy -= n;
  if (g.S.energy <= 0) toClinic(g);   // vidé : on s'effondre
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
  if (g.player) g.player.iframe = 0;   // pas de clignotement après le K.O.
  g.bus.emit('toast', "K.O. ! Ramené à la maison (-10% d'argent)");
}

// Manger / boire un objet consommable.
// 19/11 : manger prend un petit moment (animation) : impossible d'enchaîner les bouchées.
export const EAT_MS = 900;
export const eating = g => g.eating && g.now() - g.eating.t0 < EAT_MS ? g.eating : null;
export function consume(g, id) {
  const e = ITEMS[id] && ITEMS[id].eat;
  if (!e || !has(g.S, id) || eating(g)) return false;
  g.eating = { id, t0: g.now() };
  add(g, id, -1);
  g.S.energy = Math.min(g.S.maxE, g.S.energy + (e.e || 0));
  g.S.hp = Math.min(g.S.maxHp, g.S.hp + (e.h || 0));
  return true;
}
