// Parties : solo ou multijoueur (créée avec un code, rejointe avec ce code). Une sauvegarde par joueur et par partie.
// Index local des parties de cet appareil (pour « Continuer », même hors ligne).
import { CFG } from '../config.js';

export const IDX = 'ferme_parties';
export function readIndex(storage) { try { return JSON.parse(storage.getItem(IDX)) || []; } catch { return []; } }
export function upsertIndex(storage, game, at = Date.now()) {
  const list = [{ ...game, at }, ...readIndex(storage).filter(x => x.id !== game.id)];
  try { storage.setItem(IDX, JSON.stringify(list.slice(0, 20))); } catch { /* stockage plein ou bloqué */ }
  return list;
}
// Fusionne les parties connues ici et celles du compte en ligne, la plus récente d'abord.
export function mergeGames(local, online) {
  const by = {};
  for (const x of local) by[x.id] = { ...x };
  for (const o of online) by[o.id] = { ...(by[o.id] || {}), ...o, at: Math.max(by[o.id]?.at || 0, o.at || 0) };
  return Object.values(by).sort((a, b) => (b.at || 0) - (a.at || 0));
}
// « 7k2q », « ferme 7K2Q », « FERME-7K2Q » → « FERME-7K2Q »
export function normCode(s) {
  const t = String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^FERME/, '');
  return t ? 'FERME-' + t : '';
}
export const gameLabel = x => x.mode === 'multi' ? `👥 Partie à plusieurs · ${x.code || '?'}${x.players ? ` (${x.players} joueur${x.players > 1 ? 's' : ''})` : ''}` : '🧑‍🌾 Partie solo';
export const localGame = (now = Date.now()) => ({ id: 'solo-' + now.toString(36), code: null, mode: 'solo', lot: 0, offline: true });

const row = r => ({ id: r.game_id, code: r.code, mode: r.mode, lot: r.farm_lot, players: r.players, at: r.saved_at ? Date.parse(r.saved_at) : 0 });
async function call(sb, fn, args) {
  const { data, error } = await sb.rpc(CFG.TABLE + fn, args);
  if (error) throw new Error(/introuvable/i.test(error.message) ? 'Partie introuvable : vérifie le code.' : /complète/i.test(error.message) ? 'Cette partie est complète (4 joueurs).' : error.message);
  return data;
}
export async function createOnlineGame(sb, mode, name) { return row((await call(sb, 'create_game', { p_mode: mode, p_name: name }))[0]); }
export async function joinOnlineGame(sb, code, name) { return row((await call(sb, 'join_game', { p_code: normCode(code), p_name: name }))[0]); }
export async function myOnlineGames(sb) { try { return (await call(sb, 'my_games', {})).map(row); } catch { return []; } }
