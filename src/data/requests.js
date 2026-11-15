// Lot 7 — demandes du panneau d'affichage, avec un code couleur par famille.
// Toutes les valeurs (noms de chantiers, objectifs, coûts) sont des propositions de Claude (💡).
export const KINDS = {
  chantier: { n: 'Chantier du village', i: '🔨', color: '#e0893a', items: ['wood', 'stone', 'fence'], mult: 1.0 },
  fete: { n: 'Fête de saison', i: '🎉', color: '#e05a9a', items: ['wheat', 'corn', 'carrot', 'egg', 'wool', 'bread'], mult: 1.0 },
  habitant: { n: 'Demande d\'un habitant', i: '💚', color: '#4fb07a', items: [], mult: 1.1 },
  caravane: { n: 'Caravane commerciale', i: '🐪', color: '#d9b23a', items: ['wool', 'rabbit_wool', 'truffle', 'potion', 'slime', 'corn', 'egg'], mult: 0.6 }
};
// Probabilité de chaque famille quand une place se libère.
export const KIND_WEIGHTS = { chantier: 3, fete: 3, habitant: 2, caravane: 2 };

// Chantiers de reconstruction : une jauge commune (objets livrés), l'un après l'autre.
export const PROJECTS = [
  { id: 'lampadaires', n: 'Rallumer les lampadaires', goal: 60, reward: 400 },
  { id: 'place', n: 'Repaver la place du marché', goal: 120, reward: 700 },
  { id: 'pont', n: 'Réparer le vieux pont', goal: 200, reward: 1200 }
];
// Fête de saison : objets à réunir avant la fin de la saison.
export const FESTIVAL_GOAL = 50, FESTIVAL_REWARD = 500;
export const FESTIVALS = ['Fête des semailles', "Fête de l'été", 'Fête des récoltes', "Fête de l'hiver"];

// Caravane : chaque livraison donne des jetons, qui débloquent graines, animaux et outils.
export const UNLOCKS = [
  { id: 'carrot_seed', kind: 'graine', n: 'Graines de carotte', i: '🥕', cost: 2 },
  { id: 'corn_seed', kind: 'graine', n: 'Graines de maïs', i: '🌽', cost: 4 },
  { id: 'rabbit', kind: 'animal', n: 'Lapins', i: '🐰', cost: 5 },
  { id: 'pig', kind: 'animal', n: 'Cochons', i: '🐷', cost: 6 },
  { id: 'sheep', kind: 'animal', n: 'Moutons', i: '🐑', cost: 8 },
  { id: 'forge_or', kind: 'outil', n: 'Plans de forge Or et Iridium', i: '⚒️', cost: 10 }
];
