// Réparation des bâtiments délabrés (cabane, grange) et outils trouvés dehors. Logique pure.
import { REPAIRS, REPAIR_STEP, FIELD_TOOLS } from '../data/repairs.js';
import { inRect } from '../world/map.js';
import { add } from './inventory.js';

export const repairState = (S, id) => ((S.repair ||= {})[id] ||= { wood: 0, stone: 0 });
export function isRepaired(S, id) {
  const r = S.repair && S.repair[id];
  return !!r && Object.entries(REPAIRS[id].need).every(([k, v]) => (r[k] || 0) >= v);
}
const onFarm = S => (S.scene || 'farm') === 'farm';
// Bâtiment encore délabré sur cette case (le toucher = déposer).
export const repairAt = (S, x, y) => onFarm(S) ? Object.keys(REPAIRS).find(id => { const R = REPAIRS[id]; return inRect(x, y, R.x0, R.y0, R.x1, R.y1) && !isRepaired(S, id); }) || null : null;
// Bâtiment délabré devant lequel se tient le joueur (affiche la fenêtre des besoins).
export const repairNear = S => onFarm(S) ? Object.keys(REPAIRS).find(id => { const R = REPAIRS[id]; return !isRepaired(S, id) && S.x >= R.x0 - 1 && S.x <= R.x1 + 2 && S.y >= R.y0 && S.y <= R.y1 + 4; }) || null : null;

// Dépose ce qu'on a sur soi, jusqu'à remplir les jauges.
export function contribute(g, id) {
  const S = g.S, R = REPAIRS[id], st = repairState(S, id);
  if (isRepaired(S, id)) return false;
  let moved = '';
  for (const [k, need] of Object.entries(R.need)) {
    const give = Math.min(REPAIR_STEP, S.inv[k] || 0, need - (st[k] || 0));
    if (give > 0) { add(g, k, -give); st[k] = (st[k] || 0) + give; moved += `+${give}${k === 'wood' ? '🪵' : '🪨'} `; }
  }
  if (!moved) { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', 'Il te manque du bois ou des pierres : va en chercher !'); return false; }
  (S.tips ||= {}).hammer = true;   // l'explication « reste appuyé avec le marteau » n'est plus utile
  g.bus.emit('sfx', 'pick'); g.bus.emit('pop', { t: moved.trim(), x: (R.x0 + R.x1) / 2, y: R.y1 });
  if (isRepaired(S, id)) {
    g.bus.emit('sfx', 'levelup'); g.bus.emit('toast', `✅ ${R.n} est réparée !`); g.bus.emit('repaired', id);
  }
  return true;
}

// Outils posés par terre au début (une seule fois chacun).
export const fieldToolAt = (S, x, y) => onFarm(S) ? FIELD_TOOLS.find(t => t.x === x && t.y === y && !(S.tools && S.tools[t.tool])) || null : null;
export function pickFieldTool(g, x, y) {
  const S = g.S, t = fieldToolAt(S, x, y);
  if (!t) return null;
  S.tools = { ...S.tools, [t.tool]: Math.max(1, S.tools[t.tool] || 0) };
  S.sel = t.tool;
  g.bus.emit('sfx', 'levelup'); g.bus.emit('toast', `Tu as trouvé ${t.n} ! ${t.i}`); g.bus.emit('inv');
  return t.tool;
}
