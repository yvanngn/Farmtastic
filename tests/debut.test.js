// Lot 8 : début de partie (aucun outil, accueil du chef, grange-tunnels).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame } from './helpers.js';
import { defaultState, migrate } from '../src/core/state.js';
import { act, smartTool } from '../src/systems/actions.js';
import { hasTool, canUpgrade } from '../src/systems/skills.js';
import { autoPickup, PICKUPS } from '../src/systems/grange.js';
import { registerNPC, placeNPC, welcome } from '../src/systems/social.js';
import { CHEF, OUT_FROM, OUT_TO } from '../src/data/npcs.js';
import { isSolid } from '../src/world/map.js';

const start = (extra = {}) => makeGame({ state: { tools: {}, intro: { met: false }, grange: { found: [], broken: [] }, ...extra } });

test('nouvelle partie : aucun outil, accueil à faire, grange intacte', () => {
  const S = defaultState();
  assert.deepEqual(S.tools, {});
  assert.equal(S.intro.met, false);
  assert.equal(hasTool(S, 'hand'), true);
  assert.equal(hasTool(S, 'axe'), false);
});

test('sans hache : on ne coupe pas, le message parle de la grange', () => {
  const { g, S, toasts } = start({ sel: 'hand' });
  S.objs['30,20'] = { t: 'tree', k: 'oak', g: 3, hp: 3 };
  assert.equal(smartTool(g, 30, 20), 'hand');
  S.x = 30.5; S.y = 21.5; S.dir = 1;
  act(g, 30, 20);
  assert.match(toasts().at(-1), /grange/);
  assert.equal(canUpgrade(S, 'axe').why, 'missing');
});

test('grange : la hache à l’entrée, les planches, la faucille et la pioche, l’éboulis, la pelle', () => {
  const { g, S } = start();
  assert.equal(act(g, 12, 4), 'door');
  assert.equal(S.scene, 'grange');
  assert.equal(act(g, 9, 2), 'blocked', 'planches sans hache');
  S.x = 3.5; S.y = 3.6; assert.equal(autoPickup(g), 'axe');
  assert.equal(isSolid(S, 9, 2), true);
  assert.equal(act(g, 9, 2), 'break');
  assert.equal(isSolid(S, 9, 2), false, 'le passage est ouvert');
  assert.equal(act(g, 12, 3), 'sickle');
  assert.equal(act(g, 13, 4), 'pick');
  assert.equal(act(g, 13, 7), 'break', 'éboulis à la pioche');
  assert.equal(act(g, 18, 9), 'shovel');
  assert.deepEqual(S.grange.found.sort(), PICKUPS.map(p => p.tool).sort());
  assert.equal(act(g, 20, 8), 'collapse', 'la suite des tunnels reste fermée');
  assert.equal(hasTool(S, 'sword'), false, 'pas d’épée dans la grange');
});

test('le chef accueille le joueur près de la maison, puis va sur la place du village', () => {
  const { g, S } = start({ minute: 600 });
  registerNPC(g, CHEF); placeNPC(g.npcs.chef, S, OUT_FROM, OUT_TO);
  assert.equal(g.npcs.chef.scene, 'farm');
  const said = []; g.bus.on('say', d => said.push(d));
  assert.equal(welcome(g), true);
  assert.equal(said[0].lines.length, CHEF.welcomeLines.length);
  said[0].onChoose(0);
  assert.equal(S.intro.met, true);
  placeNPC(g.npcs.chef, S, OUT_FROM, OUT_TO);
  assert.equal(g.npcs.chef.scene, 'town');
  assert.equal(welcome(g), false, 'une seule fois');
});

test('ancienne sauvegarde : outils gardés, pas d’accueil', () => {
  const s = migrate({ name: 'x', tools: { axe: 2, pick: 1, sickle: 1, sword: 1 } });
  assert.equal(s.tools.axe, 2);
  assert.equal(s.intro.met, true);
  assert.equal(migrate({ name: 'y' }).tools.sword, 1);
});
