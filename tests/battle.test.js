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

// ---- lot 30c : combats en équipe (deux parties branchées l'une sur l'autre, sans réseau)
import { battleState, onJoin, onAllyAct, noteBattle, joinable, joinBattle, closeBattle as close2 } from '../src/systems/battle.js';
function duo() {
  const A = makeGame({ rnd: seq(0.5), state: { name: 'Hôte', scene: 'wild', x: 5, y: 4, hp: 100, tools: { sword: 1 } } });
  const Bp = makeGame({ rnd: seq(0.5), state: { name: 'Amie', scene: 'wild', x: 7, y: 4, hp: 80, tools: { sword: 1 }, inv: {} } });
  A.g.uid = 'a'; Bp.g.uid = 'b';
  const toHost = []; Bp.g.bus.on('net', m => toHost.push(m));
  const e = { type: 'slime_b', x: 5, y: 4, hp: 100 }; A.g.enemies.push(e); startBattle(A.g, e);
  const sync = () => { for (const m of toHost.splice(0)) (m.event === 'battleJoin' ? onJoin : onAllyAct)(A.g, m.payload); noteBattle(Bp.g, 'a', battleState(A.g)); };
  return { A, Bp, sync };
}
test('lot 30c : un joueur proche voit le combat, le rejoint, attaque ; les monstres peuvent le viser', () => {
  const { A, Bp, sync } = duo();
  sync(); assert.equal(joinable(Bp.g).length, 1, 'combat visible à 2 cases');
  assert.equal(joinBattle(Bp.g, 'a'), true); sync();
  assert.ok(A.g.battle.allies.b); assert.equal(A.g.battle.allies.b.hp, 80);
  A.g.battle.turn = true;                        // l'hôte réfléchit : les alliés continuent d'avancer
  tickBattle(A.g, 3); sync(); assert.equal(Bp.g.battle.turn, true, 'la jauge de l’allié est pleine');
  const hp0 = A.g.battle.foes[0].hp; heroAct(Bp.g, { act: 'attack' }); sync();
  assert.ok(A.g.battle.foes[0].hp < hp0, 'l’attaque de l’allié touche'); assert.equal(Bp.g.battle.turn, false);
  A.g.rnd = () => 0.9; A.g.battle.foes[0].atb = 0.999; A.g.battle.turn = false; A.g.battle.hero.atb = 0; tickBattle(A.g, 0.01); sync();
  assert.ok(Bp.S.hp < 80, 'l’allié prend des coups (sa vie suit l’état de l’hôte)');
});
test('lot 30c : victoire partagée — chacun reçoit son XP et son butin', () => {
  const { A, Bp, sync } = duo();
  sync(); joinBattle(Bp.g, 'a'); sync();
  const xpB = Bp.S.pxp; A.g.battle.foes[0].hp = 1; A.g.battle.turn = true; heroAct(A.g, { act: 'attack' }); sync();
  assert.equal(A.g.battle.over, 'win'); assert.equal(Bp.g.battle.over, 'win');
  assert.equal(Bp.S.pxp, xpB + MOBS.slime_b.xp); assert.equal(Bp.S.inv.slime, 1);
  assert.equal(close2(Bp.g), 'win'); assert.equal(Bp.g.battle, null);
});
