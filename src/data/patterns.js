// soon: true = patron pas encore disponible (affiché « Bientôt »). Seul le chaudron est en vente pour l'instant.
// Patrons vendus dans les magasins : acheter un patron apprend une recette (onglet 📜 Recettes).
// 💡 prix et ingrédients proposés par Claude, sauf le chaudron (50 $ chez le forgeron, demande de l'utilisateur).
export const PATTERNS = {
  p_chaudron: { n: 'Patron du chaudron', recipe: 'chaudron', price: 50, shop: 'forge', job: 'forgeron' },
  p_bague: { n: 'Patron : bague de cuivre', recipe: 'bague_cuivre', price: 120, shop: 'forge', job: 'joaillier', soon: true },
  p_tisane: { n: 'Patron : tisane fleurie', recipe: 'tisane', price: 60, shop: 'stall', job: 'alchimiste', soon: true },
  p_bonnet: { n: 'Patron : bonnet de laine', recipe: 'bonnet', price: 80, shop: 'stall', job: 'couturier', soon: true },
  p_pain: { n: 'Patron : pain maison', recipe: 'pain', price: 40, shop: 'bakery', job: 'cuisinier', pot: true, soon: true },
  p_ragout: { n: 'Patron : ragoût', recipe: 'ragout', price: 90, shop: 'butcher', job: 'cuisinier', pot: true, soon: true },
  p_soupe_poisson: { n: 'Patron : soupe de poisson', recipe: 'soupe_poisson', price: 90, shop: 'fishmonger', job: 'cuisinier', pot: true, soon: true }
};
// Plats du chaudron : on remue à la louche (rester appuyé) jusqu'à ce que la jauge soit pleine.
export const POT_RECIPES = {
  confiture_baies: { out: 'confiture_baies', q: 1, in: { berry: 4 }, job: 'cuisinier', base: true, lvl: 1 },   // connue avec le chaudron (+45 ⚡)
  confiture_mures: { out: 'confiture_mures', q: 1, in: { mure: 3 }, job: 'cuisinier', base: true, lvl: 1 },   // 💡 3 mûres
  pain: { out: 'bread', q: 2, in: { flour: 2 }, job: 'cuisinier', lvl: 2 },   // lot 8 : 💡 niveaux
  ragout: { out: 'ragout', q: 1, in: { beef: 1, carrot: 1 }, job: 'cuisinier', lvl: 4 },
  soupe_poisson: { out: 'soupe_poisson', q: 1, in: { fish: 1, berry: 2 }, job: 'cuisinier', lvl: 3 }
};
export const POT_STIR = 0.1;     // jauge gagnée par coup de louche (10 coups)
export const MAX_POTS = 3;
