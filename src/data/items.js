// Registre des objets. p = prix de vente, buy = prix boutique, seed = culture produite, eat = effets.
export const ITEMS = {
  wood: { n: 'Bois', p: 2, i: '🪵' },
  stone: { n: 'Pierre', p: 2, i: '🪨' },
  wheat_seed: { n: 'Graine de blé', p: 1, i: '🌱', seed: 'wheat', buy: 5 },
  corn_seed: { n: 'Graine de maïs', p: 3, i: '🌱', seed: 'corn', buy: 15 },
  carrot_seed: { n: 'Graine de carotte', p: 2, i: '🌱', seed: 'carrot', buy: 10 },
  wheat: { n: 'Blé', p: 6, i: '🌾' },
  corn: { n: 'Maïs', p: 18, i: '🌽' },
  carrot: { n: 'Carotte', p: 12, i: '🥕', eat: { e: 15 } },
  egg: { n: 'Œuf', p: 25, i: '🥚', eat: { e: 20, h: 5 } },
  hay: { n: 'Foin', p: 1, i: '🟨', buy: 10, keep: true },
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
  slime: { n: 'Gelée', p: 5, i: '🟢' },
  fence: { n: 'Clôture', p: 4, i: '🚧' },
  potion: { n: 'Potion', p: 30, i: '🧪', eat: { h: 40 }, keep: true }
};

export const TOOLS = [
  { id: 'hand', n: 'Main', i: '✋' },
  { id: 'axe', n: 'Hache', i: '🪓' },
  { id: 'pick', n: 'Pioche', i: '⛏️' },
  { id: 'sickle', n: 'Faucille', i: '🔪' },
  { id: 'sword', n: 'Épée', i: '🗡️' }
];
