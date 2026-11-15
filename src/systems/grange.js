// La grange de la maison : un ensemble de tunnels. On y trouve les outils de départ
// (faucille derrière des planches, pelle derrière un éboulis ; la hache et la pioche sont dehors, voir data/repairs.js).
// Un grand éboulement ferme la suite des tunnels (à découvrir plus tard).
import { tileAt } from '../world/scenes.js';
import { hasTool } from './skills.js';

export const PICKUPS = [
  { x: 12, y: 3, tool: 'sickle', n: 'la faucille', i: '🔪' },
  { x: 18, y: 9, tool: 'shovel', n: 'la pelle', i: '🪏' }
];
// p = planches (hache), r = éboulis (pioche)
export const BREAK_TOOL = { p: 'axe', r: 'pick' };

export function grangeState(S) { return (S.grange ||= { found: [], broken: [] }); }
export const isBroken = (S, x, y) => !!(S.grange && S.grange.broken.includes(x + ',' + y));
export const pickupAt = (S, x, y) => PICKUPS.find(p => p.x === x && p.y === y && !grangeState(S).found.includes(p.tool)) || null;

export function takePickup(g, p) {
  const S = g.S;
  grangeState(S).found.push(p.tool);
  S.tools = { ...S.tools, [p.tool]: Math.max(1, S.tools[p.tool] || 0) };
  S.sel = p.tool;
  g.bus.emit('sfx', 'levelup'); g.bus.emit('toast', `Tu as trouvé ${p.n} ! ${p.i}`); g.bus.emit('inv');
  return p.tool;
}

// Action sur une case des tunnels : ramasser, casser planches / éboulis, buter sur l'éboulement.
export function grangeAction(g, tx, ty) {
  const S = g.S, p = pickupAt(S, tx, ty);
  if (p) return takePickup(g, p);
  const t = tileAt('grange', tx, ty);
  if (BREAK_TOOL[t] && !isBroken(S, tx, ty)) {
    const tool = BREAK_TOOL[t];
    if (!hasTool(S, tool)) { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', t === 'p' ? 'Des planches clouées… il faudrait une hache.' : 'Un éboulis bloque le passage… il faudrait une pioche.'); return 'blocked'; }
    grangeState(S).broken.push(tx + ',' + ty);
    g.bus.emit('swing', tool); g.bus.emit('sfx', 'break');
    g.bus.emit('toast', t === 'p' ? 'Les planches cèdent !' : "L'éboulis s'effondre, le passage est libre !");
    return 'break';
  }
  if (t === 'E') { g.bus.emit('toast', "Le tunnel continue derrière cet éboulement… impossible d'aller plus loin pour l'instant."); return 'collapse'; }
  return 'none';
}

// Ramassage automatique quand on marche sur un outil.
export function autoPickup(g) {
  const S = g.S;
  if (S.scene !== 'grange') return null;
  const p = pickupAt(S, Math.floor(S.x), Math.floor(S.y - .2));
  return p ? takePickup(g, p) : null;
}
