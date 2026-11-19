// Quête « Ghostbuster » : 1re nuit un hululement, 2e nuit un « hoooou », 3e nuit on va voir sur la ferme :
// l'esprit d'une vieille femme qui pleure, qui disparaît quand on s'approche. Lui parler viendra plus tard (objet à venir).
import { GHOST, GHOST_LINES } from '../data/npcs.js';

const dayNo = S => (S.year - 1) * 120 + S.season * 30 + S.day;
export const ghostQ = S => ((S.quests ||= {}).ghost ||= {});
const think = (g, lines) => g.bus.emit('say', { name: g.S.name, color: '#ffdf8a', lines });
const night = S => S.minute >= GHOST.from;
// Visible : 3e nuit (ou après), sur la ferme, la nuit, tant qu'on ne l'a pas fait fuir.
export const ghostVisible = S => { const q = ghostQ(S); return !!q.n3 && !q.vanish && (S.scene || 'farm') === 'farm' && night(S); };

export function ghostTick(g) {
  const S = g.S, q = ghostQ(S), d = dayNo(S);
  if (q.vanish || !night(S)) return null;
  if (!q.n1) { q.n1 = d; think(g, GHOST_LINES.n1); return 'n1'; }
  if (!q.n2) { if (d > q.n1) { q.n2 = d; think(g, GHOST_LINES.n2); return 'n2'; } return null; }
  if (!q.n3) { if (d > q.n2 && (S.scene || 'farm') === 'farm') { q.n3 = d; think(g, GHOST_LINES.n3); return 'n3'; } return null; }
  if (!ghostVisible(S)) return null;
  const dist = Math.hypot(GHOST.x + .5 - S.x, GHOST.y + .5 - S.y);
  if (!q.seen && dist < 7) { q.seen = true; think(g, [GHOST_LINES.pleure]); return 'seen'; }
  if (q.seen && dist < GHOST.near) { q.vanish = true; g.bus.emit('sfx', 'stars'); think(g, GHOST_LINES.vanish); return 'vanish'; }
  return null;
}
