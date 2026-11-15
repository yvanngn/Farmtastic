// Animaux façon Stardew : nourrir + caresser chaque jour → produit tous les `every` jours.
// food = objet qui nourrit (null = pas besoin). roam = se promène librement (sinon enclos).
export const ANIMALS = {
// home = bâtiment nécessaire (vendu par le charpentier) ; null = vit librement.
  chicken: { n: 'Poule', prod: 'egg', every: 1, food: 'hay', buy: 400, i: '🐔', sound: 'cluck', home: 'coop' },
  rabbit: { n: 'Lapin', prod: 'rabbit_wool', every: 2, food: 'hay', buy: 800, i: '🐰', sound: 'squeak', home: 'coop' },
  pig: { n: 'Cochon', prod: 'truffle', every: 2, food: 'hay', buy: 1200, i: '🐷', sound: 'oink', home: 'pigsty' },
  sheep: { n: 'Mouton', prod: 'wool', every: 3, food: 'hay', buy: 1500, i: '🐑', sound: 'baa', home: 'barn' },
  dog: { n: 'Chien', prod: null, every: 0, food: null, buy: 600, i: '🐕', sound: 'woof', roam: true, home: 'kennel' },
  cat: { n: 'Chat', prod: null, every: 0, food: null, buy: 300, i: '🐱', sound: 'meow', roam: true, home: null }
};
