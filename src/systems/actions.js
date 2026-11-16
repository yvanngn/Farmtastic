// Aiguillage d'une action sur une tuile, selon la scène (ferme ou intérieur).
import { isBin, key, isPlot } from '../world/map.js';
import { doorAt, tileAt, UI_TILES } from '../world/scenes.js';
import { sleep } from './time.js';
import { sellAll } from './economy.js';
import { hitObject } from './resources.js';
import { findAnimalAt, interactAnimal, feedAll } from './animals.js';
import { farmAction, isRipe, isTilled } from './farming.js';
import { ITEMS } from '../data/items.js';
import { BUILDINGS } from '../data/buildings.js';
import { hasTool } from './skills.js';
import { grangeAction } from './grange.js';
import { examineText } from './examine.js';
import { hitZRock, isOpen, pickTestSword } from './wild.js';
import { pickShroom } from './foret.js';
import { repairAt, contribute, pickFieldTool } from './repair.js';
import { pitchTent, tentAt, useTent } from './camp.js';
import { pickJewel } from './igor.js';
import { cast, hook, zoneAt } from './fishing.js';
import { chestAt, placeChest } from './chests.js';
import { fireAt, startCook, pickBush, placeFire } from './cooking.js';
import { pickFlower, hitNature, natureAt, digTreasure } from './nature.js';
import { findNPCAt, talk, gift, hearts } from './social.js';
import { add } from './inventory.js';
import { TOOL_FOR } from './resources.js';

const TOOL_IDS = ['hand', 'axe', 'pick', 'sickle', 'shovel', 'sword', 'rod'];
const own = (S, t) => (hasTool(S, t) ? t : 'hand');
// Choisit l'outil adapté à la cible. Un objet tenu (graine, foin…) est gardé, sauf devant un arbre/rocher/monstre.
export function smartTool(g, tx, ty) {
  const S = g.S;
  if (S.scene === 'wild') return S.wild && S.wild.rocks[key(tx, ty)] ? own(S, 'pick') : (hasTool(S, 'sword') ? 'sword' : S.sel);
  if (S.scene === 'grange') { const t = tileAt('grange', tx, ty); return t === 'p' ? own(S, 'axe') : t === 'r' ? own(S, 'pick') : S.sel; }
  if ((S.scene || 'farm') !== 'farm') return S.sel;
  if (findNPCAt(g, tx, ty)) return TOOL_IDS.includes(S.sel) ? 'hand' : S.sel;
  const holdsItem = !TOOL_IDS.includes(S.sel);
  if (hasTool(S, 'sword') && g.enemies.some(e => Math.hypot(e.x - S.x, e.y - S.y) < 1.8)) return 'sword';
  const o = S.objs[key(tx, ty)];
  if (o) return hasTool(S, TOOL_FOR[o.t]) ? TOOL_FOR[o.t] : (holdsItem ? S.sel : 'hand');
  if (holdsItem) return S.sel;
  const p = S.plots[key(tx, ty)];
  if (p && isRipe(p, g.now())) return own(S, 'sickle');
  if (isPlot(tx, ty) && !isTilled(S, tx, ty) && hasTool(S, 'shovel') && (holdsItem && ITEMS[S.sel] && ITEMS[S.sel].seed || S.sel === 'shovel' || S.sel === 'hand')) return 'shovel';
  return S.sel === 'sword' || S.sel === 'axe' || S.sel === 'pick' || S.sel === 'shovel' ? 'hand' : S.sel;
}

export function enterScene(g, to, spawn) {
  const S = g.S;
  S.scene = to; S.x = spawn.x; S.y = spawn.y;
  g.player.target = null;
  g.bus.emit('sfx', 'door');
  g.bus.emit('scene', to);
}

// Action + commentaire du héros quand on interagit avec un élément du décor qu'on ne peut pas prendre.
// Maisons des habitants : on n'entre qu'avec au moins la moitié de leur affinité (5 cœurs sur 10).
// Avant, on frappe : s'ils sont chez eux, ils viennent parler à la porte.
export const HOME_OWNER = { luna: 'luna', franck: 'franck', hailey: 'hailey' };
export const ENTER_HEARTS = 5;
export const canEnterHome = (S, id) => hearts(S.social[id] || { points: 0 }) >= ENTER_HEARTS;
function knock(g, id) {
  const n = g.npcs[id], home = n && n.scene === id;
  g.bus.emit('sfx', 'ui');
  if (g.now() - (g.knockT || -1e9) < 2500) return 'knock';
  g.knockT = g.now();
  if (!home) { g.bus.emit('toast', `🚪 Toc toc… Personne ne répond. ${n ? n.name : ''} n'est pas chez ${n && n.de === "d'elle" ? 'elle' : 'lui'}.`); return 'knock'; }
  g.bus.emit('toast', `🚪 Toc toc… ${n.name} entrouvre la porte. (Pour entrer : ${ENTER_HEARTS} ❤️)`);
  talk(g, id);
  return 'knock';
}

export function act(g, tx, ty) {
  if (g.fishing) return hook(g) || 'fishing';   // pendant la pêche : ferrer / remonter
  if (g.S.sel === 'rod' && zoneAt(g.S, tx, ty)) return cast(g, tx, ty) ? 'cast' : 'none';
  const r = act0(g, tx, ty);
  if (r === 'none' || r === false) {
    const t = examineText(g.S, tx, ty);
    if (t) { g.bus.emit('say', { name: g.S.name, color: '#ffdf8a', lines: [t] }); return 'look'; }
  }
  return r;
}
function act0(g, tx, ty) {
  const S = g.S, sc = S.scene || 'farm';
  // un habitant : objet en main = cadeau, sinon discussion
  const npc = findNPCAt(g, tx, ty);
  if (npc) {
    if (!TOOL_IDS.includes(S.sel) && S.inv[S.sel] > 0) { gift(g, npc.id, S.sel, add); return 'gift'; }
    talk(g, npc.id); return 'talk';
  }
  if (pickTestSword(g, tx, ty)) return 'pick';
  if (pickFieldTool(g, tx, ty)) return 'pick';
  if (pickJewel(g, tx, ty)) return 'pick';
  if (tentAt(S, tx, ty)) return useTent(g) && 'tent';
  { const c = chestAt(S, tx, ty); if (c) { g.bus.emit('openChest', c); return 'chest'; } }
  if (S.sel === 'chest' && sc === 'farm') return placeChest(g, tx, ty) ? 'chestPlaced' : 'missing';
  if (fireAt(S, tx, ty)) return startCook(g, tx, ty) ? 'cook' : 'fire';
  { const b = pickBush(g, tx, ty); if (b != null) return b ? 'berries' : 'empty'; }
  if (S.sel === 'campfire' && sc === 'farm') return placeFire(g, tx, ty) ? 'fire' : 'missing';
  if (S.sel === 'tent' && sc === 'farm' && !npc) return pitchTent(g, tx, ty) ? 'pitch' : 'missing';
  { const rp = repairAt(S, tx, ty); if (rp) return contribute(g, rp) ? 'repair' : 'missing'; }
  if (digTreasure(g, tx, ty)) return 'treasure';
  if (pickFlower(g, tx, ty)) return 'pick';
  { const N = natureAt(S, sc); if (N && N.rocks[key(tx, ty)]) return hitNature(g, tx, ty) ? 'hit' : 'none'; }
  const d = doorAt(sc, tx, ty);
  if (d && d.to === 'wild' && !isOpen(S)) { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', 'La grille de la caverne est fermée à clé. Le chef du village saura peut-être…'); return 'locked'; }
  if (d && HOME_OWNER[d.to] && !canEnterHome(S, HOME_OWNER[d.to])) return knock(g, HOME_OWNER[d.to]);
  if (d && !(sc === 'farm' && BUILDINGS[d.to] && !(S.built && S.built[d.to]))) { enterScene(g, d.to, d.spawn); return 'door'; }
  if (sc === 'grange') { const r = grangeAction(g, tx, ty); if (r !== 'none') return r; }
  if (sc === 'foret') { const r = pickShroom(g, tx, ty); return r ? 'pick' : r === false ? 'noknife' : 'none'; }
  if (tileAt(sc, tx, ty) === 'G') { g.bus.emit('toast', '🧊 Une grotte gelée, bouchée par des éboulis et de la glace. Impossible d’entrer… pour l’instant.'); return 'locked'; }
  if (sc === 'wild' && tileAt(sc, tx, ty) === 'S') { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', '⬇️ Un escalier s’enfonce vers l’étage 2… bloqué par des éboulis pour l’instant.'); return 'stairs'; }
  if (sc === 'wild') return S.wild && S.wild.rocks[key(tx, ty)] ? (hitZRock(g, tx, ty) ? 'hit' : 'none') : 'none';
  if (sc === 'town') { const ui = UI_TILES[tileAt(sc, tx, ty)]; if (ui) { g.bus.emit('sfx', 'ui'); g.bus.emit('open', ui); return ui; } return 'none'; }
  if (sc === 'house') {
    const t = tileAt(sc, tx, ty);
    if (t === 'E') { if (S.workbench) { g.bus.emit('sfx', 'ui'); g.bus.emit('open', 'workshop'); return 'workshop'; } g.bus.emit('sfx', 'denied'); g.bus.emit('toast', 'Un vieil établi tout branlant… Le charpentier du village pourrait le réparer.'); return 'broken'; }
    if (t === 'B' && S.bed === false) { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', 'Il n’y a pas encore de lit ici… En attendant, la tente fera l’affaire.'); return 'nobed'; }
    return t === 'B' ? (sleep(g) ? 'sleep' : 'none') : 'none';
  }
  if (BUILDINGS[sc]) return tileAt(sc, tx, ty) === 'H' ? (feedAll(g, sc) ? 'feedAll' : 'none') : 'none';
  if (isBin(tx, ty)) { g.bus.emit('open', 'sell'); return 'sell'; }
  if (S.objs[key(tx, ty)]) return hitObject(g, tx, ty) ? 'hit' : 'none';
  const a = findAnimalAt(S, tx, ty);
  if (a) return interactAnimal(g, a);
  return farmAction(g, tx, ty) ? 'farm' : 'none';
}
