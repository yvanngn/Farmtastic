// Zone de bois à l'est de la ferme : essences d'arbres, types de pierres, limites.
export const TREE_KINDS = {
  oak: { n: 'Chêne', wood: [3, 5] },
  pine: { n: 'Sapin', wood: [3, 5] },
  birch: { n: 'Bouleau', wood: [3, 5] }
};
export const TREE_KIND_IDS = Object.keys(TREE_KINDS);
export const TREE_GROW_DAYS = 3;        // pousse → arbre adulte en 3 jours
export const ROCK_DAYS = 3;             // une pierre met 3 jours à réapparaître
// Pierres : petite = 1 pierre, plus grosse = 2 pierres. Le gros rocher (pioche Cuivre) reste à part.
export const STONE_YIELD = { rock: 1, rock_big: 2 };
export const FOREST = { x0: 34, MAX_TREES: 70, MAX_ROCKS: 30, TREES_PER_DAY: 4, ROCKS_PER_DAY: 3 };
