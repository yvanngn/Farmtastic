// Zone de combat (Terres sauvages) : salles façon Zelda Game Boy, monstres par salle,
// cochons qui tirent, cailloux à minerais. Logique pure : pas de DOM ni de hasard direct.
import { isSolid, key } from '../world/map.js';
import { LAYOUTS } from '../world/scenes.js';
import { add } from './inventory.js';
import { damage, useEnergy } from './player.js';
import { gainXp, toolTier, hasTool } from './skills.js';
import { ROOM_W, ROOM_H, MOBS, ROOM_MOBS, ZROCKS, ZROCK_COUNT, ZROCK_P3, ZROCK_P2, ORES, GATE } from '../data/wild.js';
import { CFG } from '../config.js';
import { MINING_GAIN, energyCost } from '../data/tools.js';

export const roomOf = (x, y) => (Math.floor(y / ROOM_H) * 3 + Math.floor(x / ROOM_W));
export const isOpen = S => !!S.wildOpen || CFG.ACCES_TEST;

// TEST : une épée posée devant le portail, à ramasser dès le début.
export const TEST_SWORD = { x: 45, y: 18 };
export const testSwordHere = S => CFG.ACCES_TEST && (S.scene || 'farm') === 'farm' && !(S.tools && S.tools.sword);
export function pickTestSword(g, x, y) {
  const S = g.S;
  if (!testSwordHere(S) || x !== TEST_SWORD.x || y !== TEST_SWORD.y) return false;
  S.tools = { ...S.tools, sword: 1 };
  g.bus.emit('sfx', 'levelup'); g.bus.emit('toast', '🗡️ Tu as trouvé une épée !'); g.bus.emit('inv');
  return true;
}

// Ouverture de la zone : le chef confie la clé du vieux portail et une épée.
export function openWild(g) {
  const S = g.S;
  if (S.wildOpen) return false;
  S.wildOpen = true;
  S.tools = { ...S.tools, sword: Math.max(1, S.tools.sword || 0) };
  g.bus.emit('sfx', 'levelup');
  const n = g.npcs && g.npcs.chef;
  g.bus.emit('say', { name: n ? n.name : 'Le chef du village', color: n ? n.color : '#e8c26a', voice: 'voiceChef', lines: [
    'Les lampadaires brillent de nouveau, grâce à toi ! Tiens, voici la clé du vieux portail, tout à l\'est de ta ferme.',
    'Derrière, ce sont les Terres sauvages. Des slimes et des cochons pas commodes y rôdent : prends cette épée.'] });
  g.bus.emit('inv');
  return true;
}

// Cailloux de la zone : renouvelés chaque jour, sur des cases libres.
export function ensureRocks(g) {
  const S = g.S, day = S.year + '-' + S.season + '-' + S.day;
  S.wild ||= { day: null, rocks: {} };
  if (S.wild.day === day) return S.wild.rocks;
  const L = LAYOUTS.wild, rocks = {};
  for (let tries = 0, n = 0; n < ZROCK_COUNT && tries < 400; tries++) {
    const x = 1 + (g.rnd() * 28 | 0), y = 1 + (g.rnd() * 14 | 0), k = key(x, y);
    if (L[y][x] !== '.' || rocks[k] || (x < 4 && y < 7)) continue;
    const v = g.rnd(), t = v < ZROCK_P3 ? 'zrock3' : v < ZROCK_P2 ? 'zrock2' : 'zrock1';
    rocks[k] = { t, hp: ZROCKS[t].hp }; n++;
  }
  S.wild.day = day; S.wild.rocks = rocks;
  return rocks;
}

export function hitZRock(g, x, y) {
  const S = g.S, k = key(x, y), o = S.wild && S.wild.rocks[k];
  if (!o) return false;
  if (S.sel !== 'pick') { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', hasTool(S, 'pick') ? 'Il faut la pioche ⛏️' : 'Il te faut une pioche.'); return false; }
  const tier = toolTier(S, 'pick');
  if (!useEnergy(g, energyCost(tier))) return false;
  o.hp -= tier; o.shake = 0.25;
  g.bus.emit('swing', 'pick'); g.bus.emit('objHit', { x, y, t: 'rock', broken: o.hp <= 0 });
  g.bus.emit('sfx', o.hp <= 0 ? 'break' : 'pick');
  gainXp(g, 'mining', MINING_GAIN.hit);
  if (o.hp <= 0) {
    delete S.wild.rocks[k];
    const R = ZROCKS[o.t];
    add(g, 'stone', R.stone); gainXp(g, 'mining', 5 * R.stone);
    let txt = '+' + R.stone + '🪨';
    if (g.rnd() < R.ore) { const ore = ORES[g.rnd() * ORES.length | 0]; add(g, ore, 1); txt += ore === 'ruby' ? ' ♦️' : ' 💚'; g.bus.emit('sfx', 'levelup'); g.bus.emit('toast', ore === 'ruby' ? 'Un rubis !' : 'Une émeraude !'); }
    g.bus.emit('pop', { t: txt, x, y });
  }
  return true;
}

// Entrer dans une salle : ses monstres apparaissent (comme dans Zelda, ils reviennent si on repasse).
export function spawnRoom(g, room) {
  g.enemies.length = 0; (g.shots ||= []).length = 0;
  const rx = room % 3, ry = Math.floor(room / 3), L = LAYOUTS.wild;
  for (const type of ROOM_MOBS[room] || []) {
    for (let tries = 0; tries < 30; tries++) {
      const x = rx * ROOM_W + 2 + g.rnd() * (ROOM_W - 4), y = ry * ROOM_H + 2 + g.rnd() * (ROOM_H - 4);
      if (L[y | 0][x | 0] === '.' && !(g.S.wild && g.S.wild.rocks[key(x | 0, y | 0)]) && Math.hypot(x - g.S.x, y - g.S.y) > 3) {
        g.enemies.push({ type, x, y, hp: MOBS[type].hp, cd: 1, hit: 0, room, t: g.rnd() * 3 }); break;
      }
    }
  }
}

function tryMove(S, e, nx, ny) {
  if (roomOf(nx, ny) !== e.room) return;
  if (!isSolid(S, nx | 0, ny | 0)) { e.x = nx; e.y = ny; }
}

// Boucle de la zone : changement de salle, monstres, tirs, invincibilité du joueur.
export function updateWild(g, dt) {
  const S = g.S, P = g.player;
  if (S.scene !== 'wild') { if (g.wildRoom != null) { g.wildRoom = null; g.enemies.length = 0; if (g.shots) g.shots.length = 0; } return; }
  ensureRocks(g);
  const room = roomOf(S.x, S.y);
  if (room !== g.wildRoom) { g.wildRoom = room; spawnRoom(g, room); }
  P.iframe = Math.max(0, (P.iframe || 0) - dt);
  const hurt = n => { if (P.iframe > 0) return; P.iframe = 0.8; damage(g, n); };
  for (const e of [...g.enemies]) {
    const M = MOBS[e.type]; e.cd -= dt; e.hit -= dt; e.t += dt;
    const dx = S.x - e.x, dy = S.y - e.y, d = Math.hypot(dx, dy) || 1;
    if (e.type === 'pig') {
      // garde ses distances et tire en ligne droite vers le joueur
      const want = d < 3 ? -1 : d > 5 ? 1 : 0;
      if (want) tryMove(S, e, e.x + dx / d * dt * M.speed * want, e.y + dy / d * dt * M.speed * want);
      if (e.cd <= 0 && d < 7) {
        e.cd = M.reload;
        const ax = Math.abs(dx) > Math.abs(dy), vx = ax ? Math.sign(dx) * 5 : 0, vy = ax ? 0 : Math.sign(dy) * 5;
        g.shots.push({ x: e.x, y: e.y - .3, vx, vy, life: 2, dmg: M.shot });
        g.bus.emit('sfx', 'oink');
      }
    } else {
      // les slimes avancent par petits bonds
      const hop = Math.sin(e.t * (e.type === 'slime_b' ? 9 : 6)) > 0;
      if (hop && d > 0.4) tryMove(S, e, e.x + dx / d * dt * M.speed * 1.6, e.y + dy / d * dt * M.speed * 1.6);
    }
    if (d < 0.6 && e.cd <= 0 && e.type !== 'pig') { e.cd = 1; hurt(M.dmg); }
    if (d < 0.6 && e.type === 'pig') hurt(M.dmg);
  }
  for (let i = (g.shots || []).length - 1; i >= 0; i--) {
    const s = g.shots[i]; s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
    if (Math.hypot(s.x - S.x, s.y - (S.y - .3)) < .45) { hurt(s.dmg); g.shots.splice(i, 1); continue; }
    if (s.life <= 0 || isSolid(S, s.x | 0, s.y | 0)) g.shots.splice(i, 1);
  }
}

// Récompense d'un monstre vaincu.
export function mobLoot(g, e) {
  const M = MOBS[e.type] || MOBS.slime_v;
  if (M.drop) { add(g, M.drop); g.bus.emit('pop', { t: '+🟢', x: e.x, y: e.y }); }
  if (M.money) { const n = M.money[0] + (g.rnd() * (M.money[1] - M.money[0] + 1) | 0); g.S.money += n; g.bus.emit('pop', { t: '+' + n + '🪙', x: e.x, y: e.y }); }
}
export { GATE };
