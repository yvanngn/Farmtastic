// Commerces du village : ils ne vendent que les patrons (data/patterns.js) et les ingrédients de base.
// sells = objets vendus (prix d'achat = ITEMS[id].buy).
export const SHOPS = {
  bakery: { n: 'Boulangerie', i: '🥖', sells: ['flour'] },
  butcher: { n: 'Boucherie', i: '🥩', sells: ['beef', 'ham', 'sausage'] },
  fishmonger: { n: 'Poissonnerie', i: '🐟', sells: ['fish', 'shrimp', 'salmon'] },
  stall: { n: 'Magasin général',   // 💡 nom western (avant : Étal du marché)
    i: '🌱', sells: ['hay_seed', 'wheat_seed', 'carrot_seed', 'corn_seed', 'manteau'] },
  forge: { n: 'Forge d’Igor', i: '⚒️', sells: [] },   // 20/11 : plus besoin de louche
  feed: { n: 'Marchand d\'animaux', i: '🐾', sells: ['hay'] }
};

// 20/11 (demande de l'utilisateur) : se débarrasser de ses objets.
// - la décharge (place du panneau, à côté de la ferme) reprend TOUT à 50 % du prix de l'étal ; 💡 gérée plus tard par Balthazar ;
// - chaque marchand rachète ce qui correspond à ce qu'il vend, à 75 % du prix.
// (l'étal reste le meilleur prix : jusqu'au double.)
export const SELL_RATE = { dump: 0.5, shop: 0.75 };
const MUSH = /^(mousseron|morille|girolle|oronge|cepe|truffe_blanche|pied_mouton|trompette)_[sml]$/;
const FLOWERS = ['paquerette', 'violette', 'muguet', 'coquelicot', 'bleuet', 'lavande', 'bruyere', 'souci', 'colchique', 'perce_neige', 'hellebore', 'edelweiss'];
export const SHOP_BUYS = {
  bakery: id => ['wheat', 'flour', 'bread', 'croissant', 'corn'].includes(id),                                   // grains et pains
  butcher: id => ['beef', 'ham', 'sausage', 'bone', 'ragout'].includes(id),                                     // viandes
  fishmonger: (id, it) => !!it.fishItem || ['fish', 'shrimp', 'salmon', 'soupe_poisson'].includes(id),         // poissons
  stall: (id, it) => !!it.seed || MUSH.test(id) || FLOWERS.includes(id) || ['carrot', 'corn', 'berry', 'berry_cooked', 'mure', 'mure_grillee', 'confiture_mures', 'confiture_baies', 'tisane', 'truffle', 'barbe_papa', 'bonnet'].includes(id),   // magasin général : graines et produits de la terre
  forge: id => id === 'stone' || /_ore$/.test(id) || ['ruby', 'emerald', 'bague_cuivre'].includes(id),         // pierre, minerais, pierres précieuses
  feed: id => ['straw', 'wool', 'rabbit_wool', 'egg', 'slime'].includes(id),                                    // marchand d'animaux : produits des bêtes
  carpenter: id => ['wood', 'fence'].includes(id),                                                              // charpentier : bois
};
export const SHOP_NAMES = { bakery: 'la boulangerie', butcher: 'la boucherie', fishmonger: 'la poissonnerie', stall: 'le magasin général', forge: 'la forge', feed: 'le marchand d’animaux', carpenter: 'le charpentier' };
