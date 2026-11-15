// Coffres posés au sol (sur sa ferme) : on y range ce qu'on veut. Logique pure.
import { isSolid, isPath, key } from '../world/map.js';
import { add, canAdd, stackSize } from './inventory.js';

export const CHEST_CELLS = 24;   // 💡 cases d'un coffre
export const chestAt = (S, x, y) => (S.scene || 'farm') === 'farm' && (S.chests || []).find(c => c.x === x && c.y === y) || null;
const cellsUsed = (c, st) => Object.values(c.items).reduce((a, n) => a + Math.ceil(n / st), 0);
export const chestRoom = (S, c, id) => { const st = stackSize(S), n = c.items[id] || 0, free = CHEST_CELLS - cellsUsed(c, st); return free * st + (n % st ? st - (n % st) : 0); };

export function placeChest(g, x, y) {
  const S = g.S;
  if ((S.scene || 'farm') !== 'farm' || !(S.inv.chest > 0)) return false;
  if (isSolid(S, x, y) || isPath(x, y) || (S.plots && S.plots[key(x, y)]) || Math.hypot(x + .5 - S.x, y + .5 - S.y) > 2.5) {
    g.bus.emit('sfx', 'denied'); g.bus.emit('toast', '📦 Pose le coffre sur une case libre, tout près de toi.'); return false;
  }
  add(g, 'chest', -1); (S.chests ||= []).push({ x, y, items: {} });
  if (S.sel === 'chest' && !(S.inv.chest > 0)) S.sel = 'hand';
  g.bus.emit('sfx', 'craft'); g.bus.emit('toast', '📦 Coffre posé ! Touche-le pour y ranger tes affaires.');
  return true;
}
// Ranger (sac → coffre) ou reprendre (coffre → sac) jusqu'à n objets ; renvoie le nombre déplacé.
export function store(g, c, id, n) {
  const S = g.S, k = Math.min(n, S.inv[id] || 0, chestRoom(S, c, id));
  if (k <= 0) return 0;
  add(g, id, -k); c.items[id] = (c.items[id] || 0) + k;
  return k;
}
export function takeOut(g, c, id, n) {
  const S = g.S, have = c.items[id] || 0;
  let k = Math.min(n, have); while (k > 0 && !canAdd(S, id, k)) k--;
  if (k <= 0) { g.bus.emit('toast', 'Sac plein !'); return 0; }
  c.items[id] = have - k; if (!c.items[id]) delete c.items[id];
  add(g, id, k);
  return k;
}
// Reprendre un coffre vide dans son sac.
export function pickUpChest(g, c) {
  const S = g.S;
  if (Object.keys(c.items).length) { g.bus.emit('toast', 'Vide d’abord le coffre.'); return false; }
  if (!canAdd(S, 'chest', 1)) { g.bus.emit('toast', 'Sac plein !'); return false; }
  S.chests = S.chests.filter(x => x !== c); add(g, 'chest', 1);
  return true;
}
