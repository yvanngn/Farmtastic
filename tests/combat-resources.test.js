import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame, seq, ramasse } from './helpers.js';
import { attack, updateEnemies, spawnEnemies } from '../src/systems/combat.js';
import { hitObject } from '../src/systems/resources.js';
import { useEnergy, consume } from '../src/systems/player.js';

test('3 coups d’épée tuent un slime et donnent de la gelée', () => {
  const { g, S } = makeGame();
  const e = { x: S.x + 1, y: S.y, hp: 100, cd: 0, hit: 0 };
  g.enemies.push(e);
  attack(g, e); attack(g, e); attack(g, e);
  assert.equal(g.enemies.length, 0);
  assert.equal(S.inv.slime, 1);
  assert.equal(S.energy, 98.5);
});

test('contact ennemi : -10 PV, puis K.O. à 0', () => {
  const { g, S } = makeGame({ state: { hp: 10, money: 100 } });
  g.enemies.push({ x: S.x, y: S.y + 0.3, hp: 100, cd: 0, hit: 0 });
  updateEnemies(g, 0.016);
  assert.equal(S.hp, 50);
  assert.equal(S.money, 90);
  assert.equal(g.enemies.length, 0);
});

test('pas de monstre le jour par beau temps', () => {
  const { g } = makeGame({ rnd: seq(0) });
  spawnEnemies(g, 1);
  assert.equal(g.enemies.length, 0);
});

test('arbre : hache obligatoire, 3 coups, bois récolté', () => {
  const { g, S, toasts } = makeGame({ rnd: seq(0.9) });
  S.objs['30,20'] = { t: 'tree', hp: 3 };
  assert.equal(hitObject(g, 30, 20), false);
  assert.match(toasts()[0], /hache/);
  S.sel = 'axe';
  hitObject(g, 30, 20); hitObject(g, 30, 20); hitObject(g, 30, 20);
  assert.equal(S.objs['30,20'].t, 'stump', '19/11 : il reste la souche');
  assert.ok(S.drops.some(d => d.id === 'wood'), 'le bois tombe par terre');
  ramasse(g); assert.equal(S.inv.wood, 5);
  assert.equal(Math.round(S.energy * 100) / 100, 98.05, '0,65 énergie par coup (19/11)');
});

test('énergie insuffisante bloque l’action', () => {
  const { g, S } = makeGame({ state: { energy: 1 } });
  assert.equal(useEnergy(g, 2), false);
  assert.equal(S.energy, 1);
});

test('manger restaure, sans dépasser le maximum', () => {
  const { g, S } = makeGame({ state: { energy: 95, hp: 50, inv: { egg: 1 } } });
  assert.equal(consume(g, 'egg'), true);
  assert.equal(S.energy, 100);
  assert.equal(S.hp, 55);
});

// ---- Lot 3 : bois de l'est ----
import { regrow, forestCount, treeKind } from '../src/systems/resources.js';
import { FOREST, TREE_GROW_DAYS, ROCK_DAYS } from '../src/data/forest.js';
import { genObjects } from '../src/world/map.js';

test('bois de l’est : de nouvelles pousses n’apparaissent que dans la zone, sans dépasser le maximum', () => {
  let i = 0; const { g, S } = makeGame({ rnd: () => ((i = (i * 9301 + 49297) % 233280) / 233280) });
  for (let d = 0; d < 60; d++) regrow(g);
  const c = forestCount(S);
  assert.ok(c.trees <= FOREST.MAX_TREES && c.trees > 30, 'arbres : ' + c.trees);
  assert.equal(c.rocks, 0, '19/11 : plus de pierres qui repoussent à la ferme');
  for (const k in S.objs) assert.ok(+k.split(',')[0] >= FOREST.x0, 'rien ne repousse hors du bois : ' + k);
  const kinds = new Set(Object.entries(S.objs).filter(([, o]) => o.t === 'tree').map(([k, o]) => o.k));
  assert.deepEqual([...kinds].sort(), ['birch', 'oak', 'pine'], '3 essences');
});

test('un arbre met 3 jours à pousser avant de donner du bois', () => {
  const { g, S, toasts } = makeGame({ state: { sel: 'axe', inv: {} } });
  S.objs['40,10'] = { t: 'tree', k: 'pine', g: 0, hp: 3 };
  S.x = 40.5; S.y = 11.5;
  assert.equal(hitObject(g, 40, 10), false);
  assert.match(toasts().at(-1), /sapin pousse encore \(3 j\)/);
  for (let d = 0; d < TREE_GROW_DAYS; d++) regrow(g);
  assert.equal(S.objs['40,10'].g, 3);
  hitObject(g, 40, 10); hitObject(g, 40, 10); hitObject(g, 40, 10); ramasse(g);
  assert.ok(S.inv.wood >= 3, 'le sapin donne du bois');
});

test('pierres : la petite donne 1 pierre, la plus grosse 2', () => {
  const { g, S } = makeGame({ state: { sel: 'pick', inv: {}, tools: { axe: 1, pick: 3, sickle: 1, sword: 1 } } });
  S.objs['40,10'] = { t: 'rock', hp: 2 }; S.objs['41,10'] = { t: 'rock_big', hp: 3 };
  hitObject(g, 40, 10); ramasse(g);
  assert.equal(S.inv.stone, 1);
  hitObject(g, 41, 10); ramasse(g);
  assert.equal(S.inv.stone, 3);
});

test('une pierre prévue sort de terre au bout de 3 jours', () => {
  const { g, S } = makeGame();
  S.objs = {}; S.rockQueue = [{ k: '44,20', d: ROCK_DAYS, big: true }];
  regrow(g); regrow(g);
  assert.equal(S.objs['44,20'], undefined);
  regrow(g);
  assert.equal(S.objs['44,20'].t, 'rock_big');
});

test('carte de départ : le bois respecte ses limites ; anciens arbres = adultes', () => {
  const S = { objs: genObjects() }, c = forestCount(S);
  assert.ok(c.trees <= FOREST.MAX_TREES && c.rocks <= FOREST.MAX_ROCKS, JSON.stringify(c));
  assert.ok(['oak', 'pine', 'birch'].includes(treeKind({ t: 'tree' }, 3, 4)));
});

test('plus de coups pour le bois et les cailloux ; les pierres trop dures sont repérables', async () => {
  const { newTree, newRock, TREE_HP, ROCK_HPS } = await import('../src/world/map.js');
  const { MIN_PICK } = await import('../src/data/tools.js');
  assert.equal(newTree('oak').hp, 8); assert.equal(newRock(false).hp, 6); assert.equal(newRock(true).hp, 9);
  assert.ok(ROCK_HPS.boulder > ROCK_HPS.rock_big && TREE_HP > 3);
  assert.ok(MIN_PICK.boulder > 1, 'le gros rocher demande une meilleure pioche (dessiné plus foncé)');
});

test('21/11 : ce qu’on casse se répand au sol, on le ramasse en passant dessus (son par composant)', async () => {
  const { pickDrops, pickSound, SCATTER_MS } = await import('../src/systems/inventory.js');
  const { g, S, clock } = makeGame({ rnd: seq(0.9), state: { sel: 'axe', inv: {} } });
  S.objs['30,20'] = { t: 'tree', hp: 1 }; hitObject(g, 30, 20);
  assert.ok(!S.inv.wood, 'pas directement dans le sac');
  const d = S.drops.find(x => x.id === 'wood'); assert.ok(Math.abs(d.x - 30) <= 1 && Math.abs(d.y - 20) <= 1, 'autour de l’arbre');
  const sfx = []; g.bus.on('sfx', s => sfx.push(s));
  pickDrops(g, d.x, d.y); assert.ok(!S.inv.wood, 'encore en l’air');
  clock.t += SCATTER_MS; pickDrops(g, d.x, d.y); assert.ok(S.inv.wood > 0); assert.ok(sfx.includes('getWood'));
  assert.equal(pickSound('stone'), 'getStone'); assert.equal(pickSound('gold_ore'), 'getOre'); assert.equal(pickSound('berry'), 'getFood');
});

test('lot 8 : beaucoup plus d’arbres et de cailloux au départ, et autant remis à chaque saison même si la ferme est vidée', async () => {
  const { seasonRestock } = await import('../src/systems/resources.js');
  const { newDay } = await import('../src/systems/time.js');
  const o = genObjects(), n = t => Object.values(o).filter(x => t.includes(x.t)).length;
  assert.ok(n(['tree']) >= 150, `départ : ${n(['tree'])} arbres`); assert.equal(n(['rock', 'rock_big', 'boulder']), 0, '19/11 : plus de cailloux à la ferme');
  const { g } = makeGame(); g.S.objs = {}; g.S.x = 5.5; g.S.y = 6.8; g.S.day = 30;
  newDay(g, true);
  const m = t => Object.values(g.S.objs).filter(x => t.includes(x.t)).length, keys = () => Object.keys(g.S.objs).filter(k => g.S.objs[k].t === 'tree').sort().join();
  assert.ok(m(['tree']) >= n(['tree']) * .8 && m(['tree']) <= n(['tree']) * 1.2, `remis : ${m(['tree'])}`);
  const before = keys(); g.S.season = (g.S.season + 1) % 4; seasonRestock(g);
  assert.notEqual(keys(), before, '19/11 : à chaque saison, les arbres sont placés ailleurs');
});

test('coups de hache et de pioche plus lents (un geste à la fois) ; un meilleur outil va plus vite ; moins d’énergie par coup', async () => {
  const { CFG } = await import('../src/config.js');
  const { energyCost } = await import('../src/data/tools.js');
  const old = CFG.HIT_MS; CFG.HIT_MS = 650;
  try {
    const timeToFell = tier => {
      const { g, S, clock } = makeGame({ state: { sel: 'axe', energy: 100, tools: { axe: tier } } });
      S.objs = { '20,20': { t: 'tree', k: 'oak', g: 3, hp: 8 } }; S.x = 20.5; S.y = 21; const t0 = clock.t;
      while (S.objs['20,20'] && S.objs['20,20'].t === 'tree') { hitObject(g, 20, 20); clock.t += 50; }
      return { ms: clock.t - t0, e: 100 - S.energy };
    };
    const base = timeToFell(1), fer = timeToFell(3);
    assert.ok(base.ms >= 7 * 650, 'arbre à la hache de base : 8 coups, au moins 4,5 s');
    assert.ok(fer.ms < base.ms / 2, 'la hache en fer fait gagner beaucoup de temps');
    assert.ok(Math.abs(base.e - 8 * energyCost(1)) < 1e-9); assert.ok(base.e <= 5.5, 'un arbre coûte au plus 5,5 ⚡ avec la hache de base (19/11)');
    const { g, S, clock } = makeGame({ state: { sel: 'pick', energy: 100 } }); S.objs = { '20,20': { t: 'rock', hp: 6 } }; S.x = 20.5; S.y = 21;
    hitObject(g, 20, 20); assert.equal(hitObject(g, 20, 20), 'wait', 'pas de second coup avant la fin du geste');
    clock.t += 650; assert.equal(hitObject(g, 20, 20), true);
  } finally { CFG.HIT_MS = old; }
});

test('19/11 : ferme sans cailloux ni gros rochers (tout est à la carrière)', async () => {
  const { genObjects } = await import('../src/world/map.js');
  for (const seed of [12345, 1, 2, 3]) assert.equal(Object.values(genObjects(seed)).filter(o => o.t === 'boulder' || o.t === 'rock' || o.t === 'rock_big').length, 0);
});

test('19/11 : souche — coupée elle donne un peu de bois ; laissée, elle repousse au bout de 4 jours', async () => {
  const { regrow } = await import('../src/systems/resources.js');
  const { g, S } = makeGame({ rnd: seq(0.5) });
  S.sel = 'axe'; S.tools.axe = 3; S.objs['30,20'] = { t: 'tree', k: 'oak', hp: 3 }; S.objs['31,20'] = { t: 'tree', k: 'oak', hp: 3 };
  hitObject(g, 30, 20); hitObject(g, 31, 20); assert.equal(S.objs['30,20'].t, 'stump');
  const w = S.drops.filter(d => d.id === 'wood').reduce((a, d) => a + (d.n || 1), 0);
  hitObject(g, 30, 20); assert.equal(S.objs['30,20'], undefined, 'souche arrachée');
  assert.ok(S.drops.filter(d => d.id === 'wood').reduce((a, d) => a + (d.n || 1), 0) > w, 'un peu plus de bois');
  for (let d = 0; d < 4; d++) regrow(g);
  assert.equal(S.objs['31,20'].t, 'tree'); assert.equal(S.objs['31,20'].g, 0, 'repousse petit à petit');
});
