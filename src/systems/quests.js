// Quêtes principales. Les étapes se déduisent de l'état de la partie (rien de plus à sauvegarder).
import { hearts } from './social.js';
import { isRepaired } from './repair.js';

export const QUESTS = {
  igor: {
    n: 'Un coffre pour ranger', i: '📦', from: 3,
    steps: [
      { id: 'rencontre', t: 'Parler à Igor, le forgeron, qui traîne dans le quartier', done: S => !!S.quests?.igor?.asked },
      { id: 'bijou', t: 'Retrouver son bijou : « ici, ou près de la cabane »', done: S => !!S.quests?.igor?.found },
      { id: 'rendre', t: 'Lui rapporter le bijou : il t’apprendra le coffre', done: S => !!S.quests?.igor?.done },
      { id: 'coffre', t: 'Fabriquer ton coffre (🔥 Recettes : 80 bois + 20 pierres)', done: S => (S.chests || []).length > 0 || (S.inv?.chest || 0) > 0 }
    ]
  },
  debut: {
    n: 'Premiers pas', i: '🌱',
    steps: [
      { id: 'tente', t: 'Ouvrir le sac 🎒, choisir la tente et « Déployer » à côté de la cabane', done: S => !!S.tent || isRepaired(S, 'house') },
      { id: 'nuit', t: 'Dès 18h il fait nuit : dormir sous la tente (sinon pas d’énergie le lendemain ; à 0 d’énergie, clinique et 10 % de frais)', done: S => !!S.quests?.debut?.dormi || isRepaired(S, 'house') },
      { id: 'outils', t: 'Trouver la pioche (contre la grange) et un outil pour couper les arbres', done: S => !!(S.tools?.pick && S.tools?.axe) },
      { id: 'feu', t: 'Faire un feu de camp (🔥 Recettes : 5 bois + 2 cailloux)', done: S => (S.fires || []).length > 0 || (S.inv?.campfire || 0) > 0 || isRepaired(S, 'house') },
      { id: 'cabane', t: 'Rafistoler la cabane : 100 bois et 50 pierres', done: S => isRepaired(S, 'house') }
    ]
  },
  franck: {
    n: 'Aider Franck à sortir', i: '🏠',
    steps: [
      { id: 'rencontre', t: 'Frapper chez Franck, le voisin de Luna, et lui dire bonjour', done: S => (S.social.franck?.talks || 0) > 0 },
      { id: 'confiance', t: 'Gagner sa confiance (2 cœurs) : il sortira un peu le soir', done: S => hearts(S.social.franck || { points: 0 }) >= 2 },
      { id: 'volets', t: 'Qu\'il ouvre ses volets (3 cœurs)', done: S => hearts(S.social.franck || { points: 0 }) >= 3 },
      { id: 'confie', t: 'Qu\'il se confie un peu (4 cœurs)', done: S => hearts(S.social.franck || { points: 0 }) >= 4 },
      { id: 'objet', t: "Lui fabriquer l'objet qui l'animera, à l'établi de la maison (objet à venir)", done: S => !!S.quests?.franck?.objet, locked: true }
    ]
  }
};
export function questProgress(S, id) {
  const q = QUESTS[id], done = q.steps.map(s => s.done(S));
  const cur = done.indexOf(false);
  return { q, done, cur: cur < 0 ? q.steps.length : cur };
}
