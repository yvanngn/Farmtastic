// Pêche : mélange Zelda (on lance, on voit l'ombre du poisson tourner autour du bouchon puis mordre)
// et Stardew Valley (combat : garder le poisson dans la zone verte qui monte quand on appuie). Logique pure.
import { FISH } from '../data/fish.js';
import { isPond } from '../world/map.js';
import { LAYOUTS } from '../world/scenes.js';
import { add, canAdd } from './inventory.js';
import { useEnergy } from './player.js';

export const BITE_WINDOW = 900;          // ms pour ferrer après le « ! »
export const WAIT = [1800, 6000];        // attente avant la touche
export const BAR = .28;                  // hauteur de la zone verte (fraction de la jauge)

export function zoneAt(S, x, y) {
  const sc = S.scene || 'farm';
  if (sc === 'farm') return isPond(x, y) ? 'etang' : null;
  const t = LAYOUTS[sc] && LAYOUTS[sc][y] && LAYOUTS[sc][y][x];
  if (t !== 'w') return null;
  return sc === 'plage' ? 'mer' : sc === 'montagne' ? 'lac' : null;
}
export const canBite = (f, S, zone) => f.zones.includes(zone) && f.seasons.includes(S.season) && S.minute >= f.from && S.minute < f.to;
// Lot 12 : la canne sommaire de Rouky (palier 1) attend plus longtemps et n'attrape pas les poissons rares (améliorable plus tard).
export const BASIC_ROD = { wait: 1.6, minW: 2 };
const basicRod = S => (S.tools && S.tools.rod || 0) <= 1;
export function pickFish(S, zone, r) {
  const ok = FISH.filter(f => canBite(f, S, zone) && !(basicRod(S) && f.w < BASIC_ROD.minW));
  if (!ok.length) return null;
  let t = r * ok.reduce((a, f) => a + f.w, 0);
  for (const f of ok) if ((t -= f.w) < 0) return f;
  return ok[ok.length - 1];
}

// Lancer : la ligne part vers l'eau visée ; un poisson est choisi selon le lieu, la saison et l'heure.
export function cast(g, x, y) {
  const S = g.S, zone = zoneAt(S, x, y);
  if (!zone) { g.bus.emit('toast', '🎣 Vise l’eau pour lancer ta ligne.'); return false; }
  if (!useEnergy(g, 2)) return false;
  const fish = pickFish(S, zone, g.rnd());
  g.fishing = { phase: 'wait', x, y, zone, fish, t0: g.now(), bite: g.now() + (WAIT[0] + g.rnd() * (WAIT[1] - WAIT[0])) * (basicRod(S) ? BASIC_ROD.wait : 1) };
  g.bus.emit('sfx', 'pick'); g.bus.emit('swing', 'rod');
  if (!fish) g.fishing.bite = Infinity;   // rien ne mord à cet endroit, à cette heure-ci
  return true;
}

// Toucher pendant la pêche : ferrer au bon moment, sinon remonter la ligne.
export function hook(g) {
  const F = g.fishing; if (!F) return false;
  if (F.phase === 'bite') { F.phase = 'fight'; F.fight = newFight(F.fish); g.bus.emit('sfx', 'levelup'); g.bus.emit('fishFight', F); return 'fight'; }
  if (F.phase === 'wait') { g.fishing = null; g.bus.emit('toast', F.fish ? 'Tu as remonté ta ligne trop tôt.' : 'Rien ne mord ici, à cette heure-ci… Essaie un autre endroit ou une autre heure.'); return 'reel'; }
  return false;
}

// Combat (façon Stardew) : la zone verte tombe, monte quand on appuie ; le poisson bouge tout seul.
export const newFight = f => ({ bar: .3, v: 0, fy: .5, ft: .5, prog: .3, diff: f.diff });
export function stepFight(st, dt, holding, r) {
  st.v += (holding ? 2.6 : -2.2) * dt; st.v *= .96; st.bar = Math.max(0, Math.min(1 - BAR, st.bar + st.v * dt));
  if (st.bar === 0 || st.bar === 1 - BAR) st.v *= -.3;
  if (r() < dt * st.diff * 1.2) st.ft = r();                       // le poisson change de cap
  st.fy += Math.sign(st.ft - st.fy) * Math.min(Math.abs(st.ft - st.fy), dt * .35 * st.diff);
  const inside = st.fy >= st.bar && st.fy <= st.bar + BAR;
  st.prog = Math.max(0, Math.min(1, st.prog + (inside ? .32 : -.22) * dt));
  return st.prog >= 1 ? 'win' : st.prog <= 0 ? 'lose' : inside ? 'in' : 'out';
}

export function fishTick(g, dt) {
  const F = g.fishing; if (!F) return null;
  const now = g.now();
  if (F.phase === 'wait' && now >= F.bite) { F.phase = 'bite'; F.biteAt = now; g.bus.emit('sfx', 'denied'); return 'bite'; }
  if (F.phase === 'bite' && now - F.biteAt > BITE_WINDOW) { g.fishing = null; g.bus.emit('toast', 'Raté ! Le poisson s’est décroché. Touche vite quand le « ! » apparaît.'); return 'miss'; }
  if (F.phase === 'fight') {
    const res = stepFight(F.fight, dt, !!g.fishHold, g.rnd);
    if (res === 'win') return land(g);
    if (res === 'lose') { g.fishing = null; g.bus.emit('fishEnd', false); g.bus.emit('toast', `Le poisson s’est échappé…`); return 'lose'; }
  }
  return F.phase;
}

// Poisson attrapé : dans le sac, et noté dans le carnet de pêche (taille, lieu, date).
export function land(g) {
  const S = g.S, F = g.fishing, f = F.fish;
  g.fishing = null; g.bus.emit('fishEnd', true);
  const size = Math.round(f.size[0] + g.rnd() * (f.size[1] - f.size[0]));
  if (canAdd(S, f.id, 1)) add(g, f.id, 1); else g.bus.emit('toast', 'Sac plein : tu relâches le poisson.');
  const when = { day: S.day, season: S.season, year: S.year, minute: S.minute, zone: F.zone };
  const e = (S.fishLog ||= {})[f.id] ||= { n: 0, best: 0, first: when };
  e.n++; e.last = when; const record = size > e.best; e.best = Math.max(e.best, size);
  g.bus.emit('sfx', 'levelup');
  g.bus.emit('toast', `🎣 ${f.n} ! ${size} cm${record && e.n > 1 ? ' — nouveau record !' : ''}`);
  return 'win';
}
