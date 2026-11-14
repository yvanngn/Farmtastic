// Animaux façon Stardew : nourrir + caresser chaque jour → produit tous les `every` jours.
// food = objet qui nourrit (null = pas besoin). roam = se promène librement (sinon enclos).
export const ANIMALS = {
  chicken: { n: 'Poule', prod: 'egg', every: 1, food: 'hay', buy: 400, i: '🐔', sound: 'cluck' },
  rabbit: { n: 'Lapin', prod: 'rabbit_wool', every: 2, food: 'hay', buy: 800, i: '🐰', sound: 'squeak' },
  sheep: { n: 'Mouton', prod: 'wool', every: 3, food: 'hay', buy: 1500, i: '🐑', sound: 'baa' },
  cat: { n: 'Chat', prod: null, every: 0, food: null, buy: 300, i: '🐱', sound: 'meow', roam: true }
};
