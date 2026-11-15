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
import { createSettingsPanel } from './ui/settingsPanel.js';
import { $, toast } from './ui/dom.js';
import { createControls } from './ui/controls.js';
import { createWheel } from './ui/wheel.js';
import { createMapView } from './ui/mapView.js';
import { createBoard } from './ui/board.js';
import { createTitle } from './ui/title.js';
import { createDialog } from './ui/dialog.js';
import { NPCS, OUT_FROM, OUT_TO, INTRO_LINES } from './data/npcs.js';
import { placeNPC, findNPCAt, mystTick } from './systems/social.js';
import { pickFieldTool } from './systems/repair.js';
import { cookTick } from './systems/cooking.js';
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
import { act, smartTool } from './systems/actions.js';
import { tickTime } from './systems/time.js';
import { wander } from './systems/animals.js';
import { rainBoost } from './systems/farming.js';
import { spawnEnemies, updateEnemies } from './systems/combat.js';
import { registerNPC, talk, gift } from './systems/social.js';
import { add } from './systems/inventory.js';
import { initSupabase, upsertProfile } from './net/supabase.js';
import { createSaveManager, localAdapter, supabaseAdapter } from './net/save.js';
import { createMultiplayer, lerpOthers } from './net/multiplayer.js';

const g = createGame();
let started = false, saved = null, overwriteArmed = false, net = { sb: null, uid: null }, mp = null;
const cv = $('#game');
const renderer = createRenderer(cv, g);
let store = null; try { store = localStorage; } catch { /* stockage bloqué */ }
const audio = createAudio(g, store);
const settingsPanel = createSettingsPanel(audio);
const wheel = createWheel(g, audio);
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
  g.bus.on('open', what => what === 'board' ? board.open() : menu.open(what, true));
}
wireBus();

let saver = null;
async function doSave(manual) {
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
    // confirm() est bloqué dans certains cadres : double appui pour écraser une sauvegarde.
    if (saved && !overwriteArmed) { overwriteArmed = true; $('#bStart').textContent = 'Écraser la sauvegarde ?'; return; }
    const look = g.S.look;
    g.S = defaultState(); g.S.look = look; g.S.name = name; g.S.objs = genObjects();
    begin();
  },
  onContinue() { g.S = saved; if (!g.S.objs) g.S.objs = genObjects(); begin(); },
  onBack() { custom.close(); overwriteArmed = false; title.open(); }
});
const title = createTitle({
  audio,
  onContinue() { title.close(); g.S = saved; if (!g.S.objs) g.S.objs = genObjects(); begin(); },
  onNew() { title.close(); custom.open(false, !!saved); },
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
  S.sel = smartTool(g, ft.tx, ft.ty);
  if (S.sel === 'sword' && ['farm', 'wild'].includes(S.scene || 'farm')) {
    const en = g.enemies.reduce((b, e) => { const d = Math.hypot(e.x - S.x, e.y - S.y); return d < 1.8 && (!b || d < b.d) ? { e, d } : b; }, null);
    if (en) { attack(g, en.e); return; }
  }
  const it = ITEMS[S.sel];
  if (it && it.eat && !it.seed) { if (consume(g, S.sel)) audio.play('feed'); return; }
  act(g, ft.tx, ft.ty);
}
const controls = createControls(g, input, { onAct: doAction, onTools: () => wheel.open('tools'), onItems: () => wheel.open('items') });
const hud = createHud(g, controls);
addEventListener('keydown', e => {
  if (!started || custom.isOpen() || title.isOpen() || dialog.isOpen || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
  const k = e.key.toLowerCase();
  if (k === ' ') { e.preventDefault(); doAction(); }
  else if (k === '1' || k === 'tab') { e.preventDefault(); wheel.open('tools'); }
  else if (k === '2' || k === 'i') wheel.open('items');
  else if (k === 'm') mapView.isOpen ? mapView.close() : mapView.open();
  else if (k === 'escape') { wheel.close(); mapView.close(); document.querySelectorAll('.overlay.on').forEach(o => { if (o.id !== 'ovLook') o.classList.remove('on'); }); }
});

$('#bSave').onclick = () => doSave(true);
$('#bBag').onclick = () => { audio.play('ui'); menu.open(); };
$('#bLook').onclick = () => { audio.play('ui'); custom.open(true, false); };
$('#bSet').onclick = () => { audio.play('ui'); settingsPanel.open(); };
$('#bMap').onclick = () => { audio.play('ui'); mapView.open(); };

async function begin() {
  // le chemin vers le village doit rester libre (anciennes sauvegardes)
  for (const k in g.S.objs) { const [x, y] = k.split(',').map(Number); if (isPath(x, y) || isGate(x, y) || isLunaLot(x, y)) delete g.S.objs[k]; }
  for (const [x, y] of BUSHES) delete g.S.objs[x + ',' + y];   // les buissons à baies gardent leur place
  for (const id in NPCS) registerNPC(g, NPCS[id]);
  for (const id in g.npcs) placeNPC(g.npcs[id], g.S, OUT_FROM, OUT_TO);
  if (!g.S.intro.arrived) { // arrivée en train : le train repart pendant que le héros repense à l'annonce
    g.trainT = performance.now();
    setTimeout(() => g.bus.emit('say', { name: g.S.name, color: '#ffdf8a', lines: INTRO_LINES, onEnd: () => { g.S.intro.arrived = true; toast('🏚️ Ta cabane est au nord, au bout du chemin.'); } }), 2600);
  }
  started = true; custom.close(); hud.show(); renderer.initWeather(); ensureOrders(g);
  if (net.sb) { playerMarket = createPlayerMarket(net.sb, net.uid, g); await upsertProfile(net.sb, net.uid, g.S); mp = createMultiplayer({ sb: net.sb, uid: net.uid, g }); mp.join(); }
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
    updatePlayer(g, dt, input.keys, (tx, ty) => act(g, tx, ty));
    const wf = g.player.walkFrame; if (wf !== lastFrame && (wf === 1 || wf === 3)) audio.play('step'); lastFrame = wf;
    tickTime(g, dt * 1000);
    wander(g, dt);
    updateWild(g, dt); // les monstres ne vivent que dans les Caverne sombre
    autoPickup(g);
    pickTestSword(g, Math.floor(g.S.x), Math.floor(g.S.y - .2)); pickFieldTool(g, Math.floor(g.S.x), Math.floor(g.S.y - .2)); mystTick(g); cookTick(g);
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
    if ((hudT += dt) > 0.25) { hudT = 0; hud.update(); repairPanel.update(started && !dialog.isOpen); }
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
  const adapters = store ? [localAdapter(store)] : [];
  if (net.sb) adapters.push(supabaseAdapter(net.sb, net.uid));
  saver = createSaveManager({ adapters, getState: () => g.S, canSave: () => started });
  setInterval(() => doSave(false), CFG.AUTOSAVE_MS);
  document.addEventListener('visibilitychange', () => { if (document.hidden) doSave(false); });
  saved = await saver.load();
  if (saved) { g.S.look = { ...saved.look }; g.S.name = saved.name; title.setSave(true); }
})();
