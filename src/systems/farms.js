// 19/11 (demande de l'utilisateur) : les 4 fermes et leurs sorties. Disposition (voir FARM_LINKS dans world/map.js) :
//   Ferme du Nord-Ouest (3) | Carrière
//   Ferme de l'Ouest (2)    | Ferme principale (0) | Forêt
//   Ferme du Sud-Ouest (1)  | Place du panneau
//                           | Rond-point (fontaine)
//                           | Zone résidentielle
// La sienne est la scène « farm » ; celle d'un voisin est « farm:N ». Logique pure.
import { FARM_LOTS } from '../data/buildings.js';
import { FARM_LINKS } from '../data/buildings.js';
export { FARM_LINKS };
export const lotOf = S => (S.scene || 'farm') === 'farm' ? (S.farmLot || 0) : /^farm:\d$/.test(S.scene) ? +S.scene.slice(5) : null;
export const neighborLot = (lot, dir) => { const v = (FARM_LINKS[lot] || {})[dir]; return typeof v === 'number' ? v : null; };
export const sceneOfLot = (S, lot) => lot === (S.farmLot || 0) ? 'farm' : 'farm:' + lot;
// Où l'on arrive dans une ferme, selon le sens du déplacement (dir).
export function arrival(S, lot, dir) {
  if (lot === (S.farmLot || 0)) return { E: { x: 1.6, y: 18.5 }, W: { x: 46.2, y: 18.5 }, S: { x: 16.5, y: 1.4 }, N: { x: 16.5, y: 33.8 } }[dir];
  return { E: { x: 1.6, y: 9.9 }, W: { x: 28.2, y: 9.9 }, S: { x: 15.9, y: 1.8 }, N: { x: 15.9, y: 20.2 } }[dir];
}
// Arrivée dans une zone voisine d'une ferme (sens du déplacement).
const ZONE_IN = { carriere: { N: { x: 15.9, y: 19.4 }, E: { x: 1.6, y: 9.9 } }, place: { S: { x: 13, y: 1.8 }, E: { x: 1.6, y: 8.9 } }, foret: { E: { x: 1.6, y: 9.6 } } };
// Porte d'une ferme (« edge:N ») ou porte « lot » d'une zone → { to, spawn, lot?, name? } ; null sinon.
export function farmDoor(S, d) {
  if (d.to === 'lot') { const n = d.lot; return { to: sceneOfLot(S, n), spawn: arrival(S, n, d.dir), lot: n, name: FARM_LOTS[n].n }; }
  if (!d.to.startsWith('edge:')) return null;
  const lot = lotOf(S); if (lot == null) return null;
  const dir = d.to.slice(5), v = (FARM_LINKS[lot] || {})[dir];
  if (v == null) return { to: null };
  if (typeof v === 'number') return { to: sceneOfLot(S, v), spawn: arrival(S, v, dir), lot: v, name: FARM_LOTS[v].n };
  return { to: v, spawn: (ZONE_IN[v] || {})[dir] || { x: 2, y: 2 } };
}
