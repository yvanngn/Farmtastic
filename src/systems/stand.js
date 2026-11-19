// 19/11 (demande de l'utilisateur) : l'étal du centre-ville, à côté de la fontaine, remplace le bac de vente (façon Hay Day).
// On y met des objets en vente : les habitants les achètent de temps en temps. Moins cher = vendu plus vite (quelques minutes) ;
// au prix fort, il faut attendre que la nuit passe. Au début, 10 objets en vente au plus (une pile de 10).
// Les habitants y mettent aussi en vente des objets, régulièrement, mais assez cher. Logique pure (g.rnd, g.now).
import { ITEMS } from '../data/items.js';
import { add, has } from './inventory.js';
import { sellable } from './economy.js';

export const STAND_CAP = 10;                          // objets en vente au début
export const PRICE_STEPS = [0.5, 0.75, 1, 1.5, 2];   // × prix de base (19/11 : de la moitié au double)
export const OFFERS_PER_DAY = 3, OFFER_MULT = 2.5;    // 💡 offres des habitants : 3 par jour, 2,5 × le prix de base
export const BUYERS = ['Myst', 'Luna', 'Franck', 'Hailey', 'Manu', 'Igor', 'Ed', 'Suzie', 'Remy', 'Harry', 'Rouky'];
const ST = S => (S.stand ||= { lots: [], offers: [], day: null, log: [] });
export const stand = S => S.stand || { lots: [], offers: [], day: null, log: [] };
export const used = S => stand(S).lots.reduce((a, l) => a + l.n, 0);
export const unitPrice = (id, mult) => Math.max(1, Math.round(ITEMS[id].p * mult));
// 19/11 (règles de l'utilisateur) : × 0,5 → vendu en 2 à 3 min ; de × 0,51 à × 0,99 → vendu dans la journée (5 à 15 min) ;
// de × 1 à × 1,99 → vendu pendant la nuit ; × 2 → au bout de 2 nuits.
export function saleDelay(mult, r) {
  if (mult >= 1) return Infinity;
  const [a, b] = mult <= .5 ? [2, 3] : [5, 15];
  return Math.round((a + (b - a) * r) * 60000);
}
export const nightsFor = mult => mult >= 2 ? 2 : mult >= 1 ? 1 : 0;
export const waitLabel = m => m >= 2 ? 'en 2 jours' : m >= 1 ? 'après la nuit' : m <= .5 ? 'en 2 à 3 min' : 'dans la journée';
export function listItem(g, id, n, mult) {
  const S = g.S, st = ST(S);
  if (!sellable(id) || !PRICE_STEPS.includes(mult)) return false;
  n = Math.min(n | 0, STAND_CAP - used(S), S.inv[id] || 0);
  if (n <= 0 || !has(S, id, n)) { g.bus.emit('toast', used(S) >= STAND_CAP ? `🧺 L’étal est plein (${STAND_CAP} objets au plus).` : 'Rien à mettre en vente.'); return false; }
  add(g, id, -n);
  st.lots.push({ id, n, mult, price: unitPrice(id, mult) * n, t0: g.now(), wait: saleDelay(mult, g.rnd()), nights: nightsFor(mult) });
  g.bus.emit('sfx', 'ui'); g.bus.emit('inv');
  return true;
}
export function unlist(g, i) {
  const st = ST(g.S), l = st.lots[i]; if (!l) return false;
  st.lots.splice(i, 1); add(g, l.id, l.n); g.bus.emit('inv'); return true;
}
function sell(g, l, i) {
  const S = g.S, st = ST(S), who = BUYERS[(g.rnd() * BUYERS.length) | 0];
  st.lots.splice(i, 1); S.money += l.price;
  st.log.unshift({ id: l.id, n: l.n, v: l.price, who }); st.log.length = Math.min(st.log.length, 20);
  g.bus.emit('sfx', 'coin'); g.bus.emit('toast', `💰 ${who} a acheté ${l.n} × ${ITEMS[l.id].n} à ton étal : +${l.price} $`);
}
// Appelé souvent (HUD) : les lots dont le délai est passé trouvent preneur.
export function standTick(g) {
  const st = stand(g.S); let k = 0;
  for (let i = st.lots.length - 1; i >= 0; i--) { const l = st.lots[i]; if (g.now() - l.t0 >= l.wait) { sell(g, l, i); k++; } }
  return k;
}
// Au matin : ce qui attendait la nuit est vendu (au prix fort, il faut 2 nuits) ; nouvelles offres des habitants.
export function standNewDay(g) {
  const S = g.S, st = ST(S);
  for (let i = st.lots.length - 1; i >= 0; i--) { const l = st.lots[i]; l.nights = (l.nights || 0) - 1; if (l.nights <= 0) sell(g, l, i); }
  rollOffers(g);
}
const POOL = () => Object.keys(ITEMS).filter(id => { const it = ITEMS[id]; return sellable(id) && it.p >= 2 && !it.seed && !it.keep; });
export function rollOffers(g) {
  const S = g.S, st = ST(S), pool = POOL(); st.offers = [];
  for (let i = 0; i < OFFERS_PER_DAY && pool.length; i++) {
    const id = pool[(g.rnd() * pool.length) | 0], n = 1 + ((g.rnd() * 3) | 0);
    st.offers.push({ id, n, price: Math.round(ITEMS[id].p * OFFER_MULT) * n, who: BUYERS[(g.rnd() * BUYERS.length) | 0] });
  }
  st.day = `${S.year}-${S.season}-${S.day}`;
  return st.offers;
}
export function ensureOffers(g) { const S = g.S, st = ST(S); if (st.day !== `${S.year}-${S.season}-${S.day}`) rollOffers(g); return st.offers; }
export function buyOffer(g, i) {
  const S = g.S, o = ST(S).offers[i];
  if (!o || S.money < o.price) { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', 'Pas assez d’argent.'); return false; }
  S.money -= o.price; add(g, o.id, o.n); ST(S).offers.splice(i, 1);
  g.bus.emit('sfx', 'coin'); g.bus.emit('toast', `🛒 Acheté à ${o.who} : ${o.n} × ${ITEMS[o.id].n} (−${o.price} $)`); g.bus.emit('inv');
  return true;
}
