// Argent : vente, boutique, fabrication.
import { ITEMS } from '../data/items.js';
import { ANIMALS } from '../data/animals.js';
import { RECIPES } from '../data/recipes.js';
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
  if (!it || !it.buy || g.S.money < it.buy * n) return false;
  if (!canAddItem(g.S, id, n)) { g.bus.emit('toast', 'Sac plein 🎒'); g.bus.emit('sfx', 'denied'); return false; }
  g.S.money -= it.buy * n;
  g.bus.emit('sfx', 'buy');
  add(g, id, n);
  return true;
}

export function buyAnimal(g, type) {
  const def = ANIMALS[type];
  if (!def || g.S.money < def.buy) return false;
  g.S.money -= def.buy;
  g.bus.emit('sfx', 'buy');
  g.S.animals.push({ id: 'a' + g.now() + (g.rnd() * 1e6 | 0), type, x: 22, y: 10, fed: false, petted: false, love: 0, produced: false });
  return true;
}

const canAddItem = canAdd;

export const canCraft = (S, r) => Object.entries(r.in).every(([k, n]) => has(S, k, n));

export function craft(g, index) {
  const r = RECIPES[index];
  if (!r || !canCraft(g.S, r)) return false;
  for (const [k, n] of Object.entries(r.in)) add(g, k, -n);
  add(g, r.out, r.q);
  g.bus.emit('sfx', 'craft');
  return true;
}
