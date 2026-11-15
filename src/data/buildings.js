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
export const FARM_LOTS = [
  { id: 0, n: 'Ferme du Nord', x: .5, y: .16 },
  { id: 1, n: 'Ferme de l\'Est', x: .84, y: .5 },
  { id: 2, n: 'Ferme du Sud', x: .5, y: .84 },
  { id: 3, n: 'Ferme de l\'Ouest', x: .16, y: .5 }
];
