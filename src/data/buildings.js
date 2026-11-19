// Bâtiments vendus par le charpentier. Ils se construisent sur leur emplacement, au nord de l'enclos.
// x0..x1 = colonnes occupées (lignes 6 et 7). Chaque bâtiment a un intérieur avec sa mangeoire.
export const BUILDINGS = {
  coop: { n: 'Poulailler', un: 'un poulailler', plein: 'Poulailler complet', i: '🐔', x0: 23, x1: 25, cost: { money: 3000, wood: 40, stone: 10 }, cap: 8, for: 'poules et lapins', door: true },
  pigsty: { n: 'Porcherie', un: 'une porcherie', plein: 'Porcherie complète', i: '🐷', x0: 19, x1: 21, cost: { money: 5000, wood: 60, stone: 20 }, cap: 6, for: 'cochons', door: true },
  kennel: { n: 'Chenil', un: 'un chenil', plein: 'Chenil complet', i: '🐕', x0: 31, x1: 32, cost: { money: 2000, wood: 30, stone: 10 }, cap: 3, for: 'chiens' },
  barn: { n: 'Bergerie', un: 'une bergerie', plein: 'Bergerie complète', i: '🐑', x0: 27, x1: 30, cost: { money: 8000, wood: 80, stone: 30 }, cap: 6, for: 'moutons', door: true }
};
export const BUILD_Y0 = 6, BUILD_Y1 = 7;

// Établi de la maison : cassé au début, le charpentier le répare (💡 coût proposé par Claude).
export const WORKBENCH = { n: "Réparer l'établi", i: '🛠️', cost: { money: 800, wood: 20, stone: 5 } };

// Emplacements de ferme de départ autour du village : un par joueur (multijoueur).
// En solo, les autres restent « libres » mais sont déjà visibles sur la carte de la région.
// Les 4 fermes des joueurs, côte à côte en haut à gauche de la région, séparées par des chemins en croix.
export const FARM_LOTS = [
  // 19/11 : nouvelle disposition (voir docs/ROADMAP.md, lot 23) : la ferme principale au nord de la place du panneau,
  // la ferme du Sud-Ouest à l'ouest de la place, la ferme de l'Ouest à l'ouest de la principale, la ferme du Nord-Ouest au-dessus.
  { id: 0, n: 'La ferme principale', c: 1, r: 1 },
  { id: 1, n: 'Ferme du Sud-Ouest', c: 0, r: 2 },
  { id: 2, n: 'Ferme de l’Ouest', c: 0, r: 1 },
  { id: 3, n: 'Ferme du Nord-Ouest', c: 0, r: 0 }
];
// 19/11 : sorties de chaque ferme (N, S, E, O) : n° de ferme voisine ou zone ; absent = fermé (haie, barrière, falaise)
export const FARM_LINKS = {
  0: { N: 'carriere', S: 'place', E: 'foret', W: 2 },
  1: { N: 2, E: 'place' },
  2: { N: 3, S: 1, E: 0 },
  3: { S: 2, E: 'carriere' }
};
