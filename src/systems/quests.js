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
      { id: 'cabane', t: 'Retaper la cabane : 40 bois et 15 pierres (marteau 🔨 ; les pierres sont à la carrière, au nord de la ferme)', done: S => isRepaired(S, 'house') },
      { id: 'four', t: 'Aider le cuistot du restaurant (centre-ville) : réparer son four au marteau (30 pierres + 15 bois) — il te donnera son couteau', done: S => !!S.resto?.knife || !!S.tools?.knife },
      { id: 'grange', t: 'Rafistoler la grange (100 bois et 60 pierres) et y trouver la pelle, pour bêcher et planter', done: S => !!S.tools?.shovel }
    ]
  },
  // 18/11 : le courrier des graines (le lendemain de la pelle) lance le premier champ
  champ: {
    n: 'Le premier champ', i: '🌾', main: true, unlock: S => !!S.mail?.seedsRead,
    steps: [
      { id: 'courrier', t: 'Lire le courrier dans la boîte aux lettres de la ferme (graines de blé en pièce jointe)', done: S => !!S.mail?.seedsRead },
      { id: 'becher', t: 'Bêcher des carrés de terre à la pelle 🪏, sur l’herbe de la ferme', done: S => Object.keys(S.tilled || {}).length > 0 },
      { id: 'semer', t: 'Choisir les graines de blé dans le sac et glisser sur les carrés pour semer', done: S => Object.values(S.plots || {}).some(p => p.crop === 'wheat') || !!S.quests?.champ?.recolte },
      { id: 'recolter', t: 'Le lendemain, récolter tout le champ d’un coup à la faucille', done: S => !!S.quests?.champ?.recolte }
    ]
  },
  // 20/11 : Suzie, à l'étal de la place, apprend à vendre
  etal: {
    n: 'Le premier étal', i: '🧺', main: true, unlock: S => !!S.quests?.etal?.met,
    steps: [
      { id: 'suzie', t: "Rencontrer Suzie à l'étal de la place du panneau", done: S => !!S.quests?.etal?.met },
      { id: 'vendre', t: "Mettre un objet en vente à l'étal (moins c'est cher, plus ça part vite)", done: S => !!(S.stand && (S.stand.lots.length || S.stand.log.length)) },
      { id: 'vendu', t: 'Attendre que quelqu’un l’achète', done: S => !!(S.stand && S.stand.log.length) }
    ]
  },
  // 20/11 : Remy (une fois le four réparé) offre le plan du chaudron et apprend à cuisiner
  cuisine: {
    n: 'La cuisine du chef', i: '🍲', main: true, unlock: S => !!S.resto?.knife,
    steps: [
      { id: 'plan', t: 'Retourner voir Remy au restaurant', done: S => (S.recipes || []).includes('chaudron') },
      { id: 'fabriquer', t: 'Fabriquer le chaudron (📜 Recettes : 20 pierres + 10 bois)', done: S => (S.inv?.chaudron || 0) > 0 || (S.pots || []).length > 0 },
      { id: 'poser', t: 'Le poser sur la ferme (chaudron en main, toucher l’herbe)', done: S => (S.pots || []).length > 0 },
      { id: 'cuire', t: 'Y faire cuire des baies ou des mûres', done: S => (S.recipes || []).some(r => r === 'confiture_baies' || r === 'confiture_mures') }
    ]
  },
  // Lot 13 : la lettre de Golgolas (dès le niveau 5) ouvre la zone cachée au sud de la gare
  golgolas: {
    n: 'Le centre de Golgolas', i: '🧙', main: true, unlock: S => !!S.golgo?.read,
    steps: [
      { id: 'lettre', t: 'Lire la lettre de Golgolas (boîte aux lettres de la ferme)', done: S => !!S.golgo?.read },
      { id: 'meteorite', t: 'Casser la météorite devant son centre, au sud de la gare (environ 5000 coups de pioche)', done: S => (S.golgo?.hits || 0) >= 5000 },
      { id: 'materiaux', t: 'Apporter à Golgolas 500 bois, 500 pierres et 200 champignons', done: S => (S.golgo?.lvl || 0) >= 1 }
    ]
  },
  // Lot 29 : la lettre de l'inconnu, envoyée par le mineur au niveau 5
  grosrocher: {
    n: 'Le rocher du centre', i: '🪨', unlock: S => !!S.bigRock?.read,
    steps: [
      { id: 'lettre', t: 'Lire la lettre envoyée par le mineur (boîte aux lettres de la ferme)', done: S => !!S.bigRock?.read },
      { id: 'casser', t: "Casser l'énorme rocher au centre de la carrière (10 000 coups de pioche)", done: S => (S.bigRock?.hits || 0) >= 10000 }
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
      { id: 'agrandir', t: "L'intérieur est tout petit et vide : agrandir la cabane, 80 bois et 30 pierres (marteau 🔨 devant la cabane)", done: S => isRepaired(S, 'house2') }
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
