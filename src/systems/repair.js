import { gainJob } from './jobs.js';
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
const ready = (S, id) => !REPAIRS[id].after || isRepaired(S, REPAIRS[id].after);   // l'agrandissement vient après la cabane
export const repairAt = (S, x, y) => onFarm(S) ? Object.keys(REPAIRS).find(id => { const R = REPAIRS[id]; return inRect(x, y, R.x0, R.y0, R.x1, R.y1) && !isRepaired(S, id) && ready(S, id) && (!R.after || S.sel === 'hammer'); }) || null : null;   // l'agrandissement : seulement marteau en main
// Bâtiment délabré devant lequel se tient le joueur (affiche la fenêtre des besoins).
export const repairNear = S => onFarm(S) ? Object.keys(REPAIRS).find(id => { const R = REPAIRS[id]; return !isRepaired(S, id) && ready(S, id) && (!R.after || S.sel === 'hammer') && S.x >= R.x0 - 1 && S.x <= R.x1 + 2 && S.y >= R.y0 && S.y <= R.y1 + 4; }) || null : null;

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
  (S.tips ||= {}).hammer = true;
  gainJob(g, 'charpentier', 1);   // métier de charpentier : chaque coup de marteau compte   // l'explication « reste appuyé avec le marteau » n'est plus utile
  g.bus.emit('sfx', 'pick'); g.bus.emit('pop', { t: moved.trim(), x: (R.x0 + R.x1) / 2, y: R.y1 });
  if (isRepaired(S, id)) {
    g.bus.emit('sfx', 'levelup'); g.bus.emit('toast', `✅ ${R.n} est réparée !`); g.bus.emit('repaired', id);
    if (id === 'house') g.bus.emit('toast', '📜 Nouvelles quêtes secondaires : agrandir la cabane, fabriquer un lit et un coffre (plans chez Harry Fordson, le charpentier).');
    if (id === 'house2') g.bus.emit('toast', '🏠 Ta cabane est plus grande : il y a de la place pour s’installer !');
  }
  return true;
}

// Quête secondaire du lit : le lit fabriqué (plan acheté chez Harry) s'installe dans la cabane.
export function installBed(g) {
  const S = g.S;
  if (S.bed !== false || !(S.inv.bed > 0)) return false;
  add(g, 'bed', -1); S.bed = true;
  g.bus.emit('sfx', 'levelup'); g.bus.emit('toast', '🛏️ Ton lit est installé : tu peux enfin dormir dans ta cabane !');
  return true;
}

// Outils posés par terre au début (une seule fois chacun).
export const fieldToolAt = (S, x, y) => onFarm(S) ? FIELD_TOOLS.find(t => t.x === x && t.y === y && !(S.tools && S.tools[t.tool])) || null : null;
export function pickFieldTool(g, x, y) {
  const S = g.S, t = fieldToolAt(S, x, y);
  if (!t || (S.tools && S.tools[t.tool])) return null;   // jamais deux fois le même outil
  S.tools = { ...S.tools, [t.tool]: Math.max(1, S.tools[t.tool] || 0) };
  S.sel = t.tool;
  g.bus.emit('sfx', 'levelup'); g.bus.emit('toast', `Tu as trouvé ${t.n} ! ${t.i}`); g.bus.emit('inv');
  return t.tool;
}
