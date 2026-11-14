import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGame } from './helpers.js';
import { interactAnimal, animalsNewDay, findAnimalAt } from '../src/systems/animals.js';

test('nourrir au foin puis caresser', () => {
  const { g, S } = makeGame({ state: { sel: 'hay' } });
  const a = S.animals[0];
  assert.equal(interactAnimal(g, a), 'feed');
  assert.equal(S.inv.hay, 4);
  assert.equal(interactAnimal(g, a), 'pet');
  assert.equal(a.love, 30);
  assert.equal(interactAnimal(g, a), 'info');
});

test('nourrie → produit le lendemain ; non caressée → affection baisse', () => {
  const { g, S } = makeGame({ state: { sel: 'hay' } });
  const a = S.animals[0];
  interactAnimal(g, a);
  animalsNewDay(S);
  assert.equal(a.produced, true);
  assert.equal(a.love, 15);
  assert.equal(interactAnimal(g, a), 'collect');
  assert.equal(S.inv.egg, 1);
});

test('pas nourrie → pas d’œuf', () => {
  const { S } = makeGame();
  animalsNewDay(S);
  assert.equal(S.animals[0].produced, false);
});

test('trouver un animal par tuile', () => {
  const { S } = makeGame();
  assert.ok(findAnimalAt(S, 21, 9));
  assert.equal(findAnimalAt(S, 2, 2), null);
});
