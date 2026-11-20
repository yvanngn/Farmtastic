// 20/11 : quêtes « Le premier étal » (Suzie) et « La cuisine du chef » (Remy), prix libre à l'étal.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame } from './helpers.js';
import { etalTick, SUZIE_STAND } from '../src/systems/etal.js';
import { listItem, standTick, saleDelay, priceRange, nightsFor } from '../src/systems/stand.js';
import { questProgress, questVisible } from '../src/systems/quests.js';
import { cuistotTalk } from '../src/systems/resto.js';
import { CUISTOT } from '../src/data/npcs.js';

test('20/11 : Suzie, à l’étal, apprend à vendre et donne un bois', () => {
  const { g, S, clock } = makeGame({ state: { scene: 'place', x: SUZIE_STAND.x - 1, y: SUZIE_STAND.y, inv: {} } });
  const said = []; g.bus.on('say', d => said.push(d));
  assert.equal(questVisible(S, 'etal'), false);
  assert.equal(etalTick(g), 'met'); assert.equal(S.inv.wood, 1); assert.ok(said.some(d => d.lines.some(l => /moins c'est cher/i.test(l))));
  assert.equal(questVisible(S, 'etal'), true); assert.equal(questProgress(S, 'etal').cur, 1);
  assert.equal(listItem(g, 'wood', 1, 0.5), true); assert.equal(questProgress(S, 'etal').cur, 2);
  clock.t += 10 * 60000; standTick(g); assert.equal(questProgress(S, 'etal').cur, 3, 'vendu');
  assert.equal(etalTick(g), 'fin');
});

test('20/11 : prix libre de la moitié au double, durée avec une part de hasard', () => {
  assert.deepEqual(priceRange('wheat'), [3, 12]);
  assert.ok(saleDelay(0.5, 0) < saleDelay(0.5, 1), 'le hasard joue'); assert.ok(saleDelay(0.5, .5) < saleDelay(0.9, .5), 'moins cher → plus vite');
  assert.equal(saleDelay(1, .5), Infinity); assert.equal(nightsFor(2, .9), 2); assert.equal(nightsFor(1.5, .1), 2, 'parfois une nuit de plus');
});

test('20/11 : Remy offre le plan du chaudron une fois le four réparé', () => {
  const { g, S } = makeGame({ state: { resto: { asked: true, oven: true, knife: true }, recipes: [] } });
  assert.equal(questVisible(S, 'cuisine'), true); assert.equal(questProgress(S, 'cuisine').cur, 0);
  assert.equal(cuistotTalk(g, CUISTOT), true); assert.ok(S.recipes.includes('chaudron'));
  assert.equal(questProgress(S, 'cuisine').cur, 1);
  assert.equal(cuistotTalk(g, CUISTOT), false, 'une seule fois');
});
