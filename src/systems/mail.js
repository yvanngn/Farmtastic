// 18/11 (demande de l'utilisateur) : le lendemain du jour où l'on trouve la pelle, un courrier arrive dans la boîte aux lettres
// de la ferme, avec en pièce jointe des graines de blé. Le lire lance la quête principale « Le premier champ » et son tuto.
// La boîte sert aussi à la lettre de Golgolas (lot 13). Logique pure.
import { add } from './inventory.js';
import { readLetter, golgo } from './golgolas.js';

export const SEED_GIFT = 20;   // 💡 graines de blé jointes au courrier
export const SEED_MAIL = [
  "« Bonjour, et bienvenue sur ta ferme ! On m'a dit que tu avais retrouvé la vieille pelle de la grange.",
  "Je t'envoie de quoi commencer : des graines de blé. Le blé pousse en un jour, c'est parfait pour débuter.",
  "Bêche quelques carrés de terre, sème, et reviens le lendemain avec ta faucille. Bonne récolte ! — L'étal du marché »"
];
export const TUTO = [
  "📖 Tuto — ton premier champ :",
  "1. Prends la pelle 🪏 et touche l'herbe de ta ferme : chaque toucher bêche un carré (1 ⚡). Glisse pour en faire plusieurs.",
  "2. Ouvre le sac 🎒 et choisis les graines de blé 🌱, puis glisse le doigt sur tes carrés : tout se plante d'un coup.",
  "3. Le blé pousse en 1 jour. Le lendemain, prends la faucille et touche un épi mûr : tout le champ est récolté, sans bouger.",
  "4. La paille 🟫 se vend 1 $ au bac de vente ; garde un peu de blé pour cuisiner."
];
const M = S => (S.mail ||= {});
export const seedMail = S => S.mail || {};
export const hasUnread = S => !!(seedMail(S).seeds && !seedMail(S).seedsRead) || !!(golgo(S).letter && !golgo(S).read);

// Au lever du jour : si l'on avait la pelle la veille, le courrier arrive.
export function mailNewDay(g) {
  const S = g.S, m = M(S);
  if (m.seeds || !(S.tools && S.tools.shovel)) return false;
  m.seeds = true;
  g.bus.emit('toast', '📬 Du courrier t’attend dans la boîte aux lettres de la ferme !');
  return true;
}
// Toucher la boîte : d'abord le courrier des graines s'il n'est pas lu, sinon la lettre de Golgolas.
export function openMailbox(g) {
  const S = g.S, m = M(S);
  if (m.seeds && !m.seedsRead) {
    m.seedsRead = true;
    add(g, 'wheat_seed', SEED_GIFT);
    g.bus.emit('say', { name: 'Courrier', color: '#e6c34a', lines: [...SEED_MAIL, `📎 Pièce jointe : ${SEED_GIFT} graines de blé 🌱`, ...TUTO] });
    g.bus.emit('sfx', 'levelup'); g.bus.emit('toast', '📜 Nouvelle quête principale : Le premier champ'); g.bus.emit('inv');
    return 'seeds';
  }
  return readLetter(g);
}
