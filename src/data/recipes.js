// Recettes qu'on connaît et qu'on fabrique n'importe où (onglet « Recettes »). Au début : seulement le feu.
// lot 8 : lvl = niveau du joueur requis (recettes du début : niveau 1 ; les autres 💡 en attendant les choix de l'utilisateur)
export const HAND_RECIPES = {
  campfire: { out: 'campfire', q: 1, in: { wood: 5, stone: 2 }, cat: 'feu', lvl: 1 },
  chest: { out: 'chest', q: 1, in: { wood: 80, stone: 20 }, cat: 'rangement', job: 'charpentier', lvl: 1 },   // 18/11 : plan acheté chez Harry Fordson (quête secondaire)
  lit: { out: 'bed', q: 1, in: { wood: 50, stone: 10 }, cat: 'deco', job: 'charpentier', lvl: 1 },   // 18/11 : plan acheté chez Harry (💡 50 bois + 10 pierres)
  chaudron: { out: 'chaudron', q: 1, in: { stone: 20, wood: 10 }, cat: 'feu', job: 'forgeron', lvl: 1 },   // 💡 patron acheté à la forge
  bague_cuivre: { out: 'bague_cuivre', q: 1, in: { copper_ore: 3, stone: 2 }, cat: 'bijoux', job: 'joaillier', lvl: 4 },
  tisane: { out: 'tisane', q: 1, in: { berry: 2, paquerette: 2 }, cat: 'potions', job: 'alchimiste', lvl: 2 },
  bonnet: { out: 'bonnet', q: 1, in: { wool: 2 }, cat: 'couture', job: 'couturier', lvl: 3 }
};
export const START_RECIPES = [];   // 20/11 : plus de feu de camp (la cuisine se fait au chaudron)
// Onglets des recettes, par type d'objet (les autres types viendront avec les nouvelles recettes).
export const RECIPE_CATS = { feu: '🔥 Feu et cuisine', rangement: '📦 Rangement', outils: '🛠️ Outils', armes: '⚔️ Armes', bijoux: '💍 Bijoux', potions: '⚗️ Potions', couture: '🧵 Couture', deco: '🪴 Décoration' };
// Cuisson au feu de camp : objet en main → objet cuit, en 5 secondes.
export const COOK = { berry: 'berry_cooked', mure: 'mure_grillee' };
export const COOK_MS = 5000;
// Buissons à baies de la ferme (fixes) : les baies repoussent tous les 2 jours.
// 3e valeur : 'mure' = ronce à mûres (sinon baies). 16/11 : plus de buissons et des mûres (demande de l'utilisateur, 💡 emplacements).
export const BUSHES = [[8, 16], [12, 17], [4, 27], [11, 34], [13, 29], [21, 22], [26, 17], [6, 15], [18, 26], [29, 22], [31, 15],
  [14, 32, 'mure'], [27, 32, 'mure'], [20, 30, 'mure'], [33, 27, 'mure'], [6, 22, 'mure']];
export const BERRY_DAYS = 2, BERRY_PICK = [2, 4];
export const MAX_FIRES = 3;
export const RECIPES = [
  { out: 'hay', q: 3, in: { wheat: 1 }, lvl: 1 },
  { out: 'fence', q: 1, in: { wood: 2 }, lvl: 1 },
  { out: 'potion', q: 1, in: { carrot: 2, egg: 1 }, lvl: 2 }
];
