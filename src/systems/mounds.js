// Lot 12 : petits tas de terre à creuser à la pelle. Une vingtaine par zone extérieure (sauf la gare et le centre-ville),
// à de nouvelles places chaque jour ; on peut marcher dessus. Butin au hasard (répartition à faire évoluer). Logique pure.
import { LAYOUTS, SOLID_TILES } from '../world/scenes.js';
import { key, rng, freeForObj, isSolid, isPlot } from '../world/map.js';
import { CFG } from '../config.js';
import { MUSHROOMS } from '../data/items.js';
import { add } from './inventory.js';
import { useEnergy } from './player.js';
import { hasTool } from './skills.js';
import { gainPxp, XP } from './level.js';

export const MOUND_ZONES = ['farm', 'rondpoint', 'quartier', 'ranch', 'parc', 'port', 'montagne', 'plage', 'foret'];
export const MOUNDS_PER_ZONE = 20;
// Butin (décision du 18/11) : rien 10 %, pierres 30 %, bois 25 %, champignons 20 %, os 15 %.
export const MOUND_LOOT = [['rien', .10], ['stone', .30], ['wood', .25], ['champignon', .20], ['bone', .15]];
export const MOUND_QTY = { stone: [1, 3], wood: [1, 3], champignon: [1, 1], bone: [1, 1] };   // 💡 quantités

const dayNum = S => ((S.year || 1) - 1) * 120 + (S.season || 0) * 30 + (S.day || 1);
const size = sc => sc === 'farm' ? [CFG.W, CFG.H] : [LAYOUTS[sc][0].length, LAYOUTS[sc].length];
const hash = s => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };

// Case où un tas peut apparaître : sol praticable, hors portes, ponts, eau et objets.
export function moundSpot(S, sc, x, y) {
  const k = key(x, y), N = S.nature && S.nature[sc];
  if (N && (N.rocks[k] || N.flowers[k])) return false;
  if (sc === 'farm') return freeForObj(x, y) && !isPlot(x, y) && !(S.objs && S.objs[k]) && !(S.plots && S.plots[k]) && !(S.tilled && S.tilled[k]) && !isSolid({ ...S, scene: 'farm' }, x, y);
  const t = LAYOUTS[sc] && LAYOUTS[sc][y] && LAYOUTS[sc][y][x];
  if (!t || SOLID_TILES.includes(t) || 'D=w'.includes(t)) return false;
  if (sc === 'foret' && S.foret && S.foret.shrooms && S.foret.shrooms[k]) return false;
  return !isSolid({ ...S, scene: sc }, x, y);
}

// Les tas du jour dans une zone (tirés une fois par jour, mêmes places pour une même partie et un même jour).
export function ensureMounds(S, sc) {
  if (!MOUND_ZONES.includes(sc)) return null;
  S.mounds ||= {};
  const d = dayNum(S), M = S.mounds[sc];
  if (M && M.day === d) return M;
  const r = rng(hash(`${S.gameSeed || 'farmwest'}:${sc}:${d}`)), [w, h] = size(sc), at = {};
  for (let i = 0, n = 0; i < 2000 && n < MOUNDS_PER_ZONE; i++) {
    const x = 1 + (r() * (w - 2) | 0), y = 1 + (r() * (h - 2) | 0), k = key(x, y);
    if (!at[k] && moundSpot(S, sc, x, y)) { at[k] = 1; n++; }
  }
  return (S.mounds[sc] = { day: d, at });
}
export const moundAt = (S, sc, x, y) => { const M = S.mounds && S.mounds[sc]; return !!(M && M.day === dayNum(S) && M.at[key(x, y)]); };

export function pickLoot(r) {
  let t = r;
  for (const [id, p] of MOUND_LOOT) if ((t -= p) < 0) return id;
  return MOUND_LOOT[MOUND_LOOT.length - 1][0];
}

// Creuser un tas : il faut la pelle en main ; le tas disparaît jusqu'au lendemain.
export function digMound(g, x, y) {
  const S = g.S, sc = S.scene || 'farm';
  ensureMounds(S, sc);
  if (!moundAt(S, sc, x, y)) return null;
  if (!hasTool(S, 'shovel')) { g.bus.emit('toast', '🟫 Un petit tas de terre… Il faudrait une pelle pour creuser.'); return 'noshovel'; }
  if (S.sel !== 'shovel') { g.bus.emit('toast', '🪏 Prends la pelle pour creuser ce petit tas.'); return 'noshovel'; }
  if (!useEnergy(g, 1)) return 'tired';
  delete S.mounds[sc].at[key(x, y)];
  g.bus.emit('swing', 'shovel'); g.bus.emit('sfx', 'plant');
  const id = pickLoot(g.rnd());
  if (id === 'rien') { g.bus.emit('pop', { t: '…', x, y }); g.bus.emit('toast', 'Rien dans ce tas.'); return 'rien'; }
  const [a, b] = MOUND_QTY[id], n = a + (g.rnd() * (b - a + 1) | 0);
  const item = id === 'champignon' ? `${MUSHROOMS[S.season || 0][0].id}_s` : id;
  add(g, item, n); gainPxp(g, XP.small, 'dig');
  if (id === 'bone') g.bus.emit('toast', '🦴 Un os ! Un chien serait ravi…');
  g.bus.emit('pop', { t: `+${n}`, x, y });
  return item;
}
