import { cuistotTalk, harryTalk } from './resto.js';
import { roukyTalk } from './rouky.js';
import { golgolasTalk } from './golgolas.js';
import { craftRequest, craftReady, deliverCraft, craftLabel } from './craftquests.js';
import { CRAFT_LINES } from '../data/npcs.js';
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
// 19/11 : l'habitant est-il à son travail ? (Ed ne dit « bienvenue au saloon » qu'au saloon)
const atWork = n => !n.worker || n.scene === n.worker.scene;
export function nextLine(g, id) {
  const r = g.S.social[id], n = g.npcs[id];
  if (n.story) {
    if (!r.talked) {
      const i = n.story.findIndex((l, k) => !r.seen.includes(k) && l.h <= hearts(r));
      if (i >= 0) { r.seen.push(i); return atWork(n) || !n.story[i].away ? n.story[i].t : n.story[i].away; }
    } else if (r.seen.length) return n.story[r.seen[r.seen.length - 1]].t; // elle répète ce qu'elle vient de dire
  }
  const lines = (!atWork(n) && n.chatAway) || n.chat || n.dialog || ['…'];
  return lines[g.rnd() * lines.length | 0];
}

export function talk(g, id) {
  const r = g.S.social[id], n = g.npcs[id];
  if (!r || !n) return false;
  r.seen ||= []; r.asked ||= []; r.talks ||= 0;
  const say = (lines, extra) => g.bus.emit('say', { name: n.name, title: n.title, color: n.color, voice: n.voice, lines, ...extra });
  if (id === 'harry' && harryTalk(g, n)) { if (!r.talked) { r.points += 20; r.talked = true; r.talks++; } return true; }   // le coffre (lot 6)
  if (id === 'golgolas' && golgolasTalk(g, n)) { if (!r.talked) { r.points += 20; r.talked = true; r.talks++; } return true; }   // lot 13
  if (id === 'rouky' && roukyTalk(g, n)) { if (!r.talked) { r.points += 20; r.talked = true; r.talks++; } return true; }   // lot 12 : la canne de Rouky
  if (id === 'cuistot' && cuistotTalk(g, n)) { if (!r.talked) { r.points += 20; r.talked = true; r.talks++; } return true; }   // quête du four (lot 5)
  if (r.talked) { g.bus.emit('toast', `💬 Tu as déjà parlé à ${n.name} aujourd’hui. Reviens demain !`); return 'already'; }   // 19/11 : une discussion par jour (hors quête spéciale)
  // une question de temps en temps (1 discussion sur 3), une seule fois chacune
  const q = !r.talked && r.talks % 3 === 2 && (n.questions || []).find(x => !r.asked.includes(x.id) && x.h <= hearts(r));
  const line = q ? q.q : nextLine(g, id);
  if (!r.talked) { r.points += 20; r.talked = true; r.talks++; }
  if (q) { say([q.q], { choices: q.a.map(a => a.t), onChoose: i => answer(g, id, q.id, i) }); return q.q; }
  // Comme dans Witch'rok : la réplique reste en tête, puis on choisit un sujet ou « Rien. »
  const topics = (n.topics || []).filter(tp => (tp.h || 0) <= hearts(r));
  const ask = { t: '🛠️ Une demande ?', craft: true };   // lot 9 : demande de fabrication de la semaine
  const all = [...topics, ask];
  say([line], { choices: [...all.map(tp => tp.t), 'Rien.'], onChoose: i => { const tp = all[i]; if (!tp) return; if (tp.craft) craftTalk(g, id, say); else if (tp.open) g.bus.emit('open', tp.open); else say(tp.lines); } });
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
// Point situé à la fraction t (0 → 1) d'un trajet en lignes droites, et direction du pas.
export function alongPath(pts, t) {
  const segs = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y)), L = segs.reduce((a, b) => a + b, 0);
  let d = Math.max(0, Math.min(1, t)) * L;
  for (let i = 0; i < segs.length; i++) { if (d <= segs[i] || i === segs.length - 1) { const f = segs[i] ? Math.min(1, d / segs[i]) : 1; return { x: pts[i].x + (pts[i + 1].x - pts[i].x) * f, y: pts[i].y + (pts[i + 1].y - pts[i].y) * f }; } d -= segs[i]; }
  return { ...pts[pts.length - 1] };
}
function alongDir(pts, t, back) {
  const a = alongPath(pts, t), b = alongPath(pts, Math.min(1, t + .02)), dx = (b.x - a.x) * (back ? -1 : 1), dy = (b.y - a.y) * (back ? -1 : 1);
  return Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 2 : 3) : (dy < 0 ? 1 : 0);
}
// Routine quotidienne qui varie un peu chaque jour (Hailey pour commencer). Renvoie le lieu du moment.
// Étape : [heure, lieu] ; heure ou lieu peuvent être une liste (une variante choisie selon le jour) ;
// un lieu « x? » n'a lieu qu'un soir sur deux (sinon on reste à l'étape d'avant).
export const routineDay = S => (S.year - 1) * 120 + S.season * 30 + S.day;
export function routinePlace(n, S) {
  const d = routineDay(S), pick = (v, k) => Array.isArray(v) ? v[(d * 7 + k * 3) % v.length] : v;
  const steps = (d - 1) % 7 >= 5 ? n.routine.repos : n.routine.travail;   // 19/11 : repos le samedi et le dimanche
  let at = null;
  steps.forEach(([h, p], k) => {
    const from = pick(h, k); let place = pick(p, k + 1);
    if (place.endsWith('?')) { if ((d + k) % 2) return; place = place.slice(0, -1); }
    if (S.minute >= from) at = place;
  });
  return at || 'maison';
}
// Essai : le PNJ fait le tour d'un point (ellipse), t en secondes. Direction selon le sens de la marche (0 bas, 1 haut, 2 gauche, 3 droite).
export function orbitNPC(n, t) {
  const o = n.orbit, a = (t / o.period) * Math.PI * 2;
  n.scene = o.scene; n.x = o.cx + Math.cos(a) * o.rx; n.y = o.cy + Math.sin(a) * o.ry; n.walking = true;
  const vx = -Math.sin(a) * o.rx, vy = Math.cos(a) * o.ry;
  n.dir = Math.abs(vx) > Math.abs(vy) ? (vx < 0 ? 2 : 3) : (vy < 0 ? 1 : 0);
}
// 19/11 : lieux de détente du week-end (samedi : la place du centre-ville ; dimanche : le parc et la plage)
const LEISURE_SAT = [{ scene: 'town', x: 13.5, y: 9.6 }, { scene: 'town', x: 22.5, y: 9.6 }, { scene: 'town', x: 18.5, y: 5.6 }, { scene: 'town', x: 12.6, y: 6.6 }];
const LEISURE_SUN = [{ scene: 'plage', x: 22.5, y: 7.5 }, { scene: 'plage', x: 26.5, y: 8.5 }, { scene: 'town', x: 14.5, y: 9.6 }];
export function placeNPC(n, S, OUT_FROM, OUT_TO) {
  if (n.mystic) return placeMyst(n, S);
  if (n.routine) { const p = n.places[routinePlace(n, S)]; n.scene = p.scene; n.x = p.x; n.y = p.y; n.walking = false; faceP(n, S); return; }
  if (n.stay) { n.scene = n.home; Object.assign(n, n.inside); n.walking = false; faceP(n, S); return; }   // reste chez lui (Suzie, Jade)
  if (n.worker) { // au travail de longues heures, sinon introuvable
    const w = n.worker, day = S.minute >= w.from && S.minute < w.to, off = !n.napping && (routineDay(S) - 1) % 7 >= 5;
    if (off) {   // 19/11 : le week-end, pas de travail : on se promène sur la place du centre-ville (ou au parc le dimanche)
      const sun = (routineDay(S) - 1) % 7 === 6, h = [...n.id].reduce((a, c) => a + c.charCodeAt(0), 0), spots = sun ? LEISURE_SUN : LEISURE_SAT, p = spots[h % spots.length];
      const outNow = S.minute >= 600 && S.minute < 1140;
      n.scene = outNow ? p.scene : (n.home || 'none'); Object.assign(n, outNow ? { x: p.x, y: p.y } : (n.inside || w.at)); n.walking = false; faceP(n, S); n.sleeping = false; return;
    }
    const on = day;
    n.scene = on ? w.scene : (n.home || 'none'); Object.assign(n, on ? w.at : (n.inside || w.at)); n.walking = false; n.dir = 0;
    if (n.napping) n.sleeping = on;   // lot 12 : Rouky fait la sieste dehors le jour
    return;
  }
  const out = S.minute >= OUT_FROM && S.minute < OUT_TO;
  n.walking = false;
  const walk = (n.walks || []).find(w => S.day % (w.every || 1) === 0 && S.minute >= w.from && S.minute < w.to);
  if (walk && (!n.shy || hearts(S.social[n.id] || { points: 0 }) >= n.shy.minHearts)) { n.scene = walk.scene; Object.assign(n, walk.at); n.dir = 0; return; } // promenade en forêt
  else if (!n.home && n.commute) { // il sort de chez lui et marche jusqu'à sa place (et rentre le soir)
    const m = S.minute, k = n.commuteMin || 40, go = m >= OUT_FROM && m < OUT_FROM + k, back = m >= OUT_TO && m < OUT_TO + k;
    if (go || back) { const t = go ? (m - OUT_FROM) / k : 1 - (m - OUT_TO) / k; n.scene = n.dayScene || 'town'; Object.assign(n, alongPath(n.commute, t)); n.walking = true; n.dir = alongDir(n.commute, t, back); }
    else { n.scene = out ? (n.dayScene || 'town') : 'none'; Object.assign(n, n.day); }
  }
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
// Myst : il attend le joueur sur le quai ; après les premières pensées du héros, il vient lui parler (plan,
// tente, liste des tâches, outil pour couper les arbres), puis redescend chez lui. Ensuite, il ne sort que le soir.
export const MYST_WAKE = 3.5;
export function placeMyst(n, S) {
  const st = S.intro && S.intro.myst, R = n.route;
  n.sleeping = false;
  const step = S.intro && S.intro.step;
  if (step && step !== 'done') {   // Farmwest : sur le quai de la gare, puis assis dans la diligence (on ne le voit pas)
    n.walking = false; if (step === 'train' || step === 'descente' || step === 'myst') {   // (il reste sur le quai pendant que le héros descend du train)
      n.scene = 'gare'; n.x = 4.5; n.y = 5.8; n.dir = 0; } else n.scene = 'none';
    return;
  }
  if (st === 'sleep' || st === 'wait' || st === 'talk') {   // il attend le joueur sur le quai
    n.scene = 'farm'; Object.assign(n, n.waitAt); n.walking = false; n.leg = R.length - 1;
    if (st !== 'talk' && S.intro.arrived && (S.scene || 'farm') === 'farm') S.intro.myst = 'talk';
    faceP(n, S);
    return;
  }
  if (st === 'leaving') {
    if (n.scene !== 'farm' || !Number.isFinite(n.x)) { n.scene = 'farm'; Object.assign(n, n.waitAt); n.leg = R.length - 1; }
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

// Lot 9 : l'habitant donne (ou reprend) sa demande de fabrication de la semaine.
export function craftTalk(g, id, say) {
  const S = g.S, q = craftRequest(g, id), fill = t => t.replace('{objet}', q ? craftLabel(q) : '');
  if (!q) { say([CRAFT_LINES.none]); return 'none'; }
  if (q.done) { say([CRAFT_LINES.done]); return 'done'; }
  if (craftReady(S, q)) { say([CRAFT_LINES.give], { onEnd: () => deliverCraft(g, id) }); return 'give'; }
  const first = !q.seen; q.seen = true;
  say([fill(first ? CRAFT_LINES.ask : CRAFT_LINES.wait) + ` (récompense : ${q.reward} $)`]);
  return first ? 'ask' : 'wait';
}
