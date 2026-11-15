// Quêtes principales. Les étapes se déduisent de l'état de la partie (rien de plus à sauvegarder).
import { hearts } from './social.js';

export const QUESTS = {
  franck: {
    n: 'Aider Franck à sortir', i: '🏠',
    steps: [
      { id: 'rencontre', t: 'Frapper chez Franck, le voisin de Luna, et lui dire bonjour', done: S => (S.social.franck?.talks || 0) > 0 },
      { id: 'confiance', t: 'Gagner sa confiance (2 cœurs) : il sortira un peu le soir', done: S => hearts(S.social.franck || { points: 0 }) >= 2 },
      { id: 'volets', t: 'Qu\'il ouvre ses volets (3 cœurs)', done: S => hearts(S.social.franck || { points: 0 }) >= 3 },
      { id: 'confie', t: 'Qu\'il se confie un peu (4 cœurs)', done: S => hearts(S.social.franck || { points: 0 }) >= 4 },
      { id: 'objet', t: "Lui fabriquer l'objet qui l'animera (atelier à débloquer)", done: S => !!S.quests?.franck?.objet, locked: true }
    ]
  }
};
export function questProgress(S, id) {
  const q = QUESTS[id], done = q.steps.map(s => s.done(S));
  const cur = done.indexOf(false);
  return { q, done, cur: cur < 0 ? q.steps.length : cur };
}
