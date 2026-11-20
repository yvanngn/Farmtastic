// Lot 30a : écran de combat au tour par tour (fond de la zone, héros à gauche, monstres à droite, menu en bas).
import { heroAct, closeBattle, TECHS, foodIds } from '../systems/battle.js';
import { ITEMS } from '../data/items.js';
import { MOBS } from '../data/wild.js';
import { drawChar } from '../render/sprites.js';
import { drawMob } from '../render/wild.js';
import { iconHTML } from './icons.js';

const BG = { wild: ['#2a2430', '#3a3240', '#4a4050'], carriere: ['#8a8070', '#b8ac96', '#a09482'], dedale: ['#7a3a2a', '#c47a4e', '#a8603a'] };
export function createBattleUI(g, audio) {
  const ov = document.createElement('div'); ov.id = 'ovBattle'; ov.className = 'overlay';
  ov.innerHTML = `<div class="panel box battle"><canvas id="btCv" width="320" height="150"></canvas>
    <div id="btFoes" class="bt-foes"></div><div id="btLog" class="bt-log"></div>
    <div class="bt-hero"><b id="btName"></b><div class="bt-bar vie"><i id="btHp"></i><span id="btHpT"></span></div><div class="bt-bar nrj"><i id="btEn"></i><span id="btEnT"></span></div><div class="bt-bar atb"><i id="btAtb"></i></div></div>
    <div id="btMenu" class="bt-menu"></div></div>`;
  document.body.appendChild(ov);
  const cv = ov.querySelector('#btCv'), ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false;
  let sub = null, pend = null, raf = 0;   // sous-menu ouvert ; action qui attend sa cible
  const $ = s => ov.querySelector(s);
  function menu() {
    const B = g.battle, M = $('#btMenu');
    if (!B) return;
    if (B.over) { M.innerHTML = `<button class="primaire" data-k="close">${B.over === 'win' ? '🏆 Continuer' : B.over === 'fled' ? '💨 Continuer' : '🏥 Continuer'}</button>`; return; }
    if (!B.turn) { M.innerHTML = '<p class="info">⏳ Ta jauge se remplit…</p>'; return; }
    const alive = B.foes.filter(f => f.hp > 0);
    if (pend) { M.innerHTML = '<p class="info">Quel ennemi ?</p>' + alive.map((f, i) => `<button data-k="target" data-v="${i}">${f.n} (${f.hp})</button>`).join('') + '<button data-k="back">◀</button>'; return; }
    if (sub === 'tech') { M.innerHTML = Object.entries(TECHS).map(([id, T]) => `<button data-k="tech" data-v="${id}" ${g.S.energy < T.e ? 'disabled' : ''} title="${T.txt}">${T.i} ${T.n} <small>${T.e} ⚡</small></button>`).join('') + '<button data-k="back">◀</button>'; return; }
    if (sub === 'item') { const ids = foodIds(g.S); M.innerHTML = (ids.length ? ids.map(id => `<button data-k="item" data-v="${id}">${iconHTML(id)} ${ITEMS[id].n} ×${g.S.inv[id]}</button>`).join('') : '<p class="info">Rien à manger dans le sac.</p>') + '<button data-k="back">◀</button>'; return; }
    M.innerHTML = '<button data-k="attack">⚔️ Attaquer</button><button data-k="sub" data-v="tech">💥 Techniques</button><button data-k="sub" data-v="item">🍞 Objets</button><button data-k="defend">🛡️ Se défendre</button><button data-k="flee">💨 Fuir</button>';
  }
  const act = a => { const B = g.battle, n = B.foes.filter(f => f.hp > 0).length; if ((a.act === 'attack' || (a.act === 'tech' && !TECHS[a.tech].all)) && n > 1 && a.target == null) { pend = a; menu(); return; } pend = null; sub = null; heroAct(g, a); audio && audio.play && audio.play('ui'); menu(); };
  $('#btMenu').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.disabled) return; const k = b.dataset.k, v = b.dataset.v;
    if (k === 'close') { closeBattle(g); ov.classList.remove('on'); cancelAnimationFrame(raf); sub = pend = null; return; }
    if (k === 'back') { sub = pend = null; menu(); return; }
    if (k === 'sub') { sub = v; menu(); return; }
    if (k === 'target') { const a = { ...pend, target: +v }; pend = null; act(a); return; }
    if (k === 'attack' || k === 'defend' || k === 'flee') return act({ act: k });
    if (k === 'tech') return act({ act: 'tech', tech: v });
    if (k === 'item') return act({ act: 'item', item: v });
  });
  function draw(now) {
    const B = g.battle; if (!B) return;
    const c = BG[B.scene] || ['#5a7a3a', '#7aa04a', '#6a9040'];
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = c[0]; ctx.fillRect(0, 0, 320, 60); ctx.fillStyle = c[1]; ctx.fillRect(0, 60, 320, 90);
    for (let k = 0; k < 40; k++) { ctx.fillStyle = c[2]; ctx.fillRect((k * 53) % 320, 66 + (k * 29) % 80, 3, 2); }
    ctx.setTransform(2, 0, 0, 2, 0, 0);   // personnages ×2
    const hb = B.over === 'lose' ? 4 : 0;
    drawChar(ctx, 26, 36 + hb, g.S.look, 3, B.turn ? 0 : ((now / 200) | 0) % 4, now);
    const alive = B.foes; alive.forEach((f, i) => {
      if (f.hp <= 0) return;
      const x = 6.6 + (i % 2) * 1.6, y = 3.3 + i * 0.95, hit = f.hurt > 0;
      if (f.hurt > 0) f.hurt -= .05; if (f.anim > 0) f.anim -= .05;
      drawMob(ctx, { type: f.type, x: x - (f.anim > 0 ? .4 : 0), y, hit }, now);
    });
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // HUD
    const S = g.S; $('#btName').textContent = S.name;
    $('#btHp').style.width = (100 * S.hp / S.maxHp) + '%'; $('#btHpT').textContent = `❤️ ${Math.round(S.hp)} / ${S.maxHp}`;
    $('#btEn').style.width = (100 * S.energy / S.maxE) + '%'; $('#btEnT').textContent = `⚡ ${Math.round(S.energy)}`;
    $('#btAtb').style.width = (100 * B.hero.atb) + '%'; $('#btAtb').parentElement.classList.toggle('pleine', B.turn);
    $('#btFoes').innerHTML = B.foes.map(f => `<div class="bt-foe${f.hp <= 0 ? ' ko' : ''}"><span>${f.n}</span><div class="bt-bar vie"><i style="width:${100 * f.hp / f.max}%"></i></div><div class="bt-bar atb"><i style="width:${100 * Math.min(1, f.atb)}%"></i></div></div>`).join('');
    $('#btLog').innerHTML = B.log.map(t => `<div>${t}</div>`).join('');
    raf = requestAnimationFrame(draw);
  }
  g.bus.on('battle', what => {
    if (what === 'start') { sub = pend = null; ov.classList.add('on'); menu(); cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); }
    else if (what === 'turn' || what === 'win' || what === 'lose' || what === 'fled') menu();
  });
  return { isOpen: () => ov.classList.contains('on') };
}
