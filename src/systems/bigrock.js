// Lot 29 (demande de l'utilisateur, 20/11) : l'énorme rocher au centre du dédale de la carrière.
// - 10 000 coups de pioche, énergie d'un caillou ordinaire ; tous les 10 coups, 2 cailloux tombent, et plus rarement un minerai ;
// - à plusieurs, les coups sont partagés (le plus grand compte reçu des autres joueurs l'emporte, cf. src/net/multiplayer.js) ;
// - cassé, il laisse un trou vers le dédale profond (lot 30 ; en attendant, l'ancienne carrière profonde) ;
// - dès le niveau 5, le mineur envoie par courrier la lettre d'un inconnu trouvée à l'entrée : elle dit que le rocher se casse.
//   Elle arrive même si le rocher est déjà cassé (aucun effet de plus). Logique pure.
import { level, gainPxp, XP } from './level.js';
import { add, scatter } from './inventory.js';
import { useEnergy } from './player.js';
import { gainXp, toolTier, hasTool } from './skills.js';
import { energyCost, hitReady, MINING_GAIN } from '../data/tools.js';
import { VEINS } from '../data/nature.js';
import { pickVein } from './nature.js';
import { BIG_ROCK } from '../world/scenes.js';

export const ROCK_HITS = 10000, ROCK_EVERY = 10, ROCK_STONES = 2;
export const ROCK_ORE_P = 0.15;       // 💡 un minerai une fois sur 7 environ, à chaque volée de cailloux
export const ROCK_LETTER_LEVEL = 5;
export const ROCK_HOLE = { scene: 'carriere2', spawn: { x: 12.9, y: 15.3 } };   // ⏳ lot 30 : le dédale profond
const R = S => (S.bigRock ||= { hits: 0, letter: false, read: false, met: false });
export const bigRock = S => S.bigRock || { hits: 0, letter: false, read: false, met: false };
export const rockDone = S => bigRock(S).hits >= ROCK_HITS;
export const isBigRock = (sc, x, y) => sc === 'carriere' && x >= BIG_ROCK.x && x < BIG_ROCK.x + BIG_ROCK.w && y >= BIG_ROCK.y && y < BIG_ROCK.y + BIG_ROCK.h;
// Multijoueur : les coups des autres joueurs (on garde le plus grand compte).
export function mergeRockHits(S, n) { const st = R(S), v = Math.min(ROCK_HITS, Math.floor(+n) || 0); if (v > st.hits) { st.hits = v; return true; } return false; }

export function hitBigRock(g, enter) {
  const S = g.S, st = R(S);
  if (rockDone(S)) { if (enter) enter(ROCK_HOLE.scene, ROCK_HOLE.spawn); return 'hole'; }
  if (!hasTool(S, 'pick') || S.sel !== 'pick') { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', '⛏️ Un rocher immense… Il faudrait une pioche en main, et beaucoup de patience.'); return 'nopick'; }
  if (!hitReady(g)) return 'wait';
  const tier = toolTier(S, 'pick');
  if (!useEnergy(g, energyCost(tier))) return 'tired';
  st.hits = Math.min(ROCK_HITS, st.hits + 1);
  g.bus.emit('swing', 'pick'); g.bus.emit('sfx', 'pick'); g.bus.emit('rockHit', st.hits);
  gainXp(g, 'mining', MINING_GAIN.hit);
  const cx = BIG_ROCK.x + BIG_ROCK.w / 2, cy = BIG_ROCK.y + BIG_ROCK.h;
  if (st.hits % ROCK_EVERY === 0) {
    scatter(g, 'stone', ROCK_STONES, cx, cy); gainPxp(g, XP.small, 'rock');
    let txt = `+${ROCK_STONES}🪨`;
    if (g.rnd() < ROCK_ORE_P) { const v = VEINS[pickVein(g.rnd())]; scatter(g, v.ore, 1, cx, cy); txt += ' +1 ' + v.n.replace('Filon', 'minerai'); }
    g.bus.emit('pop', { t: txt, x: cx, y: cy });
  }
  if (rockDone(S)) { gainPxp(g, XP.quest, 'bigrock'); g.bus.emit('sfx', 'levelup'); g.bus.emit('toast', '💥 L’énorme rocher s’effondre ! Un trou s’ouvre dans le sol…'); }
  return 'hit';
}

// Le courrier du mineur, dès le niveau 5 (vérifié 4 fois par seconde, comme la lettre de Golgolas).
export function rockLetterTick(g) {
  const S = g.S, st = R(S);
  if (st.letter || level(S) < ROCK_LETTER_LEVEL) return false;
  st.letter = true;
  g.bus.emit('sfx', 'levelup'); g.bus.emit('toast', '📬 Du courrier t’attend dans la boîte aux lettres de la ferme !');
  return true;
}
export const ROCK_LETTER = [
  "Un mot du mineur de la carrière : « Je n'arrive pas à percer ce mystère. Toi, peut-être ? Voici la lettre que j'ai trouvée à l'entrée. »",
  "La lettre, d'une écriture inconnue : « Le grand rocher du centre n'est pas éternel. Celui qui le frappera assez longtemps verra ce qu'il cache. »"
];
export function readRockLetter(g) {
  const S = g.S, st = R(S);
  if (!st.letter) return 'empty';
  g.bus.emit('say', { name: 'Lettre du mineur', color: '#c8a878', lines: ROCK_LETTER });
  if (!st.read) { st.read = true; g.bus.emit('toast', '📜 Nouvelle quête : Le rocher du centre'); }
  return 'rockLetter';
}
// Parler au mineur : la première fois, il se présente.
export function minerTalk(g, n) {
  const S = g.S, st = R(S);
  if (st.met) return false;   // discussion normale ensuite
  st.met = true; g.bus.emit('say', { name: n.name, color: n.color, voice: n.voice, lines: n.intro });
  return true;
}
