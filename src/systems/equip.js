// 19/11 (demande de l'utilisateur) : équipement (menu → 🎽 Équipement). Emplacements : tête, corps, pieds, accessoire.
// Un objet équipable a `equip: '<emplacement>'` dans data/items.js ; il quitte le sac quand on l'équipe, il y revient
// quand on le retire. Bottes de vent : marche 4 fois plus vite (offertes à Yvan, objet à gagner plus tard). Logique pure.
import { ITEMS } from '../data/items.js';
import { add, has } from './inventory.js';
export const SLOTS = { tete: '🎩 Tête', corps: '🧥 Corps', pieds: '👢 Pieds', accessoire: '💍 Accessoire' };
const E = S => (S.equip ||= { tete: null, corps: null, pieds: null, accessoire: null });
export const equipped = (S, slot) => (S.equip || {})[slot] || null;
export const equippable = S => Object.keys(S.inv || {}).filter(id => ITEMS[id] && ITEMS[id].equip && S.inv[id] > 0);
export function equip(g, id) {
  const S = g.S, it = ITEMS[id]; if (!it || !it.equip || !has(S, id)) return false;
  const slot = it.equip, old = E(S)[slot]; add(g, id, -1); if (old) add(g, old, 1);
  E(S)[slot] = id; g.bus.emit('sfx', 'ui'); g.bus.emit('toast', `${it.i} ${it.n} équipé${it.f ? 'es' : ''}.`); g.bus.emit('inv'); return true;
}
export function unequip(g, slot) {
  const S = g.S, id = E(S)[slot]; if (!id) return false;
  E(S)[slot] = null; add(g, id, 1); g.bus.emit('sfx', 'ui'); g.bus.emit('inv'); return true;
}
// Vitesse de marche : produit des bonus des objets portés.
export const speedMult = S => Object.values(S.equip || {}).reduce((m, id) => m * ((id && ITEMS[id] && ITEMS[id].speed) || 1), 1);
export const wearing = (S, id) => Object.values(S.equip || {}).includes(id);
// Cadeau pour Yvan : les bottes de vent, une seule fois, équipées d'office.
export function yvanGift(g) {
  const S = g.S; if (!S.name || S.name.trim().toLowerCase() !== 'yvan' || (S.flags && S.flags.yvanBoots)) return false;
  (S.flags ||= {}).yvanBoots = true; add(g, 'bottes_vent', 1); equip(g, 'bottes_vent');
  g.bus.emit('toast', '👢 Pour Yvan : les bottes de vent ! Tu marches 4 fois plus vite (menu → 🎽 Équipement pour les retirer).');
  return true;
}
