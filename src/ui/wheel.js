// Roues de sélection : outils (avec palier) et objets du sac (places vides visibles).
// Aperçu sans sélectionner : survol à la souris, ou glisser le doigt sur la roue.
// Au toucher : 1er appui = nom de l'objet, 2e appui sur le même = le prendre en main.
import { $ } from './dom.js';
import { ITEMS, TOOLS } from '../data/items.js';
import { TIER_NAMES } from '../data/tools.js';
import { slots, usedSlots } from '../systems/inventory.js';
import { toolTier } from '../systems/skills.js';
import { iconHTML } from './icons.js';

const PER_RING = 10;

export function createWheel(g, audio) {
  const ov = $('#ovWheel'), ring = $('#wheelRing'), center = $('#wheelCenter');
  let kind = null, openedAt = 0, list = [], preview = -1, touch = false;

  function entries() {
    const S = g.S;
    if (kind === 'tools') return TOOLS.map(t => ({ id: t.id, n: t.n, sub: t.id === 'hand' ? 'Interagir, récolter, caresser' : 'Palier ' + TIER_NAMES[toolTier(S, t.id)], tier: t.id === 'hand' ? 0 : toolTier(S, t.id) }));
    const out = Object.keys(S.inv).map(id => ({ id, n: ITEMS[id] ? ITEMS[id].n : id, c: S.inv[id], sub: ITEMS[id] ? `×${S.inv[id]} · ${ITEMS[id].p} 🪙/u` : '' }));
    while (out.length < slots(S)) out.push(null);
    return out;
  }
  const defaultLabel = () => `<strong>${kind === 'tools' ? 'Outils' : `Sac ${usedSlots(g.S)}/${slots(g.S)}`}</strong><small>${touch ? 'Touchez un objet pour voir son nom' : 'Survolez pour voir, cliquez pour prendre'}</small>`;
  function showName(idx) {
    preview = idx;
    ring.querySelectorAll('.wslot').forEach((b, i) => b.classList.toggle('apercu', i === idx));
    const e = list[idx];
    center.innerHTML = e ? `<strong>${e.n}</strong><small>${e.sub || ''}</small>${touch ? '<em>Touchez encore pour prendre</em>' : ''}` : defaultLabel();
  }
  function choose(idx) {
    const e = list[idx]; if (!e) return;
    g.S.sel = e.id; g.bus.emit('inv'); audio.play('ui'); close();
  }

  function render() {
    list = entries(); preview = -1;
    const S = g.S, vmin = Math.min(innerWidth, innerHeight);
    const rings = Math.ceil(list.length / PER_RING);
    const slot = Math.max(40, Math.min(64, vmin * (rings > 2 ? .11 : .14)));
    const R0 = Math.max(slot * 1.45, vmin * .2), gap = slot * 1.15;
    ring.style.setProperty('--slot', slot + 'px');
    ring.innerHTML = '';
    list.forEach((e, idx) => {
      const r = Math.floor(idx / PER_RING), inRing = Math.min(PER_RING, list.length - r * PER_RING), k = idx % PER_RING;
      const a = -Math.PI / 2 + (k / inRing) * Math.PI * 2 + (r % 2 ? Math.PI / inRing : 0), R = R0 + r * gap;
      const b = document.createElement('button');
      b.className = 'wslot' + (e && S.sel === e.id ? ' sel' : '') + (e ? '' : ' vide');
      b.dataset.idx = idx;
      b.style.left = Math.cos(a) * R + 'px'; b.style.top = Math.sin(a) * R + 'px';
      b.style.animationDelay = (idx * 12) + 'ms';
      if (e) {
        b.innerHTML = `<span>${iconHTML(e.id)}</span>${e.c ? `<b>${e.c}</b>` : ''}${e.tier > 1 ? `<i class="tier t${e.tier}"></i>` : ''}`;
        b.setAttribute('aria-label', e.n);
      } else b.disabled = true;
      ring.appendChild(b);
    });
    center.innerHTML = defaultLabel();
  }

  const slotAt = (x, y) => { const el = document.elementFromPoint(x, y); const b = el && el.closest('.wslot'); return b && !b.disabled ? +b.dataset.idx : -1; };
  let downIdx = -1, slid = false;
  ov.addEventListener('pointerdown', e => {
    touch = e.pointerType !== 'mouse';
    downIdx = slotAt(e.clientX, e.clientY); slid = false;
    if (touch && downIdx >= 0 && downIdx !== preview) showName(downIdx);
  });
  ov.addEventListener('pointermove', e => {
    if (e.pointerType === 'mouse') { const i = slotAt(e.clientX, e.clientY); if (i !== preview) i >= 0 ? showName(i) : (preview = -1, center.innerHTML = defaultLabel(), ring.querySelectorAll('.apercu').forEach(b => b.classList.remove('apercu'))); return; }
    if (e.buttons || e.pressure > 0) { const i = slotAt(e.clientX, e.clientY); if (i >= 0 && i !== preview) { slid = true; showName(i); } }
  });
  ov.addEventListener('pointerup', e => {
    if (performance.now() - openedAt < 300) return;
    const i = slotAt(e.clientX, e.clientY);
    if (i < 0) { if (!e.target.closest('#wheelCenter')) close(); return; }
    if (e.pointerType === 'mouse') return choose(i);
    // au toucher : on ne prend l'objet qu'au 2e appui sur le même emplacement
    if (!slid && i === downIdx && i === preview && ov.dataset.armed === String(i)) return choose(i);
    ov.dataset.armed = String(i);
  });

  function close() { ov.classList.remove('on'); kind = null; preview = -1; delete ov.dataset.armed; }
  return {
    open(k) { if (kind === k) return close(); kind = k; openedAt = performance.now(); delete ov.dataset.armed; render(); ov.classList.add('on'); audio.play('ui'); },
    close, get isOpen() { return !!kind; }
  };
}
