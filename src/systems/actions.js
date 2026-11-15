// Aiguillage d'une action sur une tuile, selon la scène (ferme ou intérieur).
import { isBin, key } from '../world/map.js';
import { doorAt, tileAt, UI_TILES } from '../world/scenes.js';
import { sleep } from './time.js';
import { sellAll } from './economy.js';
import { hitObject } from './resources.js';
import { findAnimalAt, interactAnimal, feedAll } from './animals.js';
import { farmAction, isRipe } from './farming.js';
import { ITEMS } from '../data/items.js';
import { BUILDINGS } from '../data/buildings.js';
import { hasTool } from './skills.js';
import { grangeAction } from './grange.js';
import { findNPCAt, talk, gift } from './social.js';
import { add } from './inventory.js';
import { TOOL_FOR } from './resources.js';

const TOOL_IDS = ['hand', 'axe', 'pick', 'sickle', 'shovel', 'sword'];
const own = (S, t) => (hasTool(S, t) ? t : 'hand');
// Choisit l'outil adapté à la cible. Un objet tenu (graine, foin…) est gardé, sauf devant un arbre/rocher/monstre.
export function smartTool(g, tx, ty) {
  const S = g.S;
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
  return S.sel === 'sword' || S.sel === 'axe' || S.sel === 'pick' ? 'hand' : S.sel;
}

export function enterScene(g, to, spawn) {
  const S = g.S;
  S.scene = to; S.x = spawn.x; S.y = spawn.y;
  g.player.target = null;
  g.bus.emit('sfx', 'door');
  g.bus.emit('scene', to);
}

export function act(g, tx, ty) {
  const S = g.S, sc = S.scene || 'farm';
  // un habitant : objet en main = cadeau, sinon discussion
  const npc = findNPCAt(g, tx, ty);
  if (npc) {
    if (!TOOL_IDS.includes(S.sel) && S.inv[S.sel] > 0) { gift(g, npc.id, S.sel, add); return 'gift'; }
    talk(g, npc.id); return 'talk';
  }
  const d = doorAt(sc, tx, ty);
  if (d && !(sc === 'farm' && BUILDINGS[d.to] && !(S.built && S.built[d.to]))) { enterScene(g, d.to, d.spawn); return 'door'; }
  if (sc === 'grange') { const r = grangeAction(g, tx, ty); if (r !== 'none') return r; }
  if (sc === 'town') { const ui = UI_TILES[tileAt(sc, tx, ty)]; if (ui) { g.bus.emit('sfx', 'ui'); g.bus.emit('open', ui); return ui; } return 'none'; }
  if (sc === 'house') return tileAt(sc, tx, ty) === 'B' ? (sleep(g) ? 'sleep' : 'none') : 'none';
  if (BUILDINGS[sc]) return tileAt(sc, tx, ty) === 'H' ? (feedAll(g, sc) ? 'feedAll' : 'none') : 'none';
  if (isBin(tx, ty)) { sellAll(g); return 'sell'; }
  if (S.objs[key(tx, ty)]) return hitObject(g, tx, ty) ? 'hit' : 'none';
  const a = findAnimalAt(S, tx, ty);
  if (a) return interactAnimal(g, a);
  return farmAction(g, tx, ty) ? 'farm' : 'none';
}
