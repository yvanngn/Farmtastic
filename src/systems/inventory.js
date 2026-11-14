// Sac à places limitées : chaque type d'objet occupe une place, jusqu'à CFG.STACK unités.
import { CFG } from '../config.js';

export const has = (S, id, n = 1) => (S.inv[id] || 0) >= n;
export const count = (S, id) => S.inv[id] || 0;
export const slots = S => S.invSlots || CFG.INV_SLOTS;
export const usedSlots = S => Object.keys(S.inv).length;

export function canAdd(S, id, n = 1) {
  const cur = S.inv[id] || 0;
  if (!cur && usedSlots(S) >= slots(S)) return false;
  return cur + n <= CFG.STACK;
}

// Renvoie la quantité réellement ajoutée (peut être partielle si le sac est plein).
export function add(g, id, n = 1) {
  const S = g.S;
  if (n > 0) {
    const cur = S.inv[id] || 0;
    if (!cur && usedSlots(S) >= slots(S)) { g.bus.emit('toast', 'Sac plein 🎒'); g.bus.emit('sfx', 'denied'); return 0; }
    const k = Math.min(n, CFG.STACK - cur);
    if (k <= 0) { g.bus.emit('toast', 'Pile pleine (' + CFG.STACK + ')'); return 0; }
    S.inv[id] = cur + k;
    if (k < n) g.bus.emit('toast', 'Sac plein : ' + (n - k) + ' perdu(s)');
    g.bus.emit('inv');
    return k;
  }
  S.inv[id] = (S.inv[id] || 0) + n;
  if (S.inv[id] <= 0) { delete S.inv[id]; if (S.sel === id) S.sel = 'hand'; }
  g.bus.emit('inv');
  return n;
}
