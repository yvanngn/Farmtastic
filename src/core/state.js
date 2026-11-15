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
    animals: [{ id: 'a1', type: 'chicken', x: 21.5, y: 9.5, fed: false, petted: false, love: 20, produced: false }],
    social: {}, savedAt: 0,
    scene: 'farm', invSlots: CFG.INV_SLOTS, stackLvl: 0,
    skills: { mining: { xp: 0 } },
    tools: { axe: 1, pick: 1, sickle: 1, sword: 1 },
    market: { slots: [] }
  };
}

// Migration douce : les champs absents d'une vieille sauvegarde prennent la valeur par défaut.
export function migrate(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const s = Object.assign(defaultState(), raw);
  const d = defaultState();
  s.look = Object.assign(d.look, raw.look || {});
  s.tools = Object.assign(d.tools, raw.tools || {});
  s.skills = Object.assign(d.skills, raw.skills || {});
  s.v = CFG.VERSION;
  return s;
}
