// Gestion d'animaux façon Stardew (poules, lapins, moutons, chats).
import { ANIMALS } from '../data/animals.js';
import { PEN_BOUNDS, ROAM_BOUNDS } from '../world/map.js';
import { add, has, canAdd } from './inventory.js';

export function findAnimalAt(S, x, y) {
  return S.animals.find(a => Math.hypot(a.x - (x + 0.5), a.y - (y + 0.5)) < 1) || null;
}

// Ordre : ramasser le produit > nourrir (si bonne nourriture en main) > caresser > infos.
export function interactAnimal(g, a) {
  const S = g.S, def = ANIMALS[a.type];
  if (a.produced && def.prod) {
    if (!canAdd(S, def.prod)) { add(g, def.prod); return 'full'; }
    g.bus.emit('sfx', 'collect'); add(g, def.prod); a.produced = false;
    g.bus.emit('pop', { t: '+1', x: a.x, y: a.y }); return 'collect';
  }
  if (def.food && S.sel === def.food && !a.fed && has(S, def.food)) {
    add(g, def.food, -1); a.fed = true; g.bus.emit('sfx', 'feed');
    g.bus.emit('pop', { t: 'Miam !', x: a.x, y: a.y, c: '#ff0' }); return 'feed';
  }
  if (!a.petted) {
    a.petted = true; a.love = Math.min(100, a.love + (a.type === 'cat' || a.type === 'dog' ? 15 : 10)); a.heart = 1;
    g.bus.emit('sfx', def.sound || 'cluck'); return 'pet';
  }
  const hint = def.food && !a.fed ? ' · pas encore nourri (foin)' : a.type === 'cat' ? ' · ronronne 💤' : a.type === 'dog' ? ' · remue la queue 🐾' : '';
  g.bus.emit('toast', `${def.n} — affection ${a.love}/100${hint}`);
  return 'info';
}

// Mangeoire d'un bâtiment : nourrit tous ses animaux qui ont faim (home absent = tous).
export function feedAll(g, home) {
  const S = g.S;
  let n = 0;
  for (const a of S.animals) {
    const def = ANIMALS[a.type];
    if (home && def.home !== home) continue;
    if (def.food && !a.fed && has(S, def.food)) { add(g, def.food, -1); a.fed = true; n++; }
  }
  g.bus.emit('sfx', n ? 'feed' : 'denied');
  g.bus.emit('toast', n ? `${n} animal(aux) nourri(s) 🌾` : (S.animals.some(a => ANIMALS[a.type].food && !a.fed) ? 'Il faut du foin' : 'Tout le monde a mangé'));
  return n;
}

export function animalsNewDay(S) {
  for (const a of S.animals) {
    const def = ANIMALS[a.type] || {};
    if (def.prod && a.fed) {
      a.cycle = (a.cycle || 0) + 1;
      if (a.cycle >= (def.every || 1)) { a.produced = true; a.cycle = 0; }
    }
    if (!a.petted) a.love = Math.max(0, a.love - 5);
    a.fed = a.petted = false;
  }
}

export function wander(g, dt) {
  for (const a of g.S.animals) {
    const def = ANIMALS[a.type] || {}, B = def.roam ? ROAM_BOUNDS : PEN_BOUNDS;
    if (a.heart > 0) a.heart -= dt;
    if (a.wait > 0) { a.wait -= dt; a.moving = false; continue; }
    if (!a.goal || g.rnd() < 0.004) a.goal = { x: B.x0 + g.rnd() * B.w, y: B.y0 + g.rnd() * B.h };
    const d = Math.hypot(a.goal.x - a.x, a.goal.y - a.y), sp = a.type === 'rabbit' ? 1.4 : a.type === 'sheep' ? 0.5 : 0.8;
    a.moving = d > 0.1;
    if (a.moving) { a.x += (a.goal.x - a.x) / d * dt * sp; a.y += (a.goal.y - a.y) / d * dt * sp; a.f = a.goal.x < a.x; }
    else if (def.roam && g.rnd() < 0.01) a.wait = 2 + g.rnd() * 4; // le chat s'assoit
  }
}
