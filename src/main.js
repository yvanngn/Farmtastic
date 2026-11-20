import { letterTick } from './systems/golgolas.js';
import { rockLetterTick } from './systems/bigrock.js';
// Point d'entrée : assemble les modules et fait tourner la boucle.
import { ensureMounds } from './systems/mounds.js';
import { CFG } from './config.js';
import { createGame } from './core/game.js';
import { setFarmLot } from './world/map.js';
import { fireAt } from './systems/cooking.js';
import { COOK } from './data/recipes.js';
import { journalHook } from './systems/journal.js';
import { defaultState } from './core/state.js';
import { genObjects } from './world/map.js';
import { createRenderer } from './render/renderer.js';
import { preloadSheets } from './render/sprites.js';
import { preloadDecors } from './render/decors.js';
import { autoLandscape } from './ui/screen.js';
autoLandscape();   // 20/11 : paysage automatique sur téléphone
import { createHud } from './ui/hud.js';
import { createMenu } from './ui/menu.js';
import { createCustomizer } from './ui/customize.js';
import { createInput } from './ui/input.js';
import { createAudio } from './audio/audio.js';
import { createSettingsPanel, adminSaved, getEco } from './ui/settingsPanel.js';
import { $, toast } from './ui/dom.js';
import { createControls } from './ui/controls.js';
import { createWheel } from './ui/wheel.js';
import { createMapView } from './ui/mapView.js';
import { createBoard } from './ui/board.js';
import { createTitle } from './ui/title.js';
import { createHotbar } from './ui/hotbar.js';
import { createNight } from './ui/night.js';
import { questXpTick, seedQuestXp, registerRecipeLevels } from './systems/level.js';
import { QUESTS } from './systems/quests.js';
import { HAND_RECIPES as HR_LVL } from './data/recipes.js';
import { POT_RECIPES as PR_LVL } from './data/patterns.js';
registerRecipeLevels([...Object.values(HR_LVL), ...Object.values(PR_LVL)].map(r => ({ n: (ITEMS[r.out] || {}).n || r.out, lvl: r.lvl || 0 })));
import { introTick, introActive, skipIntro } from './systems/intro.js';
import { createDialog } from './ui/dialog.js';
import { NPCS, OUT_FROM, OUT_TO, INTRO_LINES } from './data/npcs.js';
import { placeNPC, orbitNPC, findNPCAt, mystTick } from './systems/social.js';
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
import { updateDedale } from './systems/dedale.js';
import { ensureShrooms, pickShroom } from './systems/foret.js';
import { isLunaLot } from './world/map.js';
import { isPath, isGate } from './world/map.js';
import { createPlayerMarket } from './net/market.js';
import { facingTile } from './systems/movement.js';
import { aimTile } from './systems/reach.js';
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
import { buryGame, unburyGame, readTomb, visibleGames, removeFromIndex, deleteOnlineGame, readIndex, upsertIndex, mergeGames, localGame, createOnlineGame, joinOnlineGame, myOnlineGames } from './net/games.js';
import { createGamesPanel } from './ui/gamesPanel.js';
import { createInventoryGrid } from './ui/inventoryGrid.js';
import { createSellPanel } from './ui/sellPanel.js';
import { createBattleUI } from './ui/battle.js';
import { tickBattle } from './systems/battle.js';
import { createCalendarPanel } from './ui/calendarPanel.js';
import { createPotPanel } from './ui/potPanel.js';
import { etalTick } from './systems/etal.js';
import { createStandPanel } from './ui/standPanel.js';
import { standTick } from './systems/stand.js';
import { yvanGift } from './systems/equip.js';
import { createChestPanel } from './ui/chestPanel.js';
import { createMultiplayer, lerpOthers } from './net/multiplayer.js';

const g = createGame();
let hudIdle = 0;
journalHook(g);   // 19/11 : le journal note chaque activité
let started = false, net = { sb: null, uid: null }, mp = null, games = [], game = null, pending = null;
const cv = $('#game');
const renderer = createRenderer(cv, g);
preloadSheets();   // planches des personnages chargées dès l'écran titre
preloadDecors().then(() => g.bus.emit('decors'));   // lot 32 : décors d'après les planches fournies (cactus, cailloux, filons, arbres, saloon, fontaine, diligence)
let store = null; try { store = localStorage; } catch { /* stockage bloqué */ }
const audio = createAudio(g, store);
const settingsPanel = createSettingsPanel(audio, g);
if (adminSaved()) { ADMIN.on = true; document.body.classList.add('admin'); }
const wheel = createWheel(g, audio);
const invGrid = createInventoryGrid(g, audio);
const sellPanel = createSellPanel(g, audio);
const battleUI = createBattleUI(g, audio);   // lot 30a : combat au tour par tour
g.bus.on('net', m => mp && mp.send && mp.send(m.event, m.payload));   // lot 30c : messages des combats en équipe
const standPanel = createStandPanel(g, audio);   // 19/11 : l'étal (sur la place du panneau)
const calendarPanel = createCalendarPanel(g, audio);
const potPanel = createPotPanel(g, audio);   // 20/11 : cuisine au chaudron   // 19/11 : le grand panneau (calendrier, météo)
const chestPanel = createChestPanel(g, audio);
createFishPanel(g, audio);
createParcPanel(g, audio);
const mapView = createMapView(g, renderer, audio);
const board = createBoard(g, audio);
const dialog = createDialog(g, audio);
const night = createNight({ audio, save: () => doSave(false) });
let playerMarket = null;

// Branchements bus → UI
function wireBus() {
  g.bus.on('toast', toast);
  g.bus.on('pop', p => g.fx.push({ ...p, life: 1 }));
  g.bus.on('newDay', () => { renderer.initWeather(); audio.play('day'); doSave(false); });
  g.bus.on('scene', () => { g.enemies.length = 0; });
  g.bus.on('night', n => night.show(n));   // lot 8 : transition de la nuit
  g.bus.on('openChest', c => chestPanel.open(c));
  g.bus.on('showMap', () => { mapView.open(); toast('🗺️ Le plan est toujours là : bouton 🗺️ en haut à droite (ou touche M).'); });
  g.bus.on('clinic', e => { const h = NPCS.hailey, lines = e && e.off === 'repos' ? h.clinicRepos : e && e.off === 'nuit' ? h.clinicNuit : h.clinic; setTimeout(() => g.bus.emit('say', { name: h.name, color: h.color, voice: h.voice, lines }), 600); });
  g.bus.on('open', what => what === 'pot' ? potPanel.open() : what === 'settings' ? settingsPanel.open() : what === 'journal' ? menu.openJournal() : what === 'board' ? board.open() : what === 'sell' ? sellPanel.open() : what === 'dump' ? sellPanel.open('dump') : String(what).startsWith('sellTo:') ? sellPanel.open('shop:' + what.slice(7)) : what === 'stand' ? standPanel.open() : what === 'calendar' ? calendarPanel.open() : what === 'quests' ? menu.open('quests', true) : menu.open(what, true));
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
  else { g.S = defaultState(); g.S.look = look; g.S.name = name; g.S.treeSeed = (Math.random() * 1e9) | 0; g.S.objs = genObjects(g.S.treeSeed); }   // 19/11 : arbres placés au hasard à chaque nouvelle partie
  g.S.game = { id: gm.id, code: gm.code, mode: gm.mode }; g.S.farmLot = gm.lot || 0;
  begin();
  if (gm.mode === 'multi') setTimeout(() => toast(`👥 Code de la partie : ${gm.code} — envoie-le à tes amis !`), 1200);
}
function openGame(gm) {
  game = gm;
  const adapters = store ? [localAdapter(store, localKey(gm.id))] : [];
  if (net.sb && !gm.offline) adapters.push(supabaseAdapter(net.sb, net.uid, gm.id));
  saver = createSaveManager({ adapters, getState: () => g.S, canSave: () => started });
  if (store) { unburyGame(store, gm.id); games = mergeGames(upsertIndex(store, gm), games); }   // (une partie rejointe de nouveau réapparaît)
}
async function continueGame(gm) {
  openGame(gm);
  const s = await saver.load();
  if (!s) { toast('⚠️ Sauvegarde introuvable pour cette partie.'); return; }
  title.close(); custom.close();
  g.S = s; if (!g.S.objs) g.S.objs = genObjects(g.S.treeSeed || 12345);
  for (const k in g.S.objs) { const [x, y] = k.split(',').map(Number); if (isPath(x, y) && g.S.objs[k].t !== 'bigtree') delete g.S.objs[k]; }   // 20/11 : nouvelles sorties au milieu de la ferme
  g.S.game = { id: gm.id, code: gm.code || null, mode: gm.mode || 'solo' }; if (gm.lot != null) g.S.farmLot = gm.lot;
  begin();
}
async function deleteGame(gm) {   // lot 8 : solo ou à plusieurs (validation dans la fenêtre des parties)
  try { store && store.removeItem(localKey(gm.id)); } catch { /* rien */ }
  if (store) { removeFromIndex(store, gm.id); buryGame(store, gm.id); }   // retenue comme effacée : elle ne revient pas au rechargement
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
const input = createInput(cv, g, renderer, { isActive: () => started && !custom.isOpen() && !title.isOpen() && !dialog.isOpen && !introActive(g.S), onMenu: () => menu.open() });

// Bouton d'action : agit sur la tuile en face (ou frappe l'ennemi le plus proche avec l'épée).
const ACT_COOLDOWN_MS = 300;   // 💡 au plus ~3 actions par seconde en restant appuyé
let lastAct = -1e9;
function doAction() {
  if (!started || dialog.isOpen || introActive(g.S) || g.battle) return;
  const now = performance.now(); if (now - lastAct < ACT_COOLDOWN_MS) return; lastAct = now;   // petit délai caché : doigt / clic / espace maintenus ne s'emballent plus
  const S = g.S;
  const ft = facingTile(S);
  if (findNPCAt(g, ft.tx, ft.ty)) { act(g, ft.tx, ft.ty); return; } // parler / offrir avant de manger
  // plus de choix automatique : on prend soi-même le bon outil dans la roue 🛠️
  const it = ITEMS[S.sel];
  const fireNear = (S.fires || []).some(f => Math.hypot(f.x + .5 - S.x, f.y + .5 - S.y) < 2.2);
  // 20/11 : plus de baies jetées sur le feu (la cuisine se fait au chaudron)
  if (it && it.eat && !it.seed) { if (consume(g, S.sel)) audio.play('feed'); return; }
  if (S.sel === 'axe' || S.sel === 'pick') {   // 20/11 : on vise la cible la plus proche ; sinon, coup dans le vide
    const aim = aimTile(S, S.sel, ft);
    if (aim) { act(g, aim.tx, aim.ty); return; }
    const r = act(g, ft.tx, ft.ty);
    if (!r || r === 'none' || r === 'look') { g.bus.emit('swing', S.sel); audio.play('swish'); }
    return;
  }
  act(g, ft.tx, ft.ty);
}
const controls = createControls(g, input, { onAct: doAction, onTools: () => wheel.open('tools'), onItems: () => invGrid.open() });
const hotbar = createHotbar(g, audio);
const hud = createHud(g, controls);
addEventListener('keydown', e => {
  if (!started || introActive(g.S) || custom.isOpen() || title.isOpen() || dialog.isOpen || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
  const k = e.key.toLowerCase();
  if (k === ' ') { e.preventDefault(); doAction(); }
  else if (/^[1-8]$/.test(k)) { e.preventDefault(); hotbar.pick(+k - 1); }   // barre d'outils
  else if (k === 'tab') { e.preventDefault(); wheel.open('tools'); }
  else if (k === 'i') invGrid.open();
  else if (k === 'm') mapView.isOpen ? mapView.close() : mapView.open();
  else if (k === 'escape') { wheel.close(); mapView.close(); document.querySelectorAll('.overlay.on').forEach(o => { if (o.id !== 'ovLook') o.classList.remove('on'); }); }
});

$('#bSave').onclick = () => doSave(true);
g.bus.on('saveNow', () => doSave(true));
g.bus.on('refreshView', () => renderer.invalidate());   // 20/11   // 20/11 : bouton 💾 dans les réglages
// Intro : ⏩ maintenir pour accélérer, ⏭ passer jusqu'à la ferme
{ const f = $('#bIntroFast'), on = v => { g.introFast = v; f.classList.toggle('on', v); };
  f.addEventListener('pointerdown', e => { e.preventDefault(); on(true); }); for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) f.addEventListener(ev, () => on(false));
  $('#bIntroSkip').onclick = () => { if (!introActive(g.S)) return; audio.play('ui'); on(false); dialog.reset(); skipIntro(g); }; }
$('#bBag').onclick = () => { audio.play('ui'); menu.open(); };
$('#bRecipes').onclick = () => { audio.play('ui'); menu.open('recettes', true); };
$('#bQuests').onclick = () => { audio.play('ui'); menu.open('quests', true); };   // 19/11 : les quêtes, à côté du bouton d'action   // seulement les recettes (le menu complet reste en haut)
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
  if (!g.S.intro.arrived && !g.S.intro.step) { // (anciennes parties) le héros repense à l'annonce (lot 8 : plus de train dans la ferme)
    setTimeout(() => g.bus.emit('say', { name: g.S.name, color: '#ffdf8a', lines: INTRO_LINES, onEnd: () => { g.S.intro.arrived = true; } }), 2600);
  }
  if (!g.S.xpQuests) seedQuestXp(g.S, QUESTS);   // lot 8 : ce qui est déjà fait ne rapporte pas d'XP d'un coup
  started = true; g.inGame = true; custom.close(); hud.show(); hotbar.show(); renderer.initWeather(); ensureOrders(g);
  if (net.sb) { playerMarket = createPlayerMarket(net.sb, net.uid, g); await upsertProfile(net.sb, net.uid, g.S); if (game && game.mode === 'multi') { g.uid = net.uid; mp = createMultiplayer({ sb: net.sb, uid: net.uid, g, world: game.id }); mp.join(); } }
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
let last = performance.now(), hudT = 0, lastFrame = 0, lastInput = 0;
addEventListener('pointerdown', () => { lastInput = performance.now(); }, true); addEventListener('keydown', () => { lastInput = performance.now(); }, true);
// 19/11 (performances) : 60 images/s quand on bouge ou qu'il se passe quelque chose, 30 au repos (ou toujours en économie d'énergie).
function fastNeeded(now) {
  if (getEco()) return false;
  return !started || !!g.player.walkFrame || !!g.player.target || !!g.fishing || !!g.parcGame || !!g.ride || introActive(g.S) || now - lastInput < 1500 || !!document.querySelector('.overlay.on #fishFight:not([hidden])');
}
let lastDraw = 0;
function loop(now) {
  if (!fastNeeded(now) && now - lastDraw < 31) { requestAnimationFrame(loop); return; }
  lastDraw = now; setFarmLot(g.S.farmLot);   // 19/11 : emplacement de ma ferme (passages vers les voisines)
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (started) {
    const arrivee = (g.S.intro && ['wait', 'sleep', 'talk'].includes(g.S.intro.myst)) || introActive(g.S);   // Farmwest : pendant le nouveau début aussi
    const inIntro = introActive(g.S); document.body.classList.toggle('intro', inIntro);   // pendant l'intro : seulement la bulle et ⏩ / ⏭
    if (inIntro) { introTick(g, dt * (g.introFast ? 6 : 1)); if (g.introFast) dialog.fastTick(); }
    // 20/11 : garde-fou — l'intro attend un dialogue qui n'est pas (ou plus) affiché : on relance l'étape au lieu de rester bloqué
    if (inIntro && g.introWait && !dialog.isOpen) { g.introStuck = (g.introStuck || 0) + dt; if (g.introStuck > 1.5) { g.introStuck = 0; g.introWait = false; } } else g.introStuck = 0;   // ⏩ maintenu : tout va 6 fois plus vite
    if (g.fishing || g.parcGame) { g.player.target = null; g.player.walkFrame = 0; }   // on ne bouge pas en pêchant
    else if (g.talking || arrivee || g.battle) { g.player.target = null; g.player.walkFrame = 0; if (g.battle) tickBattle(g, dt); }   // lot 30a : pendant un combat, seules les jauges avancent   // pendant un dialogue ou l'arrivée, on ne bouge pas
    else updatePlayer(g, dt, input.keys, (tx, ty) => act(g, tx, ty));
    const wf = g.player.walkFrame; if (wf !== lastFrame && (wf === 1 || wf === 3)) audio.play('step'); lastFrame = wf;
    tickTime(g, dt * 1000);
    wander(g, dt);
    updateWild(g, dt); // les monstres ne vivent que dans les Caverne sombre
    updateDedale(g, dt);   // lot 30b : dédale profond (arbres, marmottes)
    autoPickup(g);
    pickTestSword(g, Math.floor(g.S.x), Math.floor(g.S.y - .2)); pickFieldTool(g, Math.floor(g.S.x), Math.floor(g.S.y - .2)); mystTick(g); cookTick(g); nightTip(g); ghostTick(g); fishTick(g, dt); coldTick(g, dt);
    ensureNature(g, g.S.scene || 'farm'); ensureMounds(g.S, g.S.scene || 'farm'); rainbowTick(g);
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
    for (const id in g.npcs) { const n = g.npcs[id]; placeNPC(n, g.S, OUT_FROM, OUT_TO); if (n.orbit && n.scene === n.orbit.scene) orbitNPC(n, now / 1000); /* essai : tour de la fontaine */ if (n.justOut) { n.justOut = false; toast(`${n.name} est sorti s'asseoir devant chez lui !`); } }
    mp && mp.tick(now);
    for (const k in g.S.objs) { const o = g.S.objs[k]; if (o.shake > 0) o.shake -= dt; }
    if (g.S.scene === 'dedale' && g.S.dedale) for (const k in g.S.dedale.trees) { const o = g.S.dedale.trees[k]; if (o.shake > 0) o.shake -= dt; }   // lot 30b
    for (let i = g.fx.length - 1; i >= 0; i--) { const f = g.fx[i]; f.life -= dt; f.y -= dt * 0.75; if (f.life <= 0) g.fx.splice(i, 1); }
    renderer.updateParticles(dt);
    renderer.render(now);
    // 20/11 : le cadre en haut à gauche reste affiché tout le temps (la caméra suit le héros jusqu'aux bords)
    if ((hudT += dt) > 0.25) { hudT = 0; if (started && !introActive(g.S)) { questXpTick(g, QUESTS); letterTick(g); rockLetterTick(g); standTick(g); if (!dialog.isOpen) etalTick(g); yvanGift(g); } hud.update(); { const v = $('#vitals'); if (v) v.style.visibility = introActive(g.S) ? 'hidden' : ''; } repairPanel.update(started && !dialog.isOpen && !document.querySelector('.overlay.on')); }
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
  if (store) games = visibleGames(games, readTomb(store));   // parties effacées sur cet appareil
  if (games.length) title.setSave(true, games.length);
})();

// 19/11 : au clavier, chaque fenêtre qui s'ouvre reçoit le focus sur son bouton principal (Entrée valide), et les flèches
// passent d'un bouton à l'autre. Avant, le focus restait sur l'écran titre derrière : Entrée ne validait plus rien.
{
  const topOverlay = () => [...document.querySelectorAll('.overlay.on')].pop();
  const buttons = ov => [...ov.querySelectorAll('button:not([disabled]), input, select')].filter(b => b.offsetParent && !/Fermer/.test(b.getAttribute('aria-label') || ''));
  const focusMain = ov => { if (!ov || ov.contains(document.activeElement)) return; const b = ov.querySelector('button.primaire:not([disabled])') || buttons(ov)[0]; b?.focus({ preventScroll: true }); };
  new MutationObserver(ms => { for (const m of ms) if (m.target.classList?.contains('overlay') && m.target.classList.contains('on')) setTimeout(() => focusMain(m.target), 60); })
    .observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
  addEventListener('keydown', e => {
    const ov = topOverlay(); if (!ov || !['ArrowDown', 'ArrowUp'].includes(e.key) || e.target.tagName === 'INPUT') return;
    const bs = buttons(ov); if (!bs.length) return; e.preventDefault();
    const i = bs.indexOf(document.activeElement), j = i < 0 ? 0 : (i + (e.key === 'ArrowDown' ? 1 : -1) + bs.length) % bs.length;
    bs[j].focus(); bs[j].scrollIntoView({ block: 'nearest' });
  });
  document.getElementById('iName')?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('bStart')?.click(); } });
}
