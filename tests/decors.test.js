// 21/11 : chaque décor annoncé a son image ; la diligence a 4 images de trot par vue et sa roue à part.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { DECORS, COACH_VIEW, COACH_WHEELS, COACH_CELL } from '../src/render/decors.js';
const size = f => { const b = readFileSync(f); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
test('décors : une image par nom', () => { for (const n of DECORS) assert.ok(existsSync(`assets/decors/${n}.png`), n); });
test('diligence : 4 directions, bandes de 4 cases, roues dans la case du profil', () => {
  for (const d of ['droite', 'gauche', 'face', 'dos']) { const [w] = size(`assets/decors/${COACH_VIEW[d]}.png`); assert.equal(w % 4, 0, d); }
  const [w, h] = size('assets/decors/diligence_gauche.png'); assert.equal(w / 4, COACH_CELL);
  for (const [x, y, r] of COACH_WHEELS) assert.ok(x - r >= 0 && x + r <= COACH_CELL && y + r <= h);
});
