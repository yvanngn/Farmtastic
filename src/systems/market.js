// Panneau d'affichage du village : 6 emplacements de demandes, mieux payées que le bac.
// Une demande livrée ou jetée laisse son emplacement vide 2 h (temps réel, comme Hay Day).
// Le marché entre joueurs est dans net/market.js.
import { ITEMS } from '../data/items.js';
import { add, has } from './inventory.js';

export const ORDER_SLOTS = 6;
export const RENEW_MS = 2 * 3600 * 1000;
export const BOTS = ['Épicerie du village', 'Marchand ambulant', 'Boulangerie', 'Tisserand', 'Forgeron', 'Auberge'];
export const MARKET_ITEMS = ['wheat', 'corn', 'carrot', 'egg', 'wool', 'rabbit_wool', 'wood', 'stone', 'fence', 'potion', 'slime'];

export function newOrder(g, slot = 0) {
  const item = MARKET_ITEMS[g.rnd() * MARKET_ITEMS.length | 0];
  return {
    id: slot + '-' + g.now().toString(36) + (g.rnd() * 1e6 | 0).toString(36),
    item, qty: 3 + (g.rnd() * 10 | 0),
    price: Math.max(1, Math.round(ITEMS[item].p * (1.2 + g.rnd() * 0.8))),
    bot: BOTS[g.rnd() * BOTS.length | 0]
  };
}

// Remplit les emplacements vides dont le délai est écoulé. Migre l'ancien format (orders/jour).
export function ensureOrders(g) {
  const S = g.S, now = g.now();
  if (!S.market || !Array.isArray(S.market.slots)) S.market = { slots: [] };
  while (S.market.slots.length < ORDER_SLOTS) S.market.slots.push({ order: null, next: 0 });
  S.market.slots.forEach((s, i) => { if (!s.order && s.next <= now) s.order = newOrder(g, i); });
  return S.market.slots;
}

const slotOf = (S, id) => S.market.slots.find(s => s.order && s.order.id === id);
const free = (g, s) => { s.order = null; s.next = g.now() + RENEW_MS; };
export const timeLeft = (g, s) => Math.max(0, s.next - g.now());

export function fulfillOrder(g, id) {
  const S = g.S, s = slotOf(S, id), o = s && s.order;
  if (!o || !has(S, o.item, o.qty)) { g.bus.emit('sfx', 'denied'); return false; }
  add(g, o.item, -o.qty);
  S.money += o.qty * o.price;
  free(g, s);
  g.bus.emit('sfx', 'coin');
  g.bus.emit('toast', `${o.bot} vous paie ${o.qty * o.price} 🪙`);
  return true;
}

export function discardOrder(g, id) {
  const s = slotOf(g.S, id);
  if (!s) return false;
  free(g, s);
  g.bus.emit('toast', 'Demande retirée du panneau');
  return true;
}

export function fmtDelay(ms) {
  const m = Math.ceil(ms / 60000), h = Math.floor(m / 60);
  return h ? `${h} h ${String(m % 60).padStart(2, '0')}` : `${m} min`;
}
