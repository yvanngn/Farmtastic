import { isSolid } from '../world/map.js';
import { add } from './inventory.js';
import { damage, useEnergy } from './player.js';
import { isNight } from './weather.js';
import { toolTier } from './skills.js';

export const MAX_ENEMIES = 5;
export const SWORD_DMG = 34;
export const CONTACT_DMG = 10;

export function spawnEnemies(g, dt) {
  const S = g.S;
  if (!(isNight(S) || S.weather === 'storm') || g.enemies.length >= MAX_ENEMIES) return;
  if (g.rnd() >= dt * 0.3) return;
  const x = 35 + g.rnd() * 12, y = 1 + g.rnd() * 34;
  if (!isSolid(S, x | 0, y | 0)) g.enemies.push({ x, y, hp: 100, cd: 0, hit: 0 });
}

export function updateEnemies(g, dt) {
  const S = g.S;
  for (const e of [...g.enemies]) {
    e.cd -= dt; e.hit -= dt;
    const d = Math.hypot(S.x - e.x, S.y - e.y);
    if (d < 7 && d > 0.4) {
      const nx = e.x + (S.x - e.x) / d * dt * 1.5, ny = e.y + (S.y - e.y) / d * dt * 1.5;
      if (!isSolid(S, nx | 0, ny | 0)) { e.x = nx; e.y = ny; }
    }
    if (d < 0.6 && e.cd <= 0) { e.cd = 1; damage(g, CONTACT_DMG); }
  }
}

export const enemyAt = (g, x, y, r = 1) => g.enemies.find(n => Math.hypot(n.x - x, n.y - y) < r) || null;

export function attack(g, e) {
  if (!useEnergy(g, 0.5)) return false;
  g.bus.emit('swing', 'sword');
  const S = g.S;
  e.hp -= Math.round(SWORD_DMG * (1 + 0.5 * (toolTier(S, 'sword') - 1))); e.hit = 0.15;
  g.bus.emit('sfx', 'hit');
  const d = Math.hypot(e.x - S.x, e.y - S.y) || 1;
  e.x += (e.x - S.x) / d * 0.6; e.y += (e.y - S.y) / d * 0.6;
  if (e.hp <= 0) {
    g.enemies.splice(g.enemies.indexOf(e), 1);
    add(g, 'slime');
    g.bus.emit('pop', { t: '+🟢', x: e.x, y: e.y });
  }
  return true;
}
