// À bout de forces (énergie à 0) : on se réveille à la clinique, soigné par Hailey, avec 10 % de frais.
import { CFG } from '../config.js';
import { HAILEY } from '../data/npcs.js';
import { routinePlace, routineDay } from './social.js';

export const CLINIC_FEE = 0.1, CLINIC_ENERGY = 0.5;   // 💡 énergie rendue après les soins
export const CLINIC_BED = { x: 2.5, y: 4.6 };

// Hailey travaille-t-elle en ce moment ? Sinon (jour de repos, nuit), elle vient quand même mais le tarif est doublé.
export function haileyOff(S) {
  if (!HAILEY.routine) return null;
  if ((routineDay(S) - 1) % 7 >= 5) return 'repos';   // 19/11 : week-end
  return routinePlace(HAILEY, S) === 'clinique' ? null : 'nuit';
}
export function toClinic(g, why = 'fatigue') {
  const S = g.S, off = haileyOff(S), fee = Math.round(S.money * CLINIC_FEE * (off ? 2 : 1));
  S.money -= fee;
  S.scene = 'clinique'; S.x = CLINIC_BED.x; S.y = CLINIC_BED.y; S.dir = 0;
  S.energy = Math.round(S.maxE * CLINIC_ENERGY);
  if (why === 'nuit') S.minute = CFG.DAY_START + 120;   // réveil à 8h
  else S.minute = Math.min(S.minute + 120, CFG.DAY_END - 60);
  if (g.enemies) g.enemies.length = 0;
  g.bus.emit('scene', 'clinique');
  g.bus.emit('sfx', 'sleep');
  g.bus.emit('toast', (why === 'nuit' ? `🏥 Pas couché(e) à 1h : on t’a retrouvé(e) endormi(e) dehors… réveil à l’infirmerie.` : `🏥 Effondré(e) de fatigue… réveil à la clinique.`) + ` Frais de soins : ${fee} $ (${off ? '20 %, tarif doublé' : '10 %'})`);
  g.bus.emit('clinic', { fee, off });
  return fee;
}
