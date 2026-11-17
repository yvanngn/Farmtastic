// Nature : fleurs à cueillir, cailloux et filons à piocher (ferme, forêt, Caverne sombre ; jamais en ville),
// et arc-en-ciel les jours de pluie avec un trésor à son pied. Logique pure.
import { syncForest, FOREST_ROUTE, LAYOUTS } from '../world/scenes.js';
import { key, freeForObj, isSolid } from '../world/map.js';
import { CFG } from '../config.js';
import { FLOWERS } from '../data/items.js';
import { NATURE, VEINS, VEIN_HP, VEIN_ORE, ROCK_HP, P_RARE_FLOWER, P_MID_FLOWER, RAINBOW } from '../data/nature.js';
import { add, scatter } from './inventory.js';
import { useEnergy } from './player.js';
import { gainXp, toolTier, hasTool } from './skills.js';
import { MINING_GAIN, energyCost } from '../data/tools.js';
import { isWet } from './weather.js';
import { gainPxp, XP } from './level.js';

const dayId = S => S.year + '-' + S.season + '-' + S.day;
const size = sc => sc === 'farm' ? [CFG.W, CFG.H] : [LAYOUTS[sc][0].length, LAYOUTS[sc].length];

export const natureAt = (S, sc) => (S.nature && S.nature[sc]) || null;

// Case libre pour y faire pousser une fleur ou sortir un caillou.
export function freeSpot(S, sc, x, y) {
  const N = natureAt(S, sc), k = key(x, y);
  if (N && (N.flowers[k] || N.rocks[k])) return false;
  if (sc === 'farm') return freeForObj(x, y) && !(S.objs && S.objs[k]) && !(S.plots && S.plots[k]) && !(S.tilled && S.tilled[k]) && !isSolid({ ...S, scene: 'farm' }, x, y) && Math.hypot(x - S.x, y - S.y) > 2;
  const L = LAYOUTS[sc];
  if ((sc === 'montagne' || sc === 'plage') && L && L[y]) return 'ns'.includes(L[y][x]) && Math.hypot(x - S.x, y - S.y) > 2;
  if (!L || !L[y] || L[y][x] !== '.') return false;
  if (sc === 'foret') return x > 0 && x < 27 && !FOREST_ROUTE.has(key(x, y)) &&   // lot 8 : jamais de caillou sur le chemin du labyrinthe
    !(S.foret && S.foret.shrooms && S.foret.shrooms[k]);
  if (sc === 'wild') return !(S.wild && S.wild.rocks && S.wild.rocks[k]) && !(x < 4 && y < 7);
  return false;
}

function spot(g, sc, tries = 300) {
  const [w, h] = size(sc);
  for (let i = 0; i < tries; i++) { const x = 1 + (g.rnd() * (w - 2) | 0), y = 1 + (g.rnd() * (h - 2) | 0); if (freeSpot(g.S, sc, x, y)) return [x, y]; }
  return null;
}

export function pickVein(r) {
  const tot = Object.values(VEINS).reduce((a, v) => a + v.w, 0);
  let t = r * tot;
  for (const [id, v] of Object.entries(VEINS)) { if ((t -= v.w) < 0) return id; }
  return 'copper';
}

// Une fois par jour et par lieu : nouvelles fleurs (celles d'hier fanent), cailloux et filons complétés.
export function ensureNature(g, sc) {
  if (sc === 'foret') syncForest(g.S);   // lot 11
  const C = NATURE[sc];
  if (!C) return null;
  const S = g.S; S.nature ||= {};
  const N = S.nature[sc] ||= { day: null, flowers: {}, rocks: {} };
  if (N.day === dayId(S)) return N;
  N.day = dayId(S); N.flowers = {};
  const fl = FLOWERS[S.season];
  for (let i = 0; i < C.flowers; i++) {
    const p = spot(g, sc); if (!p) break;
    const v = g.rnd(); N.flowers[key(...p)] = v < P_RARE_FLOWER ? fl[2].id : v < P_RARE_FLOWER + P_MID_FLOWER ? fl[1].id : fl[0].id;
  }
  const rocks = Object.values(N.rocks).filter(o => o.t === 'rock').length;
  for (let i = 0; i < Math.min(C.rocksDay, C.rocks - rocks); i++) { const p = spot(g, sc); if (p) N.rocks[key(...p)] = { t: 'rock', hp: ROCK_HP }; }
  const veins = Object.values(N.rocks).filter(o => o.t === 'vein').length;
  if (veins < C.veins && g.rnd() < C.veinP) { const p = spot(g, sc); if (p) N.rocks[key(...p)] = { t: 'vein', v: pickVein(g.rnd()), hp: VEIN_HP }; }
  return N;
}

// Farmwest (lot 5) : fleurs et champignons se cueillent au couteau, en restant appuyé : une petite jauge se remplit
// (CUEILLE_HITS coups d'action, l'action se répète quand on garde le doigt appuyé). Renvoie false sans couteau,
// 'progress' pendant la jauge, true quand c'est cueilli.
export const CUEILLE_HITS = 3;
export const KNIFE_FLOWER = "Je ne vais pas arracher ces fleurs à la main… Il me faudrait un couteau pour les couper proprement.";
export function cueillir(g, x, y, needLine) {
  const S = g.S, sc = S.scene || 'farm', k = sc + ':' + key(x, y);
  if (!(S.tools && S.tools.knife)) {
    if (g.now() - (g.knifeT || -1e9) > 4000) { g.knifeT = g.now(); g.bus.emit('toast', needLine); }
    return false;
  }
  if (!g.cueille || g.cueille.k !== k) g.cueille = { k, scene: sc, x, y, n: 0 };
  g.cueille.n++;
  if (g.cueille.n < CUEILLE_HITS) { g.bus.emit('sfx', 'ui'); return 'progress'; }
  g.cueille = null;
  return true;
}
export function pickFlower(g, x, y) {
  const S = g.S, N = natureAt(S, S.scene || 'farm'), k = key(x, y), id = N && N.flowers[k];
  if (!id) return null;
  const c = cueillir(g, x, y, '🌸 ' + KNIFE_FLOWER); if (c !== true) return c;
  delete N.flowers[k];
  add(g, id, 1);
  gainPxp(g, XP.small, 'flower');   // lot 8
  g.bus.emit('sfx', 'collect'); g.bus.emit('pop', { t: '+🌸', x, y });
  return id;
}

// Caillou ou filon : coups de pioche ; un filon demande plus de coups, quel que soit son minerai.
export function hitNature(g, x, y) {
  const S = g.S, N = natureAt(S, S.scene || 'farm'), k = key(x, y), o = N && N.rocks[k];
  if (!o) return false;
  if (S.sel !== 'pick') { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', hasTool(S, 'pick') ? 'Il faut la pioche ⛏️' : 'Il te faut une pioche.'); return false; }
  const tier = toolTier(S, 'pick');
  if (!useEnergy(g, energyCost(tier))) return false;
  o.hp -= tier; o.shake = 0.25;
  g.bus.emit('swing', 'pick'); g.bus.emit('objHit', { x, y, t: 'rock', broken: o.hp <= 0 });
  g.bus.emit('sfx', o.hp <= 0 ? 'break' : 'pick');
  gainXp(g, 'mining', MINING_GAIN.hit);
  if (o.hp <= 0) {
    delete N.rocks[k];
    gainPxp(g, XP.small, 'rock');   // lot 8
    scatter(g, 'stone', 1, x, y);
    let txt = '+1🪨';
    if (o.t === 'vein') {
      const V = VEINS[o.v], n = VEIN_ORE[0] + (g.rnd() * (VEIN_ORE[1] - VEIN_ORE[0] + 1) | 0);
      scatter(g, V.ore, n, x, y); gainXp(g, 'mining', 15); txt += ` +${n} ${V.n.replace('Filon', 'minerai')}`;
      if (o.v === 'gold') { g.bus.emit('sfx', 'levelup'); g.bus.emit('toast', "De l'or ! ✨"); }
    }
    g.bus.emit('pop', { t: txt, x, y });
  }
  return true;
}

// Arc-en-ciel : décidé chaque matin de pluie ; trésor sur une case libre de la ferme.
export function rollRainbow(g) {
  const S = g.S;
  S.rainbow = null;
  if (!isWet(S.weather) || g.rnd() >= RAINBOW.p) return null;
  const p = spot(g, 'farm'); if (!p) return null;
  const from = RAINBOW.from[0] + (g.rnd() * (RAINBOW.from[1] - RAINBOW.from[0]) | 0);
  return (S.rainbow = { day: dayId(S), from, to: from + RAINBOW.length, x: p[0], y: p[1], found: false, told: false });
}
export const rainbowVisible = S => !!(S.rainbow && !S.rainbow.found && S.rainbow.day === dayId(S) && S.minute >= S.rainbow.from && S.minute < S.rainbow.to);

// Annonce une seule fois quand l'arc-en-ciel apparaît.
export function rainbowTick(g) {
  const S = g.S, R = S.rainbow;
  if (!rainbowVisible(S) || R.told) return false;
  R.told = true;
  g.bus.emit('toast', "🌈 Un arc-en-ciel au-dessus de la ferme ! On dit qu'un trésor se cache à son pied…");
  return true;
}

export function digTreasure(g, x, y) {
  const S = g.S, R = S.rainbow;
  if ((S.scene || 'farm') !== 'farm' || !rainbowVisible(S) || R.x !== x || R.y !== y) return null;
  R.found = true;
  const m = RAINBOW.money[0] + (g.rnd() * (RAINBOW.money[1] - RAINBOW.money[0] + 1) | 0);
  S.money += m;
  const ore = VEINS[pickVein(0.5 + g.rnd() * 0.5)].ore; add(g, ore, 2);   // plutôt les minerais rares
  const fl = FLOWERS[S.season][2].id; add(g, fl, 1);
  g.bus.emit('sfx', 'levelup');
  g.bus.emit('toast', `🌈 Trésor ! +${m} $, du minerai et une fleur rare.`);
  g.bus.emit('pop', { t: '+' + m + '$', x, y });
  return { money: m, ore, flower: fl };
}
