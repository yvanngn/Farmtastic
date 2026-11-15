// Bulle de dialogue en bas de l'écran (charte Witch'rok) : nom coloré en police de titre,
// texte lisible, ▸ qui clignote. Clic / Espace / Entrée = suite ; Échap ou « Passer » = fermer.
// Une question affiche ses réponses en boutons (touches 1, 2, 3) : il faut répondre.
import { $ } from './dom.js';

export function createDialog(g, audio) {
  const box = $('#dlg'), nameEl = $('#dlgName'), textEl = $('#dlgText'), choicesEl = $('#dlgChoices');
  let queue = [], cur = null;
  function show() {
    if (!queue.length) { box.classList.remove('on'); cur = null; g.talking = false; return; }
    g.talking = true;
    cur = queue.shift();
    nameEl.textContent = cur.name + (cur.title ? ` · ${cur.title}` : ''); nameEl.style.color = cur.color || 'var(--or-vif)';
    textEl.textContent = cur.line;
    choicesEl.innerHTML = cur.choices ? cur.choices.map((c, i) => `<button data-c="${i}">${c}</button>`).join('') : '';
    $('#dlgNext').style.display = cur.choices ? 'none' : '';
    box.classList.remove('on'); void box.offsetWidth; box.classList.add('on');
    if (cur.voice) audio.play(cur.voice);
  }
  g.bus.on('say', ({ name, title, color, voice, lines, choices, onChoose }) => {
    const wasOpen = !!cur;
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
    if (e.target.id === 'dlgSkip') close(); else next();
  });
  addEventListener('keydown', e => {
    if (!cur) return;
    if (cur.choices) { const i = +e.key - 1; if (i >= 0 && i < cur.choices.length) { e.preventDefault(); e.stopImmediatePropagation(); pick(i); } else if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); } return; }
    if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); close(); }
    else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopImmediatePropagation(); next(); }
  }, true);
  return { get isOpen() { return !!cur; } };
}
