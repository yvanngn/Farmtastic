// Bâtiments délabrés au début : on les rafistole en déposant bois et pierres (jauges).
export const REPAIRS = {
  house: { n: 'La cabane', need: { wood: 100, stone: 50 }, x0: 2, y0: 1, x1: 6, y1: 4 },
  grange: { n: 'La grange', need: { wood: 150, stone: 80 }, x0: 10, y0: 1, x1: 13, y1: 4 }   // 💡 quantités
};
export const REPAIR_STEP = 1;   // 1 bois et 1 pierre par coup de marteau : c'est long au début (demande de l'utilisateur)
// Outils posés dehors au début : la pioche contre la grange, la hache parmi les arbres au sud.
export const FIELD_TOOLS = [
  { tool: 'pick', x: 14, y: 3, n: 'la pioche', i: '⛏️' },
  { tool: 'axe', x: 6, y: 31, n: 'la hache', i: '🪓' }
];
export const AXE_GROVE = [[4, 30], [8, 30], [5, 32], [7, 33], [9, 32], [3, 33], [9, 29]];
// Arrivée en train : quai de la gare, à l'ouest de la ferme.
export const ARRIVAL = { x: 2.0, y: 20.6 };
