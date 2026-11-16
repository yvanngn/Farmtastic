import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame, seq } from './helpers.js';
import { CFG } from '../src/config.js';
import { tickTime, newDay, sleep, fmtTime } from '../src/systems/time.js';
import { rollWeather, darkness } from '../src/systems/weather.js';

test('le temps avance d’une minute toutes les MS_PER_MIN', () => {
  const { g, S } = makeGame();
  tickTime(g, CFG.MS_PER_MIN * 10);
  assert.equal(S.minute, 370);
});

test('pas couché à 1h : nouvelle journée à l’infirmerie, 10 % de frais', () => {
  const { g, S, toasts } = makeGame({ state: { minute: CFG.BED_LIMIT - 1, money: 100, energy: 30 } });
  tickTime(g, CFG.MS_PER_MIN);
  assert.equal(S.day, 2);
  assert.equal(S.money, 90);
  assert.equal(S.scene, 'clinique');
  assert.match(toasts()[0], /aucune énergie/);
});

test('dormir seulement après 18h, énergie pleine', () => {
  const { g, S } = makeGame({ state: { energy: 10 } });
  assert.equal(sleep(g), false);
  S.minute = 1100;
  assert.equal(sleep(g), true);
  assert.equal(S.energy, 100);
  assert.equal(S.minute, CFG.DAY_START);
});

test('changement de saison et d’année', () => {
  const { g, S } = makeGame({ state: { day: 28, season: 3 } });
  newDay(g, true);
  assert.deepEqual([S.day, S.season, S.year], [1, 0, 2]);
});

test('météo : neige seulement en hiver', () => {
  assert.equal(rollWeather(3, 0.1), 'snow');
  assert.equal(rollWeather(0, 0.1), 'sun');
  assert.equal(rollWeather(0, 0.8), 'rain');
  assert.equal(rollWeather(0, 0.95), 'storm');
});

test('nouvelle journée : météo tirée et événement émis', () => {
  const { g, S, events } = makeGame({ rnd: seq(0.8) });
  newDay(g, true);
  assert.equal(S.weather, 'rain');
  assert.ok(events.some(e => e[0] === 'newDay'));
});

test('nuit et orage assombrissent', () => {
  assert.equal(darkness({ minute: 600, weather: 'sun' }), 0);
  assert.ok(darkness({ minute: 1400, weather: 'storm' }) > 0.5);
  assert.equal(fmtTime(1385), '23:00');
});
