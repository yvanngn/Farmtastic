// Bois et pierre. La puissance de l'outil (palier) retire autant de PV par coup
// et réduit l'énergie dépensée. Casser des pierres donne de l'XP de minage.
import { CFG } from '../config.js';
import { freeForObj, key } from '../world/map.js';
import { MIN_PICK, MINING_GAIN, TIER_NAMES, energyCost } from '../data/tools.js';
import { add } from './inventory.js';
import { useEnergy } from './player.js';
import { gainXp, toolTier } from './skills.js';

export const TOOL_FOR = { tree: 'axe', rock: 'pick', boulder: 'pick' };
const isStone = t => t === 'rock' || t === 'boulder';

export function hitObject(g, x, y) {
  const S = g.S, k = key(x, y), o = S.objs[k];
  if (!o) return false;
  const tool = TOOL_FOR[o.t];
  if (S.sel !== tool) { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', tool === 'axe' ? 'Il faut la hache 🪓' : 'Il faut la pioche ⛏️'); return false; }
  const tier = toolTier(S, tool), need = MIN_PICK[o.t] || 1;
  if (tier < need) { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', `Pioche « ${TIER_NAMES[need]} » requise (forge)`); return false; }
  if (!useEnergy(g, energyCost(tier))) return false;
  o.hp -= tier; o.shake = 0.25;
  g.bus.emit('swing', tool);
  g.bus.emit('objHit', { x, y, t: o.t, broken: o.hp <= 0 });
  g.bus.emit('sfx', o.hp <= 0 ? 'break' : o.t === 'tree' ? 'chop' : 'pick');
  if (isStone(o.t)) gainXp(g, 'mining', MINING_GAIN.hit);
  if (o.hp <= 0) {
    delete S.objs[k];
    if (o.t === 'tree') {
      const n = 3 + (g.rnd() * 3 | 0); add(g, 'wood', n);
      g.bus.emit('pop', { t: '+' + n + '🪵', x, y });
      if (g.rnd() < 0.3) add(g, 'wheat_seed', 2);
    } else {
      const n = o.t === 'boulder' ? 8 + (g.rnd() * 5 | 0) : 2 + (g.rnd() * 3 | 0);
      add(g, 'stone', n);
      gainXp(g, 'mining', MINING_GAIN[o.t]);
      g.bus.emit('pop', { t: '+' + n + '🪨', x, y });
    }
  }
  return true;
}

export function regrow(g, count = 6) {
  const S = g.S;
  for (let i = 0; i < count; i++) {
    const x = 1 + g.rnd() * (CFG.W - 2) | 0, y = 1 + g.rnd() * (CFG.H - 2) | 0;
    if (freeForObj(x, y) && !S.objs[key(x, y)] && Math.hypot(x - S.x, y - S.y) > 3) {
      const v = g.rnd();
      S.objs[key(x, y)] = v < 0.55 ? { t: 'tree', hp: 3 } : (x >= 34 && v > 0.9) ? { t: 'boulder', hp: 6 } : { t: 'rock', hp: 2 };
    }
  }
}
