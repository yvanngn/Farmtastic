// Farmwest (lot 5) : le restaurant du centre-ville. Le four du cuistot est en panne ; le réparer au marteau
// (30 pierres + 15 bois) rapporte le couteau, qui sert à cueillir les fleurs et les champignons. Logique pure.
import { has, add } from './inventory.js';
import { hasTool } from './skills.js';
import { isRepaired } from './repair.js';

export const OVEN_COST = { stone: 30, wood: 15 };
export const restoQ = S => (S.resto ||= { asked: false, oven: false, knife: false });

function giveKnife(g, n) {
  const S = g.S, q = restoQ(S);
  q.knife = true;
  if (!hasTool(S, 'knife')) { S.tools = { ...S.tools, knife: 1 }; S.sel = 'knife'; }   // jamais deux fois le même outil
  g.bus.emit('sfx', 'levelup'); g.bus.emit('toast', '🔪 Tu as reçu le couteau ! Fleurs et champignons se cueillent maintenant (reste appuyé).'); g.bus.emit('inv');
}
// Parler au cuistot : demande, rappel, ou remerciements + couteau. Renvoie true si la quête a parlé.
export function cuistotTalk(g, n) {
  const S = g.S, q = restoQ(S), say = (lines, extra) => g.bus.emit('say', { name: n.name, color: n.color, voice: n.voice, lines, ...extra });
  if (q.knife) return false;
  if (q.oven) { say(n.thanks, { onEnd: () => giveKnife(g, n) }); return true; }
  if (!q.asked) { q.asked = true; say(n.ask); return true; }
  say([n.reminder]); return true;
}
// Toucher le four : avec le marteau et le matériel, il est réparé.
export function repairOven(g) {
  const S = g.S, q = restoQ(S);
  if (q.oven) { g.bus.emit('toast', '🔥 Le four chauffe. Le cuistot est ravi.'); return 'ok'; }
  if (S.sel !== 'hammer') { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', 'Le four est fissuré… Il faudrait le marteau 🔨 pour le réparer.'); return 'need'; }
  const miss = Object.entries(OVEN_COST).filter(([k, n]) => !has(S, k, n));
  if (miss.length) { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', `Pour réparer le four : ${OVEN_COST.stone} 🪨 et ${OVEN_COST.wood} 🪵 (tu as ${S.inv.stone || 0} 🪨, ${S.inv.wood || 0} 🪵).`); return 'missing'; }
  for (const [k, n] of Object.entries(OVEN_COST)) add(g, k, -n);
  q.oven = true; q.asked = true;
  g.bus.emit('swing', 'hammer'); g.bus.emit('sfx', 'craft'); g.bus.emit('toast', '🔥 Le four est réparé ! Va le dire au cuistot.');
  g.bus.emit('ovenFixed');
  return 'fixed';
}

// Farmwest (lot 6) : Harry Fordson, le charpentier, apprend à faire le coffre une fois la cabane retapée (quête principale).
export function harryTalk(g, n) {
  const S = g.S;
  if ((S.recipes || []).includes('chest') || !isRepaired(S, 'house')) return false;
  S.recipes = [...(S.recipes || []), 'chest'];
  g.bus.emit('say', { name: n.name, title: n.title, color: n.color, voice: n.voice, lines: n.chest });
  g.bus.emit('sfx', 'levelup'); g.bus.emit('toast', '📦 Nouvelle recette : le coffre (80 bois + 20 pierres) — 📜 Recettes');
  return true;
}
