// Sauvegarde : plusieurs « adaptateurs » (local, cloud). On écrit partout,
// on recharge la version la plus récente (savedAt).
import { CFG } from '../config.js';
import { migrate } from '../core/state.js';

// Une sauvegarde locale par partie (clé : ferme_save_v1:<id de la partie>). La partie « locale » historique garde l'ancienne clé.
export const localKey = gameId => !gameId || gameId === 'local' ? CFG.LSKEY : CFG.LSKEY + ':' + gameId;
export function localAdapter(storage, k = CFG.LSKEY) {
  return {
    name: 'local',
    async read() { try { return JSON.parse(storage.getItem(k)); } catch { return null; } },
    async write(S) { storage.setItem(k, JSON.stringify(S)); return true; }
  };
}

// Sauvegarde en ligne : une ligne par joueur et par partie.
export function supabaseAdapter(sb, uid, gameId) {
  return {
    name: 'cloud',
    async read() {
      const { data, error } = await sb.from(CFG.TABLE + 'saves').select('data').eq('player_id', uid).eq('game_id', gameId).maybeSingle();
      return error ? null : (data && data.data) || null;
    },
    async write(S) {
      const { error } = await sb.from(CFG.TABLE + 'saves').upsert({ game_id: gameId, player_id: uid, data: S, version: CFG.VERSION, saved_at: new Date().toISOString() });
      return !error;
    }
  };
}

export function createSaveManager({ adapters, getState, canSave = () => true, now = Date.now }) {
  let busy = false;
  return {
    async load() {
      const all = await Promise.all(adapters.map(a => a.read().catch(() => null)));
      const best = all.filter(Boolean).sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0))[0];
      return migrate(best);
    },
    // Renvoie { local:true, cloud:false… } ou null si ignoré (déjà en cours / pas démarré).
    async save() {
      if (busy || !canSave()) return null;
      busy = true;
      const S = getState();
      S.savedAt = now();
      const res = {};
      for (const a of adapters) { try { res[a.name] = await a.write(S); } catch { res[a.name] = false; } }
      busy = false;
      return res;
    }
  };
}
