// Point d'entrée : assemble les modules et fait tourner la boucle.
import { CFG } from './config.js';
import { createGame } from './core/game.js';
import { defaultState } from './core/state.js';
import { genObjects } from './world/map.js';
import { createRenderer } from './render/renderer.js';
import { createHud } from './ui/hud.js';
import { createMenu } from './ui/menu.js';
import { createCustomizer } from './ui/customize.js';
import { createInput } from './ui/input.js';
import { createAudio } from './audio/audio.js';
import { createSettingsPanel, adminSaved } from './ui/settingsPanel.js';
import { $, toast } from './ui/dom.js';
import { createControls } from './ui/controls.js';
import { createWheel } from './ui/wheel.js';
import { createMapView } from './ui/mapView.js';
import { createBoard } from './ui/board.js';
import { createTitle } from './ui/title.js';
import { createHotbar } from './ui/hotbar.js';
import { introTick, introActive } from './systems/intro.js';
import { createDialog } from './ui/dialog.js';
import { NPCS, OUT_FROM, OUT_TO, INTRO_LINES } from './data/npcs.js';
import { placeNPC, findNPCAt, mystTick } from './systems/social.js';
import { pickFieldTool } from './systems/repair.js';
import { cookTick } from './systems/cooking.js';
import { fishTick } from './systems/fishing.js';
import { coldTick } from './systems/cold.js';
import { createFishPanel } from './ui/fishPanel.js';
import { createParcPanel } from './ui/parcPanel.js';
import { nightTip } from './systems/camp.js';
import { ghostTick } from './systems/ghost.js';
import { BUSHES } from './data/recipes.js';
import { createRepairPanel } from './ui/repairPanel.js';
import { autoPickup } from './systems/grange.js';
import { pickTestSword } from './systems/wild.js';
import { ensureNature, rainbowTick, pickFlower, digTreasure } from './systems/nature.js';
import { doorAt } from './world/scenes.js';
import { pickDrops, dropsAt, swapDrop, stackSize } from './systems/inventory.js';
import { updateWild } from './systems/wild.js';
import { ensureShrooms, pickShroom } from './systems/foret.js';
import { isLunaLot } from './world/map.js';
import { isPath, isGate } from './world/map.js';
import { createPlayerMarket } from './net/market.js';
import { facingTile } from './systems/movement.js';
import { attack } from './systems/combat.js';
import { consume } from './systems/player.js';
import { ensureOrders } from './systems/market.js';
import { ITEMS } from './data/items.js';
import { updatePlayer } from './systems/movement.js';
import { act } from './systems/actions.js';
import { ADMIN, setAdmin } from './systems/admin.js';
import { tickTime } from './systems/time.js';
import { wander } from './systems/animals.js';
import { rainBoost } from './systems/farming.js';
import { spawnEnemies, updateEnemies } from './systems/combat.js';
import { registerNPC, talk, gift } from './systems/social.js';
import { add } from './systems/inventory.js';
import { initSupabase, upsertProfile } from './net/supabase.js';
import { createSaveManager, localAdapter, supabaseAdapter, localKey } from './net/save.js';
import { removeFromIndex, deleteOnlineGame, readIndex, upsertIndex, mergeGames, localGame, createOnlineGame, joinOnlineGame, myOnlineGames } from './net/games.js';
import { createGamesPanel } from './ui/gamesPanel.js';
import { createInventoryGrid } from './ui/inventoryGrid.js';
import { createSellPanel } from './ui/sellPanel.js';
import { createChestPanel } from './ui/chestPanel.js';
import { createMultiplayer, lerpOthers } from './net/multiplayer.js';

const g = createGame();
let started = false, net = { sb: null, uid: null }, mp = null, games = [], game = null, pending = null;
const cv = $('#game');
const renderer = createRenderer(cv, g);
let store = null; try { store = localStorage; } catch { /* stockage bloqué */ }
const audio = createAudio(g, store);
const settingsPanel = createSettingsPanel(audio, g);
if (adminSaved()) { ADMIN.on = true; document.body.classList.add('admin'); }
const wheel = createWheel(g, audio);
const invGrid = createInventoryGrid(g, audio);
const sellPanel = createSellPanel(g, audio);
const chestPanel = createChestPanel(g, audio);
createFishPanel(g, audio);
createParcPanel(g, audio);
const mapView = createMapView(g, renderer, audio);
const board = createBoard(g, audio);
const dialog = createDialog(g, audio);
let playerMarket = null;

// Branchements bus → UI
function wireBus() {
  g.bus.on('toast', toast);
  g.bus.on('pop', p => g.fx.push({ ...p, life: 1 }));
  g.bus.on('newDay', () => { renderer.initWeather(); audio.play('day'); doSave(false); });
  g.bus.on('scene', () => { g.enemies.length = 0; });
  g.bus.on('openChest', c => chestPanel.open(c));
  g.bus.on('showMap', () => { mapView.open(); toast('🗺️ Le plan est toujours là : bouton 🗺️ en haut à droite (ou touche M).'); });
  g.bus.on('clinic', e => { const h = NPCS.hailey, lines = e && e.off === 'repos' ? h.clinicRepos : e && e.off === 'nuit' ? h.clinicNuit : h.clinic; setTimeout(() => g.bus.emit('say', { name: h.name, color: h.color, voice: h.voice, lines }), 600); });
  g.bus.on('open', what => what === 'board' ? board.open() : what === 'sell' ? sellPanel.open() : menu.open(what, true));
}
wireBus();

let saver = null;
async function doSave(manual) {
  if (!saver) return;
  const res = await saver.save();
  const ok = hud.savedAt(res);
  if (manual && res) audio.play('save');
  if (manual && res) toast(ok ? 'Partie sauvegardée ✔' : 'Sauvegardé localement (cloud indisponible)');
}

const menu = createMenu(g, { online: () => !!(mp && mp.online), audio, get market() { return playerMarket; } });
const custom = createCustomizer({
  getLook: () => g.S.look,
  getName: () => g.S.name,
  onStart(name, inGame) {
    g.S.name = name;
    if (inGame) { custom.close(); mp && mp.track(); upsertProfile(net.sb, net.uid, g.S); doSave(false); return; }
    startPicked(name);
  },
  onContinue() { if (games[0]) continueGame(games[0]); },
  onBack() { custom.close(); title.open(); }
});
// Une nouvelle partie : solo (en ligne si possible, sinon sur l'appareil), créée à plusieurs, ou rejointe avec un code.
async function startPicked(name) {
  const p = pending || { kind: 'solo' }, look = g.S.look;
  let gm = null;
  try {
    if (p.kind === 'solo') gm = net.sb ? await createOnlineGame(net.sb, 'solo', name).catch(() => localGame()) : localGame();
    else if (p.kind === 'create') gm = await createOnlineGame(net.sb, 'multi', name);
    else gm = await joinOnlineGame(net.sb, p.code, name);
  } catch (err) { toast('⚠️ ' + err.message); return; }
  gm.name = name;
  openGame(gm);
  const old = p.kind === 'join' ? await saver.load() : null;   // déjà membre de cette partie : on reprend sa ferme
  if (old) { g.S = old; g.S.name = name; }
  else { g.S = defaultState(); g.S.look = look; g.S.name = name; g.S.objs = genObjects(); }
  g.S.game = { id: gm.id, code: gm.code, mode: gm.mode }; g.S.farmLot = gm.lot || 0;
  begin();
  if (gm.mode === 'multi') setTimeout(() => toast(`👥 Code de la partie : ${gm.code} — envoie-le à tes amis !`), 1200);
}
function openGame(gm) {
  game = gm;
  const adapters = store ? [localAdapter(store, localKey(gm.id))] : [];
  if (net.sb && !gm.offline) adapters.push(supabaseAdapter(net.sb, net.uid, gm.id));
  saver = createSaveManager({ adapters, getState: () => g.S, canSave: () => started });
  if (store) games = mergeGames(upsertIndex(store, gm), games);
}
async function continueGame(gm) {
  openGame(gm);
  const s = await saver.load();
  if (!s) { toast('⚠️ Sauvegarde introuvable pour cette partie.'); return; }
  title.close(); custom.close();
  g.S = s; if (!g.S.objs) g.S.objs = genObjects();
  g.S.game = { id: gm.id, code: gm.code || null, mode: gm.mode || 'solo' }; if (gm.lot != null) g.S.farmLot = gm.lot;
  begin();
}
async function deleteGame(gm) {
  if (gm.mode === 'multi') return games;
  try { store && store.removeItem(localKey(gm.id)); } catch { /* rien */ }
  if (store) removeFromIndex(store, gm.id);
  if (net.sb && !gm.offline) await deleteOnlineGame(net.sb, gm.id).catch(() => toast('⚠️ Effacée ici, mais pas en ligne (réessaie plus tard).'));
  games = games.filter(x => x.id !== gm.id);
  title.setSave(games.length > 0, games.length);
  toast('🗑️ Partie effacée.');
  return games;
}
const gamesPanel = createGamesPanel({ audio, online: () => !!net.sb, onDelete: deleteGame, onPick(p) {
  if (p.kind === 'continue') return continueGame(p.game);
  pending = p; title.close(); custom.open(false, false);
} });
const title = createTitle({
  audio,
  onContinue() { if (games[0]) continueGame(games[0]); },
  onNew() { gamesPanel.showNew(); },
  onGames() { gamesPanel.showList(games); },
  onSettings() { settingsPanel.open(); }
});
const repairPanel = createRepairPanel(g);
const input = createInput(cv, g, renderer, { isActive: () => started && !custom.isOpen() && !title.isOpen() && !dialog.isOpen, onMenu: () => menu.open() });

// Bouton d'action : agit sur la tuile en face (ou frappe l'ennemi le plus proche avec l'épée).
function doAction() {
  if (!started || dialog.isOpen) return;
  const S = g.S;
  const ft = facingTile(S);
  if (findNPCAt(g, ft.tx, ft.ty)) { act(g, ft.tx, ft.ty); return; } // parler / offrir avant de manger
  // plus de choix automatique : on prend soi-même le bon outil dans la roue 🛠️
  if (S.sel === 'sword' && ['farm', 'wild'].includes(S.scene || 'farm')) {
    const en = g.enemies.reduce((b, e) => { const d = Math.hypot(e.x - S.x, e.y - S.y); return d < 1.8 && (!b || d < b.d) ? { e, d } : b; }, null);
    if (en) { attack(g, en.e); return; }
  }
  const it = ITEMS[S.sel];
  if (it && it.eat && !it.seed) { if (consume(g, S.sel)) audio.play('feed'); return; }
  act(g, ft.tx, ft.ty);
}
const controls = createControls(g, input, { onAct: doAction, onTools: () => wheel.open('tools'), onItems: () => invGrid.open() });
const hotbar = createHotbar(g, audio);
const hud = createHud(g, controls);
addEventListener('keydown', e => {
  if (!started || custom.isOpen() || title.isOpen() || dialog.isOpen || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
  const k = e.key.toLowerCase();
  if (k === ' ') { e.preventDefault(); doAction(); }
  else if (/^[1-8]$/.test(k)) { e.preventDefault(); hotbar.pick(+k - 1); }   // barre d'outils
  else if (k === 'tab') { e.preventDefault(); wheel.open('tools'); }
  else if (k === 'i') invGrid.open();
  else if (k === 'm') mapView.isOpen ? mapView.close() : mapView.open();
  else if (k === 'escape') { wheel.close(); mapView.close(); document.querySelectorAll('.overlay.on').forEach(o => { if (o.id !== 'ovLook') o.classList.remove('on'); }); }
});

$('#bSave').onclick = () => doSave(true);
$('#bBag').onclick = () => { audio.play('ui'); menu.open(); };
$('#bRecipes').onclick = () => { audio.play('ui'); menu.open('recettes', true); };   // seulement les recettes (le menu complet reste en haut)
// Revenir au menu principal : on sauvegarde, puis on recharge le jeu sur l'écran titre (tout repart proprement, multijoueur compris).
g.bus.on('toTitle', () => {
  if (!started) return;
  g.bus.emit('say', { name: 'Menu principal', color: '#ffdf8a', lines: ['Sauvegarder et revenir au menu principal ?'], choices: ['Oui', 'Non'],
    onChoose: async i => { if (i !== 0) return; await doSave(true); setTimeout(() => location.reload(), 300); } });
});
// Pas de clic droit ni de menu contextuel dans le jeu.
addEventListener('contextmenu', e => e.preventDefault());
addEventListener('pointerdown', e => { if (e.button === 2) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
addEventListener('mousedown', e => { if (e.button === 2) e.preventDefault(); }, true);
$('#bSet').onclick = () => { audio.play('ui'); settingsPanel.open(); };
$('#bMap').onclick = () => { audio.play('ui'); mapView.open(); };

async function begin() {
  if (!ADMIN.on && g.S.tools.rod && !g.S.rodFound) { const t = { ...g.S.tools }; delete t.rod; g.S.tools = t; }   // plus de canne de test
  if (ADMIN.on) setAdmin(g, true);
  // le chemin vers le village doit rester libre (anciennes sauvegardes)
  for (const k in g.S.objs) { const [x, y] = k.split(',').map(Number); if (isPath(x, y) || isGate(x, y) || isLunaLot(x, y)) delete g.S.objs[k]; }
  for (const [x, y] of BUSHES) delete g.S.objs[x + ',' + y];   // les buissons à baies gardent leur place
  for (const id in NPCS) registerNPC(g, NPCS[id]);
  for (const id in g.npcs) placeNPC(g.npcs[id], g.S, OUT_FROM, OUT_TO);
  if (!g.S.intro.arrived && !g.S.intro.step) { // (anciennes parties) arrivée en train : le train repart pendant que le héros repense à l'annonce
    g.trainT = performance.now();
    setTimeout(() => g.bus.emit('say', { name: g.S.name, color: '#ffdf8a', lines: INTRO_LINES, onEnd: () => { g.S.intro.arrived = true; } }), 2600);
  }
  started = true; g.inGame = true; custom.close(); hud.show(); hotbar.show(); renderer.initWeather(); ensureOrders(g);
  if (net.sb) { playerMarket = createPlayerMarket(net.sb, net.uid, g); await upsertProfile(net.sb, net.uid, g.S); if (game && game.mode === 'multi') { mp = createMultiplayer({ sb: net.sb, uid: net.uid, g, world: game.id }); mp.join(); } }
  doSave(false);
}

// API publique pour ajouter du contenu plus tard (PNJ, objets…) depuis la console ou un module.
window.Engine = {
  game: g,
  registerNPC: n => registerNPC(g, n),
  talk: id => talk(g, id),
  gift: (id, item) => gift(g, id, item, add)
};

// Boucle
let last = performance.now(), hudT = 0, lastFrame = 0;
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (started) {
    const arrivee = (g.S.intro && ['wait', 'sleep', 'talk'].includes(g.S.intro.myst)) || introActive(g.S);   // Farmwest : pendant le nouveau début aussi
    if (introActive(g.S)) introTick(g, dt);   // sur le quai, jusqu'à la fin de l'accueil de Myst
    if (g.fishing || g.parcGame) { g.player.target = null; g.player.walkFrame = 0; }   // on ne bouge pas en pêchant
    else if (g.talking || arrivee) { g.player.target = null; g.player.walkFrame = 0; }   // pendant un dialogue ou l'arrivée, on ne bouge pas
    else updatePlayer(g, dt, input.keys, (tx, ty) => act(g, tx, ty));
    const wf = g.player.walkFrame; if (wf !== lastFrame && (wf === 1 || wf === 3)) audio.play('step'); lastFrame = wf;
    tickTime(g, dt * 1000);
    wander(g, dt);
    updateWild(g, dt); // les monstres ne vivent que dans les Caverne sombre
    autoPickup(g);
    pickTestSword(g, Math.floor(g.S.x), Math.floor(g.S.y - .2)); pickFieldTool(g, Math.floor(g.S.x), Math.floor(g.S.y - .2)); mystTick(g); cookTick(g); nightTip(g); ghostTick(g); fishTick(g, dt); coldTick(g, dt);
    ensureNature(g, g.S.scene || 'farm'); rainbowTick(g);
    pickFlower(g, Math.floor(g.S.x), Math.floor(g.S.y - .2)); digTreasure(g, Math.floor(g.S.x), Math.floor(g.S.y - .2));
    if (g.S.scene === 'foret') { ensureShrooms(g); pickShroom(g, Math.floor(g.S.x), Math.floor(g.S.y - .2)); }
    // on entre directement en marchant vers une porte (si c'est possible)
    { const S = g.S, k = input.keys, moving = k.up || k.down || k.left || k.right || k.ax || k.ay, ft = facingTile(S);
      g.doorCd = Math.max(0, (g.doorCd || 0) - dt);
      if (moving && !dialog.isOpen && g.doorCd <= 0 && doorAt(S.scene || 'farm', ft.tx, ft.ty) && Math.hypot(ft.tx + .5 - S.x, ft.ty + .5 - S.y) < 1.25) { g.doorCd = 1; act(g, ft.tx, ft.ty); } }
    // objets au sol : ramassés en passant ; sac plein → proposer un échange (une fois par case)
    { const S = g.S, tx = Math.floor(S.x), ty = Math.floor(S.y - .2), here = tx + ',' + ty;
      if (dropsAt(S, tx, ty).length && g.dropAsked !== here && !dialog.isOpen) {
        const left = pickDrops(g, tx, ty);
        if (left.length) {
          g.dropAsked = here; const d = left[0], st = stackSize(S), ids = Object.keys(S.inv).filter(k => k !== d.id && ITEMS[k]);
          g.bus.emit('say', { name: 'Sac plein 🎒', color: '#e8c26a', lines: [`Il y a ${d.n} × ${ITEMS[d.id] ? ITEMS[d.id].i + ' ' + ITEMS[d.id].n : d.id} au sol. Échanger contre une case du sac ?`],
            choices: [...ids.map(k => `Poser ${ITEMS[k].i} ${ITEMS[k].n} (×${((S.inv[k] - 1) % st) + 1})`), 'Laisser au sol'],
            onChoose: i => { if (ids[i]) swapDrop(g, d, ids[i]); } });
        }
      } else if (!dropsAt(S, tx, ty).length && g.dropAsked === here) g.dropAsked = null;
      if (g.dropAsked && g.dropAsked !== here) g.dropAsked = null; }
    rainBoost(g, dt);
    lerpOthers(g.others, dt);
    for (const id in g.npcs) { const n = g.npcs[id]; placeNPC(n, g.S, OUT_FROM, OUT_TO); if (n.justOut) { n.justOut = false; toast(`${n.name} est sorti s'asseoir devant chez lui !`); } }
    mp && mp.tick(now);
    for (const k in g.S.objs) { const o = g.S.objs[k]; if (o.shake > 0) o.shake -= dt; }
    for (let i = g.fx.length - 1; i >= 0; i--) { const f = g.fx[i]; f.life -= dt; f.y -= dt * 0.75; if (f.life <= 0) g.fx.splice(i, 1); }
    renderer.updateParticles(dt);
    renderer.render(now);
    if ((hudT += dt) > 0.25) { hudT = 0; hud.update(); repairPanel.update(started && !dialog.isOpen && !document.querySelector('.overlay.on')); }
  }
  if (custom.isOpen()) custom.draw(now);
  if (title.isOpen()) title.draw(now);
  requestAnimationFrame(loop);
}

(async () => {
  title.open(false);
  requestAnimationFrame(loop);
  net = await initSupabase();
  custom.status(net.status);
  setInterval(() => doSave(false), CFG.AUTOSAVE_MS);
  document.addEventListener('visibilitychange', () => { if (document.hidden) doSave(false); });
  const local = store ? readIndex(store) : [];
  // ancienne sauvegarde unique (avant les parties) : elle devient une partie solo de cet appareil
  try { const old = store && JSON.parse(store.getItem(CFG.LSKEY)); if (old && !local.some(x => x.id === 'local')) local.push({ id: 'local', mode: 'solo', code: null, lot: 0, offline: true, at: old.savedAt || 1 }); } catch { /* rien */ }
  games = mergeGames(local, net.sb ? await myOnlineGames(net.sb) : []);
  if (games.length) title.setSave(true, games.length);
})();
