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
