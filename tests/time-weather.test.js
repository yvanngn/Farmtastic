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

test('pas couché à 1h : nouvelle journée à l’infirmerie, tarif de nuit (20 %)', () => {
  const { g, S, toasts } = makeGame({ state: { minute: CFG.BED_LIMIT - 1, money: 100, energy: 30 } });
  tickTime(g, CFG.MS_PER_MIN);
  assert.equal(S.day, 2);
  assert.equal(S.money, 80);
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
  const { g, S } = makeGame({ state: { day: 30, season: 3 } });
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

test('7g : lumière dorée le matin, orangée le soir, rien la nuit ; ombres vers l’ouest le matin, vers l’est le soir', async () => {
  const { timeTint, sunShadow } = await import('../src/systems/weather.js');
  const m = timeTint(390), soir = timeTint(1060), nuit = timeTint(1300);
  assert.ok(m[3] > .08 && m[1] > m[2], 'matin doré'); assert.ok(soir[3] > .1 && soir[0] > soir[2], 'soir orangé'); assert.equal(nuit[3], 0);
  assert.ok(timeTint(390, 'rain')[3] < m[3], 'moins fort sous la pluie');
  assert.ok(sunShadow(400).dx < 0 && sunShadow(1100).dx > 0 && sunShadow(765).dx === 0);
  assert.ok(sunShadow(400).sx > 1, 'ombres longues le matin');
});

test('lot 8 : transition de la nuit — énergie qui remonte, rêve (jamais deux fois le même de suite), puis sauvegarde (newDay)', async () => {
  const { sleep } = await import('../src/systems/time.js');
  const { DREAMS } = await import('../src/data/npcs.js');
  const { g, S } = makeGame({ rnd: seq(0.1, 0.1, 0.1, 0.1, 0.1) });
  const nights = [], order = []; g.bus.on('night', n => { nights.push(n); order.push('night'); }); g.bus.on('newDay', () => order.push('newDay'));
  S.energy = 12; S.minute = 1300; assert.equal(sleep(g), true);
  assert.equal(nights.length, 1); assert.equal(nights[0].from, 12); assert.equal(nights[0].to, S.maxE);
  assert.ok(DREAMS.includes(nights[0].dream));
  S.minute = 1300; sleep(g); assert.notEqual(nights[1].dream, nights[0].dream, 'pas deux fois le même rêve de suite');
  assert.deepEqual(order.slice(0, 2), ['newDay', 'night'], 'newDay déclenche la sauvegarde automatique');
});
