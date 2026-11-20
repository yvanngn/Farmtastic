import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame } from './helpers.js';
import { act } from '../src/systems/actions.js';
import { shoot, AIM_ZONE, RIDES } from '../src/systems/parc.js';
import { SCENES, LAYOUTS, PARC_B } from '../src/world/scenes.js';

const tileOf = k => [PARC_B[k].x, PARC_B[k].y];

test('Farmwest 2d : la fête foraine est au sud du ranch du Maire', () => {
  assert.ok(!SCENES.foret.doors.some(x => x.to === 'parc'), 'plus de trouée dans la forêt');
  const d = SCENES.ranch.doors.find(x => x.to === 'parc'); assert.ok(d);
  const { g, S } = makeGame({ state: { scene: 'ranch', day: 29 } });
  assert.equal(act(g, d.x, d.y), 'locked', '20/11 : fermée avant le dernier jour du premier mois');
  S.day = 30; assert.equal(act(g, d.x, d.y), 'door'); assert.equal(S.scene, 'parc');
  assert.equal(SCENES.parc.doors.length, 1, 'une seule entrée'); assert.equal(SCENES.parc.doors[0].y, 0, 'au nord');
});

test('manèges : on paie, l’énergie remonte, le temps passe', () => {
  const { g, S } = makeGame({ state: { scene: 'parc', money: 100, energy: 50, minute: 600 } });
  const said = []; g.bus.on('say', d => said.push(d));
  assert.equal(act(g, ...tileOf('R')), 'ride');
  assert.equal(S.money, 100 - RIDES.R.price); assert.equal(S.energy, 50 + RIDES.R.e); assert.equal(S.minute, 600 + RIDES.R.min);
  assert.match(said[0].lines[0], /région/);
  S.money = 0; assert.equal(act(g, ...tileOf('x')), 'none', 'pas assez d’argent');
});

test('stands : 3 essais avec la jauge de visée, lot selon les réussites', () => {
  const { g, S } = makeGame({ state: { scene: 'parc', money: 100, inv: {} } });
  assert.equal(act(g, ...tileOf('z')), 'game');
  const mid = (AIM_ZONE[0] + AIM_ZONE[1]) / 2;
  shoot(g, mid); shoot(g, mid); assert.equal(shoot(g, mid), 'end');
  assert.equal(S.inv.peluche_geante, 1, '3 sur 3 : la peluche géante');
  act(g, ...tileOf('q')); shoot(g, 0); shoot(g, 0); shoot(g, mid);
  assert.equal(S.inv.barbe_papa, 1, '1 sur 3 : une barbe à papa');
  assert.equal(act(g, ...tileOf('u')), 'buy'); assert.equal(S.inv.barbe_papa, 2);
});
