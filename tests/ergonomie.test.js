import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame } from './helpers.js';
import { hitObject } from '../src/systems/resources.js';
import { harvest, plant } from '../src/systems/farming.js';
import { migrate } from '../src/core/state.js';

test('pas de choix automatique : devant un arbre, il faut prendre la hache soi-même', async () => {
  const { act } = await import('../src/systems/actions.js');
  const { g, S, toasts } = makeGame({ state: { sel: 'hand', tools: { axe: 1, pick: 1, hammer: 1 } } });
  S.objs['30,20'] = { t: 'tree', k: 'oak', g: 3, hp: 8 };
  act(g, 30, 20); assert.equal(S.objs['30,20'].hp, 8, 'rien ne se passe');
  assert.match(toasts().at(-1), /roue des outils/);
  S.sel = 'axe'; act(g, 30, 20); assert.ok(S.objs['30,20'].hp < 8);
});
test('coup sur un arbre : animation d’outil et impact émis', () => {
  const { g, S } = makeGame();
  const seen = [];
  g.bus.on('swing', t => seen.push(['swing', t]));
  g.bus.on('objHit', h => seen.push(['hit', h.t, h.broken]));
  S.sel = 'axe'; S.objs['30,20'] = { t: 'tree', hp: 1 };
  hitObject(g, 30, 20);
  assert.deepEqual(seen, [['swing', 'axe'], ['hit', 'tree', true]]);
});

test('récolte à la faucille : animation', () => {
  const { g, S, clock } = makeGame();
  let tool = null; g.bus.on('swing', t => { tool = t; });
  plant(g, 5, 9, 'wheat_seed'); clock.t += 61_000; S.sel = 'sickle';
  harvest(g, 5, 9);
  assert.equal(tool, 'sickle');
});

test('apparence : silhouette et bas par défaut, conservés au chargement', () => {
  const s = migrate({ look: { skin: '#000' } });
  assert.equal(s.look.body, 'h');
  assert.equal(s.look.bottom, 'pant');
  const f = migrate({ look: { body: 'f', bottom: 'skirt', hair: 5 } });
  assert.deepEqual([f.look.body, f.look.bottom, f.look.hair], ['f', 'skirt', 4], 'couettes → queue de cheval (options de la poupée)');
});

test('menu titre : Continuer seulement avec une sauvegarde', async () => {
  const { titleMenu } = await import('../src/ui/title.js');
  assert.deepEqual(titleMenu(false).map(i => i.id), ['new', 'howto', 'settings']);
  assert.deepEqual(titleMenu(true).map(i => i.id), ['continue', 'new', 'howto', 'settings']);
  assert.deepEqual(titleMenu(true, true).map(i => i.id), ['continue', 'games', 'new', 'howto', 'settings'], 'dès une partie : « Mes parties » (pour reprendre ou effacer)');
  assert.equal(titleMenu(true).find(i => i.main).id, 'continue');
});

// ---- Décor : le héros commente ce qu'on ne peut pas prendre ----
import { act as act2 } from '../src/systems/actions.js';
import { EXAMINE } from '../src/data/examine.js';
import { CFG } from '../src/config.js';

test('interagir avec le décor : un petit texte du héros', () => {
  const { g, S } = makeGame();
  const said = []; g.bus.on('say', d => said.push(d.lines[0]));
  assert.equal(act2(g, 3, 2), 'look');
  assert.equal(said.at(-1), EXAMINE.farm.house);
  assert.equal(act2(g, 12, 24), 'look', 'la mare');
  S.scene = 'town'; act2(g, 16, 7);
  assert.equal(said.at(-1), EXAMINE.tiles.F);
  S.scene = 'house'; act2(g, 4, 4);
  assert.equal(said.at(-1), EXAMINE.tiles.T);
  assert.notEqual(act2(g, 10, 3), 'look', 'le lit sert à dormir');
});

test('le temps passe plus lentement : 1 minute de jeu = 1 seconde', () => {
  assert.equal(CFG.MS_PER_MIN, 1000);
});

test('index.html (GitHub Pages) est à jour avec play.html (claude.ai)', async () => {
  const { readFileSync } = await import('node:fs');
  const idx = readFileSync(new URL('../index.html', import.meta.url), 'utf8'), play = readFileSync(new URL('../play.html', import.meta.url), 'utf8');
  for (const id of [...play.matchAll(/id="([^"]+)"/g)].map(m => m[1])) assert.ok(idx.includes(`id="${id}"`), 'manque dans index.html : #' + id);
});

test('enseignes : police pixel nette, accents compris, largeur prévisible', async () => {
  const { pixText, pixTextWidth } = await import('../src/render/pixfont.js');
  const px = []; pixText((x, y) => px.push([x, y]), 'É', 10, 10, '#000');
  assert.ok(px.some(([, y]) => y < 10), 'accent au-dessus');
  assert.equal(pixTextWidth('MARCHÉ'), 23);
  const all = []; pixText((x, y) => all.push(x), 'CENTRE-VILLE →', 0, 0, '#000');
  assert.ok(Math.max(...all) - Math.min(...all) <= pixTextWidth('CENTRE-VILLE →'));
});

test('jauges : orange sous 50 %, rouge vif sous 20 %', async () => {
  const { gaugeLevel, SHAKE_FROM, LOW_RED } = await import('../src/ui/hud.js');
  assert.equal(gaugeLevel(.8), 'ok'); assert.equal(gaugeLevel(.4), 'orange'); assert.equal(gaugeLevel(.1), 'rouge');
  assert.ok(SHAKE_FROM > LOW_RED, 'elle tremble avant de passer au rouge');
});

test('énergie : affichée par défaut en arc autour du bouton d’action', async () => {
  globalThis.localStorage ??= { getItem: () => null, setItem() {} };
  const { nrjMode } = await import('../src/ui/hud.js');
  assert.equal(nrjMode(), 'arc');
});

test('zoom « Loin » par défaut', async () => {
  const { ZOOM_DEFAULT, ZOOMS } = await import('../src/ui/settingsPanel.js');
  assert.equal(ZOOMS[ZOOM_DEFAULT], 'Loin');
});

test('chaque niveau de zoom montre plus loin que le précédent (« Loin » ≠ « Très loin »)', async () => {
  const { zoomScale } = await import('../src/ui/settingsPanel.js');
  for (const side of [600, 800, 1080, 1600, 2160]) {
    const s = [9, 12, 15, 20].map(z => zoomScale(side, z));
    for (let i = 1; i < 4; i++) assert.ok(s[i] < s[i - 1] || s[i] === 1, `écran ${side} : ${s}`);
  }
});

test('héros : poupée de sprites, choix limités, anciens looks convertis', async () => {
  const { DOLL_OPTS, dollFrame } = await import('../src/render/heroDoll.js');
  const { defaultState, migrate } = await import('../src/core/state.js');
  const L = defaultState().look;
  assert.equal(L.doll, true);
  for (const k of ['skin', 'eye', 'hairC', 'shirt', 'pants']) assert.ok(DOLL_OPTS[k].includes(L[k]), k);
  const m = migrate({ name: 'x', look: { body: 'h', hair: 2, shirt: '#123456', hat: 'melon', vest: '#5a3a2a' } }).look;
  assert.equal(m.doll, true); assert.equal(m.hair, 0, 'coiffure inconnue → courts'); assert.equal(m.hat, '', 'chapeau absent des options → aucun'); assert.equal(m.shirt, '#123456');
  assert.equal(typeof dollFrame, 'function');
});
