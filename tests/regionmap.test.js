import { test } from 'node:test';
import assert from 'node:assert/strict';
import { regionLayout, regionPos, REGION_POS, FARM_RECT, LABELS, RW, RH } from '../src/render/regionmap.js';
import { FARM_LOTS } from '../src/data/buildings.js';
import { SCENES } from '../src/world/scenes.js';

test('lot 10 : carte de la région en grand, comme l’image (≈ 1400 × 770 px)', () => {
  const L = regionLayout();
  assert.equal(L.length, RH); assert.ok(L.every(r => r.length === RW));
  assert.ok(Math.abs(RW * 16 - 1400) < 20 && Math.abs(RH * 16 - 770) < 10);
  const count = c => L.join('').split(c).length - 1;
  assert.ok(count('F') > 600, 'des forêts denses'); assert.ok(count('w') > 300, 'rivière et mer');
  assert.ok(count('=') >= 6, 'des ponts'); assert.ok(count('^') > 10, 'falaise du centre-ville'); assert.ok(count('k') > 50, 'roche de la caverne');
  assert.ok(count('u') >= 4 * 12, 'les champs des 4 fermes');
  for (const t of ['Les 4 Fermes', 'Forêt', 'Caverne Sombre', 'Montagne', 'Gare', 'Centre-ville', 'Zone Résidentielle', 'Ranch du Maire', 'Fête Foraine', 'Cabane du Pêcheur', 'Zone Portuaire']) assert.ok(LABELS.some(l => l[0] === t), t);
});

test('lot 10 : position du joueur sur la carte pour chaque zone extérieure, et sur sa propre ferme', () => {
  for (const sc in SCENES) if (SCENES[sc].outdoor && sc !== 'farm' && !/^farm:/.test(sc)) assert.ok(REGION_POS[sc], 'zone sans repère : ' + sc);
  for (const l of FARM_LOTS) { const p = regionPos({ scene: 'farm', farmLot: l.id }), R = FARM_RECT(l); assert.ok(p.x > R.x && p.x < R.x + R.w && p.y > R.y && p.y < R.y + R.h); }
  assert.deepEqual(regionPos({ scene: 'house', farmLot: 2 }), regionPos({ scene: 'farm', farmLot: 2 }), 'dans la maison : sur sa ferme');
});
