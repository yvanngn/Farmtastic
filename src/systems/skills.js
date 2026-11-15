// Expérience de minage et amélioration des outils (forge).
import { isUnlocked } from './market.js';
import { MINING_XP, MAX_TIER, upgradeCost, TIER_NAMES } from '../data/tools.js';
import { add } from './inventory.js';

export function level(xp) {
  let l = 1;
  for (let i = 1; i < MINING_XP.length; i++) if (xp >= MINING_XP[i]) l = i + 1;
  return l;
}
export const nextXp = xp => MINING_XP[level(xp)] ?? null; // null = niveau max
export const miningLevel = S => level((S.skills.mining || { xp: 0 }).xp);
export const toolTier = (S, t) => (S.tools && S.tools[t]) || 1;

export function gainXp(g, skill, n) {
  const s = g.S.skills[skill] || (g.S.skills[skill] = { xp: 0 });
  const before = level(s.xp);
  s.xp += n;
  const after = level(s.xp);
  if (after > before) { g.bus.emit('sfx', 'levelup'); g.bus.emit('toast', `⛏️ Minage niveau ${after} !`); }
  return after;
}

// { ok, why: 'max'|'level'|'money'|'stone', cost }
export function canUpgrade(S, tool) {
  const tier = toolTier(S, tool);
  if (tier >= MAX_TIER) return { ok: false, why: 'max' };
  const cost = upgradeCost(tier);
  if (tier >= 3 && !isUnlocked(S, 'forge_or')) return { ok: false, why: 'plans', cost };
  if (miningLevel(S) < cost.minLvl) return { ok: false, why: 'level', cost };
  if (S.money < cost.money) return { ok: false, why: 'money', cost };
  if ((S.inv.stone || 0) < cost.stone) return { ok: false, why: 'stone', cost };
  return { ok: true, cost };
}

export function upgradeTool(g, tool) {
  const r = canUpgrade(g.S, tool);
  if (!r.ok) { g.bus.emit('sfx', 'denied'); return false; }
  g.S.money -= r.cost.money;
  add(g, 'stone', -r.cost.stone);
  g.S.tools[tool] = toolTier(g.S, tool) + 1;
  g.bus.emit('sfx', 'levelup');
  g.bus.emit('toast', `Outil amélioré : ${TIER_NAMES[g.S.tools[tool]]} ✨`);
  g.bus.emit('inv');
  return true;
}
