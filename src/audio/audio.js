// Moteur audio 100 % synthétisé (Web Audio) : musiques originales par ambiance,
// enchaînées en fondu, avec réverbération ; bruitages ; ambiances en boucle.
// Démarre au premier geste du joueur (règle des navigateurs).
import { loadSettings, saveSettings, effective, pickTrack, pickAmbience } from './settings.js';

const C4 = 261.63;
const hz = semi => C4 * Math.pow(2, semi / 12);

/* ---------- Musiques (mélodies originales) ---------- */
const TRACKS = {
  // Farmwest : thèmes western (harmonica sur guitare au galop, gamme mixolydienne avec la 7e mineure)
  title: { bpm: 92, steps: 32, roots: [0, 5, -2, 0], inst: 'harmonica', gallop: true,
    mel: [12, null, 16, 19, 22, null, 19, null, 17, null, 16, null, 14, 12, null, null, 10, null, 12, 14, 17, null, 14, 12, 12, null, null, 10, 12, null, null, null] },
  day: { bpm: 112, steps: 32, roots: [0, -2, 5, 0], inst: 'twang', gallop: true,
    mel: [7, null, 12, null, 12, 14, 16, null, 14, null, 12, 10, 12, null, null, null, 7, null, 12, null, 16, 17, 19, null, 17, 16, 14, null, 12, null, null, null] },
  winter: { bpm: 84, steps: 32, roots: [0, -3, 5, 7], inst: 'bell',
    mel: [24, null, null, 19, 21, null, 19, null, 16, null, null, null, 14, null, 16, null, 19, null, null, 16, 14, null, 12, null, 14, null, null, null, null, null, null, null] },
  night: { bpm: 66, steps: 32, roots: [-3, 5, 0, 7], inst: 'bell', minor: true,
    mel: [21, null, 16, null, 19, null, null, null, 17, null, 12, null, 16, null, null, null, 16, null, 12, null, 14, null, null, 16, 19, null, null, null, null, null, null, null] },
  rain: { bpm: 74, steps: 32, roots: [2, 7, 0, -3], inst: 'epiano', minor: true,
    mel: [null, null, 17, null, 16, null, 14, null, 12, null, null, null, null, null, null, null, null, null, 19, null, 17, null, 16, null, 14, null, null, null, null, null, null, null] }
};

export function createAudio(g, storage) {
  const settings = loadSettings(storage);
  let screen = null;
  let ac = null, master, musicBus, sfxBus, reverb, noiseBuf, sched = null;
  let step = 0, nextT = 0, current = null, ambience = null;
  const trackGains = {};

  function noise(sec) {
    const b = ac.createBuffer(1, ac.sampleRate * sec, ac.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  function impulse(sec, decay) {
    const b = ac.createBuffer(2, ac.sampleRate * sec, ac.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, decay); }
    return b;
  }

  function start() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain(); master.connect(ac.destination);
    musicBus = ac.createGain(); sfxBus = ac.createGain();
    reverb = ac.createConvolver(); reverb.buffer = impulse(2.6, 3);
    const wet = ac.createGain(); wet.gain.value = 0.35; reverb.connect(wet); wet.connect(master);
    musicBus.connect(master); musicBus.connect(reverb); sfxBus.connect(master);
    noiseBuf = noise(2);
    apply();
    nextT = ac.currentTime + 0.1;
    sched = setInterval(tick, 90);
  }

  function apply() {
    if (!ac) return;
    musicBus.gain.setTargetAtTime(effective(settings, 'music') * 0.55, ac.currentTime, 0.05);
    sfxBus.gain.setTargetAtTime(effective(settings, 'sfx'), ac.currentTime, 0.05);
  }

  /* ---------- Instruments ---------- */
  function env(t, a, peak, dec, dest) {
    const gn = ac.createGain();
    gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(peak, t + a); gn.gain.exponentialRampToValueAtTime(0.0001, t + a + dec);
    gn.connect(dest); return gn;
  }
  function osc(type, f, t, dur, gn, f2) {
    const o = ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    o.connect(gn); o.start(t); o.stop(t + dur + 0.05); return o;
  }
  const inst = {
    pluck(t, f, v, dest) { osc('triangle', f, t, 0.5, env(t, 0.005, 0.22 * v, 0.45, dest)); osc('sine', f * 2, t, 0.25, env(t, 0.005, 0.05 * v, 0.2, dest)); },
    bell(t, f, v, dest) { osc('sine', f, t, 1.6, env(t, 0.004, 0.18 * v, 1.5, dest)); osc('sine', f * 3.01, t, 0.6, env(t, 0.002, 0.05 * v, 0.5, dest)); },
    epiano(t, f, v, dest) {
      const gn = env(t, 0.01, 0.16 * v, 1.2, dest), trem = ac.createGain(), lfo = ac.createOscillator(), d = ac.createGain();
      lfo.frequency.value = 5; d.gain.value = 0.3; lfo.connect(d); d.connect(trem.gain); trem.gain.value = 0.7; trem.connect(gn);
      osc('sine', f, t, 1.3, trem); osc('sine', f * 2, t, 0.4, env(t, 0.005, 0.03 * v, 0.3, dest)); lfo.start(t); lfo.stop(t + 1.4);
    },
    pad(t, freqs, dur, v, dest) {
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.connect(dest);
      const gn = ac.createGain(); gn.connect(lp);
      gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(0.05 * v, t + dur * 0.35); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      for (const f of freqs) { osc('sawtooth', f, t, dur, gn); osc('sawtooth', f * 1.005, t, dur, gn); }
    },
    // guitare « twang » : corde pincée brillante qui se pose en glissant légèrement
    twang(t, f, v, dest) { const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(3200, t); lp.frequency.exponentialRampToValueAtTime(700, t + 0.35); lp.connect(dest);
      osc('sawtooth', f * 1.02, t, 0.45, env(t, 0.003, 0.09 * v, 0.42, lp), f); osc('triangle', f / 2, t, 0.3, env(t, 0.003, 0.06 * v, 0.28, dest)); },
    // harmonica : souffle carré doux avec vibrato
    harmonica(t, f, v, dest) { const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800; lp.connect(dest);
      const o = osc('square', f, t, 0.55, env(t, 0.06, 0.05 * v, 0.5, lp)); const l = ac.createOscillator(), d = ac.createGain(); l.frequency.value = 5.5; d.gain.value = f * 0.012; l.connect(d); d.connect(o.frequency); l.start(t); l.stop(t + 0.6);
      burst(t, 0.3, 'bandpass', f * 2, 0.015 * v, 2); },
    bass(t, f, v, dest) { osc('sine', f, t, 0.5, env(t, 0.01, 0.22 * v, 0.45, dest)); }
  };

  /* ---------- Séquenceur ---------- */
  function trackGain(name) {
    if (!trackGains[name]) { const gn = ac.createGain(); gn.gain.value = 0.0001; gn.connect(musicBus); trackGains[name] = gn; }
    return trackGains[name];
  }
  function switchTrack(name) {
    if (name === current) return;
    const t = ac.currentTime;
    if (current) trackGains[current].gain.setTargetAtTime(0.0001, t, 0.8);
    trackGain(name).gain.setTargetAtTime(1, t, 0.8);
    current = name; step = 0;
  }
  function playStep(name, i, t) {
    const tr = TRACKS[name], out = trackGains[name], bar = Math.floor(i / 8) % 4, root = tr.roots[bar];
    const third = tr.minor && (root === -3 || root === 2) ? 3 : 4;
    if (i % 8 === 0) inst.pad(t, [hz(root - 12), hz(root - 12 + third), hz(root - 5)], (60 / tr.bpm) * 4.2, 1, out);
    if (i % 4 === 0) inst.bass(t, hz(root - 24), name === 'night' ? 0.6 : 1, out);
    const m = tr.mel[i % tr.steps];
    if (m != null) inst[tr.inst](t, hz(m), 1, out);
    if (tr.gallop) { if (i % 4 === 2) inst.bass(t, hz(root - 17), 0.7, out); if (i % 2 === 1) inst.pluck(t, hz(root + [0, third, 7][(i >> 1) % 3]), 0.25, out); }   // rythme au galop (« boum-tchic »)
    else if ((name === 'day' || name === 'title') && i % 2 === 1 && i % 8 !== 7) inst.pluck(t, hz(root + 12 + [0, third, 7][(i >> 1) % 3]), 0.35, out);
  }
  function tick() {
    if (!ac || ac.state !== 'running') return;
    switchTrack(pickTrack(g.S, screen));
    setAmbience(pickAmbience(g.S, screen));
    const tr = TRACKS[current], dt = 60 / tr.bpm / 2;
    while (nextT < ac.currentTime + 0.25) {
      if (effective(settings, 'music') > 0) playStep(current, step, nextT);
      step = (step + 1) % (tr.steps * 2); nextT += dt;
    }
    if (ambience === 'crickets' && Math.random() < 0.18) cricket();
  }

  /* ---------- Ambiances ---------- */
  let rainNode = null;
  function setAmbience(name) {
    if (name === ambience) return;
    ambience = name;
    if (rainNode) { const n = rainNode; n.g.gain.setTargetAtTime(0.0001, ac.currentTime, 0.6); setTimeout(() => n.src.stop(), 3000); rainNode = null; }
    if (name === 'rain') {
      const src = ac.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400;
      const gn = ac.createGain(); gn.gain.value = 0.0001; gn.gain.setTargetAtTime(g.S.weather === 'storm' ? 0.22 : 0.13, ac.currentTime, 0.8);
      src.connect(lp); lp.connect(gn); gn.connect(sfxBus); src.start();
      rainNode = { src, g: gn };
    }
  }
  function cricket() {
    const t = ac.currentTime + Math.random() * 0.2, f = 4200 + Math.random() * 600;
    for (let k = 0; k < 3; k++) osc('sine', f, t + k * 0.05, 0.03, env(t + k * 0.05, 0.003, 0.012, 0.03, sfxBus));
  }

  /* ---------- Bruitages ---------- */
  function burst(t, dur, type, freq, peak, q = 1) {
    const src = ac.createBufferSource(); src.buffer = noiseBuf;
    const f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    src.connect(f); f.connect(env(t, 0.003, peak, dur, sfxBus)); src.start(t, Math.random()); src.stop(t + dur + 0.05);
  }
  const blip = (t, type, f, dur, peak, f2) => osc(type, f, t, dur, env(t, 0.003, peak, dur, sfxBus), f2);
  const SFX = {
    step: t => burst(t, 0.05, 'lowpass', 500 + Math.random() * 200, 0.08),
    chop: t => { burst(t, 0.12, 'bandpass', 900, 0.5, 2); blip(t, 'sine', 140, 0.12, 0.35, 60); },
    pick: t => { blip(t, 'square', 1400, 0.08, 0.12, 900); burst(t, 0.1, 'highpass', 2500, 0.25); },
    break: t => { burst(t, 0.35, 'lowpass', 700, 0.5); blip(t, 'sine', 110, 0.3, 0.3, 45); },
    plant: t => blip(t, 'sine', 520, 0.08, 0.25, 300),
    harvest: t => { blip(t, 'triangle', hz(24), 0.12, 0.22); blip(t + 0.07, 'triangle', hz(28), 0.16, 0.22); blip(t + 0.14, 'sine', hz(36), 0.25, 0.1); },
    coin: t => { blip(t, 'square', 988, 0.08, 0.12); blip(t + 0.08, 'square', 1319, 0.3, 0.12); },
    buy: t => { blip(t, 'square', 784, 0.07, 0.1); blip(t + 0.07, 'square', 1047, 0.2, 0.1); },
    craft: t => { for (let k = 0; k < 3; k++) burst(t + k * 0.09, 0.05, 'bandpass', 2200, 0.35, 4); blip(t + 0.3, 'sine', hz(31), 0.6, 0.15); },
    feed: t => { for (let k = 0; k < 3; k++) burst(t + k * 0.1, 0.06, 'bandpass', 1500, 0.25, 3); },
    woof: t => { blip(t, 'sawtooth', 300, 0.09, 0.12, 180); burst(t, 0.08, 'bandpass', 600, 0.25, 2); blip(t + 0.14, 'sawtooth', 320, 0.08, 0.1, 190); },
    cluck: t => { blip(t, 'square', 720, 0.06, 0.08, 520); blip(t + 0.09, 'square', 820, 0.08, 0.08, 560); },
    getWood: t => { blip(t, 'triangle', 330, 0.07, 0.22, 220); burst(t, 0.05, 'bandpass', 700, 0.2, 3); blip(t + 0.06, 'triangle', 440, 0.08, 0.15, 300); },   // toc boisé
    getStone: t => { blip(t, 'square', 900, 0.03, 0.08, 600); burst(t, 0.06, 'highpass', 3000, 0.18); blip(t + 0.05, 'square', 700, 0.04, 0.06, 500); },   // cliquetis de cailloux
    getOre: t => { blip(t, 'sine', hz(36), 0.35, 0.14); blip(t + 0.04, 'sine', hz(43), 0.4, 0.08); blip(t, 'triangle', hz(48), 0.15, 0.05); },   // tintement métallique
    getFood: t => { blip(t, 'sine', 500, 0.06, 0.15, 900); blip(t + 0.07, 'sine', 700, 0.08, 0.12, 1100); },   // petit « pop » juteux
    collect: t => { blip(t, 'sine', hz(31), 0.4, 0.18); blip(t + 0.08, 'sine', hz(36), 0.5, 0.15); },
    hit: t => { burst(t, 0.12, 'highpass', 1200, 0.3); blip(t, 'sine', 220, 0.15, 0.4, 70); },
    hurt: t => blip(t, 'sawtooth', 320, 0.22, 0.15, 110),
    denied: t => { blip(t, 'square', 220, 0.08, 0.08); blip(t + 0.1, 'square', 165, 0.14, 0.08); },
    ui: t => blip(t, 'sine', 1200, 0.04, 0.08),
    save: t => [0, 4, 7, 12].forEach((s, k) => blip(t + k * 0.07, 'sine', hz(24 + s), 0.6, 0.12)),
    sleep: t => [12, 7, 4, 0].forEach((s, k) => blip(t + k * 0.18, 'sine', hz(12 + s), 0.9, 0.1)),
    squeak: t => { blip(t, 'sine', 1800, 0.06, 0.08, 2400); blip(t + 0.08, 'sine', 2000, 0.05, 0.06, 2600); },
    baa: t => { const o = blip(t, 'sawtooth', 220, 0.5, 0.07, 190); const l = ac.createOscillator(), d = ac.createGain(); l.frequency.value = 9; d.gain.value = 12; l.connect(d); d.connect(o.frequency); l.start(t); l.stop(t + 0.55); },
    voiceChef: t => [0, -3, 2].forEach((s2, k) => blip(t + k * 0.08, 'square', hz(5 + s2 + (Math.random() * 2 | 0)), 0.08, 0.05)),
    voiceFranck: t => [0, -2].forEach((s2, k) => blip(t + k * 0.11, 'sine', hz(7 + s2 + (Math.random() * 2 | 0)), 0.1, 0.05)),
    voiceLuna: t => [0, 4, 2].forEach((s2, k) => blip(t + k * 0.06, 'triangle', hz(19 + s2 + (Math.random() * 3 | 0)), 0.07, 0.07)),
    oink: t => { burst(t, 0.12, 'bandpass', 380, 0.35, 3); burst(t + 0.16, 0.1, 'bandpass', 420, 0.3, 3); blip(t, 'sawtooth', 140, 0.12, 0.05, 110); },
    meow: t => { blip(t, 'triangle', 520, 0.12, 0.12, 820); blip(t + 0.12, 'triangle', 820, 0.3, 0.1, 420); },
    levelup: t => [0, 4, 7, 12, 16, 19].forEach((s, k) => blip(t + k * 0.07, 'square', hz(24 + s), 0.25, 0.06)),
    whistle: t => { for (const [k, f] of [[0, 740], [0, 932], [0, 1109]]) { const o = blip(t + k, 'square', f, 1.1, 0.035); } burst(t, 1.1, 'bandpass', 1500, 0.08, 1); },   // sifflet de locomotive (accord)
    spurs: t => { for (let k = 0; k < 3; k++) blip(t + k * 0.05, 'sine', 3200 + k * 260, 0.08, 0.03); },   // éperons qui tintent
    saloon: t => { blip(t, 'sawtooth', 180, 0.25, 0.04, 120); blip(t + 0.18, 'sawtooth', 160, 0.2, 0.03, 110); burst(t + 0.3, 0.08, 'lowpass', 500, 0.2); },   // portes battantes du saloon
    door: t => { burst(t, 0.18, 'lowpass', 400, 0.3); blip(t + 0.05, 'sine', 90, 0.15, 0.25, 60); },
    stars: t => [24, 28, 31, 36, 40, 43, 48, 52].forEach((s, k) => { blip(t + k * 0.06, 'sine', hz(s), 0.7, 0.09); blip(t + k * 0.06 + 0.03, 'triangle', hz(s + 12), 0.3, 0.03); }),
    day: t => [0, 4, 7, 11, 14].forEach((s, k) => blip(t + k * 0.09, 'triangle', hz(12 + s), 0.5, 0.1))
  };

  function play(name) {
    if (!ac || ac.state !== 'running' || !SFX[name] || effective(settings, 'sfx') === 0) return;
    SFX[name](ac.currentTime + 0.01);
  }

  // Navigateur fermé, onglet caché ou page quittée : on coupe le son (sinon la musique continue).
  const pause = () => { if (ac && ac.state === 'running') ac.suspend(); };
  const resume = () => { if (ac && ac.state === 'suspended' && !document.hidden) ac.resume(); };
  document.addEventListener('visibilitychange', () => document.hidden ? pause() : resume());
  addEventListener('pagehide', () => { pause(); try { ac && ac.close(); ac = null; clearInterval(sched); } catch { /* rien */ } });
  addEventListener('blur', () => { if (document.hidden) pause(); });
  // Premier geste = démarrage
  const unlock = () => start();
  addEventListener('pointerdown', unlock); addEventListener('keydown', unlock);
  g.bus.on('sfx', play);

  return {
    play, settings,
    setScreen(s) { screen = s; },
    update(fn) { fn(settings); saveSettings(storage, settings); apply(); },
    get started() { return !!ac; }
  };
}
