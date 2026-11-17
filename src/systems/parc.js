// Parc d'attractions (caché) : manèges (on paie, on se détend, le temps passe, un peu d'énergie revient)
// et stands (petit jeu d'adresse en 3 lancers, avec des lots). Logique pure.
import { add, canAdd } from './inventory.js';

// 💡 prix, effets et textes
export const RIDES = {
  R: { n: 'Grande roue', price: 30, e: 15, min: 20, txt: 'Tout là-haut, on voit toute la région : la ferme, la ville, la mer… et la montagne au loin.' },
  I: { n: 'Carrousel', price: 15, e: 8, min: 10, txt: 'Les chevaux de bois tournent, la musique grince un peu. On a dix ans à nouveau.' },
  x: { n: 'Montagnes russes', price: 50, e: 20, min: 15, txt: 'Montée… descente vertigineuse… looping ! Le cœur bat encore en sortant.' },
  y: { n: 'Autos tamponneuses', price: 25, e: 10, min: 15, txt: 'Bing ! Bang ! Personne d’autre sur la piste… on se tamponne tout seul contre les bords.' },
  j: { n: 'Maison hantée', price: 35, e: 12, min: 15, txt: 'Des grincements, un drap qui s’envole, un rire dans le noir… Ouf, la sortie !' }
};
export const GAMES = {
  z: { n: 'Chamboule-tout', price: 20, txt: 'Trois balles pour faire tomber la pyramide de boîtes.' },
  q: { n: 'Stand de tir', price: 20, txt: 'Trois tirs sur les canards qui défilent.' }
};
export const STALL = { u: { n: 'Barbe à papa', price: 15, item: 'barbe_papa' } };
// Lots selon le nombre de réussites (sur 3)
export const PRIZES = [null, 'barbe_papa', 'peluche', 'peluche_geante'];

export const AIM_ZONE = [.4, .6];   // la zone à viser dans la jauge de visée (0 → 1)
export const aimHit = p => p >= AIM_ZONE[0] && p <= AIM_ZONE[1];

function pay(g, price) {
  const S = g.S;
  if (S.money < price) { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', `Il te faut ${price} $.`); return false; }
  S.money -= price; g.bus.emit('sfx', 'coin'); return true;
}
export function parcAt(tile) { return RIDES[tile] ? 'ride' : GAMES[tile] ? 'game' : STALL[tile] ? 'stall' : null; }

export function ride(g, tile) {
  const S = g.S, r = RIDES[tile];
  if (!r || !pay(g, r.price)) return false;
  S.energy = Math.min(S.maxE, S.energy + r.e); S.minute += r.min;
  ((S.parc ||= {}).rides ||= {})[tile] = ((S.parc.rides || {})[tile] || 0) + 1;
  g.bus.emit('ride', tile);
  g.bus.emit('say', { name: r.n, color: '#f2c832', lines: [r.txt, `+${r.e} ⚡ · ${r.min} minutes ont passé.`] });
  return true;
}
export function buyStall(g, tile) {
  const S = g.S, st = STALL[tile];
  if (!canAdd(S, st.item, 1)) { g.bus.emit('toast', 'Sac plein !'); return false; }
  if (!pay(g, st.price)) return false;
  add(g, st.item, 1); g.bus.emit('toast', `🍭 ${st.n} ! Miam.`); return true;
}
// Stand : on paie, puis 3 essais (jauge de visée, voir ui/parcPanel.js) ; lot selon les réussites.
export function startGame(g, tile) {
  if (!GAMES[tile] || !pay(g, GAMES[tile].price)) return false;
  g.parcGame = { tile, tries: 0, hits: 0 };
  g.bus.emit('parcGame', g.parcGame);
  return true;
}
export function shoot(g, p) {
  const G = g.parcGame; if (!G) return null;
  G.tries++; const hit = aimHit(p); if (hit) G.hits++;
  g.bus.emit('sfx', hit ? 'collect' : 'denied');
  if (G.tries < 3) return hit ? 'hit' : 'miss';
  g.parcGame = null;
  const prize = PRIZES[G.hits];
  if (prize && canAdd(g.S, prize, 1)) add(g, prize, 1);
  g.bus.emit('toast', prize ? `🎉 ${G.hits}/3 ! Tu gagnes : ${prize === 'barbe_papa' ? 'une barbe à papa' : prize === 'peluche' ? 'une peluche' : 'une PELUCHE GÉANTE'} !` : '0/3… Retente ta chance !');
  g.bus.emit('parcGameEnd', G);
  return 'end';
}
