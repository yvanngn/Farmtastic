// Réglages audio (purs, testables) + choix de l'ambiance selon l'état du jeu.
import { isWet } from '../systems/weather.js';

const KEY = 'ferme_audio_v1';
export const DEFAULTS = { music: { vol: 0.5, on: true }, sfx: { vol: 0.8, on: true } };

export function loadSettings(storage) {
  try {
    const s = JSON.parse(storage && storage.getItem(KEY));
    if (s && s.music && s.sfx) return { music: { ...DEFAULTS.music, ...s.music }, sfx: { ...DEFAULTS.sfx, ...s.sfx } };
  } catch { /* stockage indisponible */ }
  return structuredClone(DEFAULTS);
}
export function saveSettings(storage, s) { try { storage && storage.setItem(KEY, JSON.stringify(s)); } catch { /* ignoré */ } }

// Remonter un curseur réactive le son.
export function setVolume(s, ch, v) { s[ch].vol = Math.max(0, Math.min(1, v)); if (s[ch].vol > 0) s[ch].on = true; return s; }
export function toggle(s, ch) { s[ch].on = !s[ch].on; return s; }
export const effective = (s, ch) => (s[ch].on ? s[ch].vol : 0);

// Une musique par ambiance.
export function pickTrack(S, screen) {
  if (screen === 'title') return 'title';
  if (isWet(S.weather)) return 'rain';
  if (S.minute >= 1200 || S.minute < 360) return 'night';
  return S.season === 3 ? 'winter' : 'day';
}
// Ambiances en boucle (bruitages).
export function pickAmbience(S, screen) {
  if (screen === 'title') return null;
  if (isWet(S.weather)) return 'rain';
  if ((S.minute >= 1140) && S.season < 3) return 'crickets';
  return null;
}
