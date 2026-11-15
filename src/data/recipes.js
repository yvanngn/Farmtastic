// Recettes qu'on connaît et qu'on fabrique n'importe où (onglet « Recettes »). Au début : seulement le feu.
export const HAND_RECIPES = {
  campfire: { out: 'campfire', q: 1, in: { wood: 5, stone: 2 } },
  chest: { out: 'chest', q: 1, in: { wood: 80, stone: 20 } }   // appris auprès d'Igor
};
export const START_RECIPES = ['campfire'];
// Cuisson au feu de camp : objet en main → objet cuit, en 5 secondes.
export const COOK = { berry: 'berry_cooked' };
export const COOK_MS = 5000;
// Buissons à baies de la ferme (fixes) : les baies repoussent tous les 2 jours.
export const BUSHES = [[8, 16], [12, 17], [4, 27], [11, 34], [13, 29], [21, 22], [26, 17], [6, 15]];
export const BERRY_DAYS = 2, BERRY_PICK = [2, 3];
export const MAX_FIRES = 3;
export const RECIPES = [
  { out: 'hay', q: 3, in: { wheat: 1 } },
  { out: 'fence', q: 1, in: { wood: 2 } },
  { out: 'potion', q: 1, in: { carrot: 2, egg: 1 } }
];
