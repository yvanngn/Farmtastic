// Liens sociaux avec les PNJ. Les répliques d'histoire se débloquent avec l'amitié, une par jour.
// 250 points = 1 cœur. Une discussion et un cadeau par jour.
export const POINTS_PER_HEART = 250;
// Cadeaux : degrés de goût et effet sur l'amitié.
export const GIFT_PTS = { adore: 80, aime: 45, neutre: 20, naime: -20, deteste: -40 };
export const DEGREES = ['adore', 'aime', 'neutre', 'naime', 'deteste'];
export const DEGREE_NAMES = { adore: 'Adore', aime: 'Aime', neutre: 'Neutre', naime: "N'aime pas", deteste: 'Déteste' };
export function tasteOf(n, item) {
  const t = n.taste || {};
  for (const d of DEGREES) if ((t[d] || []).includes(item)) return d;
  if ((n.loves || []).includes(item)) return 'adore';
  if ((n.hates || []).includes(item)) return 'deteste';
  return 'neutre';
}

export function registerNPC(g, npc) {
  g.npcs[npc.id] = { ...npc, ...(g.npcs[npc.id] || {}), ...npc };
  g.S.social[npc.id] ||= { points: 0, talked: false, gifted: false };
  const r = g.S.social[npc.id]; r.seen ||= []; r.known ||= {}; r.asked ||= []; r.talks ||= 0;
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
  r.seen ||= []; r.asked ||= []; r.talks ||= 0;
  const say = (lines, extra) => g.bus.emit('say', { name: n.name, title: n.title, color: n.color, voice: n.voice, lines, ...extra });
  // une question de temps en temps (1 discussion sur 3), une seule fois chacune
  const q = !r.talked && r.talks % 3 === 2 && (n.questions || []).find(x => !r.asked.includes(x.id) && x.h <= hearts(r));
  const line = q ? q.q : nextLine(g, id);
  if (!r.talked) { r.points += 20; r.talked = true; r.talks++; }
  if (q) { say([q.q], { choices: q.a.map(a => a.t), onChoose: i => answer(g, id, q.id, i) }); return q.q; }
  // Comme dans Witch'rok : la réplique reste en tête, puis on choisit un sujet ou « Rien. »
  const topics = (n.topics || []).filter(tp => (tp.h || 0) <= hearts(r));
  if (topics.length) say([line], { choices: [...topics.map(tp => tp.t), 'Rien.'], onChoose: i => { if (topics[i]) say(topics[i].lines); } });
  else say([line]);
  return line;
}

// Réponse à une question : petit effet sur l'amitié (lent), une seule fois.
export function answer(g, id, qid, i) {
  const r = g.S.social[id], n = g.npcs[id], q = (n.questions || []).find(x => x.id === qid), a = q && q.a[i];
  if (!a || r.asked.includes(qid)) return false;
  r.asked.push(qid); r.points += a.pts;
  g.bus.emit('say', { name: n.name, color: n.color, voice: n.voice, lines: [a.r] });
  return a.pts;
}

export function gift(g, id, item, add) {
  const r = g.S.social[id], n = g.npcs[id];
  if (!r || !n || !(g.S.inv[item] > 0)) return false;
  if (r.gifted) { g.bus.emit('say', { name: n.name, color: n.color, voice: n.voice, lines: [n.already || '…'] }); return false; }
  add(g, item, -1);
  r.gifted = true;
  const deg = tasteOf(n, item);
  r.points += GIFT_PTS[deg];
  (r.known ||= {})[item] = deg; // le goût est découvert (fiche du menu)
  g.bus.emit('sfx', GIFT_PTS[deg] > 0 ? 'collect' : 'denied');
  const line = (n.react && n.react[deg]) || n.thanks || (GIFT_PTS[deg] > 0 ? 'Merci !' : 'Ah… merci.');
  g.bus.emit('say', { name: n.name, color: n.color, voice: n.voice, lines: [line] });
  return deg;
}

export const hearts = r => Math.floor(Math.max(0, r.points) / POINTS_PER_HEART);

// Position du PNJ selon l'heure (dehors le jour, chez lui le soir).
export function placeNPC(n, S, OUT_FROM, OUT_TO) {
  if (n.mystic) return placeMyst(n, S);
  if (n.worker) { // au travail de longues heures, sinon introuvable
    const w = n.worker, on = S.minute >= w.from && S.minute < w.to;
    n.scene = on ? w.scene : (n.home || 'none'); Object.assign(n, on ? w.at : (n.inside || w.at)); n.walking = false; n.dir = 0;
    return;
  }
  const out = S.minute >= OUT_FROM && S.minute < OUT_TO;
  n.walking = false;
  const walk = (n.walks || []).find(w => S.day % (w.every || 1) === 0 && S.minute >= w.from && S.minute < w.to);
  if (walk && (!n.shy || hearts(S.social[n.id] || { points: 0 }) >= n.shy.minHearts)) { n.scene = walk.scene; Object.assign(n, walk.at); n.dir = 0; return; } // promenade en forêt
  else if (!n.home) { n.scene = out ? (n.dayScene || 'town') : 'none'; Object.assign(n, n.day); }
  else if (n.shy) { // sort seulement en fin de journée, une fois qu'il a assez confiance
    const r = S.social[n.id], goes = r && hearts(r) >= n.shy.minHearts && S.minute >= n.shy.from && S.minute < n.shy.to;
    n.scene = goes ? (n.outScene || 'farm') : n.home; Object.assign(n, goes ? n.day : n.inside);
    if (goes && r && !r.wentOut) { r.wentOut = true; n.justOut = true; }
  }
  else { n.scene = out ? (n.outScene || 'farm') : n.home; Object.assign(n, out ? n.day : n.inside); }
  // se tourne vers le joueur s'il est tout près
  if (S.scene === n.scene && Math.hypot(S.x - n.x, S.y - n.y) < 2.5) n.dir = Math.abs(S.x - n.x) > Math.abs(S.y - n.y) ? (S.x < n.x ? 2 : 3) : (S.y < n.y ? 1 : 0);
  else n.dir = 0;
}
// Marche en ligne droite vers un point ; renvoie true une fois arrivé.
function walkTo(n, t, st = 0.06) {
  const dx = t.x - n.x, dy = t.y - n.y, d = Math.hypot(dx, dy);
  n.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 2 : 3) : (dy < 0 ? 1 : 0);
  if (d <= st) { n.x = t.x; n.y = t.y; n.walking = false; return true; }
  n.walking = true; n.x += dx / d * st; n.y += dy / d * st; return false;
}
const faceP = (n, S) => { if (S.scene === n.scene && Math.hypot(S.x - n.x, S.y - n.y) < 3) n.dir = Math.abs(S.x - n.x) > Math.abs(S.y - n.y) ? (S.x < n.x ? 2 : 3) : (S.y < n.y ? 1 : 0); else n.dir = 0; };
// Myst : à l'arrivée du joueur, il somnole devant la cabane ; il se réveille quand on approche, accueille,
// montre le plan, puis redescend chez lui (au fond du quartier). Ensuite, il ne sort que le soir.
export const MYST_WAKE = 3.5;
export function placeMyst(n, S) {
  const st = S.intro && S.intro.myst, R = n.route;
  n.sleeping = false;
  if (st === 'sleep' || st === 'talk') {
    n.scene = 'farm'; Object.assign(n, n.sleepAt); n.walking = false; n.leg = R.length - 1;
    if (st === 'sleep') { n.sleeping = true; n.dir = 0; if ((S.scene || 'farm') === 'farm' && Math.hypot(S.x - n.x, S.y - n.y) < MYST_WAKE) S.intro.myst = 'talk'; }
    else faceP(n, S);
    return;
  }
  if (st === 'leaving') {
    if (n.scene !== 'farm' || !Number.isFinite(n.x)) { n.scene = 'farm'; Object.assign(n, n.sleepAt); n.leg = R.length - 1; }
    if (n.leg == null) n.leg = R.length - 1;
    if (walkTo(n, R[Math.max(0, n.leg)])) { if (n.leg > 0) n.leg--; else { S.intro.myst = 'done'; n.scene = 'none'; } }
    return;
  }
  n.walking = false;
  const out = st === 'done' && S.minute >= n.night.from && S.minute < n.night.to;
  n.scene = out ? n.outScene : 'none'; Object.assign(n, n.night.at);
  faceP(n, S);
}
// Accueil de Myst : il parle une fois, montre le plan, puis repart.
export function mystTick(g) {
  const S = g.S, n = g.npcs.myst;
  if (!n || !S.intro || S.intro.myst !== 'talk' || g.mystSaid || (S.scene || 'farm') !== 'farm') return false;
  g.mystSaid = true;
  const r = S.social.myst; if (r) r.metAt = S.day;
  g.bus.emit('say', { name: n.name, color: n.color, voice: n.voice, lines: n.arrival, onEnd: () => { S.intro.myst = 'leaving'; g.bus.emit('showMap'); } });
  return true;
}

export function findNPCAt(g, tx, ty) {
  const sc = g.S.scene || 'farm';
  for (const id in g.npcs) { const n = g.npcs[id]; if ((n.scene || 'farm') === sc && Math.hypot(n.x - (tx + .5), n.y - .3 - (ty + .5)) < 1) return n; }
  return null;
}

export function socialNewDay(S) {
  for (const id in S.social) S.social[id].talked = S.social[id].gifted = false;
}
