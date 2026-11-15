// Quête d'Igor : il a perdu son bijou (« ici ou près de la cabane ») ; il est derrière la cabane.
// En le lui rendant, il nous apprend à fabriquer des coffres.
import { add } from './inventory.js';

export const JEWEL = { x: 4, y: 0 };   // derrière la cabane
export const igorQ = S => ((S.quests ||= {}).igor ||= {});
export const jewelHere = S => (S.scene || 'farm') === 'farm' && !!igorQ(S).asked && !igorQ(S).found;
export function pickJewel(g, x, y) {
  const S = g.S;
  if (!jewelHere(S) || x !== JEWEL.x || y !== JEWEL.y) return false;
  igorQ(S).found = true; add(g, 'igor_bijou', 1);
  g.bus.emit('sfx', 'levelup'); g.bus.emit('toast', '💍 Un bijou ! Ce doit être celui d’Igor.');
  return true;
}
// Parler à Igor : demande le bijou, rappel, ou remerciements (+ recette du coffre). Renvoie true si la quête a parlé.
export function igorTalk(g, n) {
  const S = g.S, q = igorQ(S), say = (lines, extra) => g.bus.emit('say', { name: n.name, color: n.color, voice: n.voice, lines, ...extra });
  if (q.done) return false;
  if ((S.inv.igor_bijou || 0) > 0) {
    add(g, 'igor_bijou', -1); q.done = true;
    S.recipes = [...new Set([...(S.recipes || []), 'chest'])];
    const r = S.social[n.id]; if (r) r.points += 120;
    say(n.thanks);
    g.bus.emit('toast', '📦 Nouvelle recette : le coffre (80 bois + 20 pierres) — onglet 🔥 Recettes');
    return true;
  }
  if (!q.asked) { q.asked = true; say(n.lost); return true; }
  say([n.reminder]); return true;
}
