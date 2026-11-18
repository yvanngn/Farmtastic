import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CAST, folkSpec, heroSpec, folkSprite } from '../src/render/folk.js';
import { NPCS } from '../src/data/npcs.js';
import { defaultState } from '../src/core/state.js';

test('18/11 : personnages « pixel moderne » : chaque habitant a sa description, le héros suit sa personnalisation', () => {
  for (const id of ['heros', 'myst', 'luna', 'franck', 'hailey', 'manu', 'igor', 'ed', 'suzie', 'jade', 'remy', 'harry', 'esprit', 'cocher', 'rouky']) assert.ok(CAST[id], id);
  for (const n of Object.values(NPCS)) if (n && n.look) assert.ok(folkSpec(n.look), `${n.id} a une description (look.folk)`);
  const L = defaultState().look, h = folkSpec(L);
  assert.equal(h.mats.top, L.shirt); assert.equal(h.mats.skin, L.skin);
  assert.equal(heroSpec({ ...L, hat: 'paille' }).hat, 'cowboy', 'chapeau de paille = même forme, autre couleur');
  assert.equal(heroSpec({ ...L, top: 'plain' }).pattern.top, undefined, 'chemise unie : pas de carreaux');
  assert.equal(folkSprite(CAST.myst), null, 'sans navigateur, on ne dessine rien (le jeu garde le dessin de secours)');
});
