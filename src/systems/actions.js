import { repairOven } from './resto.js';
import { forestTreeAt, chopForest, chopStump, isForestChest, openForestChest } from './foret.js';
// Aiguillage d'une action sur une tuile, selon la scène (ferme ou intérieur).
import { isBin, key, isPlot } from '../world/map.js';
import { seaOpen } from './admin.js';
import { doorAt, tileAt, UI_TILES, isHome, SHOP_OF, SHOP_SPAWN, SHOP_VENDOR, SCENES } from '../world/scenes.js';
import { IGOR, HARRY } from '../data/npcs.js';
const NPCS_ALL = { igor: IGOR, harry: HARRY };
import { sleep } from './time.js';
import { sellAll } from './economy.js';
import { hitObject } from './resources.js';
import { findAnimalAt, interactAnimal, feedAll } from './animals.js';
import { farmAction, isRipe, isTilled, canTill } from './farming.js';
import { ITEMS } from '../data/items.js';
import { BUILDINGS } from '../data/buildings.js';
import { hasTool } from './skills.js';
import { grangeAction } from './grange.js';
import { examineText } from './examine.js';
import { hitZRock, isOpen, pickTestSword } from './wild.js';
import { pickShroom } from './foret.js';
import { repairAt, contribute, pickFieldTool, installBed, isRepaired } from './repair.js';
import { pitchTent, tentAt, useTent } from './camp.js';
import { cast, hook, zoneAt } from './fishing.js';
import { parcAt, ride, startGame, buyStall } from './parc.js';
import { chestAt, placeChest } from './chests.js';
import { fireAt, startCook, pickBush, placeFire } from './cooking.js';
import { potAt, usePot, placePot } from './pots.js';
import { pickFlower, hitNature, natureAt, digTreasure } from './nature.js';
import { findNPCAt, talk, gift, hearts } from './social.js';
import { add } from './inventory.js';
import { TOOL_FOR } from './resources.js';
import { zoneOpen, ZONE_LEVEL } from './level.js';
import { ADMIN } from './admin.js';
import { digMound, moundAt, ensureMounds } from './mounds.js';
import { roxAt, petRox } from './rouky.js';
import { openMailbox } from './mail.js';
import { forestOpen, chopForestBlocker } from './blockers.js';
import { farmDoor } from './farms.js';
import { dayIndex } from './time.js';
import { CFG as CFG_P } from '../config.js';
// 20/11 : la fête foraine n'ouvre que le dernier jour du premier mois
export const parcOpen = S => dayIndex(S) >= CFG_P.MONTH_DAYS;
import { quarryMouthOpen } from '../world/quarrymouth.js';
import { isBigRock, hitBigRock } from './bigrock.js';
import { readLetter, hitMeteor, zoneOpen as golgoOpen, MAILBOX } from './golgolas.js';
import { METEOR } from '../world/scenes.js';

const TOOL_IDS = ['hand', 'axe', 'pick', 'sickle', 'shovel', 'sword', 'rod', 'hammer'];
const own = (S, t) => (hasTool(S, t) ? t : 'hand');
// Choisit l'outil adapté à la cible. Un objet tenu (graine, foin…) est gardé, sauf devant un arbre/rocher/monstre.
export function smartTool(g, tx, ty) {
  const S = g.S;
  if (S.scene === 'wild') return S.wild && S.wild.rocks[key(tx, ty)] ? own(S, 'pick') : (hasTool(S, 'sword') ? 'sword' : S.sel);
  if (hasTool(S, 'shovel') && moundAt(S, S.scene || 'farm', tx, ty)) return 'shovel';   // lot 12 : un petit tas → la pelle
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
  if (canTill(S, tx, ty) && !isTilled(S, tx, ty) && hasTool(S, 'shovel') && S.sel === 'shovel' || isPlot(tx, ty) && !isTilled(S, tx, ty) && hasTool(S, 'shovel') && (holdsItem && ITEMS[S.sel] && ITEMS[S.sel].seed || S.sel === 'shovel' || S.sel === 'hand')) return 'shovel';
  return S.sel === 'sword' || S.sel === 'axe' || S.sel === 'pick' || S.sel === 'shovel' ? 'hand' : S.sel;
}

export function enterScene(g, to, spawn) {
  const S = g.S, from = S.scene;
  S.scene = to; S.x = spawn.x; S.y = spawn.y;
  g.player.target = null;
  g.bus.emit('sfx', to === 'bar' || from === 'bar' ? 'saloon' : 'door');   // Farmwest : portes battantes du saloon
  g.bus.emit('scene', to);
}

// Action + commentaire du héros quand on interagit avec un élément du décor qu'on ne peut pas prendre.
// Maisons des habitants : on n'entre qu'avec au moins la moitié de leur affinité (5 cœurs sur 10).
// Avant, on frappe : s'ils sont chez eux, ils viennent parler à la porte.
export const HOME_OWNER = { luna: 'luna', franck: 'franck', hailey: 'hailey' };
export const ENTER_HEARTS = 5;
export const canEnterHome = (S, id) => true;   // 16/11 : on entre dans toutes les maisons (chacune aura une pièce secrète, plus tard)
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
    if (npc.id === 'rouky' && S.sel === 'bone') { talk(g, npc.id); return 'talk'; }   // lot 12 : l'os est pour Rox
    if (!TOOL_IDS.includes(S.sel) && S.inv[S.sel] > 0) { gift(g, npc.id, S.sel, add); return 'gift'; }
    talk(g, npc.id); return 'talk';
  }
  if (roxAt(g, tx, ty)) return petRox(g);   // lot 12 : Rox
  if (sc === 'farm' && tx === MAILBOX.x && ty === MAILBOX.y) return openMailbox(g);   // lot 13 + 18/11 (courrier des graines) : boîte aux lettres de la ferme
  if (isBigRock(sc, tx, ty)) return hitBigRock(g, (to, sp) => enterScene(g, to, sp));   // lot 29 : l'énorme rocher
  if (sc === 'golgolas' && tx >= METEOR.x && tx < METEOR.x + METEOR.w && ty >= METEOR.y && ty < METEOR.y + METEOR.h) return hitMeteor(g);   // lot 13 : la météorite
  { ensureMounds(S, sc); const m = digMound(g, tx, ty); if (m) return m === 'noshovel' || m === 'tired' ? m : 'dig'; }   // lot 12 : petits tas
  if (pickTestSword(g, tx, ty)) return 'pick';
  if (pickFieldTool(g, tx, ty)) return 'pick';
  if (tentAt(S, tx, ty)) return useTent(g) && 'tent';
  { const c = chestAt(S, tx, ty); if (c) { g.bus.emit('openChest', c); return 'chest'; } }
  if (S.sel === 'chest' && sc === 'farm') return placeChest(g, tx, ty) ? 'chestPlaced' : 'missing';
  { const p = potAt(S, tx, ty); if (p) return usePot(g, p); }
  if (S.sel === 'chaudron' && sc === 'farm') return placePot(g, tx, ty) ? 'pot' : 'missing';
  if (fireAt(S, tx, ty)) return startCook(g, tx, ty) ? 'cook' : 'fire';
  { const b = pickBush(g, tx, ty); if (b != null) return b ? 'berries' : 'empty'; }
  if (S.sel === 'campfire' && sc === 'farm') return placeFire(g, tx, ty) ? 'fire' : 'missing';
  if (S.sel === 'tent' && sc === 'farm' && !npc) return pitchTent(g, tx, ty) ? 'pitch' : 'missing';
  { const rp = repairAt(S, tx, ty); if (rp) { if (S.sel !== 'hammer') { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', '🔨 Prends le marteau dans la roue des outils 🛠️ pour réparer.'); return 'needHammer'; } return contribute(g, rp) ? 'repair' : 'missing'; } }
  if (digTreasure(g, tx, ty)) return 'treasure';
  { const f = pickFlower(g, tx, ty); if (f === false) return 'noknife'; if (f === 'progress') return 'progress'; if (f) return 'pick'; }
  { const N = natureAt(S, sc); if (N && N.rocks[key(tx, ty)]) return hitNature(g, tx, ty) ? 'hit' : 'none'; }
  let d = doorAt(sc, tx, ty);
  { const fd = d && farmDoor(S, d); if (fd) { if (!fd.to) { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', '🚧 Ce passage est fermé pour l’instant.'); return 'locked'; }   // 20/11 : zone bloquée → un message   // 19/11 : sorties des fermes (FARM_LINKS)
    if (fd.lot == null) d = { ...d, to: fd.to, spawn: fd.spawn };
    else { const who = Object.values(g.others || {}).find(o => o.farmLot === fd.lot); enterScene(g, fd.to, fd.spawn); if (fd.to !== 'farm') g.bus.emit('toast', `🏡 ${fd.name} — ${who ? 'la ferme de ' + who.name : 'personne n’y habite pour l’instant'}`); return 'door'; } } }
  if (d && d.to === 'parc' && !parcOpen(S) && !ADMIN.on) { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', '🎡 La fête foraine est encore en montage : elle ouvre le dernier jour du premier mois.'); return 'locked'; }   // 20/11
  if (d && d.to === 'foret' && !forestOpen(S) && !ADMIN.on) { const r = chopForestBlocker(g, tx, ty); return r === 'open' ? (enterScene(g, d.to, d.spawn), 'door') : 'locked'; }   // 19/11 : un gros arbre barre la forêt (hache en cuivre)
  if (d && d.to !== 'foret' && ZONE_LEVEL[d.to] && !zoneOpen(S, d.to) && !ADMIN.on) { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', d.to === 'foret' ? `🌲 Les arbres sont si serrés qu'on ne passe pas… (niveau ${ZONE_LEVEL.foret} requis)` : `🔒 La caverne attendra : niveau ${ZONE_LEVEL[d.to]} requis.`); return 'locked'; }   // lot 8 : zones débloquées par le niveau
  if (d && d.to === 'wild' && !isOpen(S)) { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', 'La grille de la caverne est fermée à clé. Le Maire saura peut-être…'); return 'locked'; }
  if (d && d.to === 'carriere2' && !quarryMouthOpen(S, d.x, d.y)) { g.bus.emit('toast', '🪨 La paroi est pleine ici. Un passage s’ouvre ailleurs chaque jour…'); return 'locked'; }   // 19/11
  if (d && d.to === 'golgolas' && !golgoOpen(S) && !ADMIN.on) { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', '🚧 Des planches barrent le chemin du sud. Quelqu’un les retirera peut-être un jour…'); return 'locked'; }   // lot 13
  if (d && d.to === 'plage' && !seaOpen(S)) { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', '🚧 Le chemin de la plage est barré pour l’instant.'); return 'locked'; }
  if (d && HOME_OWNER[d.to] && !canEnterHome(S, HOME_OWNER[d.to])) return knock(g, HOME_OWNER[d.to]);
  if (d && d.to === 'house' && isRepaired(S, 'house2')) { enterScene(g, 'maison', { x: 7.5, y: 9.4 }); return 'door'; }   // 18/11 : la cabane agrandie
  if (d && !(sc === 'farm' && BUILDINGS[d.to] && !(S.built && S.built[d.to]))) { enterScene(g, d.to, d.spawn); return 'door'; }
  if (sc === 'grange') { const r = grangeAction(g, tx, ty); if (r !== 'none') return r; }
  if (sc === 'resto' && tileAt('resto', tx, ty) === 'O') return repairOven(g);   // le four du cuistot (lot 5)
  if (sc === 'foret' && isForestChest(tx, ty)) return openForestChest(g) ? 'chest' : 'none';   // lot 8 : coffre au bout du labyrinthe
  if (sc === 'foret' && forestTreeAt(S, tx, ty)) return chopForest(g, tx, ty) ? 'hit' : 'none';
  if (sc === 'foret') { const r = chopStump(g, tx, ty); if (r) return 'hit'; }   // 19/11 : souche de la forêt
  if (sc === 'foret') { const r = pickShroom(g, tx, ty); return r === 'progress' ? 'progress' : r ? 'pick' : r === false ? 'noknife' : 'none'; }
  if (sc === 'parc') { const t = tileAt(sc, tx, ty), k = parcAt(t); if (k === 'ride') return ride(g, t) ? 'ride' : 'none'; if (k === 'game') return startGame(g, t) ? 'game' : 'none'; if (k === 'stall') return buyStall(g, t) ? 'buy' : 'none'; }
  if (tileAt(sc, tx, ty) === 'G') { g.bus.emit('toast', '🧊 Une grotte gelée, bouchée par des éboulis et de la glace. Impossible d’entrer… pour l’instant.'); return 'locked'; }
  if (sc === 'wild' && tileAt(sc, tx, ty) === 'S') { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', '⬇️ Un escalier s’enfonce vers l’étage 2… bloqué par des éboulis pour l’instant.'); return 'stairs'; }
  if (sc === 'wild') return S.wild && S.wild.rocks[key(tx, ty)] ? (hitZRock(g, tx, ty) ? 'hit' : 'none') : 'none';
  if (sc === 'place') { const t = tileAt(sc, tx, ty), ui = t === '$' ? 'stand' : t === '!' ? 'calendar' : null; if (ui) { g.bus.emit('sfx', 'ui'); g.bus.emit('open', ui); return ui; } }   // 19/11 : la place du panneau
  if (sc === 'town') { const t = tileAt(sc, tx, ty), shop = SHOP_OF[t];
    if (shop) { enterScene(g, 'shop_' + shop, SHOP_SPAWN); g.bus.emit('sfx', 'door'); return 'door'; }   // 20/11 : on entre dans le magasin
    const ui = UI_TILES[t]; if (ui) { g.bus.emit('sfx', 'ui'); g.bus.emit('open', ui); return ui; } return 'none'; }
  if (SCENES[sc] && SCENES[sc].shop && (tileAt(sc, tx, ty) === 'K' || (ty === 2 && tx >= 3 && tx <= 6))) {   // le comptoir (ou le vendeur derrière)
    const ui = SCENES[sc].shop, v = SHOP_VENDOR[ui] && NPCS_ALL[SHOP_VENDOR[ui]];
    if (v) g.bus.emit('toast', `${v.name} : « Bonjour ! Qu'est-ce qu'il te faut ? »`);
    g.bus.emit('sfx', 'ui'); g.bus.emit('open', ui); return ui; }
  if (isHome(sc)) {
    const t = tileAt(sc, tx, ty);
    if (t === 'B' && S.bed === false && installBed(g)) return 'bed';
    if (t === 'T' && (sc === 'house' || sc === 'maison')) { g.bus.emit('sfx', 'ui'); g.bus.emit('open', 'journal'); return 'journal'; }   // 19/11 : le journal sur la table
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
