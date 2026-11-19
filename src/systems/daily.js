// Quête journalière du panneau : une par jour, dès le 2e jour. Logique pure.
import { DAILY_FROM, DAILY_FIRST, DAILY_POOL } from '../data/daily.js';
import { add, has } from './inventory.js';
import { gainPxp, XP } from './level.js';

export const dayNo = S => (S.year - 1) * 120 + S.season * 30 + S.day;
export function dailyQuest(g) {
  const S = g.S, d = dayNo(S);
  if (d < DAILY_FROM) return null;
  if (!S.daily || S.daily.day !== d) {
    const first = !S.daily;
    const base = first ? DAILY_FIRST : DAILY_POOL[Math.floor(g.rnd() * DAILY_POOL.length) % DAILY_POOL.length];
    S.daily = { day: d, ...base, done: false };
  }
  return S.daily;
}
export function deliverDaily(g) {
  const S = g.S, q = dailyQuest(g);
  if (!q || q.done || !has(S, q.item, q.qty)) { g.bus.emit('sfx', 'denied'); return false; }
  add(g, q.item, -q.qty); S.money += q.reward; q.done = true;
  gainPxp(g, XP.daily, 'daily');   // lot 8 : une quête (secondaire) résolue
  g.bus.emit('sfx', 'coin'); g.bus.emit('toast', `📌 Quête du jour réussie : +${q.reward} $. Une nouvelle demain !`);
  return true;
}
