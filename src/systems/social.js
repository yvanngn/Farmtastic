// Liens sociaux avec les PNJ (aucun PNJ défini pour l'instant).
// 250 points = 1 cœur. Une discussion et un cadeau par jour.
export const POINTS_PER_HEART = 250;

export function registerNPC(g, npc) {
  g.npcs[npc.id] = npc;
  g.S.social[npc.id] ||= { points: 0, talked: false, gifted: false };
}

export function talk(g, id) {
  const r = g.S.social[id], n = g.npcs[id];
  if (!r || !n) return false;
  if (!r.talked) { r.points += 20; r.talked = true; }
  const lines = n.dialog || ['…'];
  g.bus.emit('toast', `${n.name} : ${lines[g.rnd() * lines.length | 0]}`);
  return true;
}

export function gift(g, id, item, add) {
  const r = g.S.social[id], n = g.npcs[id];
  if (!r || !n || r.gifted || !(g.S.inv[item] > 0)) return false;
  add(g, item, -1);
  r.gifted = true;
  r.points += (n.loves || []).includes(item) ? 80 : (n.hates || []).includes(item) ? -40 : 20;
  return true;
}

export const hearts = r => Math.floor(Math.max(0, r.points) / POINTS_PER_HEART);

export function socialNewDay(S) {
  for (const id in S.social) S.social[id].talked = S.social[id].gifted = false;
}
