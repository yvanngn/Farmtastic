// Argent : vente, boutique, fabrication.
import { ITEMS } from '../data/items.js';
import { ANIMALS } from '../data/animals.js';
import { RECIPES } from '../data/recipes.js';
import { BUILDINGS, WORKBENCH } from '../data/buildings.js';
import { isUnlocked } from './market.js';
import { add, has, slots, canAdd, stackSize, STACKS } from './inventory.js';
import { CFG } from '../config.js';

export const BAG_STEP = 6;
export const bagCost = S => 600 * ((slots(S) - CFG.INV_SLOTS) / BAG_STEP + 1);
export function buyBag(g) {
  const S = g.S, c = bagCost(S);
  if (slots(S) >= CFG.INV_MAX || S.money < c) { g.bus.emit('sfx', 'denied'); return false; }
  S.money -= c; S.invSlots = slots(S) + BAG_STEP;
  g.bus.emit('sfx', 'buy'); g.bus.emit('toast', `Sac agrandi : ${S.invSlots} places 🎒`); g.bus.emit('inv');
  return true;
}

// Magasin d'amélioration : piles plus grandes (10 → 20 → 30 → 50 → 99).
export const STACK_COSTS = [800, 2000, 4500, 9000];
export const stackCost = S => STACK_COSTS[S.stackLvl || 0] ?? null;
export function buyStack(g) {
  const S = g.S, c = stackCost(S);
  if (c == null || S.money < c) { g.bus.emit('sfx', 'denied'); return false; }
  S.money -= c; S.stackLvl = (S.stackLvl || 0) + 1;
  g.bus.emit('sfx', 'buy'); g.bus.emit('toast', `Piles de ${stackSize(S)} objets 📦`); g.bus.emit('inv');
  return true;
}
export { STACKS };

// Vend tout sauf graines et objets marqués keep.
export function sellAll(g) {
  const S = g.S;
  let gain = 0;
  for (const id of Object.keys(S.inv)) {
    const it = ITEMS[id];
    if (it && !it.seed && !it.keep) { gain += it.p * S.inv[id]; delete S.inv[id]; if (S.sel === id) S.sel = 'hand'; }
  }
  S.money += gain;
  g.bus.emit('inv');
  g.bus.emit('sfx', gain ? 'coin' : 'denied');
  g.bus.emit('toast', gain ? `Vendu pour ${gain} 💰` : 'Rien à vendre');
  return gain;
}

export function buy(g, id, n = 1) {
  const it = ITEMS[id];
  if (!it || !it.buy || !isUnlocked(g.S, id) || g.S.money < it.buy * n) return false;
  if (!canAddItem(g.S, id, n)) { g.bus.emit('toast', 'Sac plein 🎒'); g.bus.emit('sfx', 'denied'); return false; }
  g.S.money -= it.buy * n;
  g.bus.emit('sfx', 'buy');
  add(g, id, n);
  return true;
}

// Charpentier : construire un bâtiment (argent + bois + pierre).
export function canBuild(S, id) {
  const b = BUILDINGS[id];
  if (!b) return { ok: false, why: 'unknown' };
  if (S.built && S.built[id]) return { ok: false, why: 'built' };
  if (S.money < b.cost.money) return { ok: false, why: 'money' };
  if (!has(S, 'wood', b.cost.wood)) return { ok: false, why: 'wood' };
  if (!has(S, 'stone', b.cost.stone)) return { ok: false, why: 'stone' };
  return { ok: true };
}
export function build(g, id) {
  const S = g.S, r = canBuild(S, id);
  if (!r.ok) { g.bus.emit('sfx', 'denied'); return false; }
  const b = BUILDINGS[id];
  S.money -= b.cost.money; add(g, 'wood', -b.cost.wood); add(g, 'stone', -b.cost.stone);
  S.built = { ...S.built, [id]: true };
  g.bus.emit('sfx', 'craft'); g.bus.emit('toast', `${b.n} construit ! ${b.i}`); g.bus.emit('built', id);
  return true;
}
export const homeCount = (S, home) => S.animals.filter(a => ANIMALS[a.type] && ANIMALS[a.type].home === home).length;
// Établi : le charpentier le répare, puis on fabrique à la maison.
export function canRepairBench(S) {
  if (S.workbench) return { ok: false, why: 'built' };
  const c = WORKBENCH.cost;
  if (S.money < c.money) return { ok: false, why: 'money' };
  if (!has(S, 'wood', c.wood)) return { ok: false, why: 'wood' };
  if (!has(S, 'stone', c.stone)) return { ok: false, why: 'stone' };
  return { ok: true };
}
export function repairBench(g) {
  const S = g.S;
  if (!canRepairBench(S).ok) { g.bus.emit('sfx', 'denied'); return false; }
  const c = WORKBENCH.cost;
  S.money -= c.money; add(g, 'wood', -c.wood); add(g, 'stone', -c.stone);
  S.workbench = true;
  g.bus.emit('sfx', 'craft'); g.bus.emit('toast', "L'établi de la maison est réparé ! 🛠️");
  return true;
}

// Marchand d'animaux : il faut le bon bâtiment, avec de la place.
export function canBuyAnimal(S, type) {
  const def = ANIMALS[type];
  if (!def) return { ok: false, why: 'unknown' };
  if (!isUnlocked(S, type)) return { ok: false, why: 'locked' };
  if (def.home && !(S.built && S.built[def.home])) return { ok: false, why: 'home' };
  if (def.home && homeCount(S, def.home) >= BUILDINGS[def.home].cap) return { ok: false, why: 'full' };
  if (S.money < def.buy) return { ok: false, why: 'money' };
  return { ok: true };
}

export function buyAnimal(g, type) {
  const def = ANIMALS[type];
  if (!canBuyAnimal(g.S, type).ok) { g.bus.emit('sfx', 'denied'); return false; }
  g.S.money -= def.buy;
  g.bus.emit('sfx', 'buy');
  const bx = def.home ? (BUILDINGS[def.home].x0 + BUILDINGS[def.home].x1) / 2 + .5 : 8;
  g.S.animals.push({ id: 'a' + g.now() + (g.rnd() * 1e6 | 0), type, x: bx, y: def.home ? 9.5 : 6.5, fed: false, petted: false, love: 0, produced: false });
  return true;
}

const canAddItem = canAdd;

export const canCraft = (S, r) => Object.entries(r.in).every(([k, n]) => has(S, k, n));

export function craft(g, index) {
  const r = RECIPES[index];
  if (!g.S.workbench || !r || !canCraft(g.S, r)) return false; // on fabrique seulement à l'établi réparé
  for (const [k, n] of Object.entries(r.in)) add(g, k, -n);
  add(g, r.out, r.q);
  g.bus.emit('sfx', 'craft');
  return true;
}
