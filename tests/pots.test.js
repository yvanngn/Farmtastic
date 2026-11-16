import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame } from './helpers.js';
import { buyPattern, placePot, usePot, potAt } from '../src/systems/pots.js';
import { craftHand } from '../src/systems/cooking.js';
import { buy } from '../src/systems/economy.js';

test('lot 2 : patron du chaudron à 50 🪙, louche, jauge de cuisson', () => {
  const { g, S } = makeGame({ state: { scene: 'farm', money: 100, x: 20.5, y: 20.5, inv: { stone: 20, wood: 10, berry: 4 } } });
  assert.equal(buyPattern(g, 'p_chaudron'), true); assert.equal(S.money, 50);
  assert.equal(buyPattern(g, 'p_chaudron'), false, 'une seule fois');
  assert.equal(craftHand(g, 'chaudron'), true); assert.equal(S.inv.chaudron, 1);
  S.sel = 'chaudron'; assert.equal(placePot(g, 21, 20), true);
  const p = potAt(S, 21, 20); assert.ok(p);
  assert.equal(usePot(g, p), 'need', 'sans louche');
  assert.equal(buy(g, 'louche'), true); S.sel = 'louche';
  const said = []; g.bus.on('say', d => said.push(d));
  assert.equal(usePot(g, p), 'menu'); said.at(-1).onChoose(0);
  assert.equal(S.inv.berry || 0, 0);
  let r; for (let i = 0; i < 10; i++) r = usePot(g, p);
  assert.equal(r, 'done'); assert.equal(S.inv.confiture_baies, 1); assert.equal(p.cook, null);
});

test('lot 4 : métiers — patrons et cuisine font monter les niveaux', async () => {
  const { jobXp, jobLevel } = await import('../src/systems/jobs.js');
  const { SHOPS } = await import('../src/data/shops.js');
  const { g, S } = makeGame({ state: { scene: 'farm', money: 1000, x: 20.5, y: 20.5, inv: { stone: 20, wood: 10, flour: 2, louche: 1 } } });
  buyPattern(g, 'p_chaudron'); craftHand(g, 'chaudron');
  assert.equal(jobXp(S, 'forgeron'), 15);
  S.sel = 'chaudron'; placePot(g, 21, 20); const p = potAt(S, 21, 20); S.sel = 'louche';
  const said = []; g.bus.on('say', d => said.push(d));
  assert.equal(usePot(g, p), 'missing', 'pain inconnu sans patron');
  assert.equal(buyPattern(g, 'p_pain'), false, 'pas encore disponible');
  const { PATTERNS } = await import('../src/data/patterns.js'); PATTERNS.p_pain.soon = false;
  buyPattern(g, 'p_pain'); PATTERNS.p_pain.soon = true; usePot(g, p); said.at(-1).onChoose(said.at(-1).choices.findIndex(c => /Pain/.test(c)));
  for (let i = 0; i < 10; i++) usePot(g, p);
  assert.equal(S.inv.bread, 2); assert.equal(jobXp(S, 'cuisinier'), 15);
  for (let i = 0; i < 3; i++) (await import('../src/systems/jobs.js')).gainJob(g, 'cuisinier');
  assert.equal(jobLevel(jobXp(S, 'cuisinier')), 2);
  assert.deepEqual(SHOPS.bakery.sells, ['flour'], 'magasins : ingrédients de base seulement');
});
