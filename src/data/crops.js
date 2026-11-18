// Cultures façon Hay Day : grow = secondes réelles, yield = quantité récoltée.
export const CROPS = {
  wheat: { grow: 1200, days: 1, yield: 2, extra: { straw: 3 }, c: '#e6c34a' },   // 18/11 : 1 jour (≈ 20 min, ou le lendemain matin) ; 💡 + 3 pailles par carré
  corn: { grow: 180, yield: 2, c: '#f2d13b' },
  carrot: { grow: 120, yield: 2, c: '#ef7b2a' },
  hay: { grow: 90, yield: 3, c: '#c9b04a' }   // foin : nourriture des animaux
};
