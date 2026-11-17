import { CFG } from '../config.js';
// Panneau d'affichage du village : 6 emplacements de demandes, mieux payées que le bac.
// Quatre familles à code couleur : chantier (jauge du village), fête de saison, habitant (amitié), caravane (jetons → déblocages).
// Une demande livrée ou jetée laisse son emplacement vide 2 h (temps réel, comme Hay Day).
// Le marché entre joueurs est dans net/market.js.
import { ITEMS } from '../data/items.js';
import { add, has } from './inventory.js';
import { KINDS, KIND_WEIGHTS, PROJECTS, FESTIVAL_GOAL, FESTIVAL_REWARD, FESTIVALS, UNLOCKS } from '../data/requests.js';
import { tasteOf } from './social.js';
import { openWild } from './wild.js';

export const ORDER_SLOTS = 6;
export const RENEW_MS = 2 * 3600 * 1000;
export const BOTS = ['Épicerie du village', 'Marchand ambulant', 'Boulangerie', 'Tisserand', 'Forgeron', 'Auberge'];
export const MARKET_ITEMS = ['wheat', 'corn', 'carrot', 'egg', 'wool', 'rabbit_wool', 'wood', 'stone', 'fence', 'potion', 'slime'];

// Ce qu'il faut avoir débloqué (caravane) ou construit pour produire un objet.
const NEEDS = { wool: ['sheep', 'barn'], rabbit_wool: ['rabbit', 'coop'], truffle: ['pig', 'pigsty'], egg: [null, 'coop'], corn: ['corn_seed'], carrot: ['carrot_seed'] };
export function obtainable(S, item) {
  const [u, b] = NEEDS[item] || [];
  return (!u || isUnlocked(S, u)) && (!b || !!(S.built && S.built[b]));
}

// Famille tirée au sort (pondérée). « habitant » seulement s'il y a des habitants.
function pickKind(g) {
  const kinds = Object.keys(KIND_WEIGHTS).filter(k => k !== 'habitant' || Object.keys(g.npcs).length);
  let r = g.rnd() * kinds.reduce((n, k) => n + KIND_WEIGHTS[k], 0);
  for (const k of kinds) { r -= KIND_WEIGHTS[k]; if (r < 0) return k; }
  return kinds[0];
}
export function newOrder(g, slot = 0, kind = pickKind(g)) {
  const K = KINDS[kind];
  let items = K.items, bot = K.n, npc = null;
  if (kind === 'habitant') {
    const ids = Object.keys(g.npcs); npc = ids[g.rnd() * ids.length | 0];
    const n = g.npcs[npc]; bot = n.name;
    items = Object.keys(ITEMS).filter(k => ['adore', 'aime'].includes(tasteOf(n, k)));
    if (!items.length) items = MARKET_ITEMS;
  }
  if (kind === 'chantier') bot = currentProject(g.S) ? currentProject(g.S).n : K.n;
  if (kind === 'fete') bot = FESTIVALS[g.S.season] || K.n;
  // seulement des objets que le joueur peut déjà obtenir
  const ok = items.filter(k => obtainable(g.S, k));
  items = ok.length ? ok : ['wood', 'wheat'];
  const item = items[g.rnd() * items.length | 0];
  return {
    id: slot + '-' + g.now().toString(36) + (g.rnd() * 1e6 | 0).toString(36),
    kind, npc, item, qty: (kind === 'habitant' ? 1 : 3) + (g.rnd() * (kind === 'habitant' ? 3 : 10) | 0),
    price: Math.max(1, Math.round(ITEMS[item].p * (1.2 + g.rnd() * 0.8) * K.mult)),
    tokens: kind === 'caravane' ? 1 + (g.rnd() * 2 | 0) : 0,
    bot
  };
}

/* ---------- Jauges : chantiers, fête de saison, caravane ---------- */
export function village(S) {
  S.village ||= { done: [], progress: 0 };
  const key = S.year + '-' + S.season;
  if (!S.festival || S.festival.key !== key) S.festival = { key, pts: 0, done: false };
  S.caravan ||= { tokens: 0, unlocked: [] };
  return S.village;
}
export const currentProject = S => PROJECTS.find(p => !(S.village && S.village.done.includes(p.id))) || null;
export const isUnlocked = (S, id) => !UNLOCKS.some(u => u.id === id) || (S.caravan && S.caravan.unlocked.includes(id));

function contribute(g, o) {
  const S = g.S; village(S);
  if (o.kind === 'chantier') {
    const p = currentProject(S); if (!p) return;
    S.village.progress += o.qty;
    if (S.village.progress >= p.goal) {
      S.village.done.push(p.id); S.village.progress = 0; S.money += p.reward;
      if (p.id === 'lampadaires') openWild(g); // le Maire confie la clé des Caverne sombre
      g.bus.emit('sfx', 'levelup'); g.bus.emit('toast', `🔨 Chantier terminé : ${p.n} ! +${p.reward} $`);
    }
  } else if (o.kind === 'fete' && !S.festival.done) {
    S.festival.pts += o.qty;
    if (S.festival.pts >= FESTIVAL_GOAL) {
      S.festival.done = true; S.money += FESTIVAL_REWARD;
      g.bus.emit('sfx', 'levelup'); g.bus.emit('toast', `🎉 ${FESTIVALS[S.season]} prête ! +${FESTIVAL_REWARD} $`);
    }
  } else if (o.kind === 'habitant' && S.social[o.npc]) {
    S.social[o.npc].points += 40;
  } else if (o.kind === 'caravane') {
    S.caravan.tokens += o.tokens;
  }
}

// Caravane : échanger des jetons contre un déblocage.
export function unlock(g, id) {
  const S = g.S; village(S);
  const u = UNLOCKS.find(x => x.id === id);
  if (!u || S.caravan.unlocked.includes(id) || S.caravan.tokens < u.cost) { g.bus.emit('sfx', 'denied'); return false; }
  S.caravan.tokens -= u.cost; S.caravan.unlocked.push(id);
  g.bus.emit('sfx', 'levelup'); g.bus.emit('toast', `🐪 La caravane vous confie : ${u.n} !`);
  return true;
}

// Remplit les emplacements vides dont le délai est écoulé. Migre l'ancien format (orders/jour).
export function ensureOrders(g) {
  const S = g.S, now = g.now();
  if (!S.market || !Array.isArray(S.market.slots)) S.market = { slots: [] };
  village(S);
  // anciennes demandes sans famille : elles deviennent des demandes de caravane
  S.market.slots.forEach(s => { if (s.order && !s.order.kind) Object.assign(s.order, { kind: 'caravane', tokens: 1 }); });
  while (S.market.slots.length < ORDER_SLOTS) S.market.slots.push({ order: null, next: 0 });
  if (!CFG.BOARD_OPEN) return S.market.slots.filter(s => s.order);   // panneau vide pour l'instant
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
  g.bus.emit('toast', `${o.bot} vous paie ${o.qty * o.price} $` + (o.tokens ? ` + ${o.tokens} jeton(s) 🐪` : o.kind === 'habitant' ? ' · amitié ❤️' : ''));
  contribute(g, o);
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
