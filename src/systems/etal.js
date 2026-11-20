// 20/11 (demande de l'utilisateur) : quête « Le premier étal ». En arrivant près de l'étal de la place, on voit Suzie
// y mettre quelque chose en vente ; elle se présente, explique en gros comment vendre et donne un bois pour essayer. Logique pure.
import { SUZIE } from '../data/npcs.js';
import { STAND_POS } from '../world/scenes.js';
import { add } from './inventory.js';
export const SUZIE_STAND = { x: STAND_POS.x + 2.6, y: STAND_POS.y + 1.3 };
export const suzieAtStand = S => !(S.stand && S.stand.log && S.stand.log.length) || !(S.quests && S.quests.etal && S.quests.etal.fin);
export function etalTick(g) {
  const S = g.S, q = ((S.quests ||= {}).etal ||= {});
  if (S.scene !== 'place') return null;
  if (!q.met && Math.hypot(S.x - SUZIE_STAND.x, S.y - SUZIE_STAND.y) < 4.5) {
    q.met = true; add(g, 'wood', 1);
    g.bus.emit('say', { name: SUZIE.name, color: SUZIE.color, voice: SUZIE.voice, lines: SUZIE.etal, onEnd: () => g.bus.emit('toast', '🪵 Suzie t’a donné un morceau de bois. Touche l’étal pour le mettre en vente.') });
    return 'met';
  }
  if (q.met && !q.fin && S.stand && S.stand.log && S.stand.log.length) { q.fin = true; g.bus.emit('say', { name: SUZIE.name, color: SUZIE.color, voice: SUZIE.voice, lines: SUZIE.etalFin }); return 'fin'; }
  return null;
}
