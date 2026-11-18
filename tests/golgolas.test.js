import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame } from './helpers.js';
import { letterTick, readLetter, hitMeteor, golgolasTalk, METEOR_HITS, MAILBOX, zoneOpen } from '../src/systems/golgolas.js';
import { questVisible, questProgress } from '../src/systems/quests.js';
import { stackSize } from '../src/systems/inventory.js';
import { act } from '../src/systems/actions.js';
import { GOLGOLAS } from '../src/data/npcs.js';
import { SCENES } from '../src/world/scenes.js';

test('lot 13 : lettre de Golgolas dès le niveau 5, la zone au sud de la gare s’ouvre en la lisant', () => {
  const { g, S } = makeGame({ state: { pxp: 0 } });
  assert.equal(letterTick(g), false, 'pas avant le niveau 5');
  S.pxp = 1e5; assert.equal(letterTick(g), true); assert.equal(letterTick(g), false, 'une seule lettre');
  assert.ok(!zoneOpen(S)); assert.ok(!questVisible(S, 'golgolas'));
  S.scene = 'gare'; const d = SCENES.gare.doors.find(x => x.to === 'golgolas'); assert.equal(act(g, d.x, d.y), 'locked', 'chemin barré');
  S.scene = 'farm'; assert.equal(act(g, MAILBOX.x, MAILBOX.y), 'letter'); assert.ok(zoneOpen(S)); assert.ok(questVisible(S, 'golgolas'));
  S.scene = 'gare'; assert.equal(act(g, d.x, d.y), 'door'); assert.equal(S.scene, 'golgolas');
});

test('lot 13 : météorite (pioche, 1 caillou tous les 10 coups), puis 500 bois, 500 pierres, 200 champignons → piles de 15', () => {
  const { g, S } = makeGame({ state: { scene: 'golgolas', sel: 'pick', tools: { pick: 1 }, energy: 1e9, maxE: 1e9, inv: {}, golgo: { letter: true, read: true, hits: 0, lvl: 0, given: {} } } });
  g.npcs.golgolas = { ...GOLGOLAS };
  for (let i = 0; i < 20; i++) hitMeteor(g);
  assert.equal(S.golgo.hits, 20); assert.equal(S.inv.stone, 2);
  assert.ok(golgolasTalk(g, g.npcs.golgolas)); assert.equal(S.golgo.lvl, 0, 'rien avant la fin de la météorite');
  S.golgo.hits = METEOR_HITS - 1; hitMeteor(g); assert.equal(S.golgo.hits, METEOR_HITS); assert.equal(hitMeteor(g), 'done');
  assert.equal(stackSize(S), 10);
  S.inv = { wood: 9, stone: 9, mousseron_s: 9 }; S.golgo.given = { wood: 491, stone: 491, mush: 191 };
  golgolasTalk(g, g.npcs.golgolas);
  assert.equal(S.golgo.lvl, 1); assert.equal(stackSize(S), 15, 'le centre agrandit les piles'); assert.ok(questProgress(S, 'golgolas').done.every(Boolean));
});
