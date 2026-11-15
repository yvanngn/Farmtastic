// Habitants. story = répliques qui dévoilent leur vie, une nouvelle par jour au plus,
// débloquées par paliers d'amitié (h = cœurs requis). chat = petites phrases une fois tout dit.
// Toutes les répliques sont à faire valider par l'utilisateur (liste numérotée dans docs/CARNET.md).
export const LUNA = {
  id: 'luna', name: 'Luna', de: "d'elle", color: '#c9a0ff', voice: 'voiceLuna',
  look: { body: 'f', bottom: 'pant', skin: '#f1c7a5', hair: 1, hairC: '#3a2a3e', shirt: '#5aa88a', pants: '#4a4a6a' },
  home: 'luna', outScene: 'quartier', day: { x: 9.5, y: 7.4 }, inside: { x: 5.5, y: 4.6 },
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
    adore: "Des graines ?! Pour mon futur potager ? Merci beaucoup !",
    aime: "Oh, merci ! Ça me fait vraiment plaisir.",
    naime: "Ah… merci. Je vais bien lui trouver une utilité.",
    deteste: "Euh… Tu peux le reprendre ?"
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
      { t: 'Un grand potager.', pts: 10, r: 'Ah bon ? Faut qu\'il soit d\'accord pour ça ton ami haha.' },
      { t: 'Un hamac.', pts: 3, r: '… Je note. Le hamac.' }] }
  ],
  story: [
    { h: 0, t: "Oh, bonjour ! Je m'appelle Luna. Je viens d'emménager dans cette petite maison." },
    { h: 0, t: "Tout est encore dans les cartons. Je ne sais même plus où j'ai rangé la bouilloire." },
    { h: 0, t: "C'est toujours aussi calme, par ici ? Ça me change de la ville." },
    { h: 1, t: "Avant d'arriver, je travaillais dans l'informatique. Toute la journée devant des écrans." },
    { h: 1, t: "Je n'avais jamais vu un vrai champ de blé de près. C'est beau, en fait." },
    { h: 2, t: "Mon poste a été remplacé par une Intelligence Artificielle (IA). Du jour au lendemain." },
    { h: 2, t: "Le pire, c'est que l'intelligence artificielle fait mon ancien travail mieux que moi et beaucoup plus rapidement ..." },
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
  home: null, day: { x: 11.5, y: 12.6 },   // il habite sa villa, au sud de la place
  // trajet villa → place (le matin) et retour (le soir), à pied : porte de la villa, allée est, place
  commute: [{ x: 12.5, y: 26.5 }, { x: 16.5, y: 26.5 }, { x: 16.5, y: 20.5 }, { x: 11.5, y: 17.5 }, { x: 11.5, y: 12.6 }], commuteMin: 40,
  walks: [{ scene: 'foret', from: 780, to: 840, every: 3, at: { x: 18.5, y: 13.5 } }],  // promenade digestive, un jour sur trois, 13 h – 14 h (💡)
  traits: ['Chef élu à l\'unanimité', 'Dit aimer ses villageois', 'En secret : impôts élevés, bon temps et vacances'],
  taste: { adore: [], aime: ['bread', 'egg'], naime: [], deteste: ['slime'] },
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
  home: 'franck', outScene: 'quartier', inside: { x: 5.5, y: 2.7 }, day: { x: 11.5, y: 16.4 },
  walks: [{ scene: 'foret', from: 390, to: 450, every: 2, at: { x: 5.5, y: 12.5 } }],   // à l'aube, quand personne ne le voit (à partir de 2 cœurs) (💡)
  shy: { minHearts: 2, from: 1020, to: 1140 },   // à partir de 2 cœurs, il s'assoit devant chez lui en fin de journée
  traits: ['Timide', 'Sort peu', 'Laisse passer le temps', 'Aimait peut-être fabriquer des choses'],
  taste: { adore: ['croissant'], aime: ['bread', 'egg', 'wood'], naime: ['slime'], deteste: ['truffle'] },
  react: {
    adore: '… Pour moi ? … Merci. Vraiment.',
    aime: '… Merci. C\'est gentil.',
    neutre: 'Oh. … Merci.',
    naime: '… Je vais le poser là.',
    deteste: "Ça sent… bizarre. Tu peux le garder ?"
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
// Myst (décrit par l'utilisateur) : grand et mince, long manteau noir. Vit un peu à l'écart dans une vieille maison
// sombre (genre motel Bates). Sort le soir, parle peu mais écoute tout. Le village l'a toujours mis de côté
// (trop antisocial) : il est content qu'on arrive bousculer un peu les choses.
export const MYST = {
  id: 'myst', name: 'Myst', de: 'de lui', color: '#a99ad0', voice: 'voiceFranck',
  look: { body: 'h', bottom: 'pant', skin: '#e2cfc0', hair: 0, hairC: '#1c181c', shirt: '#1d1b22', pants: '#141218', tall: true, coat: true },
  home: null, mystic: true,
  // trajet du quartier jusqu'à la cabane : du portail sud de la ferme, on remonte le grand chemin
  route: [{ x: 16.5, y: 34.4 }, { x: 16.5, y: 20.6 }, { x: 3.6, y: 20.6 }],   // de la gare au quartier par le grand chemin
  outScene: 'quartier', night: { from: 1140, to: 1380, at: { x: 6.5, y: 28.4 } },   // sort le soir devant chez lui (💡 19h-23h)
  traits: ['Grand et mince', 'Long manteau noir', 'Sort le soir', 'Parle peu, écoute tout', 'Mis de côté par le village'],
  taste: { adore: [], aime: ['colchique', 'lavande'], naime: ['slime'], deteste: [] },   // 💡 fleurs calmes du soir
  // Accueil : il attend sur le quai de la gare, vient parler au joueur après ses premières pensées,
  // explique le plan, la tente (sac) et la liste des tâches, parle d'un outil pour couper les arbres, puis repart.
  waitAt: { x: 3.6, y: 19.6 },
  arrival: [
    "Bonjour. Tu dois être la personne de l'annonce. Moi, c'est Myst.",
    "Personne n'habite ici depuis longtemps. Au village, ils disent que l'endroit est hanté. Moi, je n'y crois pas trop.",
    "Tiens, voici le plan. Tu le retrouveras avec le bouton 🗺️, en haut à droite. Le quartier résidentiel est au sud : c'est là que j'habite, tout au fond.",
    "Ta cabane ne tiendra pas la nuit. Ouvre ton sac 🎒, choisis la tente et appuie sur « Déployer », juste à côté de la cabane.",
    "Si tu te demandes quoi faire, ta liste des tâches 📜, en haut à droite, te le dira.",
    "Pour réparer la cabane, il te faudra du bois et des pierres. On peut couper les arbres… J'ai cru voir un outil pour ça, dans les environs.",
    "Et pour les pierres, il y a une vieille pioche abandonnée, quelque part du côté de la grange.",
    "Ça leur fera du bien, qu'on bouscule un peu les choses. … Bon. À plus tard."
  ],
  story: [
    { h: 0, t: '… Bonsoir. Je sors souvent, le soir. C\'est calme.' },
    { h: 0, t: "Je parle peu. Mais j'écoute. On apprend beaucoup en écoutant." },
    { h: 1, t: 'Au quartier, on me salue de loin. Je suis le voisin bizarre du fond, je crois.' },
    { h: 2, t: "Au village, on ne m'a jamais vraiment accepté. Trop silencieux, sans doute." },
    { h: 3, t: "Depuis que tu es là, les gens parlent de la ferme. Ça bouge un peu. Ça me plaît." }
  ],
  topics: [
    { t: 'Et le village ?', lines: ['Ils parlent beaucoup. Ils écoutent peu.'] },
    { t: 'Pourquoi tu vis à l\'écart ?', h: 1, lines: ['Au fond du quartier, personne ne vient frapper par hasard. Ça me va.'] }
  ],
  chat: ['… Bonsoir.', "La nuit, tout le monde se tait. J'entends mieux."],
  questions: []
};
// Hailey (décrite par l'utilisateur) : infirmière de la clinique, fraîchement diplômée, motivée ; elle découvre
// peu à peu qu'elle travaille beaucoup pour peu, que beaucoup viennent pour rien, que les vraies urgences sont
// saturées et qu'elle reçoit le surplus ; de longues journées… elle frise le burn-out. (Histoire dévoilée par cœurs.)
export const HAILEY = {
  id: 'hailey', name: 'Hailey', de: "d'elle", color: '#7cc8c0', voice: 'voiceLuna',
  look: { body: 'f', bottom: 'pant', skin: '#f3d0b4', hair: 1, hairC: '#c8843a', shirt: '#8fd0c8', pants: '#6fb4ac' },   // tenue d'infirmière turquoise 💡
  home: 'hailey', inside: { x: 3.5, y: 3.7 }, worker: { scene: 'clinique', at: { x: 6.5, y: 3.7 }, from: 420, to: 1380 },   // de 7h à 23h (💡) : de très longues journées
  traits: ['Infirmière', 'Fraîchement diplômée', 'Motivée', 'Travaille beaucoup', 'Fatiguée'],
  taste: { adore: [], aime: ['berry_cooked', 'lavande'], naime: ['slime'], deteste: [] },   // 💡 un petit quelque chose qui réconforte
  story: [
    { h: 0, t: 'Bonjour ! Je suis Hailey, l\'infirmière. Toute nouvelle, diplômée cette année !' },
    { h: 0, t: "Si vous avez le moindre bobo, je suis là. C'est pour ça que j'ai choisi ce métier." },
    { h: 1, t: "Aujourd'hui, j'ai eu trois personnes pour un rhume. Et une pour une écharde. Ce n'est rien, hein… mais ça remplit la journée." },
    { h: 1, t: "Les urgences de la grande ville sont pleines. Alors on m'envoie ceux qu'elles ne peuvent pas prendre." },
    { h: 2, t: "J'ai fait le compte : douze heures hier. Et le salaire… disons que je ne suis pas là pour l'argent. Heureusement." },
    { h: 2, t: "Je croyais que j'aurais le temps de vraiment soigner les gens. Je cours, surtout." },
    { h: 3, t: "Je m'endors en rentrant, sans manger. Et je rêve de la salle d'attente." },
    { h: 3, t: "Si quelqu'un a vraiment besoin de moi et que je suis trop fatiguée pour bien faire… ça me fait peur." },
    { h: 4, t: "Je crois que je suis au bord du burn-out. Je n'avais jamais dit ce mot à voix haute." },
    { h: 4, t: "Merci de passer me voir sans être malade. Ça me fait du bien, vraiment." }
  ],
  topics: [
    { t: 'Ça va, le travail ?', lines: ["Ça va ! Enfin… il y a beaucoup de monde. Mais ça va !"] },
    { t: 'Tu prends des pauses ?', h: 2, lines: ['Des pauses ? Hm. Je mange debout entre deux patients, ça compte ?'] }
  ],
  chat: ['Bonjour ! Pas de bobo, j\'espère ?', 'Pensez à dormir la nuit, hein. Je dis ça à tout le monde… sauf à moi.'],
  clinic: [
    "Ah, vous vous réveillez ! On vous a trouvé(e) effondré(e), complètement épuisé(e).",
    "Je vous ai gardé(e) un moment ici. Il faut dormir la nuit, d'accord ? Votre corps n'est pas une machine.",
    "Pour les soins, il y a des frais, je suis désolée… ce n'est pas moi qui fixe les tarifs."
  ],
  questions: []
};

// Igor (décrit par l'utilisateur) : forgeron. Ancien sportif de haut niveau ; une cheville tordue a brisé ses rêves
// de Jeux olympiques. Il s'est reconverti en forgeron, et il est plutôt bon : il fait de bons outils et aimerait
// apprendre à faire des armes. Il traîne dans le quartier : il a perdu son bijou (ici ou près de la cabane).
export const IGOR = {
  id: 'igor', name: 'Igor', de: 'de lui', color: '#e0884a', voice: 'voiceChef',
  look: { body: 'h', bottom: 'pant', skin: '#d9a07a', hair: 0, hairC: '#2a1e18', shirt: '#6a4a36', pants: '#3a3632', tall: true },   // 💡 tablier de cuir, carrure d'athlète
  home: null, dayScene: 'quartier', day: { x: 18.5, y: 13.5 },   // il traîne dans la ruelle du quartier 💡
  traits: ['Forgeron', 'Ancien sportif de haut niveau', 'Cheville abîmée', 'Fait de bons outils', 'Rêve de forger des armes'],
  taste: { adore: [], aime: ['copper_ore', 'iron_ore'], naime: ['berry'], deteste: [] },   // 💡 un forgeron aime le minerai
  lost: [
    "Hé ! Tu n'aurais pas vu un bijou ? Une petite pièce à laquelle je tiens beaucoup.",
    "Je l'ai fait tomber… ou bien ici, dans le quartier, ou bien près de la vieille cabane, là-haut.",
    "Si tu le trouves, rapporte-le-moi. Je saurai te remercier."
  ],
  reminder: "Toujours pas de trace de mon bijou… Ici, ou près de la cabane, j'en suis sûr.",
  thanks: [
    "Mon bijou ! Tu l'as trouvé ! Merci, vraiment.",
    "Pour te remercier, je vais t'apprendre un truc de forgeron : fabriquer un coffre.",
    "Il te faudra 80 bois et 20 pierres. Pratique pour ranger tout ce que tu ramasses !"
  ],
  story: [
    { h: 0, t: "Salut. Moi, c'est Igor, le forgeron. Enfin… depuis quelques années." },
    { h: 1, t: "Avant, j'étais sportif. De haut niveau. Je m'entraînais pour les Jeux olympiques." },
    { h: 2, t: "Et puis je me suis tordu la cheville. Mal. Fini, les Jeux. Du jour au lendemain." },
    { h: 3, t: "Alors je me suis mis à la forge. Et tu sais quoi ? Je suis plutôt doué." },
    { h: 4, t: "Je fais de bons outils. Mais ce que j'aimerais vraiment apprendre, c'est forger des armes." }
  ],
  topics: [{ t: 'Tu fais quoi, à la forge ?', lines: ['Des outils, surtout. Solides. Qui durent.'] }],
  chat: ['La cheville tient le coup, aujourd’hui.', "Un bon outil, ça se respecte."],
  questions: []
};

// Arrivée en train (pensées du héros, 🆕) : après un licenciement, il cherche un sens à sa vie.
export const INTRO_LINES = [
  "Après mon licenciement, j'ai voulu redonner un sens à ma vie.",
  "J'ai toujours rêvé de construire ma propre maison. Alors, quand j'ai vu l'annonce qui disait que cette cabane abandonnée était offerte à la personne qui voulait s'en occuper…",
  "Il paraît que peu de gens sont venus essayer, à cause de la fameuse rumeur comme quoi la ferme serait hantée !",
];
export const NPCS = { luna: LUNA, chef: CHEF, franck: FRANCK, myst: MYST, hailey: HAILEY, igor: IGOR };
// Luna est dehors de 8 h à 19 h, chez elle le reste du temps.
export const OUT_FROM = 480, OUT_TO = 1140;
