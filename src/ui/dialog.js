// Bulle de dialogue en bas de l'écran (charte Witch'rok) : nom coloré en police de titre,
// texte lisible, ▸ qui clignote s'il y a une suite. Clic / Espace / Entrée = suite ; Échap = fermer.
// Une question affiche ses réponses en boutons (touches 1, 2, 3) : il faut répondre.
import { $ } from './dom.js';
import { ADMIN } from '../systems/admin.js';

export function createDialog(g, audio) {
  const box = $('#dlg'), nameEl = $('#dlgName'), textEl = $('#dlgText'), choicesEl = $('#dlgChoices');
  let queue = [], cur = null, ends = [], swallowUntil = 0, shownAt = 0;
  function show() {
    if (!queue.length) { box.classList.remove('on'); cur = null; g.talking = false; const e = ends; ends = []; e.forEach(f => f()); return; }
    g.talking = true;
    cur = queue.shift(); shownAt = performance.now();
    nameEl.textContent = cur.name + (cur.title ? ` · ${cur.title}` : ''); nameEl.style.color = cur.color || 'var(--or-vif)';
    textEl.textContent = cur.line;
    choicesEl.innerHTML = cur.choices ? cur.choices.map((c, i) => `<button data-c="${i}">${c}</button>`).join('') : '';
    $('#dlgNext').style.display = cur.choices || !queue.length ? 'none' : '';   // ▸ seulement s'il y a une suite (comme Witch'rok)
    box.classList.remove('on'); void box.offsetWidth; box.classList.add('on');
    if (cur.voice) audio.play(cur.voice);
  }
  g.bus.on('say', ({ name, title, color, voice, lines, choices, onChoose, onEnd }) => {
    const wasOpen = !!cur;
    if (onEnd) ends.push(onEnd); // appelé quand la discussion se ferme (fin, « Passer » ou Échap)
    lines.forEach((line, k) => queue.push({ name, title, color, voice, line, ...(k === lines.length - 1 && choices ? { choices, onChoose } : {}) }));
    if (!wasOpen) show();
  });
  const next = () => { audio.play('ui'); show(); };
  const close = () => { queue = []; show(); };
  function pick(i) { const c = cur; audio.play('ui'); show(); c.onChoose(i); }
  box.addEventListener('pointerup', e => {
    const b = e.target.closest('[data-c]');
    if (b) return pick(+b.dataset.c);
    if (cur && cur.choices) return; // il faut répondre
    swallowUntil = performance.now() + 450;   // le clic qui ferme la bulle ne doit rien déclencher derrière (inventaire…)
    if (ADMIN.on) close(); else next();
  });
  addEventListener('click', e => { if (performance.now() < swallowUntil && !box.contains(e.target)) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
  addEventListener('keydown', e => {
    if (!cur) return;
    if (cur.choices) { const i = +e.key - 1; if (i >= 0 && i < cur.choices.length) { e.preventDefault(); e.stopImmediatePropagation(); pick(i); } else if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); } return; }
    if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); close(); }
    else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopImmediatePropagation(); ADMIN.on ? close() : next(); }
  }, true);
  return {
    get isOpen() { return !!cur; },
    // accélérer (intro) : une réplique sans choix passe toute seule après un court instant
    fastTick() { if (cur && !cur.choices && performance.now() - shownAt > 220) show(); },
    // passer l'intro : on vide la bulle sans déclencher les suites prévues
    reset() { queue = []; ends = []; cur = null; box.classList.remove('on'); g.talking = false; }
  };
}
