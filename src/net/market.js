// Marché entre joueurs (Supabase). Les objets mis en vente quittent le sac (séquestre) ;
// l'achat passe par une fonction SQL atomique ; le vendeur « encaisse » ses ventes ensuite.
import { add, has, canAdd } from '../systems/inventory.js';
import { CFG } from '../config.js';

export function createPlayerMarket(sb, uid, g) {
  const S = () => g.S;
  const fail = msg => { g.bus.emit('sfx', 'denied'); g.bus.emit('toast', msg); return false; };
  return {
    uid,
    async list() {
      const { data, error } = await sb.from(CFG.TABLE + 'market_listings').select('*').eq('status', 'open').order('created_at', { ascending: false }).limit(60);
      return error ? [] : data;
    },
    async mine() {
      const { data } = await sb.from(CFG.TABLE + 'market_listings').select('*').eq('seller_id', uid).order('created_at', { ascending: false }).limit(30);
      return data || [];
    },
    async sell(item, qty, price) {
      qty = Math.floor(qty); price = Math.floor(price);
      if (!(qty > 0 && price > 0)) return fail('Quantité et prix invalides');
      if (!has(S(), item, qty)) return fail("Vous n'en avez pas assez");
      add(g, item, -qty);
      const { error } = await sb.from(CFG.TABLE + 'market_listings').insert({ seller_id: uid, seller_name: S().name, item, qty, price });
      if (error) { add(g, item, qty); return fail('Mise en vente impossible : ' + error.message); }
      g.bus.emit('sfx', 'coin'); g.bus.emit('toast', 'Annonce publiée 🏷️');
      return true;
    },
    async buy(l) {
      const total = l.qty * l.price;
      if (S().money < total) return fail("Pas assez d'argent");
      if (!canAdd(S(), l.item, l.qty)) return fail('Sac plein 🎒');
      const { error } = await sb.rpc(CFG.TABLE + 'buy_listing', { p_id: l.id });
      if (error) return fail('Annonce déjà vendue');
      S().money -= total; add(g, l.item, l.qty);
      g.bus.emit('sfx', 'buy'); g.bus.emit('toast', `Acheté à ${l.seller_name} 🤝`);
      return true;
    },
    async cancel(l) {
      if (!canAdd(S(), l.item, l.qty)) return fail('Libérez une place dans le sac');
      const { error } = await sb.rpc(CFG.TABLE + 'cancel_listing', { p_id: l.id });
      if (error) return fail('Annulation impossible');
      add(g, l.item, l.qty); g.bus.emit('toast', 'Annonce retirée');
      return true;
    },
    async claim() {
      const { data, error } = await sb.rpc(CFG.TABLE + 'claim_sales');
      if (error) return fail('Encaissement impossible');
      const n = data || 0;
      if (n > 0) { S().money += n; g.bus.emit('sfx', 'coin'); }
      g.bus.emit('toast', n > 0 ? `Ventes encaissées : +${n} 🪙` : 'Aucune vente à encaisser');
      return n;
    }
  };
}
