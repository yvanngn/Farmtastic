// Quête journalière du panneau d'affichage (dès le 2e jour). Le 1er jour de quête est toujours simple.
// 💡 objets, quantités et récompenses proposés par Claude.
export const DAILY_FROM = 2;      // jour de la partie où le panneau propose sa première quête
// (CHEST_QUEST_FROM supprimé le 17/11 : plus de quête du bijou ; le coffre est une quête principale)
export const DAILY_FIRST = { item: 'wood', qty: 10, reward: 60 };
export const DAILY_POOL = [
  { item: 'wood', qty: 15, reward: 80 },
  { item: 'stone', qty: 10, reward: 80 },
  { item: 'berry', qty: 6, reward: 50 },
  { item: 'wheat', qty: 6, reward: 90 },
  { item: 'campfire', qty: 1, reward: 60 }
];
