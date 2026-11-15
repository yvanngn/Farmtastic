// Bâtiments vendus par le charpentier. Ils se construisent sur leur emplacement, au nord de l'enclos.
// x0..x1 = colonnes occupées (lignes 6 et 7). door = porte vers un intérieur (sinon bâtiment fermé).
export const BUILDINGS = {
  coop: { n: 'Poulailler', un: 'un poulailler', plein: 'Poulailler complet', i: '🐔', x0: 23, x1: 25, cost: { money: 1500, wood: 40, stone: 10 }, cap: 8, for: 'poules et lapins', door: true },
  pigsty: { n: 'Porcherie', un: 'une porcherie', plein: 'Porcherie complète', i: '🐷', x0: 19, x1: 21, cost: { money: 2500, wood: 60, stone: 20 }, cap: 6, for: 'cochons' },
  barn: { n: 'Bergerie', un: 'une bergerie', plein: 'Bergerie complète', i: '🐑', x0: 27, x1: 30, cost: { money: 4000, wood: 80, stone: 30 }, cap: 6, for: 'moutons' }
};
export const BUILD_Y0 = 6, BUILD_Y1 = 7;
