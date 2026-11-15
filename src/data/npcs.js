// Habitants. story = répliques qui dévoilent leur vie, une nouvelle par jour au plus,
// débloquées par paliers d'amitié (h = cœurs requis). chat = petites phrases une fois tout dit.
// Toutes les répliques sont à faire valider par l'utilisateur (liste numérotée dans docs/CARNET.md).
export const LUNA = {
  id: 'luna', name: 'Luna', de: "d'elle", color: '#c9a0ff', voice: 'voiceLuna',
  look: { body: 'f', bottom: 'pant', skin: '#f1c7a5', hair: 1, hairC: '#3a2a3e', shirt: '#5aa88a', pants: '#4a4a6a' },
  home: 'luna', day: { x: 21.5, y: 33.2 }, inside: { x: 5.5, y: 4.6 },
  // Personnalité (💡 proposée par Claude, à valider) : ancienne informaticienne, rêve d'une ferme, budget serré, bricole sa maison.
  traits: ['Ancienne informaticienne', 'Rêve de sa propre ferme', 'Budget serré', 'Retape sa petite maison'],
  // Goûts par degré (💡 à valider) — tirés de la personnalité, pas d'une idée toute faite.
  taste: {
    adore: ['carrot_seed', 'wheat_seed'],      // de quoi commencer son potager
    aime: ['bread', 'croissant', 'wood'],      // un repas offert ; du bois pour bricoler
    naime: ['stone', 'hay'],
    deteste: ['slime']
  },
  react: {
    adore: "Des graines ?! Pour mon futur potager ? Tu es un amour !",
    aime: "Oh, merci ! Ça me fait vraiment plaisir.",
    naime: "Ah… merci. Je vais bien lui trouver une utilité.",
    deteste: "Euh… c'est gluant. Tu peux le reprendre ?"
  },
  // Questions (une seule fois chacune, effets faibles : l'amitié reste lente).
  questions: [
    { id: 'terre', h: 0, q: "Dis… tu crois qu'on peut vraiment vivre de la terre, aujourd'hui ?", a: [
      { t: 'Bien sûr, il faut juste de la patience.', pts: 12, r: "Tu as raison. La patience, ça s'apprend." },
      { t: 'Ça dépend de la météo… et de la chance.', pts: 5, r: 'Ha ! Alors je vais prier pour le soleil.' },
      { t: 'Franchement ? Non.', pts: -8, r: "Ah… merci pour l'encouragement." }] },
    { id: 'machines', h: 1, q: "Tu n'as jamais l'impression que les machines vont tout faire à notre place ?", a: [
      { t: 'Pas planter des carottes avec amour, en tout cas.', pts: 12, r: "Ha ! J'aime bien cette idée." },
      { t: 'Si, et ça me fait un peu peur aussi.', pts: 8, r: 'Au moins, on est deux.' },
      { t: 'Tant mieux, je ferai la sieste.', pts: -5, r: "Facile à dire quand on a encore son travail…" }] },
    { id: 'reve', h: 2, q: "Si tu avais une ferme de rêve, tu y mettrais quoi en premier ?", a: [
      { t: 'Des poules, évidemment.', pts: 12, r: "Pareil ! On est faits pour s'entendre." },
      { t: 'Un grand potager.', pts: 10, r: 'Bon choix. Les carottes ne répondent jamais.' },
      { t: 'Un hamac.', pts: 3, r: '… Je note. Le hamac.' }] }
  ],
  story: [
    { h: 0, t: "Oh, bonjour ! Je m'appelle Luna. Je viens d'emménager dans la petite maison, là." },
    { h: 0, t: "Tout est encore dans les cartons. Je ne sais même plus où j'ai rangé la bouilloire." },
    { h: 0, t: "C'est toujours aussi calme, par ici ? Ça me change de la ville." },
    { h: 1, t: "Avant d'arriver, je travaillais dans l'informatique. Toute la journée devant des écrans." },
    { h: 1, t: "Je n'avais jamais vu un vrai champ de blé de près. C'est beau, en fait." },
    { h: 2, t: "Mon poste a été remplacé par une IA. Du jour au lendemain." },
    { h: 2, t: "Le pire, c'est qu'elle fait mon ancien travail mieux que moi. Ça pique un peu." },
    { h: 3, t: "Alors j'ai décidé de tout recommencer ici. Mon rêve, ce serait d'avoir ma propre ferme." },
    { h: 3, t: "Des poules, un potager… quelque chose de vrai, que je fais de mes mains." },
    { h: 4, t: "Mais pour l'instant, je n'ai presque rien de côté. Il faut d'abord que je gagne un peu d'argent." },
    { h: 4, t: "Je prends tous les petits boulots que je trouve. Un jour, j'aurai ma ferme. Promis." }
  ],
  chat: ["Bonne journée ! Ne travaille pas trop, hein.", "Tu sens cette odeur d'herbe ? Je ne m'en lasse pas."],
  already: "Tu m'as déjà fait un cadeau aujourd'hui !",
  night: "Il est tard… on se voit demain ?"
};
export const NPCS = { luna: LUNA };
// Luna est dehors de 8 h à 19 h, chez elle le reste du temps.
export const OUT_FROM = 480, OUT_TO = 1140;
