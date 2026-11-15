// Connexion Supabase (auth anonyme). Renvoie { sb, uid, status }.
import { CFG } from '../config.js';

export async function initSupabase(lib = globalThis.supabase) {
  if (!CFG.SUPABASE_URL || !lib) return { sb: null, uid: null, status: 'Mode hors ligne (sauvegarde locale). Renseignez Supabase dans src/config.js.' };
  try {
    const sb = lib.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_KEY);
    let { data: { session } } = await sb.auth.getSession();
    if (!session) { const r = await sb.auth.signInAnonymously(); if (r.error) throw r.error; session = r.data.session; }
    return { sb, uid: session.user.id, status: 'Connecté ✔' };
  } catch (err) {
    return { sb: null, uid: null, status: 'Connexion Supabase impossible : ' + err.message };
  }
}

export async function upsertProfile(sb, uid, S) {
  if (!sb) return;
  await sb.from(CFG.TABLE + 'profiles').upsert({ id: uid, display_name: S.name, appearance: S.look, updated_at: new Date().toISOString() });
}
