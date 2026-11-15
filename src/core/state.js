import { CFG } from '../config.js';

// État sauvegardé d'un joueur. Tout ce qui doit persister vit ici, rien d'autre.
export function defaultState() {
  return {
    v: CFG.VERSION, name: 'Fermier',
    look: { body: 'h', bottom: 'pant', skin: '#f6d2b0', hair: 0, hairC: '#7a4a22', shirt: '#d04a3a', pants: '#3a4a8a' },
    money: 500, energy: 100, maxE: 100, hp: 100, maxHp: 100,
    day: 1, season: 0, year: 1, minute: CFG.DAY_START, weather: 'sun',
    inv: { wheat_seed: 10, hay: 5 }, sel: 'hand',
    x: 6.5, y: 6.8, dir: 0,
    plots: {}, objs: null,
    animals: [],
    built: { coop: false, pigsty: false, kennel: false, barn: false },
    social: {}, savedAt: 0,
    scene: 'farm', invSlots: CFG.INV_SLOTS, stackLvl: 0, rockQueue: [],
    village: { done: [], progress: 0 }, festival: null, caravan: { tokens: 0, unlocked: [] },
    skills: { mining: { xp: 0 } },
    tools: {},                       // aucun outil au départ : ils sont dans la grange
    intro: { met: false },
    tilled: {},
    farmLot: 0,                      // emplacement de ferme de ce joueur (multijoueur : un par joueur)
    drops: [],                       // objets posés au sol (sac plein)
    workbench: false,                // établi de la maison, à faire réparer par le charpentier
    wildOpen: false, wild: null,     // Terres sauvages (zone de combat), fermées au début                      // cases du champ bêchées (à la pelle)           // accueil du chef du village
    grange: { found: [], broken: [] },
    market: { slots: [] }
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
  if (!raw.intro) s.intro = { met: true };
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
  s.v = CFG.VERSION;
  return s;
}
