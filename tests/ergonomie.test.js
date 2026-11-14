import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame } from './helpers.js';
import { smartTool } from '../src/systems/actions.js';
import { hitObject } from '../src/systems/resources.js';
import { harvest, plant } from '../src/systems/farming.js';
import { migrate } from '../src/core/state.js';

test('action intelligente : bon outil selon la cible', () => {
  const { g, S, clock } = makeGame();
  S.objs['30,20'] = { t: 'tree', hp: 3 }; S.objs['31,20'] = { t: 'rock', hp: 2 };
  assert.equal(smartTool(g, 30, 20), 'axe');
  assert.equal(smartTool(g, 31, 20), 'pick');
  plant(g, 5, 9, 'wheat_seed'); clock.t += 61_000;
  S.sel = 'axe';
  assert.equal(smartTool(g, 5, 9), 'sickle', 'récolte mûre');
  assert.equal(smartTool(g, 0, 0), 'hand', 'rien devant : on range la hache');
});

test('action intelligente : un objet tenu est gardé, sauf devant un arbre ou un monstre', () => {
  const { g, S } = makeGame({ state: { sel: 'hay' } });
  assert.equal(smartTool(g, 5, 9), 'hay');
  S.objs['30,20'] = { t: 'tree', hp: 3 };
  assert.equal(smartTool(g, 30, 20), 'axe');
  g.enemies.push({ x: S.x + 1, y: S.y, hp: 100 });
  assert.equal(smartTool(g, 5, 9), 'sword');
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
  assert.deepEqual([f.look.body, f.look.bottom, f.look.hair], ['f', 'skirt', 5]);
});
