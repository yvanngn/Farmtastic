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
  hay: { n: 'Foin', p: 1, i: '🟨', buy: 40, keep: true },   // cher exprès : mieux vaut le cultiver (graines 4 $ → 3 foins)
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
  campfire: { n: 'Feu de camp', p: 0, i: '🔥', keep: true },           // à poser par terre ; on y cuit en tenant l'aliment 5 s
  berry: { n: 'Baies', p: 2, i: '🫐', eat: { e: 1 } },
  berry_cooked: { n: 'Baies grillées', p: 6, i: '🍒', eat: { e: 5 } },
  mure: { n: 'Mûres', p: 3, i: '🫐', eat: { e: 2 } },                     // 💡 un peu plus nourrissantes que les baies
  mure_grillee: { n: 'Mûres grillées', p: 8, i: '🍇', eat: { e: 6 } },
  chaudron: { n: 'Chaudron', p: 0, i: '🍲', keep: true },        // à poser ; on y cuisine à la louche
  louche: { n: 'Louche', p: 10, i: '🥄', keep: true, buy: 30 },   // 💡 prix ; vendue à la forge
  bague_cuivre: { n: 'Bague de cuivre', p: 90, i: '💍' },
  tisane: { n: 'Tisane fleurie', p: 30, i: '🍵', eat: { e: 15, h: 10 } },
  bonnet: { n: 'Bonnet de laine', p: 200, i: '🧢' },
  ragout: { n: 'Ragoût', p: 160, i: '🍲', eat: { e: 60, h: 10 } },
  soupe_poisson: { n: 'Soupe de poisson', p: 90, i: '🥣', eat: { e: 45 } },
  confiture_mures: { n: 'Confiture de mûres', p: 30, i: '🍯', eat: { e: 45 } },   // 16/11 : confitures (avant : soupes)
  confiture_baies: { n: 'Confiture de baies', p: 25, i: '🍯', eat: { e: 45 } },
  chest: { n: 'Coffre', p: 0, i: '📦', keep: true },             // appris auprès d'Igor ; à poser plus tard
  manteau: { n: 'Manteau d’hiver', p: 150, i: '🧥', keep: true, buy: 400 },   // protège du froid de la montagne (💡 vendu à l'étal du marché)
  barbe_papa: { n: 'Barbe à papa', p: 5, i: '🍭', eat: { e: 8 } },
  peluche: { n: 'Peluche', p: 30, i: '🧸', keep: true },
  peluche_geante: { n: 'Peluche géante', p: 120, i: '🐻', keep: true },
  backpack: { n: 'Sac à dos', p: 0, i: '🎒', keep: true },            // apporté du voyage
  tent: { n: 'Tente', p: 60, i: '⛺', keep: true, tent: true },        // à poser à côté de la cabane (💡 revente 60)
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
  { id: 'sword', n: 'Épée', i: '🗡️' },
  { id: 'rod', n: 'Canne à pêche', i: '🎣' },
  { id: 'hammer', n: 'Marteau', i: '🔨' },
  { id: 'knife', n: 'Couteau', i: '🔪' }   // Farmwest (lot 5) : récompense du cuistot ; fleurs et champignons
];

// Fleurs sauvages (💡 espèces et prix) : 3 par saison, la 3e plus rare. Serviront aux potions et à l'alchimie.
export const FLOWERS = [
  [{ id: 'paquerette', n: 'Pâquerette', p: 4, c: '#ffffff' }, { id: 'violette', n: 'Violette', p: 8, c: '#8a5ad0' }, { id: 'muguet', n: 'Muguet', p: 20, c: '#f2f6e0' }],
  [{ id: 'coquelicot', n: 'Coquelicot', p: 5, c: '#e0402a' }, { id: 'bleuet', n: 'Bleuet', p: 9, c: '#4a7ae8' }, { id: 'lavande', n: 'Lavande', p: 22, c: '#a07ae0' }],
  [{ id: 'bruyere', n: 'Bruyère', p: 5, c: '#d070b0' }, { id: 'souci', n: 'Souci', p: 9, c: '#f0a020' }, { id: 'colchique', n: 'Colchique', p: 24, c: '#c890e8' }],
  [{ id: 'perce_neige', n: 'Perce-neige', p: 8, c: '#ffffff' }, { id: 'hellebore', n: 'Hellébore', p: 14, c: '#e8b8c8' }, { id: 'edelweiss', n: 'Edelweiss', p: 35, c: '#e8e8d8' }]
];
for (const season of FLOWERS) for (const f of season) ITEMS[f.id] = { n: f.n, p: f.p, i: '🌸', flower: true };

// Minerais des filons (💡 prix) : du cuivre (courant) à l'or (rare).
Object.assign(ITEMS, {
  copper_ore: { n: 'Minerai de cuivre', p: 15, i: '🟠' },
  tin_ore: { n: "Minerai d'étain", p: 25, i: '⚪' },
  iron_ore: { n: 'Minerai de fer', p: 40, i: '⚫' },
  gold_ore: { n: "Minerai d'or", p: 100, i: '🟡' }
});

import { FISH } from './fish.js';
for (const f of FISH) ITEMS[f.id] = { n: f.n, p: f.p, i: f.i, eat: { e: Math.round(f.p / 8) }, fishItem: true };
