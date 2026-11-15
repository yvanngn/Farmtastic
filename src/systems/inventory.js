// Sac à cases : chaque case contient au plus stackSize(S) unités d'un même objet.
// 25 bois avec des piles de 10 = 3 cases. S.inv garde le total par objet.
import { CFG } from '../config.js';

export const STACKS = [10, 20, 30, 50, 99];           // taille des piles par niveau d'amélioration
export const has = (S, id, n = 1) => (S.inv[id] || 0) >= n;
export const count = (S, id) => S.inv[id] || 0;
export const slots = S => S.invSlots || CFG.INV_SLOTS;
export const stackSize = S => STACKS[Math.min(S.stackLvl || 0, STACKS.length - 1)];
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
export function add(g, id, n = 1) {
  const S = g.S;
  if (n > 0) {
    const k = Math.min(n, room(S, id));
    if (k <= 0) { dropItem(g, id, n); g.bus.emit('toast', 'Sac plein 🎒 : posé au sol'); g.bus.emit('sfx', 'denied'); return 0; }
    S.inv[id] = (S.inv[id] || 0) + k;
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

// Ramasse ce qui rentre ; renvoie la liste des objets restés au sol (sac plein).
export function pickDrops(g, x, y) {
  const S = g.S, left = [];
  for (const d of dropsAt(S, x, y)) {
    const k = Math.min(d.n, room(S, d.id));
    if (k > 0) { S.inv[d.id] = (S.inv[d.id] || 0) + k; d.n -= k; g.bus.emit('sfx', 'collect'); g.bus.emit('inv'); }
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
