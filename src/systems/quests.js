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
      { id: 'four', t: 'Aider le cuistot du restaurant (centre-ville) : réparer son four au marteau (30 pierres + 15 bois) — il te donnera son couteau', done: S => !!S.resto?.knife || !!S.tools?.knife },
      { id: 'grange', t: 'Rafistoler la grange (100 bois et 60 pierres) et y trouver la pelle, pour bêcher et planter', done: S => !!S.tools?.shovel }
    ]
  },
  // Lot 12 : se débloque en allant voir Rouky à la cabane du pêcheur
  rouky: {
    n: 'La canne de Rouky', i: '🎣', main: true, unlock: S => !!S.quests?.rouky?.met,
    steps: [
      { id: 'voir', t: 'Aller voir Rouky, le vieux pêcheur, à la cabane du pêcheur (au sud du centre-ville)', done: S => !!S.quests?.rouky?.met },
      { id: 'os', t: 'Trouver un os pour Rox : creuser les petits tas de terre à la pelle 🪏', done: S => (S.inv?.bone || 0) > 0 || !!S.tools?.rod },
      { id: 'donner', t: "Donner l'os à Rox (ou à Rouky) : il te donnera sa canne à pêche", done: S => !!S.tools?.rod }
    ]
  },
  // 18/11 : premières quêtes secondaires, visibles une fois la cabane retapée
  cabane2: {
    n: 'Agrandir la cabane', i: '🏠',
    steps: [
      { id: 'agrandir', t: "L'intérieur est tout petit et vide : agrandir la cabane, 160 bois et 60 pierres (marteau 🔨 devant la cabane)", done: S => isRepaired(S, 'house2') }
    ]
  },
  lit: {
    n: 'Un vrai lit', i: '🛏️',
    steps: [
      { id: 'plan', t: 'Acheter le plan du lit chez Harry Fordson, le charpentier (centre-ville)', done: S => (S.recipes || []).includes('lit') || S.bed === true },
      { id: 'fabriquer', t: 'Fabriquer le lit (📜 Recettes : 50 bois + 10 pierres)', done: S => (S.inv?.bed || 0) > 0 || S.bed === true },
      { id: 'installer', t: "L'installer dans la cabane (toucher l'emplacement du lit)", done: S => S.bed === true }
    ]
  },
  coffre: {
    n: 'Un coffre pour ranger', i: '📦',
    steps: [
      { id: 'plan', t: 'Acheter le plan du coffre chez Harry Fordson, le charpentier (centre-ville)', done: S => (S.recipes || []).includes('chest') },
      { id: 'fabriquer', t: 'Fabriquer un coffre (📜 Recettes : 80 bois + 20 pierres)', done: S => (S.chests || []).length > 0 || (S.inv?.chest || 0) > 0 }
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
// Les quêtes secondaires sont cachées au début : elles apparaissent une fois la cabane retapée (confirmé le 18/11).
export const questVisible = (S, id) => !!QUESTS[id] && (QUESTS[id].unlock ? QUESTS[id].unlock(S) : (QUESTS[id].main || isRepaired(S, 'house')));
export function questProgress(S, id) {
  const q = QUESTS[id], done = q.steps.map(s => s.done(S));
  const cur = done.indexOf(false);
  return { q, done, cur: cur < 0 ? q.steps.length : cur };
}
