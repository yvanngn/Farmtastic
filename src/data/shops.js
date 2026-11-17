// Commerces du village : ils ne vendent que les patrons (data/patterns.js) et les ingrédients de base.
// sells = objets vendus (prix d'achat = ITEMS[id].buy).
export const SHOPS = {
  bakery: { n: 'Boulangerie', i: '🥖', sells: ['flour'] },
  butcher: { n: 'Boucherie', i: '🥩', sells: ['beef', 'ham', 'sausage'] },
  fishmonger: { n: 'Poissonnerie', i: '🐟', sells: ['fish', 'shrimp', 'salmon'] },
  stall: { n: 'Magasin général',   // 💡 nom western (avant : Étal du marché)
    i: '🌱', sells: ['hay_seed', 'wheat_seed', 'carrot_seed', 'corn_seed', 'manteau'] },
  forge: { n: 'Forge d’Igor', i: '⚒️', sells: ['louche'] },
  feed: { n: 'Marchand d\'animaux', i: '🐾', sells: ['hay'] }
};
