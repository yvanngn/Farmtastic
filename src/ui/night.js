// Lot 8 : transition de la nuit quand on dort — l'énergie remonte sous nos yeux, le héros fait un rêve
// (ou une prémonition), puis la partie est sauvegardée automatiquement. Touchez pour passer.
export function createNight({ audio, save }) {
  const ov = document.createElement('div');
  ov.id = 'ovNight';
  ov.innerHTML = '<div class="nuit-ciel"></div><div class="nuit-box"><div class="nuit-lune">🌙</div><p class="nuit-reve"></p>'
    + '<div class="nuit-nrj"><span>⚡</span><div class="nuit-barre"><i></i></div><b></b></div><small class="nuit-save"></small></div>';
  document.body.appendChild(ov);
  const reve = ov.querySelector('.nuit-reve'), bar = ov.querySelector('.nuit-barre i'), val = ov.querySelector('.nuit-nrj b'), sv = ov.querySelector('.nuit-save');
  let timers = [], raf = 0, busy = false;
  const later = (ms, f) => timers.push(setTimeout(f, ms));
  function close() { timers.forEach(clearTimeout); timers = []; cancelAnimationFrame(raf); ov.classList.remove('on'); busy = false; }
  ov.addEventListener('pointerdown', () => { if (busy && ov.dataset.ready) { finish(); } });
  let finish = () => {};
  function show(n) {
    close(); busy = true; delete ov.dataset.ready;
    reve.textContent = ''; sv.textContent = ''; ov.classList.add('on');
    const t0 = performance.now(), D = 2600, pct = v => Math.round(100 * v / (n.max || 100));
    const step = now => {   // l'énergie remonte doucement
      const k = Math.min(1, (now - t0) / D), e = Math.round(n.from + (n.to - n.from) * (1 - (1 - k) ** 2));
      bar.style.width = pct(e) + '%'; val.textContent = e + ' / ' + n.max;
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    let i = 0; const txt = '« ' + n.dream + ' »';
    later(500, function type() { reve.textContent = txt.slice(0, ++i); if (i < txt.length) timers.push(setTimeout(type, 28)); });
    later(1200, () => { ov.dataset.ready = 1; });
    finish = async () => {
      if (!busy) return; timers.forEach(clearTimeout); timers = []; reve.textContent = txt;
      cancelAnimationFrame(raf); bar.style.width = pct(n.to) + '%'; val.textContent = n.to + ' / ' + n.max;
      sv.textContent = '💾 Sauvegarde…';
      try { await save(); sv.textContent = '✔ Partie sauvegardée'; } catch { sv.textContent = '⚠️ Sauvegarde impossible'; }
      audio && audio.play('save');
      setTimeout(close, 900);
    };
    later(Math.max(4200, 1800 + txt.length * 28 + 1200), () => finish());
  }
  return { show, isOpen: () => ov.classList.contains('on') };
}
