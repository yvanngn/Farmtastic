// Farmwest, lot 3 : nouveau début de partie. Logique pure (pas de DOM).
// train (la locomotive entre en gare, pensées du héros) → myst (accueil sur le quai) → diligence (traversée du
// centre-ville, Myst raconte la légende puis présente les bâtiments ; la diligence s'arrête le temps de chaque explication)
// → choix (au rond-point, on choisit une des 4 fermes) → done (dépôt devant la ferme).
import { INTRO_LINES, INTRO_MYST, MYST } from '../data/npcs.js';
import { FARM_LOTS } from '../data/buildings.js';

export const TRAIN_MS = 3200;            // la locomotive entre en gare et s'arrête
export const LOCO_LEAVE_S = 2.5;         // lot 8 : la locomotive repart une fois le héros dans la diligence
export const COACH_SPEED = 3.2;          // cases par seconde
export const GARE_QUAI = { x: 4.5, y: 7.6 }, MYST_QUAI = { x: 4.5, y: 5.8 };
export const TRAIN_DOOR = { x: 2.9, y: 4.6 };   // porte du wagon, une fois le train à quai (le héros est assis dedans)
export const STEP_SPEED = 2.4;                    // cases par seconde quand il descend sur le quai
export const RIDE = {
  gare: { y: 8.6, from: 5.2, to: 23.6 },   // lot 8 : le héros monte dans la diligence au bout du quai ; la locomotive repart
  town: { y: 10.6, from: -.5, to: 33.6 },
  rondpoint: { y: 9, from: -.5, to: 8.5 }
};
export const FARM_DROP = { x: 16.5, y: 33.6 };   // devant l'entrée sud de la ferme

export const introActive = S => !!(S.intro && S.intro.step && S.intro.step !== 'done');
const myst = (g, lines, onEnd, extra = {}) => { g.introWait = true; g.bus.emit('say', { name: MYST.name, color: MYST.color, voice: MYST.voice, lines, ...extra, onEnd: () => { g.introWait = false; onEnd && onEnd(); } }); };

function startRide(g, scene) {
  const S = g.S, R = RIDE[scene];
  S.scene = scene; S.x = R.from; S.y = R.y; S.dir = 3;
  g.ride = { scene, x: R.from, y: R.y, said: {}, t: 0 };
  g.bus.emit('scene', scene);
}

export function introTick(g, dt) {
  const S = g.S;
  if (!introActive(S) || g.introWait) return null;
  const I = S.intro;
  if (I.step === 'train') {
    if (S.scene !== 'gare') { S.scene = 'gare'; g.bus.emit('scene', 'gare'); }
    Object.assign(S, TRAIN_DOOR); g.introHidden = true;   // le héros arrive DANS le train
    g.introT = (g.introT || 0) + dt * 1000;
    if (!g.whistled && g.introT > 500) { g.whistled = true; g.bus.emit('sfx', 'whistle'); }
    if (g.introT < TRAIN_MS) return 'train';
    g.introWait = true;
    g.bus.emit('say', { name: S.name, color: '#ffdf8a', lines: INTRO_LINES, onEnd: () => { g.introWait = false; I.step = 'descente'; } });
    return 'thoughts';
  }
  if (I.step === 'descente') {   // il descend du wagon et marche jusqu'au quai, où Myst l'attend
    g.introHidden = false; Object.assign(S, S.scene === 'gare' && S.x >= TRAIN_DOOR.x - .01 ? {} : TRAIN_DOOR); S.scene = 'gare';
    const dx = GARE_QUAI.x - S.x, dy = GARE_QUAI.y - S.y, d = Math.hypot(dx, dy), st = STEP_SPEED * dt;
    const P = g.player || (g.player = {}); P.walkT = (P.walkT || 0) + dt;
    if (d > st) { S.x += dx / d * st; S.y += dy / d * st; S.dir = Math.abs(dx) > Math.abs(dy) ? 3 : 0; P.walkFrame = 1 + ((P.walkT * 1000 / 85 | 0) % 8); return 'descente'; }
    Object.assign(S, GARE_QUAI); S.dir = 2; P.walkFrame = 0; I.step = 'myst'; return 'quai';
  }
  if (I.step === 'myst') {
    myst(g, INTRO_MYST.gare, () => { I.step = 'diligence'; startRide(g, 'gare'); g.bus.emit('sfx', 'spurs'); });
    return 'myst';
  }
  if (I.step === 'diligence') {
    if (!g.ride || g.ride.scene !== S.scene) startRide(g, S.scene === 'rondpoint' || S.scene === 'gare' ? S.scene : 'town');
    const r = g.ride, R = RIDE[r.scene];
    if (r.scene === 'town' && !r.said.legende && r.x > 1) { r.said.legende = true; myst(g, INTRO_MYST.legende); return 'legende'; }
    if (r.scene === 'town') {
      const stop = INTRO_MYST.arrets.find(a => !r.said[a.x] && r.x >= a.x);
      if (stop) { r.said[stop.x] = true; myst(g, [stop.t]); return 'arret'; }   // la diligence attend la fin de l'explication
    }
    r.t += dt;
    if (r.scene === 'gare' && r.t < LOCO_LEAVE_S) return 'locomotive';   // la locomotive repart d'abord, sous les yeux du héros
    r.x = Math.min(R.to, r.x + COACH_SPEED * dt); S.x = r.x; S.y = r.y;
    if (r.x < R.to) return 'roule';
    if (r.scene === 'gare') { startRide(g, 'town'); return 'route'; }
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
// Passer toute l'intro : on arrive directement devant sa ferme (la première libre si on n'a pas encore choisi).
export function skipIntro(g) {
  const S = g.S;
  if (!introActive(S)) return false;
  g.introWait = false; g.introHidden = false; g.ride = null;
  if (S.farmLot == null || S.intro.step !== 'fin') { const taken = takenLots(g), lot = FARM_LOTS.find(l => taken[l.id] == null); S.farmLot = lot ? lot.id : 0; }
  return finishIntro(g);
}
export function finishIntro(g) {
  const S = g.S, I = S.intro;
  I.step = 'done'; I.arrived = true; I.myst = 'done';
  g.ride = null;
  S.scene = 'farm'; Object.assign(S, FARM_DROP); S.dir = 1;
  g.bus.emit('scene', 'farm'); g.bus.emit('sfx', 'door'); g.bus.emit('showMap');
  return true;
}
