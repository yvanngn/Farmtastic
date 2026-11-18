// Cultures façon Hay Day : temps réel, sans arrosage, glisser pour planter / récolter.
import { CROPS } from '../data/crops.js';
import { ITEMS } from '../data/items.js';
import { isPlot, key, isPath, isSolid } from '../world/map.js';
import { moundAt } from './mounds.js';
import { add, has } from './inventory.js';
import { isWet } from './weather.js';
import { useEnergy } from './player.js';

export const cropProgress = (p, now) => Math.min(1, (now - p.t0) / 1000 / CROPS[p.crop].grow);
export const isRipe = (p, now) => cropProgress(p, now) >= 1;

// Le champ n'est pas prêt au départ : chaque case se bêche à la pelle avant de planter.
export const isTilled = (S, x, y) => !!(S.tilled && S.tilled[key(x, y)]);
// 18/11 : on crée ses carrés de culture où l'on veut sur la ferme (herbe libre), plus seulement dans le champ.
export function canTill(S, x, y) {
  if ((S.scene || 'farm') !== 'farm') return false;
  if (isPlot(x, y)) return true;
  const k = key(x, y);
  return !isPath(x, y) && !isSolid({ ...S, scene: 'farm' }, x, y) && !(S.objs && S.objs[k]) && !moundAt(S, 'farm', x, y) && !(S.plots && S.plots[k]) && !(S.chests || []).some(c => c.x === x && c.y === y) && !(S.pots || []).some(p => p.x === x && p.y === y) && !(S.fires || []).some(f => f.x === x && f.y === y) && !(S.tent && S.tent.x === x && S.tent.y === y);
}
export function till(g, x, y) {
  const S = g.S, k = key(x, y);
  if (isTilled(S, x, y)) return false;
  if (!canTill(S, x, y)) { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', 'Impossible de bêcher ici : il faut de l’herbe libre sur la ferme.'); return false; }
  if (!useEnergy(g, 1)) return false;
  (S.tilled ||= {})[k] = 1;
  g.bus.emit('swing', 'shovel'); g.bus.emit('sfx', 'plant');
  tip(g, 'till', '🟫 Carré bêché ! Ouvre le sac 🎒, choisis les graines de blé, puis glisse le doigt sur tes carrés pour tout planter d’un coup.');
  return true;
}
// Tuto du premier champ : une bulle d'aide, une seule fois chacune.
export function tip(g, id, t) { const T = (g.S.tips ||= {}); if (T['farm_' + id]) return; T['farm_' + id] = 1; g.bus.emit('toast', t); }

export function plant(g, x, y, seedId) {
  const S = g.S, k = key(x, y), it = ITEMS[seedId];
  if (!isTilled(S, x, y) && it && it.seed && canTill(S, x, y)) { g.bus.emit('toast', 'Il faut d\'abord bêcher la terre avec la pelle 🪏'); return false; }
  if ((S.scene || 'farm') !== 'farm' || !isTilled(S, x, y) || S.plots[k] || !it || !it.seed || !has(S, seedId)) return false;
  add(g, seedId, -1);
  S.plots[k] = { crop: it.seed, t0: g.now() };
  g.bus.emit('sfx', 'plant');
  if (it.seed === 'wheat') tip(g, 'plant', '🌱 Planté ! Le blé pousse en 1 jour. Demain, prends la faucille et touche un épi : tout le champ se récolte d’un coup.');
  return true;
}

function harvestOne(g, k) {
  const S = g.S, p = S.plots[k], C = CROPS[p.crop], [x, y] = k.split(',').map(Number);
  add(g, p.crop, C.yield);
  if (C.extra) for (const id in C.extra) add(g, id, C.extra[id]);
  delete S.plots[k];
  g.bus.emit('pop', { t: '+' + C.yield + ' ' + ITEMS[p.crop].i, x, y });
  return C;
}
// 18/11 : à la faucille, on récolte d'un coup tout ce qui est mûr, sans se déplacer ; à la main, case par case.
export function harvest(g, x, y) {
  const S = g.S, k = key(x, y), p = S.plots[k], now = g.now();
  if (!p || !isRipe(p, now)) return false;
  const keys = S.sel === 'sickle' ? Object.keys(S.plots).filter(j => isRipe(S.plots[j], now)) : [k];
  for (const j of keys) harvestOne(g, j);
  g.bus.emit('sfx', 'harvest');
  g.bus.emit('swing', S.sel === 'sickle' ? 'sickle' : 'hand');
  ((S.quests ||= {}).champ ||= {}).recolte = true;
  if (keys.length > 1) g.bus.emit('toast', `🌾 ${keys.length} carrés récoltés d'un coup !`);
  tip(g, 'harvest', '🌾 Récolte faite ! La paille se vend 1 $ au bac de vente ; le blé sert à cuisiner et à faire du foin.');
  return true;
}
// 18/11 : le blé pousse en un jour : au matin suivant, ce qui a été planté la veille est mûr.
export function cropsNewDay(S) { for (const k in S.plots || {}) { const C = CROPS[S.plots[k].crop]; if (C && C.days) S.plots[k].t0 = -1e15; } }

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
