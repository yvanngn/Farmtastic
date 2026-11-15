// Registre des objets. p = prix de vente, buy = prix boutique, seed = culture produite, eat = effets.
export const ITEMS = {
  wood: { n: 'Bois', p: 2, i: '🪵' },
  stone: { n: 'Pierre', p: 2, i: '🪨' },
  wheat_seed: { n: 'Graine de blé', p: 1, i: '🌱', seed: 'wheat', buy: 5 },
  corn_seed: { n: 'Graine de maïs', p: 3, i: '🌱', seed: 'corn', buy: 15 },
  carrot_seed: { n: 'Graine de carotte', p: 2, i: '🌱', seed: 'carrot', buy: 10 },
  hay_seed: { n: 'Graine de foin', p: 1, i: '🌱', seed: 'hay', buy: 4 },
  wheat: { n: 'Blé', p: 6, i: '🌾' },
  corn: { n: 'Maïs', p: 18, i: '🌽' },
  carrot: { n: 'Carotte', p: 12, i: '🥕', eat: { e: 15 } },
  egg: { n: 'Œuf', p: 25, i: '🥚', eat: { e: 20, h: 5 } },
  hay: { n: 'Foin', p: 1, i: '🟨', buy: 40, keep: true },   // cher exprès : mieux vaut le cultiver (graines 4 🪙 → 3 foins)
  wool: { n: 'Laine', p: 120, i: '🧶' },
  rabbit_wool: { n: 'Laine de lapin', p: 90, i: '🤍' },
  bread: { n: 'Pain', p: 20, i: '🍞', buy: 40, eat: { e: 25 } },
  croissant: { n: 'Croissant', p: 30, i: '🥐', buy: 60, eat: { e: 35, h: 5 } },
  flour: { n: 'Farine', p: 15, i: '🥣', buy: 30 },
  beef: { n: 'Bœuf', p: 60, i: '🥩', buy: 120 },
  ham: { n: 'Jambon', p: 45, i: '🍖', buy: 90 },
  sausage: { n: 'Saucisse', p: 30, i: '🌭', buy: 60 },
  fish: { n: 'Poisson', p: 40, i: '🐟', buy: 80 },
  shrimp: { n: 'Crevettes', p: 55, i: '🦐', buy: 110 },
  salmon: { n: 'Saumon', p: 90, i: '🍣', buy: 180 },
  truffle: { n: 'Truffe', p: 160, i: '🍄' },
  ruby: { n: 'Rubis', p: 250, i: '♦️' },
  emerald: { n: 'Émeraude', p: 300, i: '💚' },
  slime: { n: 'Gelée', p: 5, i: '🟢' },
  fence: { n: 'Clôture', p: 4, i: '🚧' },
  potion: { n: 'Potion', p: 30, i: '🧪', eat: { h: 40 }, keep: true }
};

// Champignons de saison (forêt) : une espèce courante et une rare par saison, en 3 tailles.
// Le gros est rare et vaut bien plus ; l'espèce rare est chère. (💡 espèces et prix proposés par Claude)
export const MUSHROOMS = [
  [{ id: 'mousseron', n: 'Mousseron', p: 15, c: '#e8dcc0' }, { id: 'morille', n: 'Morille', p: 80, c: '#8a6a4a', rare: true }],
  [{ id: 'girolle', n: 'Girolle', p: 20, c: '#f2b33a' }, { id: 'oronge', n: 'Oronge', p: 90, c: '#e8602a', rare: true }],
  [{ id: 'cepe', n: 'Cèpe', p: 30, c: '#8a5a32' }, { id: 'truffe_blanche', n: 'Truffe blanche', p: 150, c: '#e8e0c8', rare: true }],
  [{ id: 'pied_mouton', n: 'Pied-de-mouton', p: 18, c: '#f0d8b0' }, { id: 'trompette', n: 'Trompette-de-la-mort', p: 70, c: '#3a3036', rare: true }]
];
export const SIZES = { s: { n: 'petit', k: 1 }, m: { n: 'moyen', k: 1.6 }, l: { n: 'gros', k: 3 } };
for (const season of MUSHROOMS) for (const m of season) for (const [sz, S] of Object.entries(SIZES))
  ITEMS[`${m.id}_${sz}`] = { n: `${m.n} (${S.n})`, p: Math.round(m.p * S.k), i: '🍄', mush: m.id };

export const TOOLS = [
  { id: 'hand', n: 'Main', i: '✋' },
  { id: 'axe', n: 'Hache', i: '🪓' },
  { id: 'pick', n: 'Pioche', i: '⛏️' },
  { id: 'sickle', n: 'Faucille', i: '🔪' },
  { id: 'shovel', n: 'Pelle', i: '🪏' },
  { id: 'sword', n: 'Épée', i: '🗡️' }
];
