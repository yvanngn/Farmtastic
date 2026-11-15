// Cultures façon Hay Day : temps réel, sans arrosage, glisser pour planter / récolter.
import { CROPS } from '../data/crops.js';
import { ITEMS } from '../data/items.js';
import { isPlot, key } from '../world/map.js';
import { add, has } from './inventory.js';
import { isWet } from './weather.js';
import { useEnergy } from './player.js';

export const cropProgress = (p, now) => Math.min(1, (now - p.t0) / 1000 / CROPS[p.crop].grow);
export const isRipe = (p, now) => cropProgress(p, now) >= 1;

// Le champ n'est pas prêt au départ : chaque case se bêche à la pelle avant de planter.
export const isTilled = (S, x, y) => !!(S.tilled && S.tilled[key(x, y)]);
export function till(g, x, y) {
  const S = g.S, k = key(x, y);
  if (!isPlot(x, y)) { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', 'On bêche seulement dans le champ, devant la maison.'); return false; }
  if (isTilled(S, x, y)) return false;
  if (!useEnergy(g, 1)) return false;
  (S.tilled ||= {})[k] = 1;
  g.bus.emit('swing', 'shovel'); g.bus.emit('sfx', 'plant');
  return true;
}

export function plant(g, x, y, seedId) {
  const S = g.S, k = key(x, y), it = ITEMS[seedId];
  if (isPlot(x, y) && !isTilled(S, x, y) && it && it.seed) { g.bus.emit('toast', 'Il faut d\'abord bêcher la terre avec la pelle 🪏'); return false; }
  if (!isPlot(x, y) || !isTilled(S, x, y) || S.plots[k] || !it || !it.seed || !has(S, seedId)) return false;
  add(g, seedId, -1);
  S.plots[k] = { crop: it.seed, t0: g.now() };
  g.bus.emit('sfx', 'plant');
  return true;
}

export function harvest(g, x, y) {
  const S = g.S, k = key(x, y), p = S.plots[k];
  if (!p || !isRipe(p, g.now())) return false;
  const C = CROPS[p.crop];
  add(g, p.crop, C.yield);
  delete S.plots[k];
  g.bus.emit('sfx', 'harvest');
  g.bus.emit('swing', g.S.sel === 'sickle' ? 'sickle' : 'hand');
  g.bus.emit('pop', { t: '+' + C.yield + ' ' + ITEMS[p.crop].i, x, y });
  return true;
}

// Action contextuelle selon l'objet sélectionné. Renvoie true si quelque chose s'est passé.
export function farmAction(g, x, y) {
  const sel = g.S.sel;
  if (sel === 'shovel') return till(g, x, y);
  if (ITEMS[sel] && ITEMS[sel].seed) return plant(g, x, y, sel);
  if (sel === 'sickle' || sel === 'hand') return harvest(g, x, y);
  return false;
}

// La pluie accélère la pousse de 25 %.
export function rainBoost(g, dtSec) {
  if (!isWet(g.S.weather)) return;
  for (const k in g.S.plots) g.S.plots[k].t0 -= dtSec * 250;
}
