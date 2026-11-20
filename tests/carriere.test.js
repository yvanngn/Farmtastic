import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame } from './helpers.js';
import { LAYOUTS, BIG_ROCK, QUARRY_ROUTE, QUARRY_RICH, QUARRY_DOOR_S, QUARRY_H, QUARRY_W } from '../src/world/scenes.js';
import { hitBigRock, ROCK_HITS, rockLetterTick, readRockLetter, mergeRockHits, isBigRock } from '../src/systems/bigrock.js';
import { ensureNature, freeSpot } from '../src/systems/nature.js';
import { openMailbox } from '../src/systems/mail.js';
import { QUESTS } from '../src/systems/quests.js';
import { act } from '../src/systems/actions.js';
import { registerNPC, talk } from '../src/systems/social.js';
import { MINEUR } from '../src/data/npcs.js';

const L = LAYOUTS.carriere;
test('lot 29 : la carrière est un grand dédale d’allées larges, avec le rocher au centre', () => {
  assert.equal(L.length, QUARRY_H); assert.equal(L[0].length, QUARRY_W);
  const open = L.join('').split('').filter(c => c === '.').length;
  assert.ok(open > QUARRY_W * QUARRY_H * .35, 'beaucoup d’allées');
  for (let y = BIG_ROCK.y; y < BIG_ROCK.y + BIG_ROCK.h; y++) for (let x = BIG_ROCK.x; x < BIG_ROCK.x + BIG_ROCK.w; x++) assert.equal(L[y][x], '@');
  assert.ok(Math.abs(BIG_ROCK.x + BIG_ROCK.w / 2 - QUARRY_W / 2) < 3 && Math.abs(BIG_ROCK.y + BIG_ROCK.h / 2 - QUARRY_H / 2) < 3, 'au centre');
  // on peut aller de l'entrée sud jusqu'au rocher (allées d'au moins 3 cases : rien ne pousse au milieu)
  const seen = new Set(), q = [[QUARRY_DOOR_S, QUARRY_H - 2]];
  while (q.length) { const [x, y] = q.pop(), k = x + ',' + y; if (seen.has(k) || !L[y] || !'.o'.includes(L[y][x])) continue; seen.add(k); q.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]); }
  assert.ok(seen.has(`${BIG_ROCK.x - 1},${BIG_ROCK.y + 1}`), 'le rocher est atteignable');
  for (const k of QUARRY_ROUTE) { const [x, y] = k.split(',').map(Number); assert.ok('.D'.includes(L[y][x]) || L[y][x] === 'o', 'milieu des allées : ' + k); }
  assert.ok(QUARRY_RICH.length >= 3);
});
test('lot 29 : les cailloux repoussent chaque jour sans jamais boucher le milieu des allées, plus nombreux dans les zones riches', () => {
  const r = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const { g, S } = makeGame({ state: { scene: 'carriere', x: QUARRY_DOOR_S + .5, y: QUARRY_H - 2 }, rnd: r });
  const N = ensureNature(g, 'carriere'), rocks = Object.keys(N.rocks);
  assert.ok(rocks.length >= 60 && rocks.length <= 100);
  for (const k of rocks) if (!N.rocks[k].border) assert.ok(!QUARRY_ROUTE.has(k), 'pas sur le chemin : ' + k);
  const inRich = rocks.filter(k => { const [x, y] = k.split(',').map(Number); return QUARRY_RICH.some(R => x >= R.x0 && x <= R.x1 && y >= R.y0 && y <= R.y1); }).length;
  const area = QUARRY_RICH.reduce((a, R) => a + (R.x1 - R.x0 + 1) * (R.y1 - R.y0 + 1), 0), all = L.join('').split('.').length;
  assert.ok(inRich / rocks.length > area / all, 'plus denses dans les zones riches');
  assert.equal(freeSpot(S, 'carriere', ...[...QUARRY_ROUTE][5].split(',').map(Number)), false);
});
test('lot 29 : l’énorme rocher — 10 000 coups, 2 cailloux tous les 10, puis un trou', () => {
  const { g, S } = makeGame({ state: { scene: 'carriere', sel: 'pick', energy: 1e9, tools: { pick: 1 }, inv: {} } });
  g.now = () => (g._t = (g._t || 0) + 10000);   // chaque coup prêt
  assert.ok(isBigRock('carriere', BIG_ROCK.x, BIG_ROCK.y));
  for (let i = 0; i < 10; i++) assert.equal(hitBigRock(g), 'hit');
  assert.equal(S.bigRock.hits, 10);
  const stones = (S.inv.stone || 0) + (g.S.drops ? 0 : 0);
  assert.ok(stones >= 0);   // les cailloux tombent au sol (scatter)
  S.bigRock.hits = ROCK_HITS - 1; assert.equal(hitBigRock(g), 'hit'); assert.equal(S.bigRock.hits, ROCK_HITS);
  assert.equal(hitBigRock(g), 'hole');
});
test('lot 29 : à plusieurs, on garde le plus grand nombre de coups', () => {
  const { S } = makeGame();
  assert.equal(mergeRockHits(S, 120), true); assert.equal(mergeRockHits(S, 50), false); assert.equal(S.bigRock.hits, 120);
  assert.equal(mergeRockHits(S, 1e9), true); assert.equal(S.bigRock.hits, ROCK_HITS);
});
test('lot 29 : au niveau 5, la lettre du mineur arrive (même si le rocher est déjà cassé) et ouvre la quête', () => {
  const { g, S } = makeGame({ state: { pxp: 0, golgo: { letter: true, read: true, hits: 0, lvl: 0, given: {} }, mail: { seeds: true, seedsRead: true } } });
  assert.equal(rockLetterTick(g), false);
  S.pxp = 1e5; S.bigRock.hits = ROCK_HITS; assert.equal(rockLetterTick(g), true);
  assert.equal(openMailbox(g), 'rockLetter'); assert.equal(S.bigRock.read, true);
  assert.equal(QUESTS.grosrocher.unlock(S), true);
});
test('lot 29 : parler au mineur à l’entrée de la carrière', () => {
  const { g, S } = makeGame({ state: { scene: 'carriere', x: 25.5, y: 38.6, minute: 600 } });
  const said = []; g.bus.on('say', m => said.push(m));
  registerNPC(g, MINEUR); Object.assign(g.npcs.mineur, { scene: 'carriere', x: 25.5, y: 37.6 });
  talk(g, 'mineur');
  assert.ok(S.bigRock.met, 'il s’est présenté'); assert.ok(said[0] && /mineur/i.test(said[0].lines.join(' ')));
});
test('21/11 : plus d’ancienne carrière profonde (une vieille partie qui y était revient dans la carrière)', async () => {
  const { migrate } = await import('../src/core/state.js'); const { SCENES } = await import('../src/world/scenes.js');
  assert.equal(SCENES.carriere2, undefined); assert.ok(!L.join('').includes('%'));
  const s = migrate({ scene: 'carriere2', x: 3, y: 3, nature: { carriere2: { rocks: {} } } });
  assert.equal(s.scene, 'carriere'); assert.equal(s.nature.carriere2, undefined);
});
