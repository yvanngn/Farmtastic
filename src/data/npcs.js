// Habitants. story = répliques qui dévoilent leur vie, une nouvelle par jour au plus,
// débloquées par paliers d'amitié (h = cœurs requis). chat = petites phrases une fois tout dit.
// Toutes les répliques sont à faire valider par l'utilisateur (liste numérotée dans docs/CARNET.md).
export const LUNA = {
  id: 'luna', name: 'Luna', de: "d'elle", color: '#c9a0ff', voice: 'voiceLuna',
  look: { body: 'f', bottom: 'pant', skin: '#f1c7a5', hair: 1, hairC: '#3a2a3e', shirt: '#5aa88a', pants: '#4a4a6a' },
  home: 'luna', day: { x: 21.5, y: 33.2 }, inside: { x: 5.5, y: 4.6 },
  walks: [{ scene: 'foret', from: 960, to: 1020, every: 2, at: { x: 9.5, y: 7.5 } }],   // balade en forêt, un jour sur deux, 16 h – 17 h (💡)
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
  topics: [
    { t: "Comment se passe l'installation ?", lines: ["Doucement. J'ai déballé trois cartons… sur vingt.", 'Mais la maison commence à ressembler à quelque chose.'] },
    { t: "Tu t'en sors, pour l'argent ?", h: 3, lines: ['Pas vraiment. Je compte chaque pièce.', "Mais j'y arriverai. Il le faut."] }
  ],
  chat: ["Bonne journée ! Ne travaille pas trop, hein.", "Tu sens cette odeur d'herbe ? Je ne m'en lasse pas."],
  already: "Tu m'as déjà fait un cadeau aujourd'hui !",
  night: "Il est tard… on se voit demain ?"
};
// Manuel, le chef du village (décrit par l'utilisateur) : il raconte qu'il a été élu à l'unanimité et qu'il aime
// ses villageois. En secret, il fait payer cher les impôts et en profite pour passer du bon temps et partir
// en vacances ; les gens croient qu'il travaille dur pour eux. Une enquête sur lui viendra plus tard.
export const CHEF = {
  id: 'chef', name: 'Manuel', title: 'chef du village', color: '#e8c26a', voice: 'voiceChef', de: 'de lui',
  look: { body: 'h', bottom: 'pant', skin: '#e2b48c', hair: 0, hairC: '#b8b4ae', shirt: '#7a4a2a', pants: '#3a3a4a' },
  home: null, day: { x: 11.5, y: 12.6 }, welcome: { x: 8.5, y: 6.9 },
  walks: [{ scene: 'foret', from: 780, to: 840, every: 3, at: { x: 18.5, y: 13.5 } }],  // promenade digestive, un jour sur trois, 13 h – 14 h (💡)
  traits: ['Chef élu à l\'unanimité', 'Dit aimer ses villageois', 'En secret : impôts élevés, bon temps et vacances'],
  taste: { adore: [], aime: ['bread', 'egg'], naime: [], deteste: ['slime'] },
  welcomeLines: [
    "Ah, te voilà enfin ! Bienvenue au village. Je suis Manuel, le chef du village.",
    "Cette ferme est à toi, maintenant. Elle a bien besoin d'un coup de main, comme tu vois.",
    "En descendant le chemin, tu trouveras le village : la halle du marché, le panneau d'affichage et nos commerces.",
    "Sur le panneau, les gens affichent leurs demandes. Le village a besoin de toi pour se reconstruire.",
    "Les outils de l'ancien propriétaire doivent traîner dans la grange, à côté de la maison.",
    "Mais méfie-toi : cette grange cache bien plus de choses qu'elle n'en a l'air…",
    "Ta voisine, Luna, vient d'arriver elle aussi. Va lui dire bonjour !"
  ],
  welcomeEnd: { t: 'Merci, chef !', r: 'Allez, au travail ! Et passe me voir sur la place quand tu veux.' },
  story: [
    { h: 0, t: "Ce village, c'est toute ma vie. J'aime chacun de mes villageois, sincèrement." },
    { h: 0, t: "J'ai été élu à l'unanimité, tu sais. Pas une seule voix contre !" },
    { h: 1, t: 'Je travaille jour et nuit pour eux. Enfin… surtout le jour.' },
    { h: 1, t: 'Les impôts ? Indispensables pour reconstruire le village, voyons.' },
    { h: 2, t: 'Je serai absent quelques jours. Un séminaire. Très fatigant, les séminaires.' },
    { h: 2, t: "Ce bronzage ? C'est… à force de travailler dehors, sur la place." }
  ],
  topics: [
    { t: 'Parlez-moi du village.', lines: ['Un village magnifique, avec des gens formidables. Il a juste besoin de quelques réparations.', 'Grâce aux demandes du panneau, on avance un peu chaque jour !'] },
    { t: 'Comment êtes-vous devenu chef ?', lines: ["Élu à l'unanimité ! Les gens m'ont fait confiance tout de suite.", "Et depuis, je me donne corps et âme pour eux. Corps et âme !"] },
    { t: 'Et les impôts, ça sert à quoi ?', h: 1, lines: ['À tout ! Les routes, les lampadaires, la fontaine…', '… Et quelques frais de représentation. Rien de bien important.'] }
  ],
  chat: ['Le village renaît un peu plus chaque jour.', "Tu as fouillé la grange ? On dit qu'elle s'enfonce loin sous la colline."],
  react: { aime: 'Oh, c\'est gentil ! Merci.', neutre: 'Merci bien.', deteste: 'Hum… je vais faire semblant de ne pas avoir vu ça.' }
};
// Franck, voisin de Luna (décrit par l'utilisateur) : timide, sort peu. Un traumatisme d'enfance
// dont il ne parle pas — on ne le saura jamais. Il laisse passer le temps ; un objet fabriqué l'animera un jour.
// Apparence, goûts, répliques et questions : 💡 propositions de Claude, à valider.
export const FRANCK = {
  id: 'franck', name: 'Franck', de: 'de lui', color: '#8ab4d8', voice: 'voiceFranck',
  // décrit par l'utilisateur : grand, cheveux mi-longs, l'air triste
  look: { body: 'h', bottom: 'pant', skin: '#e8c4a4', hair: 1, hairC: '#5a4636', shirt: '#7d8794', pants: '#3a3f4a', tall: true, sad: true },
  home: 'franck', inside: { x: 5.5, y: 2.7 }, day: { x: 27.5, y: 33.3 },
  walks: [{ scene: 'foret', from: 390, to: 450, every: 2, at: { x: 5.5, y: 12.5 } }],   // à l'aube, quand personne ne le voit (à partir de 2 cœurs) (💡)
  shy: { minHearts: 2, from: 1020, to: 1140 },   // à partir de 2 cœurs, il s'assoit devant chez lui en fin de journée
  traits: ['Timide', 'Sort peu', 'Laisse passer le temps', 'Aimait peut-être fabriquer des choses'],
  taste: { adore: ['croissant'], aime: ['bread', 'egg', 'wood'], naime: ['slime'], deteste: ['truffle'] },
  react: {
    adore: '… Un croissant ? Pour moi ? … Merci. Vraiment.',
    aime: '… Merci. C\'est gentil.',
    neutre: 'Oh. … Merci.',
    naime: '… Je vais le poser là.',
    deteste: "Ça sent… fort. Tu peux le garder ?"
  },
  already: '… Tu m\'as déjà apporté quelque chose aujourd\'hui.',
  story: [
    { h: 0, t: '… Oh. Bonjour.' },
    { h: 0, t: 'Je… je ne reçois pas beaucoup de visites.' },
    { h: 0, t: 'Tu peux bien refermer la porte en partant ? Merci.' },
    { h: 1, t: "Je m'appelle Franck. J'habite ici depuis longtemps." },
    { h: 1, t: 'Les journées passent. Je regarde par la fenêtre, surtout.' },
    { h: 2, t: "Il s'est passé quelque chose, quand j'étais petit. Je… je préfère ne pas en parler." },
    { h: 2, t: 'Depuis, je laisse le temps passer. Rien ne me donne vraiment envie.' },
    { h: 3, t: "J'ai ouvert les volets, ce matin. Ça fait bizarre, toute cette lumière." },
    { h: 3, t: "Luna m'a fait signe, hier. J'ai… fait signe aussi." },
    { h: 4, t: "Avant, j'aimais bien fabriquer des choses, je crois. Je ne sais plus trop quoi." },
    { h: 4, t: "Si un jour tu trouves quelque chose qui… je ne sais pas. Qui me donnerait envie." }
  ],
  topics: [
    { t: 'Tu veux sortir un peu ?', lines: ['… Pas aujourd\'hui.'] },
    { t: 'Tu connais Luna, ta voisine ?', h: 1, lines: ['Un peu. Elle dit bonjour. Elle a l\'air… gentille.'] }
  ],
  chat: ['…', "Il fait beau ? Je n'ai pas regardé."],
  questions: [
    { id: 'reste', h: 0, q: 'Tu… tu restes longtemps ?', a: [
      { t: 'Juste le temps de dire bonjour.', pts: 12, r: "D'accord. C'est… gentil." },
      { t: 'Toute la journée, si tu veux !', pts: -5, r: 'Ah. Euh…' },
      { t: 'Je repasserai demain.', pts: 8, r: "… D'accord." }] },
    { id: 'sortir', h: 1, q: 'Tu sors beaucoup, toi ?', a: [
      { t: 'Tous les jours, il y a tant à voir !', pts: 5, r: 'Ça doit être fatigant.' },
      { t: 'Un peu. Tu pourrais venir avec moi, un jour.', pts: 12, r: '… Peut-être. Un jour.' },
      { t: 'Pas plus que nécessaire.', pts: 8, r: 'Je comprends.' }] }
  ]
};
export const NPCS = { luna: LUNA, chef: CHEF, franck: FRANCK };
// Luna est dehors de 8 h à 19 h, chez elle le reste du temps.
export const OUT_FROM = 480, OUT_TO = 1140;
