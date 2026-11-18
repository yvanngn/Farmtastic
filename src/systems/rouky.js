// Lot 12 : Rouky, le vieux pêcheur, et son chien Rox (cabane du pêcheur, ancienne station balnéaire).
// Quête principale débloquée en allant le voir : trouver un os pour Rox → Rouky donne une canne à pêche sommaire. Logique pure.
import { add } from './inventory.js';

export const ROD_BASIC = 1;   // canne sommaire : plus lente, moins de poissons (améliorable plus tard)
const Q = S => ((S.quests ||= {}).rouky ||= {});
export const roukyMet = S => !!(S.quests && S.quests.rouky && S.quests.rouky.met);
export const hasRod = S => !!(S.tools && S.tools.rod);

// Rox est couché à côté de son maître (dehors le jour, dans la cabane le soir).
export const roxPos = n => n && n.scene && n.scene !== 'none' ? { scene: n.scene, x: n.x + 1.1, y: n.y + .3 } : null;
export function roxAt(g, x, y) {
  const p = roxPos(g.npcs.rouky);
  return !!p && p.scene === (g.S.scene || 'farm') && Math.floor(p.x) === x && Math.floor(p.y) === y;
}

// Donner l'os à Rox : Rouky donne la canne (une seule fois).
export function giveBone(g) {
  const S = g.S, n = g.npcs.rouky;
  if (!roukyMet(S) || hasRod(S) || !(S.inv.bone > 0)) return false;
  add(g, 'bone', -1);
  S.tools = { ...S.tools, rod: ROD_BASIC }; S.rodFound = true; S.sel = 'rod'; Q(S).bone = true;
  g.bus.emit('sfx', 'levelup');
  if (n) g.bus.emit('say', { name: n.name, color: n.color, voice: n.voice, lines: n.rod });
  g.bus.emit('toast', '🎣 Tu as reçu une canne à pêche sommaire ! Vise l’eau pour lancer.'); g.bus.emit('inv');
  return true;
}

// Toucher Rox : il prend l'os s'il y en a un, sinon il remue la queue.
export function petRox(g) {
  if (giveBone(g)) return 'bone';
  g.bus.emit('sfx', 'ui');
  g.bus.emit('toast', roukyMet(g.S) && !hasRod(g.S) ? '🐕 Rox renifle tes poches… Il cherche un os.' : '🐕 Rox remue la queue.');
  return 'rox';
}

// Parler à Rouky : la première fois, il se présente et la quête commence ; ensuite, il rappelle l'os ou le prend.
export function roukyTalk(g, n) {
  const S = g.S, say = lines => g.bus.emit('say', { name: n.name, color: n.color, voice: n.voice, lines });
  if (!roukyMet(S)) { Q(S).met = true; say(n.intro); g.bus.emit('toast', '📜 Nouvelle quête principale : La canne de Rouky'); return true; }
  if (hasRod(S)) return false;   // discussion normale
  if (S.inv.bone > 0) return giveBone(g);
  say(n.need); return true;
}
