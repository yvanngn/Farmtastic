import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSaveManager, localAdapter } from '../src/net/save.js';
import { defaultState, migrate } from '../src/core/state.js';

function memoryStorage() { const m = {}; return { getItem: k => m[k] ?? null, setItem: (k, v) => { m[k] = v; } }; }
const fake = (name, data, ok = true) => ({ name, data, async read() { return this.data; }, async write(S) { this.data = structuredClone(S); return ok; } });

test('sauvegarde puis rechargement local', async () => {
  const S = defaultState(); S.money = 777;
  const mgr = createSaveManager({ adapters: [localAdapter(memoryStorage())], getState: () => S, now: () => 42 });
  assert.deepEqual(await mgr.save(), { local: true });
  const back = await mgr.load();
  assert.equal(back.money, 777);
  assert.equal(back.savedAt, 42);
});

test('au chargement, la sauvegarde la plus récente gagne', async () => {
  const a = fake('local', { ...defaultState(), money: 1, savedAt: 10 });
  const b = fake('cloud', { ...defaultState(), money: 2, savedAt: 20 });
  const mgr = createSaveManager({ adapters: [a, b], getState: () => null });
  assert.equal((await mgr.load()).money, 2);
});

test('échec cloud signalé sans bloquer le local', async () => {
  const S = defaultState();
  const mgr = createSaveManager({ adapters: [fake('local', null), fake('cloud', null, false)], getState: () => S });
  assert.deepEqual(await mgr.save(), { local: true, cloud: false });
});

test('pas de sauvegarde avant le début de partie', async () => {
  const mgr = createSaveManager({ adapters: [fake('local', null)], getState: () => defaultState(), canSave: () => false });
  assert.equal(await mgr.save(), null);
});

test('migration : champs manquants complétés', () => {
  const s = migrate({ money: 5, look: { skin: '#000' } });
  assert.equal(s.money, 5);
  assert.equal(s.look.skin, '#000');
  assert.equal(s.look.hair, 0);
  assert.equal(s.maxHp, 100);
  assert.equal(migrate(null), null);
});

// ---- Parties solo / multijoueur : une sauvegarde par joueur et par partie ----
import { localKey } from '../src/net/save.js';
import { readIndex, upsertIndex, mergeGames, normCode, localGame, gameLabel, joinOnlineGame } from '../src/net/games.js';
import { CFG } from '../src/config.js';

test('chaque partie a sa propre sauvegarde locale', async () => {
  const mem = memoryStorage();
  assert.equal(localKey('local'), CFG.LSKEY, 'l’ancienne sauvegarde reste lisible');
  assert.notEqual(localKey('abc'), localKey('def'));
  await localAdapter(mem, localKey('abc')).write({ name: 'A' });
  await localAdapter(mem, localKey('def')).write({ name: 'B' });
  assert.equal((await localAdapter(mem, localKey('abc')).read()).name, 'A');
  assert.equal((await localAdapter(mem, localKey('def')).read()).name, 'B');
});

test('liste des parties : la dernière jouée en premier, en ligne et sur l’appareil fusionnées', () => {
  const mem = memoryStorage();
  upsertIndex(mem, { id: 'a', mode: 'solo' }, 10);
  upsertIndex(mem, { id: 'b', mode: 'multi', code: 'FERME-AB12' }, 20);
  upsertIndex(mem, { id: 'a', mode: 'solo' }, 30);
  assert.deepEqual(readIndex(mem).map(x => x.id), ['a', 'b']);
  const all = mergeGames(readIndex(mem), [{ id: 'b', mode: 'multi', code: 'FERME-AB12', players: 3, at: 50 }, { id: 'c', mode: 'solo', at: 5 }]);
  assert.deepEqual(all.map(x => x.id), ['b', 'a', 'c']);
  assert.match(gameLabel(all[0]), /FERME-AB12.*3 joueurs/);
  assert.equal(localGame(1).mode, 'solo');
});

test('code de partie : tapé n’importe comment, il est reconnu', () => {
  assert.equal(normCode('7k2q'), 'FERME-7K2Q');
  assert.equal(normCode(' ferme 7K2Q '), 'FERME-7K2Q');
  assert.equal(normCode('FERME-7K2Q'), 'FERME-7K2Q');
  assert.equal(normCode(''), '');
});

test('rejoindre : appelle la fonction préfixée et explique les erreurs', async () => {
  const calls = [];
  const sb = { rpc: async (fn, args) => { calls.push([fn, args]); return args.p_code === 'FERME-FULL' ? { error: { message: 'Partie complète' } } : { data: [{ game_id: 'g1', code: args.p_code, mode: 'multi', farm_lot: 2, players: 3 }] }; } };
  const gm = await joinOnlineGame(sb, '7k2q', 'Yvan');
  assert.deepEqual(calls[0], ['ferme_join_game', { p_code: 'FERME-7K2Q', p_name: 'Yvan' }]);
  assert.equal(gm.lot, 2); assert.equal(gm.id, 'g1');
  await assert.rejects(joinOnlineGame(sb, 'full', 'Y'), /complète/);
});

test('effacer une partie solo : retirée de la liste, l’autre reste', async () => {
  const { removeFromIndex, deleteOnlineGame } = await import('../src/net/games.js');
  const mem = memoryStorage();
  upsertIndex(mem, { id: 'a', mode: 'solo' }, 1); upsertIndex(mem, { id: 'b', mode: 'solo' }, 2);
  assert.deepEqual(removeFromIndex(mem, 'a').map(x => x.id), ['b']);
  assert.deepEqual(readIndex(mem).map(x => x.id), ['b']);
  const calls = []; await deleteOnlineGame({ rpc: async (fn, a) => { calls.push([fn, a]); return { data: null }; } }, 'g9');
  assert.deepEqual(calls[0], ['ferme_delete_game', { p_game: 'g9' }]);
});

test('version : semver horodaté lisible', async () => {
  const { VERSION, versionLabel } = await import('../src/version.js');
  assert.match(`${VERSION.major}.${VERSION.minor}.${VERSION.patch}`, /^\d+\.\d+\.\d+$/);
  assert.match(versionLabel(), /^v\d+\.\d+\.\d+ · \d\d\/\d\d\/\d{4} \d\d:\d\d$/);
});

test('Farmwest lot 1 : joueur « Cloud Jimny » par défaut', async () => {
  const { defaultState } = await import('../src/core/state.js');
  assert.equal(defaultState().name, 'Cloud Jimny');
});
