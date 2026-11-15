// Bulle de dialogue en bas de l'écran (charte Witch'rok) : nom coloré en police de titre,
// texte lisible, ▸ qui clignote. Clic / Espace / Entrée = suite ; Échap ou « Passer » = fermer.
import { $ } from './dom.js';

export function createDialog(g, audio) {
  const box = $('#dlg'), nameEl = $('#dlgName'), textEl = $('#dlgText');
  let queue = [], cur = null;
  function show() {
    if (!queue.length) { box.classList.remove('on'); cur = null; g.talking = false; return; }
    g.talking = true;
    cur = queue.shift();
    nameEl.textContent = cur.name; nameEl.style.color = cur.color || 'var(--or-vif)';
    textEl.textContent = cur.line;
    box.classList.remove('on'); void box.offsetWidth; box.classList.add('on');
    if (cur.voice) audio.play(cur.voice);
  }
  g.bus.on('say', ({ name, color, voice, lines }) => {
    const wasOpen = !!cur;
    for (const line of lines) queue.push({ name, color, voice, line });
    if (!wasOpen) show();
  });
  const next = () => { audio.play('ui'); show(); };
  const close = () => { queue = []; show(); };
  box.addEventListener('pointerup', e => { if (e.target.id === 'dlgSkip') close(); else next(); });
  addEventListener('keydown', e => {
    if (!cur) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); close(); }
    else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopImmediatePropagation(); next(); }
  }, true);
  return { get isOpen() { return !!cur; } };
}
