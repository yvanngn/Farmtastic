// Quêtes principales. Les étapes se déduisent de l'état de la partie (rien de plus à sauvegarder).
import { hearts } from './social.js';
import { isRepaired } from './repair.js';

export const QUESTS = {
  ghost: {
    n: 'Ghostbuster', i: '👻', main: true,
    steps: [
      { id: 'n1', t: 'Un hululement dans la nuit…', done: S => !!S.quests?.ghost?.n1 },
      { id: 'n2', t: 'Un « hoooou » la nuit suivante', done: S => !!S.quests?.ghost?.n2 },
      { id: 'n3', t: 'La 3e nuit, aller voir sur la ferme', done: S => !!S.quests?.ghost?.seen },
      { id: 'vanish', t: "S'approcher de l'esprit de la vieille femme", done: S => !!S.quests?.ghost?.vanish },
      { id: 'parler', t: "Trouver un moyen de lui parler (objet à venir)", done: S => !!S.quests?.ghost?.talked, locked: true }
    ]
  },
  debut: {
    n: 'Premiers pas', i: '🌱', main: true, order: 9,   // Farmwest (lots 4-5) : cabane, coffre, pioche, hache, couteau (four du cuistot), grange + pelle
    steps: [
      { id: 'tente', t: 'Ouvrir le sac 🎒, choisir la tente et « Déployer » à côté de la cabane', done: S => !!S.tent || isRepaired(S, 'house') },
      { id: 'nuit', t: 'Dès 18h il fait nuit : dormir sous la tente (pas couché à 1h → clinique et frais)', done: S => !!S.quests?.debut?.dormi || isRepaired(S, 'house') },
      { id: 'pioche', t: 'Trouver la pioche, posée contre la grange', done: S => !!S.tools?.pick },
      { id: 'hache', t: 'Trouver la hache, au pied du grand arbre de la ferme', done: S => !!S.tools?.axe },
      { id: 'feu', t: 'Faire un feu de camp (📜 Recettes : 5 bois + 2 cailloux)', done: S => (S.fires || []).length > 0 || (S.inv?.campfire || 0) > 0 || isRepaired(S, 'house') },
      { id: 'cabane', t: 'Retaper la cabane : 80 bois et 30 pierres (marteau 🔨)', done: S => isRepaired(S, 'house') },
      { id: 'coffre', t: 'Construire un coffre : Harry Fordson, le charpentier (centre-ville), t’apprend à le faire (80 bois + 20 pierres)', done: S => (S.chests || []).length > 0 || (S.inv?.chest || 0) > 0 },
      { id: 'four', t: 'Aider le cuistot du restaurant (centre-ville) : réparer son four au marteau (30 pierres + 15 bois) — il te donnera son couteau', done: S => !!S.resto?.knife || !!S.tools?.knife },
      { id: 'grange', t: 'Rafistoler la grange (100 bois et 60 pierres) et y trouver la pelle, pour bêcher et planter', done: S => !!S.tools?.shovel }
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
// Les quêtes secondaires sont cachées au début : elles apparaissent une fois la cabane retapée (💡 à confirmer).
export const questVisible = (S, id) => !!QUESTS[id] && (QUESTS[id].main || isRepaired(S, 'house'));
export function questProgress(S, id) {
  const q = QUESTS[id], done = q.steps.map(s => s.done(S));
  const cur = done.indexOf(false);
  return { q, done, cur: cur < 0 ? q.steps.length : cur };
}
