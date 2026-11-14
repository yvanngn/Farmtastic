import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame } from './helpers.js';
import { loadSettings, saveSettings, setVolume, toggle, effective, pickTrack, pickAmbience, DEFAULTS } from '../src/audio/settings.js';
import { plant } from '../src/systems/farming.js';
import { sellAll } from '../src/systems/economy.js';

const mem = () => { const m = {}; return { getItem: k => m[k] ?? null, setItem: (k, v) => { m[k] = v; } }; };

test('réglages : mémorisés et rechargés', () => {
  const st = mem(), s = loadSettings(st);
  assert.deepEqual(s, DEFAULTS);
  setVolume(s, 'music', 0.2); saveSettings(st, s);
  assert.equal(loadSettings(st).music.vol, 0.2);
});

test('réglages : stockage cassé = valeurs par défaut', () => {
  const bad = { getItem() { throw new Error('bloqué'); }, setItem() { throw new Error('bloqué'); } };
  assert.deepEqual(loadSettings(bad), DEFAULTS);
  saveSettings(bad, DEFAULTS); // ne doit pas planter
});

test('couper puis remonter le curseur réactive le son', () => {
  const s = loadSettings(null);
  toggle(s, 'sfx');
  assert.equal(effective(s, 'sfx'), 0);
  setVolume(s, 'sfx', 0.6);
  assert.equal(effective(s, 'sfx'), 0.6);
});

test('une musique par ambiance', () => {
  assert.equal(pickTrack({ minute: 600, weather: 'sun', season: 0 }), 'day');
  assert.equal(pickTrack({ minute: 600, weather: 'sun', season: 3 }), 'winter');
  assert.equal(pickTrack({ minute: 1300, weather: 'sun', season: 0 }), 'night');
  assert.equal(pickTrack({ minute: 600, weather: 'storm', season: 1 }), 'rain');
  assert.equal(pickAmbience({ minute: 1200, weather: 'sun', season: 1 }), 'crickets');
  assert.equal(pickAmbience({ minute: 600, weather: 'sun', season: 1 }), null);
});

test('les actions émettent leurs bruitages', () => {
  const { g, sounds } = makeGame({ state: { inv: { wheat_seed: 1, wheat: 1 } } });
  plant(g, 5, 9, 'wheat_seed');
  sellAll(g);
  assert.deepEqual(sounds(), ['plant', 'coin']);
});
