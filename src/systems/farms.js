// 19/11 (demande de l'utilisateur) : on peut aller sur les 3 autres fermes, en solo comme à plusieurs. Les 4 fermes forment
// un carré 2 × 2 (Nord-Ouest, Nord-Est, Sud-Ouest, Sud-Est) : depuis la ferme de droite on ne va qu'à gauche, etc.
// La sienne est la scène « farm » ; celle d'un voisin est « farm:N » (N = emplacement). Logique pure.
import { FARM_LOTS } from '../data/buildings.js';
import { lotCR } from '../world/map.js';
export const lotOf = S => (S.scene || 'farm') === 'farm' ? (S.farmLot || 0) : /^farm:\d$/.test(S.scene) ? +S.scene.slice(5) : null;
const STEP = { E: [1, 0], W: [-1, 0], N: [0, -1], S: [0, 1] };
export function neighborLot(lot, dir) {
  const { c, r } = lotCR(lot), [dc, dr] = STEP[dir], nc = c + dc, nr = r + dr;
  return nc < 0 || nc > 1 || nr < 0 || nr > 1 ? null : nr * 2 + nc;
}
export const sceneOfLot = (S, lot) => lot === (S.farmLot || 0) ? 'farm' : 'farm:' + lot;
// Où l'on arrive, selon le côté par lequel on entre (dir = sens du déplacement).
export function arrival(S, lot, dir) {
  const mine = lot === (S.farmLot || 0);
  if (mine) return { E: { x: 1.6, y: 5.5 }, W: { x: 46.2, y: 5.5 }, S: { x: 30.9, y: 1.6 }, N: { x: 30.9, y: 34.2 } }[dir];
  return { E: { x: 1.6, y: 10 }, W: { x: 28.2, y: 10 }, S: { x: 16, y: 1.8 }, N: { x: 16, y: 20.2 } }[dir];
}
// Porte vers une ferme voisine ? → { scene, spawn, name } ; null sinon.
export function farmDoor(S, d) {
  const lot = lotOf(S); if (lot == null) return null;
  let dir = d.to.startsWith('lot:') ? d.to.slice(4) : null;
  if (!dir && d.to === 'foret' && lotCR(lot).c === 0) dir = 'E';   // colonne de gauche : à l'est, c'est la ferme voisine
  if (!dir) return null;
  const n = neighborLot(lot, dir); if (n == null) return null;
  return { scene: sceneOfLot(S, n), spawn: arrival(S, n, dir), lot: n, name: FARM_LOTS[n].n };
}
