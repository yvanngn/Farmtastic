// Métiers : tout le monde peut les pratiquer et monter en niveau (10 niveaux). 💡 seuils et gains proposés par Claude.
export const JOBS = {
  forgeron: { n: 'Forgeron', i: '⚒️' },
  alchimiste: { n: 'Alchimiste', i: '⚗️' },
  couturier: { n: 'Couturier', i: '🧵' },
  joaillier: { n: 'Joaillier', i: '💍' },
  cuisinier: { n: 'Cuisinier', i: '🍳' },
  charpentier: { n: 'Charpentier', i: '🪚' }   // Farmwest (lot 6) : coffre, réparations au marteau
};
// XP totale pour atteindre le niveau i+1.
export const JOB_XP = [0, 40, 120, 250, 450, 700, 1000, 1400, 1900, 2500];
export const JOB_GAIN = 15;   // XP par objet fabriqué ou plat préparé
