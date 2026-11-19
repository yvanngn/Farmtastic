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
// lot 8 : beaucoup plus d'arbres et de cailloux au départ (💡 quantités)
export const FOREST = { x0: 34, MAX_TREES: 150, MAX_ROCKS: 70, TREES_PER_DAY: 4, ROCKS_PER_DAY: 3 };

// 19/11 : souches. Un arbre abattu laisse sa souche : coupée, elle donne encore un peu de bois (puis l'arbre ne revient qu'à la
// saison suivante) ; laissée, elle repousse au bout de 4 jours, petit à petit (jeune pousse → arbre en 3 jours).
export const STUMP_DAYS = 4, STUMP_HP = 2, STUMP_WOOD = [1, 2];
