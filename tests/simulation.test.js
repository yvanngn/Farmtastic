import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('20/11 : le moteur de simulation joue les 3 profils et sort ses données en JSON (compte rendu d’équilibrage)', () => {
  const dir = mkdtempSync(join(tmpdir(), 'fw-sim-')), res = {};
  for (const p of ['tranquille', 'moyen', 'acharne']) {
    const json = join(dir, p + '.json');
    execFileSync(process.execPath, ['tools/simulate.mjs', '30', '12345', '--profil=' + p, '--out=' + join(dir, p + '.md'), '--json=' + json], { stdio: 'pipe' });
    res[p] = JSON.parse(readFileSync(json, 'utf8'));
    assert.equal(res[p].profil, p); assert.equal(res[p].days.length, 30); assert.ok(res[p].milestones.length > 3);
    for (const k of ['money', 'level', 'xp', 'playMinutes']) assert.ok(Number.isFinite(res[p].final[k]), k);
  }
  assert.ok(res.acharne.final.playMinutes > res.tranquille.final.playMinutes, 'l’acharné joue plus longtemps');
  assert.throws(() => execFileSync(process.execPath, ['tools/simulate.mjs', '5', '1', '--profil=inconnu', '--out=' + join(dir, 'x.md')], { stdio: 'pipe' }));
});
