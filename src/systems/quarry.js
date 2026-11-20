// 19/11 (demande de l'utilisateur) : la carrière, au nord des fermes, remplace les cailloux de la ferme. Ses cailloux et filons
// repoussent chaque jour (3 par jour, comme avant). Elle est bordée de gros cailloux cassables, plus longs à casser, qui
// repoussent 3 jours après. Chaque jour, une des trois bouches de la paroi nord est ouverte (au hasard du jour) :
// derrière, la carrière profonde (autre architecture, filons rares). Logique pure, sans hasard du navigateur.
import { LAYOUTS } from '../world/scenes.js';
import { key } from '../world/map.js';

export const BORDER_HP = 24;          // un caillou ordinaire en demande 6
export const BORDER_DAYS = 3;         // un gros caillou de bordure repousse au bout de 3 jours
export const BORDER_STONES = [4, 6];
import { quarryDay } from '../world/quarrymouth.js';
export const dayNum = quarryDay;

// Gros cailloux de bordure (cases « o ») : posés au premier passage, puis repoussent BORDER_DAYS jours après avoir été cassés.
export function ensureBorder(S, N) {
  const L = LAYOUTS.carriere, d = dayNum(S); N.broken ||= {};
  for (let y = 0; y < L.length; y++) for (let x = 0; x < L[y].length; x++) {
    if (L[y][x] !== 'o') continue;
    const k = key(x, y);
    if (N.rocks[k]) continue;
    if (N.broken[k] != null && d - N.broken[k] < BORDER_DAYS) continue;
    N.rocks[k] = { t: 'boulder', hp: BORDER_HP, border: true }; delete N.broken[k];
  }
  return N;
}
