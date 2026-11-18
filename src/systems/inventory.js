import { ITEMS } from '../data/items.js';
// Sac à cases : chaque case contient au plus stackSize(S) unités d'un même objet.
// 25 bois avec des piles de 10 = 3 cases. S.inv garde le total par objet.
import { CFG } from '../config.js';
import { isSolid } from '../world/map.js';
import { SCENES } from '../world/scenes.js';

export const STACKS = [10, 20, 30, 50, 99];           // taille des piles par niveau d'amélioration
export const has = (S, id, n = 1) => (S.inv[id] || 0) >= n;
export const count = (S, id) => S.inv[id] || 0;
export const slots = S => S.invSlots || CFG.INV_SLOTS;
// lot 13 : les piles s'agrandissent au centre de Golgolas (niveau 1 : 15) ; les paliers déjà achetés au magasin restent acquis.
export const CENTER_PILES = [10, 15];
export const stackSize = S => Math.max(STACKS[Math.min(S.stackLvl || 0, STACKS.length - 1)], CENTER_PILES[Math.min((S.golgo && S.golgo.lvl) || 0, CENTER_PILES.length - 1)]);
const cells = (n, st) => Math.ceil(n / st);
export const usedSlots = S => { const st = stackSize(S); let u = 0; for (const id in S.inv) u += cells(S.inv[id], st); return u; };

// Quantité de cet objet qu'on peut encore ranger.
export function room(S, id) {
  const st = stackSize(S), cur = S.inv[id] || 0;
  const free = slots(S) - (usedSlots(S) - cells(cur, st));
  return Math.max(0, free * st - cur);
}
export const canAdd = (S, id, n = 1) => room(S, id) >= n;

// Renvoie la quantité réellement ajoutée (peut être partielle si le sac est plein).
export const SELL_TIP = [
  '💰 Tu peux vendre ce que tu ramasses dans le bac de vente, juste à côté de la cabane.',
  'Touche le bac : choisis chaque objet et sa quantité (−, +, Tout), puis vends. Le total s’affiche avant.',
  'Garde quand même du bois et des pierres : il en faut pour réparer la cabane !'
];
export function add(g, id, n = 1) {
  const S = g.S;
  if (n > 0) {
    const k = Math.min(n, room(S, id));
    if (k <= 0) { dropItem(g, id, n); g.bus.emit('toast', 'Sac plein 🎒 : posé au sol'); g.bus.emit('sfx', 'denied'); return 0; }
    S.inv[id] = (S.inv[id] || 0) + k;
    if ((id === 'wood' || id === 'stone') && !(S.tips ||= {}).sell) {   // tuto de la vente, la 1re fois
      S.tips.sell = true;
      g.bus.emit('say', { name: 'Conseil', color: '#ffdf8a', lines: SELL_TIP });
    }
    if (k < n) { dropItem(g, id, n - k); g.bus.emit('toast', 'Sac plein : ' + (n - k) + ' posé(s) au sol'); }
    g.bus.emit('inv');
    return k;
  }
  S.inv[id] = (S.inv[id] || 0) + n;
  if (S.inv[id] <= 0) { delete S.inv[id]; if (S.sel === id) S.sel = 'hand'; }
  g.bus.emit('inv');
  return n;
}

// Découpe le sac en cases pour l'affichage : [{ id, n }, …].
export function cellsOf(S) {
  const st = stackSize(S), out = [];
  for (const id in S.inv) { let left = S.inv[id]; while (left > 0) { out.push({ id, n: Math.min(st, left) }); left -= st; } }
  return out;
}

/* ---------- Objets au sol ---------- */
// Ce qui ne rentre pas dans le sac tombe au sol, là où se trouve le joueur. On peut le ramasser
// plus tard, ou l'échanger contre une case du sac.
export function dropItem(g, id, n) {
  const S = g.S, sc = S.scene || 'farm', x = Math.floor(S.x), y = Math.floor(S.y - .2);
  S.drops ||= [];
  const same = S.drops.find(d => d.scene === sc && d.x === x && d.y === y && d.id === id);
  if (same) same.n += n; else S.drops.push({ scene: sc, x, y, id, n });
}
export const dropsAt = (S, x, y) => (S.drops || []).filter(d => d.scene === (S.scene || 'farm') && d.x === x && d.y === y);

// Ce qu'on casse (arbre, caillou, filon, buisson…) se répand par terre autour : on passe dessus pour ramasser.
// Chaque unité saute sur une case libre voisine ; fx/fy/born servent à l'animation (vol en cloche).
export const SCATTER_MS = 450;
const AROUND = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
export function scatter(g, id, n, x, y) {
  const S = g.S, sc = S.scene || 'farm', W = (SCENES[sc] || {}).W || CFG.W, H = (SCENES[sc] || {}).H || CFG.H;
  let spots = AROUND.map(([a, b]) => [x + a, y + b]).filter(([a, b]) => a >= 0 && b >= 0 && a < W && b < H && !isSolid(S, a, b));
  if (!spots.length) { add(g, id, n); return 0; }
  S.drops ||= [];
  const born = g.now();
  for (let i = 0; i < n; i++) {
    const [a, b] = spots[Math.floor(g.rnd() * spots.length) % spots.length];
    const same = S.drops.find(d => d.scene === sc && d.x === a && d.y === b && d.id === id);
    if (same) { same.n++; same.born = born; same.fx = x; same.fy = y; }
    else S.drops.push({ scene: sc, x: a, y: b, id, n: 1, fx: x, fy: y, born });
  }
  return n;
}
// Son du ramassage, selon le composant.
export function pickSound(id) {
  if (id === 'wood') return 'getWood';
  if (id === 'stone') return 'getStone';
  if (/_ore$|^ruby$|^emerald$/.test(id)) return 'getOre';
  if (ITEMS[id] && ITEMS[id].eat) return 'getFood';
  return 'collect';
}

// Ramasse ce qui rentre ; renvoie la liste des objets restés au sol (sac plein).
export function pickDrops(g, x, y) {
  const S = g.S, left = [];
  for (const d of dropsAt(S, x, y)) {
    if (d.born && g.now() - d.born < SCATTER_MS) continue;   // encore en l'air
    const k = Math.min(d.n, room(S, d.id));
    if (k > 0) { add(g, d.id, k); d.n -= k; g.bus.emit('sfx', pickSound(d.id)); g.bus.emit('pop', { t: `+${k} ${ITEMS[d.id] ? ITEMS[d.id].i : ''}`, x, y }); }
    if (d.n > 0) left.push(d);
  }
  S.drops = (S.drops || []).filter(d => d.n > 0);
  return left;
}

// Échange : une case du sac (l'objet `give`) part au sol, l'objet au sol entre dans le sac.
export function swapDrop(g, drop, give) {
  const S = g.S, st = stackSize(S), cell = Math.min(S.inv[give] || 0, ((S.inv[give] - 1) % st) + 1);
  if (!cell || give === drop.id) return false;
  S.inv[give] -= cell; if (S.inv[give] <= 0) { delete S.inv[give]; if (S.sel === give) S.sel = 'hand'; }
  const keep = { ...drop }; drop.n = 0; S.drops = S.drops.filter(d => d.n > 0);
  S.drops.push({ scene: keep.scene, x: keep.x, y: keep.y, id: give, n: cell });
  const k = Math.min(keep.n, room(S, keep.id));
  S.inv[keep.id] = (S.inv[keep.id] || 0) + k;
  if (k < keep.n) S.drops.push({ ...keep, n: keep.n - k });
  g.bus.emit('sfx', 'collect'); g.bus.emit('inv');
  return true;
}

/* ---------- Ordre du sac (rangement à la main) et tri automatique par type ---------- */
// Ordre des types pour « Tri auto » : graines, nourriture, fleurs, champignons, minerais, ressources, objets, le reste.
export const SORT_CATS = ['Graines', 'Nourriture', 'Fleurs', 'Champignons', 'Minerais', 'Ressources', 'Objets', 'Divers'];
const RES = ['wood', 'stone', 'hay', 'fiber', 'coal', 'clay'];
export function catOf(id) {
  const it = ITEMS[id] || {};
  if (it.seed) return 0;
  if (it.flower) return 2;
  if (it.i === '🍄') return 3;
  if (/_ore$/.test(id)) return 4;
  if (RES.includes(id)) return 5;
  if (it.eat) return 1;
  if (it.keep) return 6;
  return 7;
}
// Ordre courant : celui choisi par le joueur, les nouveaux objets à la fin.
export function invOrder(S) {
  const o = (S.invOrder || []).filter(id => (S.inv[id] || 0) > 0);
  for (const id in S.inv) if (S.inv[id] > 0 && !o.includes(id)) o.push(id);
  return o;
}
export function orderedCells(S) {
  const st = stackSize(S), out = [];
  for (const id of invOrder(S)) { let left = S.inv[id]; while (left > 0) { out.push({ id, n: Math.min(st, left) }); left -= st; } }
  return out;
}
// Glisser un objet sur la case d'un autre : il prend sa place (les autres se décalent).
export function moveItem(S, id, targetId) {
  const o = invOrder(S).filter(x => x !== id);
  const i = targetId ? o.indexOf(targetId) : -1;
  if (i < 0) o.push(id); else o.splice(i, 0, id);
  S.invOrder = o;
  return o;
}
export function autoSort(S) {
  const name = id => (ITEMS[id] ? ITEMS[id].n : id);
  S.invOrder = invOrder(S).sort((a, b) => catOf(a) - catOf(b) || name(a).localeCompare(name(b), 'fr'));
  return S.invOrder;
}
