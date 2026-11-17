// Bâtiments délabrés au début : on les rafistole en déposant bois et pierres (jauges).
export const REPAIRS = {
  house: { n: 'La cabane', need: { wood: 80, stone: 30 }, x0: 2, y0: 1, x1: 6, y1: 4 },
  grange: { n: 'La grange', need: { wood: 100, stone: 60 }, x0: 10, y0: 1, x1: 13, y1: 4 }   // 💡 quantités
};
export const REPAIR_STEP = 1;   // 1 bois et 1 pierre par coup de marteau : c'est long au début (demande de l'utilisateur)
// Outils posés dehors au début : la pioche contre la grange, la hache au pied du grand arbre de la ferme (Farmwest).
export const FIELD_TOOLS = [
  { tool: 'pick', x: 14, y: 3, n: 'la pioche', i: '⛏️' },
  { tool: 'axe', x: 7, y: 31, n: 'la hache', i: '🪓' }   // lot 8 : plantée dans le tronc du grand arbre (case d'action à droite du tronc)
];
export const AXE_GROVE = [[4, 30], [9, 30], [5, 33], [9, 33], [3, 33], [10, 28]];
// Farmwest : chaque ferme a un grand arbre incassable ; la hache est plantée dans son tronc (lot 8).
export const BIG_TREE = { x: 6, y: 30 };
// Arrivée en train : quai de la gare, à l'ouest de la ferme.
export const ARRIVAL = { x: 2.0, y: 20.6 };
