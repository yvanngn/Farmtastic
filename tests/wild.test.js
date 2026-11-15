import { CFG } from '../src/config.js';
// Lot 10 : Terres sauvages (zone de combat façon Zelda Game Boy).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame, seq } from './helpers.js';
import { act } from '../src/systems/actions.js';
import { updateWild, ensureRocks, hitZRock, roomOf, openWild, spawnRoom } from '../src/systems/wild.js';
import { attack } from '../src/systems/combat.js';
import { ROOM_MOBS, ZROCKS, ZROCK_COUNT, GATE } from '../src/data/wild.js';
import { fulfillOrder, village } from '../src/systems/market.js';
import { PROJECTS } from '../src/data/requests.js';
import { defaultState } from '../src/core/state.js';

const rand = (k = 5) => () => ((k = (k * 9301 + 49297) % 233280) / 233280);

test('l’entrée de la caverne (au bout de la forêt) est fermée au début', () => {
  assert.equal(defaultState().wildOpen, false);
  const { g, S } = makeGame({ state: { wildOpen: false, scene: 'foret' } });
  assert.equal(act(g, GATE.x, GATE.y), 'locked');
  assert.equal(S.scene, 'foret');
});

test('le premier chantier fini (lampadaires) ouvre la zone et donne l’épée (quand la caverne sera ouverte)', () => {
  CFG.CAVE_OPEN = true;
  const { g, S } = makeGame({ state: { wildOpen: false, tools: { axe: 1 }, inv: { wood: PROJECTS[0].goal } } });
  village(S);
  S.market = { slots: [{ order: { id: 'a', kind: 'chantier', item: 'wood', qty: PROJECTS[0].goal, price: 1, bot: 'x' }, next: 0 }] };
  fulfillOrder(g, 'a');
  assert.equal(S.wildOpen, true);
  assert.equal(S.tools.sword, 1);
  assert.equal(openWild(g), false, 'une seule fois');
  S.scene = 'foret'; assert.equal(act(g, GATE.x, GATE.y), 'door');
  assert.equal(S.scene, 'wild');
  CFG.CAVE_OPEN = false;
});

test('chaque salle a ses monstres ; ils apparaissent en entrant dans la salle', () => {
  const { g, S } = makeGame({ rnd: rand(), state: { wildOpen: true, scene: 'wild', x: 1.6, y: 4.5 } });
  updateWild(g, 0.016);
  assert.equal(roomOf(S.x, S.y), 0);
  assert.equal(g.enemies.length, ROOM_MOBS[0].length);
  S.x = 15; S.y = 4.5; updateWild(g, 0.016);
  assert.deepEqual(g.enemies.map(e => e.type).sort(), [...ROOM_MOBS[1]].sort());
  assert.ok(g.enemies.every(e => e.room === 1));
});

test('le cochon tire ; une balle blesse le joueur, puis il clignote (invincible un instant)', () => {
  const { g, S } = makeGame({ rnd: rand(), state: { wildOpen: true, scene: 'wild', x: 25, y: 4.5, hp: 100 } });
  g.wildRoom = 2; g.enemies.length = 0; g.shots = [];
  g.enemies.push({ type: 'pig', x: 21, y: 4.5, hp: 90, cd: 0, hit: 0, room: 2, t: 0 });
  updateWild(g, 0.016);
  assert.equal(g.shots.length, 1);
  assert.ok(g.shots[0].vx > 0 && g.shots[0].vy === 0, 'tir en ligne droite');
  for (let i = 0; i < 120 && S.hp === 100; i++) updateWild(g, 0.016);
  assert.equal(S.hp, 88);
  g.shots.push({ x: S.x, y: S.y - .3, vx: 0, vy: 0, life: 1, dmg: 12 }); updateWild(g, 0.016);
  assert.equal(S.hp, 88, 'invincible juste après');
});

test('épée : vaincre un slime bleu donne de la gelée, un cochon de l’argent', () => {
  const { g, S } = makeGame({ rnd: seq(0.5), state: { scene: 'wild', x: 5, y: 4, money: 0, inv: {} } });
  const slime = { type: 'slime_b', x: 5.5, y: 4, hp: 100, cd: 1, hit: 0, room: 0, t: 0 }, pig = { type: 'pig', x: 4.5, y: 4, hp: 30, cd: 1, hit: 0, room: 0, t: 0 };
  g.enemies.push(slime, pig);
  for (let i = 0; i < 3; i++) attack(g, slime);
  assert.equal(S.inv.slime, 1);
  attack(g, pig);
  assert.equal(S.money, 10);
});

test('cailloux : 3 types (le 2 rare, le 3 plus rare), renouvelés chaque jour', () => {
  const { g, S } = makeGame({ rnd: rand(9) });
  let n = { zrock1: 0, zrock2: 0, zrock3: 0 };
  for (let d = 1; d <= 40; d++) { S.day = d; for (const o of Object.values(ensureRocks(g))) n[o.t]++; }
  assert.equal(Object.values(ensureRocks(g)).length, ZROCK_COUNT);
  assert.ok(n.zrock1 > n.zrock2 && n.zrock2 > n.zrock3 && n.zrock3 > 0, JSON.stringify(n));
});

test('minerais : rubis ou émeraude, plus souvent sur les gros cailloux', () => {
  assert.ok(ZROCKS.zrock1.ore < ZROCKS.zrock2.ore && ZROCKS.zrock2.ore < ZROCKS.zrock3.ore && ZROCKS.zrock1.ore <= 0.02);
  const { g, S } = makeGame({ rnd: seq(0.01, 0.9), state: { scene: 'wild', sel: 'pick', inv: {}, tools: { pick: 5 } } });
  S.wild = { day: S.year + '-' + S.season + '-' + S.day, rocks: { '5,5': { t: 'zrock3', hp: 6 } } };
  hitZRock(g, 5, 5); hitZRock(g, 5, 5);
  assert.equal(S.inv.stone, 3);
  assert.equal((S.inv.ruby || 0) + (S.inv.emerald || 0), 1);
});

test('K.O. dans la zone : retour à la ferme', () => {
  const { g, S } = makeGame({ state: { scene: 'wild', hp: 5 } });
  g.player.iframe = 0; g.shots = [{ x: S.x, y: S.y - .3, vx: 0, vy: 0, life: 1, dmg: 12 }]; g.wildRoom = roomOf(S.x, S.y);
  updateWild(g, 0.016);
  assert.equal(S.scene, 'farm');
});

test('mode test : portail ouvert dès le début et épée posée devant', async () => {
  const { CFG } = await import('../src/config.js');
  const { pickTestSword, TEST_SWORD } = await import('../src/systems/wild.js');
  CFG.ACCES_TEST = true; CFG.CAVE_OPEN = true;
  try {
    const { g, S } = makeGame({ state: { tools: {}, wildOpen: false, scene: 'farm' } });
    assert.equal(pickTestSword(g, TEST_SWORD.x, TEST_SWORD.y), true);
    assert.equal(S.tools.sword, 1);
    assert.equal(pickTestSword(g, TEST_SWORD.x, TEST_SWORD.y), false, 'une seule fois');
    S.scene = 'foret'; assert.equal(act(g, 29, 9), 'door');
    assert.equal(S.scene, 'wild');
  } finally { CFG.ACCES_TEST = false; CFG.CAVE_OPEN = false; }
});

test('mort dans la mine : retour à la ferme, -10 %, et le clignotement s’arrête', async () => {
  const { updateWild: up } = await import('../src/systems/wild.js');
  const { g, S } = makeGame({ state: { scene: 'wild', x: 5, y: 4, hp: 5, money: 1000 } });
  g.enemies.length = 0; g.wildRoom = 0;
  g.enemies.push({ type: 'slime_v', x: 5, y: 4.3, hp: 60, cd: 0, hit: 0, t: 0 });
  up(g, 0.016);
  assert.equal(S.scene, 'farm'); assert.equal(S.money, 900); assert.ok(S.hp > 0);
  g.player.iframe = 0.8;            // touché juste avant de tomber
  for (let i = 0; i < 120; i++) up(g, 1 / 60);
  assert.equal(g.player.iframe, 0, 'il ne clignote plus');
});

test('caverne sombre : 15 salles, sortie dès l’arrivée, escalier vers l’étage 2 (bloqué)', async () => {
  const { LAYOUTS, SCENES } = await import('../src/world/scenes.js');
  const { ROOMS_X, ROOMS_Y } = await import('../src/data/wild.js');
  const L = LAYOUTS.wild;
  assert.equal(ROOMS_X * ROOMS_Y, 15); assert.equal(ROOM_MOBS.length, 15);
  assert.equal(L[0].length, 50); assert.equal(L.length, 24);
  assert.equal(SCENES.wild.dark, true, 'il fait sombre');
  assert.equal(L[4][0], 'D', 'la sortie est juste à côté de l’arrivée');
  const { g, S } = makeGame({ state: { wildOpen: true, scene: 'wild', x: 44.5, y: 21 } });
  let sx, sy; L.forEach((r, y) => { const x = r.indexOf('S'); if (x >= 0) { sx = x; sy = y; } });
  assert.equal(act(g, sx, sy), 'stairs');
  // toutes les salles sont reliées (on peut se balader partout)
  const seen = new Set(['1,4']), q = [[1, 4]];
  while (q.length) { const [x, y] = q.pop(); for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + a, ny = y + b, k = nx + ',' + ny; if (!seen.has(k) && L[ny] && '.S'.includes(L[ny][nx] || 'T')) { seen.add(k); q.push([nx, ny]); } } }
  const rooms = new Set([...seen].map(k => { const [x, y] = k.split(',').map(Number); return roomOf(x, y); }));
  assert.equal(rooms.size, 15);
});

test('pour l’instant : caverne fermée, pas d’épée', async () => {
  const { isOpen } = await import('../src/systems/wild.js');
  const { g, S } = makeGame({ state: { wildOpen: true, tools: {} } });
  assert.equal(isOpen(S), false);
  assert.equal(openWild(g), false); assert.equal(S.tools.sword, undefined);
});
