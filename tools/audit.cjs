// 20/11 : test de l'appli dans un vrai navigateur : nouvelle partie, intro complète, chaque zone, chaque fenêtre ;
// relève les erreurs JavaScript et fait une capture par écran (dans /tmp/farmwest-audit).
// Lancer : python3 -m http.server 8080 (dans le dossier du jeu), puis node tools/audit.cjs
const { chromium } = require('playwright'); const fs = require('fs'); const OUT = process.env.OUT || '/tmp/farmwest-audit';
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1000, height: 600 } }); const q = await ctx.newPage();
  const errs = []; q.on('pageerror', e => errs.push('PAGEERR ' + e.message)); q.on('console', m => { if (m.type() === 'error' && !/ERR_TUNNEL|Failed to load resource/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await q.goto('http://localhost:8080/play.html'); await q.waitForTimeout(1500); await q.mouse.click(450, 300); await q.waitForTimeout(800);
  await q.click('[data-id="new"]'); await q.waitForTimeout(600); await q.click('text=Partie solo'); await q.waitForTimeout(800);
  await q.click('text=Commencer ▶'); await q.waitForTimeout(1200);
  // intro complète (on touche l'écran)
  const tI = Date.now(); for (let i = 0; i < 300; i++) { const st = await q.evaluate(() => window.Engine.game.S.intro.step); if (st === 'done') break; await q.mouse.click(500, 300); await q.waitForTimeout(500); }
  console.log('durée intro (s)', Math.round((Date.now() - tI) / 1000)); console.log('intro', await q.evaluate(() => JSON.stringify({ step: window.Engine.game.S.intro.step, scene: window.Engine.game.S.scene, x: window.Engine.game.S.x, y: window.Engine.game.S.y })));
  // marcher un peu avec le clavier
  await q.keyboard.down('ArrowUp'); await q.waitForTimeout(1200); await q.keyboard.up('ArrowUp');
  console.log('après marche', await q.evaluate(() => { const S = window.Engine.game.S; return S.x.toFixed(1) + ',' + S.y.toFixed(1); }));
  // chaque zone
  const scenes = await q.evaluate(() => Object.keys(window.Engine.SCENES || {}));
  console.log('scenes exposées', scenes.length);
  const list = ['farm','place','rondpoint','route_ville','town','gare','golgolas','route_plage','plage','port','quartier','ranch','parc','route','montagne','carriere','carriere2','foret','farm:1','farm:2','farm:3','house','grange','resto','bar','shop_upgrades','shop_carpenter','shop_market','luna','myst','clinique','wild'];
  fs.mkdirSync(OUT, { recursive: true });
  for (const sc of list) {
    const ok = await q.evaluate(sc => { const g = window.Engine.game, S = g.S; try { const D = (window.__SC = window.__SC || null); const DROP = { farm: [16.5, 30], place: [13, 12], rondpoint: [5, 9], route_ville: [20, 5], town: [16.5, 10.5], gare: [10, 9], golgolas: [15, 10], route_plage: [5, 20], plage: [20, 5], port: [5, 10], quartier: [20, 10], ranch: [16, 9], parc: [5, 9.5], route: [30, 6], montagne: [5, 8.6], carriere: [16, 15], carriere2: [13, 13], foret: [2, 9.5], 'farm:1': [16, 10], 'farm:2': [16, 10], 'farm:3': [16, 10] }[sc] || [5, 5]; S.x = DROP[0]; S.y = DROP[1]; S.scene = sc; const W = { farm: [16.5, 20] }[sc]; g.bus.emit('scene', sc); return 'ok'; } catch (e) { return e.message; } }, sc);
    await q.evaluate(sc => { const g = window.Engine.game, S = g.S; const d = (g.scenesDoors && g.scenesDoors(sc)) || null; }, sc);
    await q.evaluate(() => document.querySelectorAll('.overlay.on').forEach(o => o.classList.remove('on'))); await q.waitForTimeout(500); await q.screenshot({ path: `${OUT}/${sc.replace(':', '_')}.png` });
  }
  // panneaux
  for (const p of ['stand', 'calendar', 'pot', 'settings', 'board', 'upgrades', 'carpenter', 'market']) { await q.evaluate(p => { const g = window.Engine.game; if (p === 'pot') g.potOpen = { x: 0, y: 0, cook: null }; g.bus.emit('open', p); }, p); await q.waitForTimeout(400); await q.screenshot({ path: `${OUT}/panel_${p}.png` }); await q.keyboard.press('Escape'); await q.evaluate(() => document.querySelectorAll('.overlay.on').forEach(o => o.classList.remove('on'))); }
  for (const t of ['sac', 'equip', 'forge', 'recettes', 'social']) { await q.evaluate(t => window.Engine.game.bus.emit('open', t), t); await q.waitForTimeout(300); await q.screenshot({ path: `${OUT}/menu_${t}.png` }); await q.evaluate(() => document.querySelectorAll('.overlay.on').forEach(o => o.classList.remove('on'))); }
  await q.evaluate(() => window.Engine.game.bus.emit('showMap')); await q.waitForTimeout(600); await q.screenshot({ path: OUT + '/map.png' });
  console.log('ERREURS', errs.length); errs.slice(0, 30).forEach(e => console.log(e));
  await b.close(); })();
