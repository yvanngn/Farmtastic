// Multijoueur via Supabase Realtime : Broadcast (positions) + Presence (nom, apparence).
// Rien n'est écrit en base à haute fréquence.
import { CFG } from '../config.js';

export const STALE_MS = 15000;

// --- Fonctions pures (testables sans réseau) ---
// Chaque joueur a sa propre ferme : on envoie « farm:<emplacement> ». On ne voit un autre joueur sur
// « sa » ferme que s'il est sur la même (même emplacement) ; ailleurs (quartier, ville, forêt…) on se croise.
export const sceneOut = (scene, lot) => (scene || 'farm') === 'farm' ? 'farm:' + (lot || 0) : scene;
export const sceneIn = (s, myLot) => s === 'farm:' + (myLot || 0) ? 'farm' : (s || 'farm');
export function applyPos(others, p, now, myLot = 0) {
  const o = others[p.id] || (others[p.id] = { x: p.x, y: p.y, look: null, name: '…' });
  o.tx = p.x; o.ty = p.y; o.dir = p.d; o.f = p.f; o.ts = now; o.scene = sceneIn(p.s, myLot);
  return o;
}

export function applyPresence(others, state, selfId, now) {
  for (const id in state) {
    if (id === selfId) continue;
    const m = state[id][0];
    const o = others[id] || (others[id] = { x: 6, y: 7, tx: 6, ty: 7, dir: 0, f: 0 });
    o.look = m.look; o.name = m.name; o.farmLot = m.farmLot ?? null; o.ts = now;
  }
  for (const id in others) if (!state[id]) delete others[id];
}

export function pruneStale(others, now) {
  for (const id in others) if (now - (others[id].ts ?? now) > STALE_MS) delete others[id];
}

export function lerpOthers(others, dt) {
  const k = Math.min(1, dt * 12);
  for (const id in others) { const o = others[id]; if (o.tx == null) continue; o.x += (o.tx - o.x) * k; o.y += (o.ty - o.y) * k; }
}

export const posMessage = (S, frame) => [S.x.toFixed(2), S.y.toFixed(2), S.dir, frame, sceneOut(S.scene, S.farmLot)].join();

// --- Connexion ---
export function createMultiplayer({ sb, uid, g, world = CFG.WORLD }) {
  let ch = null, last = 0, lastSent = '';
  return {
    join() {
      if (!sb) return;
      ch = sb.channel('ferme:' + world, { config: { presence: { key: uid }, broadcast: { self: false } } });
      ch.on('broadcast', { event: 'pos' }, ({ payload }) => applyPos(g.others, payload, Date.now(), g.S.farmLot || 0));
      ch.on('presence', { event: 'sync' }, () => applyPresence(g.others, ch.presenceState(), uid, Date.now()));
      ch.subscribe(s => { if (s === 'SUBSCRIBED') this.track(); });
    },
    track() { if (ch) ch.track({ name: g.S.name, look: g.S.look, farmLot: g.S.farmLot || 0 }); }, // chaque joueur annonce son emplacement de ferme
    tick(now) {
      if (!ch || now - last < CFG.NET_MS) return;
      last = now;
      const S = g.S, msg = posMessage(S, g.player.walkFrame);
      if (msg !== lastSent) {
        lastSent = msg;
        ch.send({ type: 'broadcast', event: 'pos', payload: { id: uid, x: +S.x.toFixed(2), y: +S.y.toFixed(2), d: S.dir, f: g.player.walkFrame, s: sceneOut(S.scene, S.farmLot) } });
      }
      pruneStale(g.others, Date.now());
    },
    get online() { return !!ch; }
  };
}
