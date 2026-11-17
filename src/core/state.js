import { CFG } from '../config.js';
import { LEVELS } from '../systems/level.js';

// État sauvegardé d'un joueur. Tout ce qui doit persister vit ici, rien d'autre.
export function defaultState() {
  return {
    v: CFG.VERSION, name: 'Cloud Jimny',   // nom par défaut (modifiable à la création)
    look: { body: 'h', bottom: 'pant', skin: '#f6d2b0', hair: 0, hairC: '#7a4a22', shirt: '#b08a5a', pants: '#3a4a8a', overalls: '#4a8a3a' },   // 17/11 : salopette verte (planche de l'utilisateur)
    money: 500, energy: 100, maxE: 100, hp: 100, maxHp: 100,
    day: 1, season: 0, year: 1, minute: CFG.DAY_START, weather: 'sun',
    inv: { tent: 1 },   // 17/11 : seulement la tente au départ (plus de graines, de foin ni de sac à dos)
    sel: 'hand', invOrder: [], saleLog: [], chests: [], fishLog: {}, parc: {},   // poissons pêchés : { id: { n, best, first, last } }   // coffres posés { x, y, items }   // ordre des cases choisi par le joueur
    tent: null, bed: false, recipes: ['campfire'], fires: [], bushes: {}, tips: {}, pots: [],   // recettes connues, feux posés, buissons cueillis (jour)          // tente posée {x,y} ; lit de la maison à construire
    x: 4.5, y: 7.6, dir: 3,          // Farmwest : on descend de la locomotive, sur le quai de la gare (scène « gare »)
    plots: {}, objs: null,
    animals: [],
    built: { coop: false, pigsty: false, kennel: false, barn: false },
    social: {}, savedAt: 0,
    scene: 'gare', invSlots: CFG.INV_SLOTS, stackLvl: 0, rockQueue: [],
    village: { done: [], progress: 0 }, festival: null, caravan: { tokens: 0, unlocked: [] },
    skills: { mining: { xp: 0 } }, jobs: {},   // métiers { forgeron: { xp } … }
    tools: { hammer: 1 },            // seulement le marteau au départ (réparations) ; les autres outils se trouvent
    intro: { met: true, myst: 'wait', arrived: false, step: 'train' },   // Farmwest : train → Myst → diligence → choix de la ferme   // arrivée en train ; Myst attend sur le quai et accueille le joueur
    repair: { house: { wood: 0, stone: 0 }, grange: { wood: 0, stone: 0 } },   // cabane et grange délabrées au début
    tilled: {},
    farmLot: 0, game: null,          // partie en cours { id, code, mode: 'solo'|'multi' }                      // emplacement de ferme de ce joueur (multijoueur : un par joueur)
    drops: [],                       // objets posés au sol (sac plein)
    workbench: false,                // établi de la maison, à faire réparer par le charpentier
    wildOpen: false, seaOpen: false, rodFound: false, wild: null, nature: {}, rainbow: null,     // Caverne sombre (zone de combat), fermées au début                      // cases du champ bêchées (à la pelle)           // accueil du chef du village
    grange: { found: [], broken: [] },
    market: { slots: [] },
    lastDream: -1,                   // lot 8 : dernier rêve de la nuit (pas deux fois de suite le même)
    pxp: 0,                          // lot 8 : expérience du joueur (le niveau s'en déduit)
    craftQ: {},                      // lot 9 : demandes de fabrication de la semaine { habitant|'panneau': { week, item, qty, reward, done } }
    xpQuests: null                   // lot 8 : quêtes et étapes qui ont déjà rapporté de l'XP (null = à initialiser)
  };
}

// Migration douce : les champs absents d'une vieille sauvegarde prennent la valeur par défaut.
export function migrate(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const s = Object.assign(defaultState(), raw);
  const d = defaultState();
  s.look = Object.assign(d.look, raw.look || {});
  // Avant le lot 8, on avait tous les outils et pas d'accueil : on garde ça pour les anciennes parties.
  s.tools = raw.tools ? { ...raw.tools } : { axe: 1, pick: 1, sickle: 1, sword: 1 };
  if (!s.tools.hammer) s.tools.hammer = 1;   // tout le monde a un marteau
  if (!raw.intro) s.intro = { met: true };
  // Avant la cabane à rafistoler : tout était déjà debout, Myst déjà passé.
  if (raw.bed === undefined) s.bed = true;   // anciennes parties : le lit existait déjà
  if (!raw.repair) { s.repair = { house: { wood: 100, stone: 50 }, grange: { wood: 150, stone: 80 } }; s.intro = { ...s.intro, myst: 'done', arrived: true }; }
  s.intro = { met: true, myst: 'done', arrived: true, ...s.intro };
  if (s.intro.myst === false || s.intro.myst === 'come') s.intro.myst = s.intro.myst === 'come' ? 'done' : 'sleep';
  if (s.objs) for (const k of Object.keys(s.objs)) { const [x, y] = k.split(',').map(Number); if ((y === 5 && x <= 43) || (x >= 39 && x <= 46 && y <= 6) || (y === 20 && x <= 15)) delete s.objs[k]; }   // (lot 8 : plus de gare à l'ouest, cette zone se remplit aussi)
  if (raw.workbench === undefined) s.workbench = true; // avant le lot 12, on fabriquait déjà
  // Avant le lot 9, tout le champ était déjà prêt.
  if (!raw.tilled) { s.tilled = {}; for (let y = 8; y <= 13; y++) for (let x = 4; x <= 13; x++) s.tilled[x + ',' + y] = 1; }
  if (!raw.grange) s.grange = { found: Object.keys(s.tools), broken: [] };
  s.skills = Object.assign(d.skills, raw.skills || {});
  // Avant le lot 7, tout était déjà disponible : on ne retire rien aux anciennes parties.
  if (!raw.caravan) s.caravan = { tokens: 0, unlocked: ['carrot_seed', 'corn_seed', 'rabbit', 'pig', 'sheep', 'forge_or'] };
  // Avant le lot 4, le poulailler existait d'office (et la bergerie si on avait des moutons).
  if (!raw.built) s.built = { coop: true, pigsty: false, barn: (raw.animals || []).some(a => a.type === 'sheep') };
  else s.built = Object.assign(d.built, raw.built);
  // Lot 8 : parties commencées avant l'XP → niveau 1, ou niveau 3 si la cabane est déjà retapée (on ne leur retire pas la forêt).
  if (raw.pxp === undefined && s.intro && s.intro.arrived) s.pxp = s.repair && s.repair.house && s.repair.house.wood >= 80 && s.repair.house.stone >= 30 ? LEVELS[3] : LEVELS[1];
  if (s.inv) delete s.inv.igor_bijou;   // 17/11 : quête du bijou d'Igor supprimée
  if (s.objs && !Object.values(s.objs).some(o => o && o.t === 'bigtree')) s.objs['6,30'] = { t: 'bigtree' };   // Farmwest : le grand arbre de la ferme
  for (const [o, n] of [['soupe_baies', 'confiture_baies'], ['soupe_mures', 'confiture_mures']]) if (s.inv && s.inv[o]) { s.inv[n] = (s.inv[n] || 0) + s.inv[o]; delete s.inv[o]; }   // 16/11 : soupes → confitures
  s.v = CFG.VERSION;
  return s;
}
