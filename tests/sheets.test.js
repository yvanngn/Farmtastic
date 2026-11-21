import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SHEETS } from '../src/render/sheets.js';
import * as N from '../src/data/npcs.js';

test('20/11 : chaque planche demandée existe, et sheets.js ne garde que les planches utilisées', () => {
  const used = new Set(['esprit2']);   // le fantôme (renderer.js, 21/11 : planche générée par l'utilisateur)
  for (const n of Object.values(N)) if (n && n.look && n.look.planche) { assert.ok(SHEETS[n.look.planche], `${n.name} : planche ${n.look.planche} absente`); used.add(n.look.planche); }
  for (const k of Object.keys(SHEETS)) assert.ok(used.has(k) || k.startsWith('hero_'), `planche inutilisée dans sheets.js : ${k}`);
  for (const k of Object.keys(SHEETS)) { const S = SHEETS[k]; assert.ok(S.sw && S.sh && S.fw && S.fh, `${k} : tailles sw/sh/fw/fh`); }
});

test('21/11 : Simplet et Myst affichés d’après sa planche (3 rangées de 4 images)', () => {
  assert.equal(N.MINEUR.look.planche, 'simplet_v2'); assert.equal(N.MYST.look.planche, 'myst_v3');
  const S = SHEETS.simplet_v2; assert.equal(S.n, 4); assert.ok(S.fh >= 40);
});
