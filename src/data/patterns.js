// Patrons vendus dans les magasins : acheter un patron apprend une recette (onglet 🔥 Recettes).
// 💡 prix et ingrédients proposés par Claude, sauf le chaudron (50 🪙 chez le forgeron, demande de l'utilisateur).
export const PATTERNS = {
  p_chaudron: { n: 'Patron du chaudron', recipe: 'chaudron', price: 50, shop: 'forge', job: 'forgeron' }
};
// Plats du chaudron : on remue à la louche (rester appuyé) jusqu'à ce que la jauge soit pleine.
export const POT_RECIPES = {
  soupe_baies: { out: 'soupe_baies', q: 1, in: { berry: 4 }, job: 'cuisinier' }
};
export const POT_STIR = 0.1;     // jauge gagnée par coup de louche (10 coups)
export const MAX_POTS = 3;
