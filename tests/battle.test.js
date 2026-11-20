import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame, seq } from './helpers.js';
import { startBattle, tickBattle, heroAct, closeBattle, TECHS, heroAtk, ATB_RATE } from '../src/systems/battle.js';
import { MOBS } from '../src/data/wild.js';

const setup = (state = {}) => { const r = makeGame({ rnd: seq(0.5), state: { hp: 100, energy: 50, tools: { sword: 1 }, ...state } }); const e = { type: 'slime_b', x: 0, y: 0, hp: 100 }; r.g.enemies.push(e); startBattle(r.g, e); return { ...r, e }; };

test('lot 30a : les jauges se remplissent ; quand celle du héros est pleine, le temps s’arrête pour choisir', () => {
  const { g } = setup(); const B = g.battle;
  B.hero.atb = 0; B.foes[0].atb = 0;
  tickBattle(g, 1); assert.ok(Math.abs(B.hero.atb - ATB_RATE) < 1e-9); assert.equal(B.turn, false);
  tickBattle(g, 2); assert.equal(B.turn, true);
  const f = B.foes[0].atb; tickBattle(g, 5); assert.equal(B.foes[0].atb, f, 'tout est en pause pendant le choix');
});
test('lot 30a : un ennemi frappe quand sa jauge est pleine ; se défendre divise les dégâts par deux', () => {
  const { g, S } = setup(); const B = g.battle, atk = MOBS.slime_b.atk;
  B.hero.atb = 0; B.foes[0].atb = 0.999; tickBattle(g, 0.01); assert.equal(S.hp, 100 - atk);
  B.turn = true; heroAct(g, { act: 'defend' }); B.foes[0].atb = 0.999; tickBattle(g, 0.01);
  assert.equal(S.hp, 100 - atk - Math.round(atk * .5));
});
test('lot 30a : attaquer, techniques (énergie), objets', () => {
  const { g, S } = setup({ inv: { bread: 1 }, hp: 50 }); const B = g.battle, f = B.foes[0];
  B.turn = true; heroAct(g, { act: 'attack' }); assert.equal(f.hp, 100 - heroAtk(S));
  B.turn = true; const e0 = S.energy; heroAct(g, { act: 'tech', tech: 'fort' }); assert.equal(S.energy, e0 - TECHS.fort.e); assert.ok(f.hp < 100 - heroAtk(S) * 2);
  S.energy = 1; B.turn = true; assert.equal(heroAct(g, { act: 'tech', tech: 'balayage' }), false, 'pas assez d’énergie'); assert.equal(B.turn, true);
  heroAct(g, { act: 'item', item: 'bread' }); assert.equal(S.inv.bread || 0, 0); assert.ok(S.hp > 50);
});
test('lot 30a : victoire = XP et butin ; fuite manquée possible', () => {
  const { g, S } = setup(); const B = g.battle, xp0 = S.pxp;
  g.rnd = () => 0.9; B.turn = true; heroAct(g, { act: 'flee' }); assert.equal(B.over, null, 'fuite ratée');
  B.foes[0].hp = 1; B.turn = true; heroAct(g, { act: 'attack' });
  assert.equal(B.over, 'win'); assert.equal(S.pxp, xp0 + MOBS.slime_b.xp); assert.equal(S.inv.slime, 1);
  assert.equal(closeBattle(g), 'win'); assert.equal(g.battle, null);
});
