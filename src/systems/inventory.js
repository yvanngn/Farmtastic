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
    if (k <= 0) { g.bus.emit('toast', 'Sac plein 🎒'); g.bus.emit('sfx', 'denied'); return 0; }
    S.inv[id] = (S.inv[id] || 0) + k;
    if (k < n) g.bus.emit('toast', 'Sac plein : ' + (n - k) + ' perdu(s)');
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
