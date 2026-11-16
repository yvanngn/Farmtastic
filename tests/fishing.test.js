import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame, seq } from './helpers.js';
import { act } from '../src/systems/actions.js';
import { pickFish, zoneAt, stepFight, newFight, fishTick, BITE_WINDOW } from '../src/systems/fishing.js';
import { coldTick } from '../src/systems/cold.js';
import { FISH } from '../src/data/fish.js';
import { SCENES, LAYOUTS } from '../src/world/scenes.js';
import { isPond } from '../src/world/map.js';

const pond = () => { for (let y = 0; y < 36; y++) for (let x = 0; x < 48; x++) if (isPond(x, y)) return [x, y]; };

test('les poissons dépendent du lieu, de la saison et de l’heure', () => {
  const S = { season: 3, minute: 1300 };
  assert.equal(pickFish(S, 'lac', .99).id, 'lotte_bleue', 'la nuit en hiver, au lac gelé');
  S.season = 1; S.minute = 700;
  assert.ok(FISH.filter(f => f.zones.includes('mer')).some(f => f.id === pickFish(S, 'mer', .99).id));
  S.minute = 200; assert.equal(pickFish(S, 'etang', .5), null, 'rien à 3h du matin');
});

test('pêche : lancer, attendre l’ombre, ferrer au « ! », gagner le combat, carnet de pêche', () => {
  const [px, py] = pond();
  const { g, S, clock } = makeGame({ rnd: seq(.1), state: { tools: { rod: 1 }, sel: 'rod', season: 0, minute: 600, inv: {} } });
  assert.equal(zoneAt(S, px, py), 'etang');
  assert.equal(act(g, px, py), 'cast'); assert.equal(g.fishing.phase, 'wait');
  clock.t = g.fishing.bite + 1; assert.equal(fishTick(g, .016), 'bite');
  assert.equal(act(g, px, py), 'fight');
  g.fishHold = true; let r; for (let i = 0; i < 2000 && g.fishing; i++) { g.fishing.fight.fy = g.fishing.fight.bar + .1; r = fishTick(g, .02); }
  assert.equal(r, 'win');
  const id = Object.keys(S.fishLog)[0];
  assert.equal(S.inv[id], 1); assert.equal(S.fishLog[id].n, 1); assert.equal(S.fishLog[id].first.zone, 'etang');
});

test('pêche : trop tard pour ferrer = le poisson s’échappe', () => {
  const [px, py] = pond();
  const { g, clock } = makeGame({ rnd: seq(.1), state: { tools: { rod: 1 }, sel: 'rod', season: 0, minute: 600 } });
  act(g, px, py); clock.t = g.fishing.bite + 1; fishTick(g, .016);
  clock.t += BITE_WINDOW + 10; assert.equal(fishTick(g, .016), 'miss'); assert.equal(g.fishing, null);
});

test('combat : hors de la zone verte, la prise baisse jusqu’à l’échappée', () => {
  const st = newFight({ diff: 1 }); let r;
  for (let i = 0; i < 400; i++) { st.fy = .95; r = stepFight(st, .02, false, () => .5); if (r === 'lose') break; }
  assert.equal(r, 'lose');
});

test('montagne gelée (à l’est du quartier) : grotte fermée, et le froid fait baisser la vie sans manteau', () => {
  assert.ok(SCENES.quartier.doors.some(d => d.to === 'montagne'));
  assert.ok(SCENES.town.doors.some(d => d.to === 'plage'), 'la plage est au nord du centre-ville');
  const { g, S } = makeGame({ state: { scene: 'montagne', hp: 100, inv: {} } });
  let gy, gx; LAYOUTS.montagne.forEach((r, y) => { const x = r.indexOf('G'); if (x >= 0) { gx = x; gy = y; } });
  assert.equal(act(g, gx, gy), 'locked');
  for (let i = 0; i < 10; i++) coldTick(g, 1); assert.equal(S.hp, 90);
  S.inv.manteau = 1; coldTick(g, 5); assert.equal(S.hp, 90, 'au chaud avec le manteau');
});
