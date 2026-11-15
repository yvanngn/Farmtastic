// Forêt : chaque jour, des champignons de la saison poussent au pied des arbres.
// Taille petite / moyenne / grosse (la grosse est rare) ; une espèce rare et chère par saison.
import { LAYOUTS } from '../world/scenes.js';
import { key } from '../world/map.js';
import { MUSHROOMS } from '../data/items.js';
import { add } from './inventory.js';

export const SHROOMS_PER_DAY = 8, P_RARE = 0.12, P_BIG = 0.1, P_MEDIUM = 0.3;

export function ensureShrooms(g) {
  const S = g.S, day = S.year + '-' + S.season + '-' + S.day;
  S.foret ||= { day: null, shrooms: {} };
  if (S.foret.day === day) return S.foret.shrooms;
  const L = LAYOUTS.foret, out = {}, sp = MUSHROOMS[S.season];
  const nearTree = (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => L[y + b] && L[y + b][x + a] === 'T');
  for (let tries = 0, n = 0; n < SHROOMS_PER_DAY && tries < 600; tries++) {
    const x = 1 + (g.rnd() * 28 | 0), y = 1 + (g.rnd() * 16 | 0), k = key(x, y);
    if (L[y][x] !== '.' || out[k] || !nearTree(x, y) || x > 25) continue;
    const m = g.rnd() < P_RARE ? sp[1] : sp[0], v = g.rnd(), size = v < P_BIG ? 'l' : v < P_BIG + P_MEDIUM ? 'm' : 's';
    out[k] = { sp: m.id, size }; n++;
  }
  S.foret.day = day; S.foret.shrooms = out;
  return out;
}

// Ramasser le champignon d'une case (en marchant dessus ou avec le bouton d'action).
// Le couteau (à venir) sert à cueillir les champignons.
export const KNIFE_LINE = "Je préfère ne pas les ramasser à la main… même si c'est sûrement une idée reçue. Il me faudrait un couteau.";
export function pickShroom(g, x, y) {
  const S = g.S, k = key(x, y), m = S.foret && S.foret.shrooms[k];
  if (!m) return null;
  if (!(S.tools && S.tools.knife)) { // sans couteau, il préfère ne pas les cueillir à la main
    if (g.now() - (g.knifeT || -1e9) > 4000) { g.knifeT = g.now(); g.bus.emit('toast', `🍄 ${KNIFE_LINE}`); }
    return false;
  }
  delete S.foret.shrooms[k];
  const id = `${m.sp}_${m.size}`;
  add(g, id, 1);
  g.bus.emit('sfx', 'collect');
  g.bus.emit('pop', { t: '+🍄', x, y });
  if (m.size === 'l') g.bus.emit('toast', 'Un gros champignon ! 🍄');
  return id;
}
