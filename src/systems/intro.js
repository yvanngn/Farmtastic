// Farmwest, lot 3 : nouveau début de partie. Logique pure (pas de DOM).
// train (la locomotive entre en gare, pensées du héros) → myst (accueil sur le quai) → diligence (traversée du
// centre-ville, Myst raconte la légende puis présente les bâtiments ; la diligence s'arrête le temps de chaque explication)
// → choix (au rond-point, on choisit une des 4 fermes) → done (dépôt devant la ferme).
import { INTRO_LINES, INTRO_MYST, MYST } from '../data/npcs.js';
import { FARM_LOTS } from '../data/buildings.js';

export const TRAIN_MS = 3200;            // la locomotive entre en gare et s'arrête
export const COACH_SPEED = 3.2;          // cases par seconde
export const GARE_QUAI = { x: 4.5, y: 7.6 }, MYST_QUAI = { x: 4.5, y: 5.8 };
export const RIDE = {
  town: { y: 10.6, from: -.5, to: 33.6 },
  rondpoint: { y: 9, from: -.5, to: 8.5 }
};
export const FARM_DROP = { x: 16.5, y: 33.6 };   // devant l'entrée sud de la ferme

export const introActive = S => !!(S.intro && S.intro.step && S.intro.step !== 'done');
const myst = (g, lines, onEnd, extra = {}) => { g.introWait = true; g.bus.emit('say', { name: MYST.name, color: MYST.color, voice: MYST.voice, lines, ...extra, onEnd: () => { g.introWait = false; onEnd && onEnd(); } }); };

function startRide(g, scene) {
  const S = g.S, R = RIDE[scene];
  S.scene = scene; S.x = R.from; S.y = R.y; S.dir = 3;
  g.ride = { scene, x: R.from, y: R.y, said: {} };
  g.bus.emit('scene', scene);
}

export function introTick(g, dt) {
  const S = g.S;
  if (!introActive(S) || g.introWait) return null;
  const I = S.intro;
  if (I.step === 'train') {
    if (S.scene !== 'gare') { S.scene = 'gare'; Object.assign(S, GARE_QUAI); g.bus.emit('scene', 'gare'); }
    g.introT = (g.introT || 0) + dt * 1000;
    if (!g.whistled && g.introT > 500) { g.whistled = true; g.bus.emit('sfx', 'whistle'); }
    if (g.introT < TRAIN_MS) return 'train';
    g.introWait = true;
    g.bus.emit('say', { name: S.name, color: '#ffdf8a', lines: INTRO_LINES, onEnd: () => { g.introWait = false; I.step = 'myst'; } });
    return 'thoughts';
  }
  if (I.step === 'myst') {
    myst(g, INTRO_MYST.gare, () => { I.step = 'diligence'; startRide(g, 'town'); g.bus.emit('sfx', 'spurs'); });
    return 'myst';
  }
  if (I.step === 'diligence') {
    if (!g.ride || g.ride.scene !== S.scene) startRide(g, S.scene === 'rondpoint' ? 'rondpoint' : 'town');
    const r = g.ride, R = RIDE[r.scene];
    if (r.scene === 'town' && !r.said.legende && r.x > 1) { r.said.legende = true; myst(g, INTRO_MYST.legende); return 'legende'; }
    if (r.scene === 'town') {
      const stop = INTRO_MYST.arrets.find(a => !r.said[a.x] && r.x >= a.x);
      if (stop) { r.said[stop.x] = true; myst(g, [stop.t]); return 'arret'; }   // la diligence attend la fin de l'explication
    }
    r.x = Math.min(R.to, r.x + COACH_SPEED * dt); S.x = r.x; S.y = r.y;
    if (r.x < R.to) return 'roule';
    if (r.scene === 'town') { startRide(g, 'rondpoint'); return 'pont'; }
    I.step = 'choix'; return 'arrivee';
  }
  if (I.step === 'choix' || I.step === 'choisit') { askFarm(g); return 'choix'; }   // (« choisit » : partie rechargée pendant le choix)
  if (I.step === 'fin') { finishIntro(g); return 'fin'; }
  return null;
}

// Fermes déjà prises (multijoueur) : par un autre joueur de la partie.
export function takenLots(g) { const t = {}; for (const id in g.others || {}) { const o = g.others[id]; if (o && o.farmLot != null) t[o.farmLot] = o.name || 'un autre joueur'; } return t; }

function askFarm(g) {
  const S = g.S, taken = takenLots(g);
  S.intro.step = 'choisit';
  g.introWait = true;
  g.bus.emit('say', { name: MYST.name, color: MYST.color, voice: MYST.voice, lines: INTRO_MYST.rond,
    choices: FARM_LOTS.map(l => taken[l.id] != null ? `${l.n} (prise par ${taken[l.id]})` : l.n),
    onChoose: i => { g.introWait = false; if (!chooseFarm(g, i)) S.intro.step = 'choix'; } });
}

// Choix de la ferme (appelé par le choix du dialogue). Une ferme prise ne se choisit pas.
export function chooseFarm(g, i) {
  const S = g.S, I = S.intro, taken = takenLots(g);
  if (!FARM_LOTS[i] || taken[i] != null) { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', 'Cette ferme est déjà prise : choisis-en une autre.'); return false; }
  S.farmLot = i; I.step = 'fin';
  myst(g, INTRO_MYST.fin, () => finishIntro(g));
  return true;
}
export function finishIntro(g) {
  const S = g.S, I = S.intro;
  I.step = 'done'; I.arrived = true; I.myst = 'done';
  g.ride = null;
  S.scene = 'farm'; Object.assign(S, FARM_DROP); S.dir = 1;
  g.bus.emit('scene', 'farm'); g.bus.emit('sfx', 'door'); g.bus.emit('showMap');
  return true;
}
