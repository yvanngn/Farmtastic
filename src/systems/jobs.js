// Métiers (forgeron, alchimiste, couturier, joaillier, cuisinier) : XP gagnée en fabriquant ou en cuisinant. Logique pure.
import { JOBS, JOB_XP, JOB_GAIN } from '../data/jobs.js';

export function jobLevel(xp) { let l = 1; for (let i = 1; i < JOB_XP.length; i++) if (xp >= JOB_XP[i]) l = i + 1; return l; }
export const jobXp = (S, id) => ((S.jobs || {})[id] || { xp: 0 }).xp;
export const jobNext = xp => JOB_XP[jobLevel(xp)] ?? null;
export function gainJob(g, id, n = JOB_GAIN) {
  if (!JOBS[id]) return 0;
  const J = (g.S.jobs ||= {}), s = (J[id] ||= { xp: 0 }), before = jobLevel(s.xp);
  s.xp += n;
  const after = jobLevel(s.xp);
  if (after > before) { g.bus.emit('sfx', 'levelup'); g.bus.emit('toast', `${JOBS[id].i} ${JOBS[id].n} niveau ${after} !`); }
  return after;
}
