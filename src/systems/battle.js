// Lot 30a (décision de l'utilisateur, 21/11) : combat au tour par tour avec jauge (façon « ATB »).
// On voit les monstres dans la zone ; les toucher ouvre l'écran de combat. Chaque combattant a une jauge qui se remplit
// selon sa vitesse ; quand celle du héros est pleine, le temps s'arrête et on choisit : Attaquer, Techniques (énergie ⚡),
// Objets, Se défendre, Fuir. Perdre = réveil à la clinique (frais de Hailey). L'état du combat est éphémère (g.battle,
// hors de S). Logique pure. ⏳ Plus tard : boss, magie.
// Lot 30c (21/11) : combats en équipe. Celui qui lance le combat en est l'hôte : il fait avancer les jauges et calcule tout ;
// il diffuse l'état (≤ 4 fois par seconde) ; un joueur proche peut le rejoindre (bouton « Rejoindre le combat ») : ses
// actions partent vers l'hôte. Les monstres frappent au hasard un des héros. Chacun reçoit son XP et son butin.
// Tout passe par g.bus.emit('net', { event, payload }) : le réseau est branché dans main.js.
import { MOBS } from '../data/wild.js';
import { ITEMS } from '../data/items.js';
import { add } from './inventory.js';
import { hasTool, toolTier } from './skills.js';
import { gainPxp } from './level.js';
import { toClinic } from './clinic.js';

export const ATB_RATE = 0.4;           // jauge pleine en 2,5 s à la vitesse 1 💡
export const HERO_SPD = 1;
export const FLEE_P = 0.6;             // chance de fuir 💡
export const JOIN_R = 4;               // les monstres de la même salle à moins de 4 cases rejoignent le combat 💡
export const MAX_FOES = 3, MAX_ALLIES = 3;
export const JOIN_DIST = 8;            // on peut rejoindre un combat à moins de 8 cases 💡
export const TECHS = {                 // 💡 techniques de base (la magie viendra plus tard)
  fort: { n: 'Coup puissant', i: '💥', e: 4, mult: 1.8, txt: 'Un coup lourd sur un ennemi.' },
  balayage: { n: 'Balayage', i: '🌀', e: 6, mult: 0.8, all: true, txt: 'Frappe tous les ennemis.' }
};
export const heroAtk = S => hasTool(S, 'sword') ? 14 + 7 * (toolTier(S, 'sword') - 1) : 5;   // à mains nues : 5
export const foodIds = S => Object.keys(S.inv || {}).filter(id => S.inv[id] > 0 && ITEMS[id] && ITEMS[id].eat);
const alive = B => B.foes.filter(f => f.hp > 0);
const roll = g => 0.85 + g.rnd() * 0.3;
const say = (B, t) => { B.log.push(t); if (B.log.length > 4) B.log.shift(); };

export function startBattle(g, first, others = []) {
  if (g.battle) return g.battle;
  const list = [first, ...others.filter(e => e !== first)].slice(0, MAX_FOES);
  const foes = list.map(e => { const M = MOBS[e.type] || MOBS.slime_v; return { ref: e, type: e.type || 'slime_v', n: M.n, hp: e.hp ?? M.hp, max: M.hp, atb: g.rnd() * 0.4 }; });
  g.battle = { id: (g.uid || 'moi') + ':' + Math.round(g.now()), foes, hero: { atb: 0.5, defend: false }, turn: false, log: [], over: null, scene: g.S.scene, allies: {} };
  say(g.battle, foes.length > 1 ? `${foes.length} ennemis approchent !` : `${foes[0].n} attaque !`);
  g.bus.emit('battle', 'start'); g.bus.emit('sfx', 'hurt');
  return g.battle;
}

// Avance les jauges ; le temps s'arrête pendant que le héros choisit (mode « attente »).
export function tickBattle(g, dt) {
  const B = g.battle; if (!B || B.remote || B.over) return;
  for (const a of Object.values(B.allies || {})) if (!a.down && !a.turn) { a.atb = Math.min(1, a.atb + dt * ATB_RATE * HERO_SPD); if (a.atb >= 1) a.turn = true; }   // 30c : les alliés ne mettent pas le combat en pause
  if (B.turn) return;
  B.hero.atb = Math.min(1, B.hero.atb + dt * ATB_RATE * HERO_SPD);
  for (const f of alive(B)) {
    f.atb += dt * ATB_RATE * (MOBS[f.type].spd || 1);
    if (f.atb >= 1) { f.atb = 0; foeHit(g, f); if (B.over) return; }
  }
  if (B.hero.atb >= 1) { B.turn = true; g.bus.emit('battle', 'turn'); }
}

function foeHit(g, f) {
  const B = g.battle, S = g.S, M = MOBS[f.type];
  const al = Object.entries(B.allies || {}).filter(([, a]) => !a.down), n = al.length + 1, pick = n > 1 ? (g.rnd() * n | 0) : 0;
  if (pick > 0) {   // 30c : un allié est visé
    const [, a] = al[pick - 1], dmg = Math.max(1, Math.round((M.atk || 8) * roll(g) * (a.defend ? 0.5 : 1)));
    a.hp = Math.max(0, a.hp - dmg); f.anim = 1; say(B, `${f.n} frappe ${a.name} : −${dmg} ❤️`); if (a.hp <= 0) { a.down = true; say(B, `💫 ${a.name} s’effondre…`); }
    g.bus.emit('battle', 'hit'); return;
  }
  const dmg = Math.max(1, Math.round((M.atk || 8) * roll(g) * (B.hero.defend ? 0.5 : 1)));
  S.hp = Math.max(0, S.hp - dmg); f.anim = 1;
  say(B, `${f.n} frappe : −${dmg} ❤️${B.hero.defend ? ' (paré)' : ''}`);
  g.bus.emit('sfx', 'hurt'); g.bus.emit('battle', 'hit');
  if (S.hp <= 0) lose(g);
}

// Action du héros (quand sa jauge est pleine). a = { act: 'attack'|'tech'|'item'|'defend'|'flee', target, tech, item }
export function heroAct(g, a) {
  const B = g.battle, S = g.S; if (!B || B.over || !B.turn) return false;
  if (B.remote) return remoteAct(g, a);   // 30c : je suis l'allié d'un autre joueur
  const targets = alive(B), tgt = targets[a.target | 0] || targets[0];
  B.hero.defend = false;
  if (a.act === 'attack') hitFoe(g, tgt, heroAtk(S), '⚔️');
  else if (a.act === 'tech') {
    const T = TECHS[a.tech]; if (!T) return false;
    if (S.energy < T.e) { say(B, `Pas assez d'énergie pour ${T.n} (${T.e} ⚡).`); return false; }
    S.energy -= T.e;
    for (const f of T.all ? targets : [tgt]) hitFoe(g, f, heroAtk(S) * T.mult, T.i);
  } else if (a.act === 'item') {
    const it = ITEMS[a.item]; if (!it || !it.eat || !(S.inv[a.item] > 0)) return false;
    add(g, a.item, -1); S.energy = Math.min(S.maxE, S.energy + (it.eat.e || 0)); S.hp = Math.min(S.maxHp, S.hp + (it.eat.h || 0));
    say(B, `${it.n} : +${it.eat.h || 0} ❤️ +${it.eat.e || 0} ⚡`);
  } else if (a.act === 'defend') { B.hero.defend = true; say(B, '🛡️ Tu te mets en garde.'); }
  else if (a.act === 'flee') {
    if (g.rnd() < FLEE_P) { say(B, '💨 Tu prends la fuite !'); end(g, 'fled'); }
    else say(B, '💨 Impossible de fuir !');
  } else return false;
  B.hero.atb = 0; B.turn = false;
  if (!B.over && !alive(B).length) win(g);
  return true;
}

function hitFoe(g, f, base, icon) {
  const B = g.battle, dmg = Math.max(1, Math.round(base * roll(g)));
  f.hp = Math.max(0, f.hp - dmg); f.hurt = 1;
  say(B, `${icon} ${f.n} : −${dmg}${f.hp <= 0 ? ' — vaincu !' : ''}`);
  g.bus.emit('sfx', 'hit');
}

// Victoire : butin et XP, les monstres vaincus disparaissent de la zone.
function win(g) {
  const B = g.battle, S = g.S, got = [];
  let xp = 0;
  for (const f of B.foes) {
    const M = MOBS[f.type]; xp += M.xp || 1;
    if (M.drop) { add(g, M.drop, 1); got.push(ITEMS[M.drop] ? ITEMS[M.drop].n : M.drop); }
    for (const [id, p, n] of M.loot || []) if (g.rnd() < p) { add(g, id, n || 1); got.push(ITEMS[id] ? ITEMS[id].n : id); }
    if (M.money) { const m = M.money[0] + (g.rnd() * (M.money[1] - M.money[0] + 1) | 0); S.money += m; got.push(m + ' $'); }
    const i = g.enemies.indexOf(f.ref); if (i >= 0) g.enemies.splice(i, 1);
  }
  gainPxp(g, xp, 'battle');
  B.reward = { xp, got, types: B.foes.map(f => f.type) }; say(B, `🏆 Victoire ! +${xp} XP${got.length ? ' · ' + got.join(', ') : ''}`);
  g.bus.emit('sfx', 'levelup'); end(g, 'win');
}
function lose(g) {
  const B = g.battle; say(B, '💫 Tu t’effondres…'); end(g, 'lose');
}
function end(g, how) { const B = g.battle; B.over = how; for (const f of B.foes) if (f.ref) f.ref.hp = f.hp; g.bus.emit('battle', how); }

// Fermer l'écran une fois le combat fini. Fuite : les monstres reculent, on a un court répit. Défaite : la clinique.
export function closeBattle(g) {
  const B = g.battle; if (!B || !B.over) return false;
  g.battle = null;
  if (B.over === 'fled') { if (g.player) g.player.iframe = 2.5; for (const f of B.foes) if (f.ref) { const d = Math.hypot(f.ref.x - g.S.x, f.ref.y - g.S.y) || 1; f.ref.x += (f.ref.x - g.S.x) / d * 2; f.ref.y += (f.ref.y - g.S.y) / d * 2; } }
  if (B.over === 'lose') { toClinic(g, 'combat'); g.S.hp = Math.round(g.S.maxHp / 2); }
  g.bus.emit('battle', 'close');
  return B.over;
}

// ---------------------------------------------------------------- Lot 30c : combats en équipe (logique pure)
// L'hôte diffuse cet état ; les autres joueurs s'en servent pour afficher le combat ou proposer de le rejoindre.
export function battleState(g) {
  const B = g.battle, S = g.S; if (!B || B.remote) return null;
  return { bid: B.id, sc: B.scene, x: +S.x.toFixed(1), y: +S.y.toFixed(1), log: B.log.slice(-4), over: B.over, types: B.reward ? B.reward.types : null,
    foes: B.foes.map(f => ({ type: f.type, n: f.n, hp: f.hp, max: f.max, atb: +f.atb.toFixed(2) })),
    host: { name: S.name, hp: S.hp, maxHp: S.maxHp, atb: +B.hero.atb.toFixed(2) },
    allies: Object.fromEntries(Object.entries(B.allies).map(([id, a]) => [id, { name: a.name, hp: a.hp, maxHp: a.maxHp, atb: +a.atb.toFixed(2), turn: !!a.turn, down: !!a.down }])) };
}
// Un joueur proche veut entrer dans mon combat.
export function onJoin(g, p) {
  const B = g.battle; if (!B || B.remote || B.over || !p || p.bid !== B.id || B.allies[p.id] || Object.keys(B.allies).length >= MAX_ALLIES) return false;
  B.allies[p.id] = { name: String(p.name || '?').slice(0, 20), hp: Math.max(1, +p.hp || 1), maxHp: Math.max(1, +p.maxHp || 100), atb: 0, turn: false, defend: false, down: false };
  say(B, `🤝 ${B.allies[p.id].name} rejoint le combat !`); g.bus.emit('battle', 'join'); return true;
}
// Action d'un allié (reçue par le réseau). atk et soins viennent de l'allié ; on les borne.
export function onAllyAct(g, p) {
  const B = g.battle; if (!B || B.remote || B.over || !p || p.bid !== B.id) return false;
  const al = B.allies[p.id], a = p.a || {}; if (!al || al.down || !al.turn) return false;
  const targets = alive(B), tgt = targets[a.target | 0] || targets[0], atk = Math.min(80, Math.max(1, +p.atk || 5));
  al.defend = false;
  if (a.act === 'attack') hitFoe(g, tgt, atk, '⚔️ ' + al.name + ' →');
  else if (a.act === 'tech' && TECHS[a.tech]) for (const f of TECHS[a.tech].all ? targets : [tgt]) hitFoe(g, f, atk * TECHS[a.tech].mult, TECHS[a.tech].i + ' ' + al.name + ' →');
  else if (a.act === 'item') { al.hp = Math.min(al.maxHp, al.hp + Math.min(60, Math.max(0, +p.heal || 0))); say(B, `🍞 ${al.name} mange.`); }
  else if (a.act === 'defend') { al.defend = true; say(B, `🛡️ ${al.name} se met en garde.`); }
  else if (a.act === 'flee') { delete B.allies[p.id]; say(B, `💨 ${al.name} quitte le combat.`); return true; }
  else return false;
  al.atb = 0; al.turn = false;
  if (!B.over && !alive(B).length) win(g);
  return true;
}
// Combats proches (vus dans les messages des autres joueurs) : on garde le plus récent par hôte.
export function noteBattle(g, hostId, st) {
  if (!st) return; (g.nearBattles ||= {})[hostId] = { ...st, t: g.now() };
  const B = g.battle; if (B && B.remote && B.host === hostId && B.id === st.bid) applyRemote(g, st);
}
export function joinable(g) {
  const S = g.S, now = g.now();
  return Object.entries(g.nearBattles || {}).filter(([, b]) => !b.over && now - b.t < 3000 && b.sc === S.scene && Math.hypot(b.x - S.x, b.y - S.y) < JOIN_DIST && Object.keys(b.allies || {}).length < MAX_ALLIES).map(([hostId, b]) => ({ ...b, hostId }));
}
export function joinBattle(g, host) {
  const b = (g.nearBattles || {})[host], S = g.S, me = g.uid || 'moi'; if (!b || g.battle) return false;
  g.battle = { remote: true, host, id: b.bid, foes: b.foes.map(f => ({ ...f })), hero: { atb: 0, defend: false }, turn: false, log: [...b.log], over: null, scene: b.sc, allies: {}, joining: true };
  g.bus.emit('net', { event: 'battleJoin', payload: { bid: b.bid, host, id: me, name: S.name, hp: S.hp, maxHp: S.maxHp } });
  g.bus.emit('battle', 'start'); return true;
}
function applyRemote(g, st) {
  const B = g.battle, me = (st.allies || {})[g.uid || 'moi'], S = g.S;
  B.foes = st.foes.map(f => ({ ...f })); B.log = st.log; B.hostInfo = st.host;
  B.allies = Object.fromEntries(Object.entries(st.allies || {}).filter(([id]) => id !== (g.uid || 'moi')));
  if (me) { B.joining = false; S.hp = me.hp; B.hero.atb = me.atb; const was = B.turn; B.turn = !!me.turn && !B.sent; if (!me.turn) B.sent = false; if (B.turn && !was) g.bus.emit('battle', 'turn'); }
  if (B.over) return;
  if (me && me.down) { B.over = 'lose'; g.bus.emit('battle', 'lose'); }
  else if (st.over === 'win' && me) { claimWin(g, st.types || st.foes.map(f => f.type)); B.over = 'win'; g.bus.emit('battle', 'win'); }
  else if (st.over) { B.over = 'fled'; g.bus.emit('battle', 'fled'); }
}
// L'allié tire son propre butin et son XP (les mêmes monstres que l'hôte).
export function claimWin(g, types) {
  const S = g.S, got = []; let xp = 0;
  for (const t of types) { const M = MOBS[t]; if (!M) continue; xp += M.xp || 1;
    if (M.drop) { add(g, M.drop, 1); got.push(ITEMS[M.drop] ? ITEMS[M.drop].n : M.drop); }
    for (const [id, p, n] of M.loot || []) if (g.rnd() < p) { add(g, id, n || 1); got.push(ITEMS[id] ? ITEMS[id].n : id); }
    if (M.money) { const m = M.money[0] + (g.rnd() * (M.money[1] - M.money[0] + 1) | 0); S.money += m; got.push(m + ' $'); } }
  gainPxp(g, xp, 'battle'); if (g.battle) { g.battle.reward = { xp, got }; g.battle.log.push(`🏆 Victoire ! +${xp} XP${got.length ? ' · ' + got.join(', ') : ''}`); }
  return { xp, got };
}
function remoteAct(g, a) {
  const B = g.battle, S = g.S, p = { bid: B.id, host: B.host, id: g.uid || 'moi', a, atk: heroAtk(S) };
  if (a.act === 'tech') { const T = TECHS[a.tech]; if (!T) return false; if (S.energy < T.e) { say(B, `Pas assez d'énergie pour ${T.n} (${T.e} ⚡).`); return false; } S.energy -= T.e; }
  if (a.act === 'item') { const it = ITEMS[a.item]; if (!it || !it.eat || !(S.inv[a.item] > 0)) return false; add(g, a.item, -1); S.energy = Math.min(S.maxE, S.energy + (it.eat.e || 0)); p.heal = it.eat.h || 0; }
  g.bus.emit('net', { event: 'battleAct', payload: p });
  B.turn = false; B.sent = true; B.hero.atb = 0;
  if (a.act === 'flee') { B.over = 'fled'; say(B, '💨 Tu quittes le combat.'); g.bus.emit('battle', 'fled'); }
  return true;
}
