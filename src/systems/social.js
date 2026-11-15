// Liens sociaux avec les PNJ. Les répliques d'histoire se débloquent avec l'amitié, une par jour.
// 250 points = 1 cœur. Une discussion et un cadeau par jour.
export const POINTS_PER_HEART = 250;

export function registerNPC(g, npc) {
  g.npcs[npc.id] = { ...npc, ...(g.npcs[npc.id] || {}), ...npc };
  g.S.social[npc.id] ||= { points: 0, talked: false, gifted: false };
  g.S.social[npc.id].seen ||= [];
}

// Choisit la réplique du jour : la prochaine réplique d'histoire débloquée, sinon une petite phrase.
export function nextLine(g, id) {
  const r = g.S.social[id], n = g.npcs[id];
  if (n.story) {
    if (!r.talked) {
      const i = n.story.findIndex((l, k) => !r.seen.includes(k) && l.h <= hearts(r));
      if (i >= 0) { r.seen.push(i); return n.story[i].t; }
    } else if (r.seen.length) return n.story[r.seen[r.seen.length - 1]].t; // elle répète ce qu'elle vient de dire
  }
  const lines = n.chat || n.dialog || ['…'];
  return lines[g.rnd() * lines.length | 0];
}

export function talk(g, id) {
  const r = g.S.social[id], n = g.npcs[id];
  if (!r || !n) return false;
  r.seen ||= [];
  const line = nextLine(g, id);
  if (!r.talked) { r.points += 20; r.talked = true; }
  g.bus.emit('say', { name: n.name, color: n.color, voice: n.voice, lines: [line] });
  return line;
}

export function gift(g, id, item, add) {
  const r = g.S.social[id], n = g.npcs[id];
  if (!r || !n || !(g.S.inv[item] > 0)) return false;
  if (r.gifted) { g.bus.emit('say', { name: n.name, color: n.color, voice: n.voice, lines: [n.already || '…'] }); return false; }
  add(g, item, -1);
  r.gifted = true;
  r.points += (n.loves || []).includes(item) ? 80 : (n.hates || []).includes(item) ? -40 : 20;
  g.bus.emit('sfx', 'collect');
  if (n.thanks) g.bus.emit('say', { name: n.name, color: n.color, voice: n.voice, lines: [n.thanks] });
  return true;
}

export const hearts = r => Math.floor(Math.max(0, r.points) / POINTS_PER_HEART);

// Position du PNJ selon l'heure (dehors le jour, chez lui le soir).
export function placeNPC(n, S, OUT_FROM, OUT_TO) {
  const out = S.minute >= OUT_FROM && S.minute < OUT_TO;
  n.scene = out ? 'farm' : n.home; Object.assign(n, out ? n.day : n.inside);
  // se tourne vers le joueur s'il est tout près
  if (S.scene === n.scene && Math.hypot(S.x - n.x, S.y - n.y) < 2.5) n.dir = Math.abs(S.x - n.x) > Math.abs(S.y - n.y) ? (S.x < n.x ? 2 : 3) : (S.y < n.y ? 1 : 0);
  else n.dir = 0;
}
export function findNPCAt(g, tx, ty) {
  const sc = g.S.scene || 'farm';
  for (const id in g.npcs) { const n = g.npcs[id]; if ((n.scene || 'farm') === sc && Math.hypot(n.x - (tx + .5), n.y - .3 - (ty + .5)) < 1) return n; }
  return null;
}

export function socialNewDay(S) {
  for (const id in S.social) S.social[id].talked = S.social[id].gifted = false;
}
