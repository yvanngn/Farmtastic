// Habitants. story = répliques qui dévoilent leur vie, une nouvelle par jour au plus,
// débloquées par paliers d'amitié (h = cœurs requis). chat = petites phrases une fois tout dit.
// Toutes les répliques sont à faire valider par l'utilisateur (liste numérotée dans docs/CARNET.md).
export const LUNA = {
  id: 'luna', name: 'Luna', de: "d'elle", color: '#c9a0ff', voice: 'voiceLuna',
  look: { folk: 'luna', body: 'f', bottom: 'pant', skin: '#f1c7a5', hair: 1, curly: true, hairC: '#7a4a2a', hat: 'cowboy', bandana: '#c0392b', shirt: '#a8432f', plaid: true, pants: '#d8cfc0', shoes: '#6a3a1e' },   // 18/11 : poupée dessinée par le code (src/render/paperdoll.js), tenue d'après son sprite
  home: 'luna', outScene: 'quartier', day: { x: 9.5, y: 7.4 }, inside: { x: 5.5, y: 4.6 },
  walks: [{ scene: 'foret', from: 960, to: 1020, every: 2, at: { x: 10.5, y: 7.5 } }],   // balade en forêt, un jour sur deux, 16 h – 17 h (💡)
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
// Manuel, dit Manu, le Maire (décrit par l'utilisateur ; « chef du village » avant Farmwest). Son ranch est au sud du rond-point.
// : il raconte qu'il a été élu à l'unanimité et qu'il aime
// ses villageois. En secret, il fait payer cher les impôts et en profite pour passer du bon temps et partir
// en vacances ; les gens croient qu'il travaille dur pour eux. Une enquête sur lui viendra plus tard.
export const CHEF = {
  id: 'chef', name: 'Manuel', title: 'Maire', color: '#e8c26a', voice: 'voiceChef', de: 'de lui',
  look: { folk: 'manu', body: 'h', bottom: 'pant', skin: '#e8a982', hair: 0, hairC: '#8a8480', beard: '#9a9490', hat: 'cowboy', shirt: '#f2efe8', vest: '#2f5a3a', pants: '#5a4030', shoes: '#7a3e1e', stout: true },   // 18/11 : poupée dessinée par le code (src/render/paperdoll.js), tenue d'après son sprite
  home: 'ranch_maison', inside: { x: 3.5, y: 4.6 }, outScene: 'town', day: { x: 18.5, y: 8.6 },
  // trajet villa → place (le matin) et retour (le soir), à pied : porte de la villa, allée est, place
  walks: [{ scene: 'foret', from: 780, to: 840, every: 3, at: { x: 19.5, y: 13.5 } }],  // promenade digestive, un jour sur trois, 13 h – 14 h (💡)
  traits: ['Maire élu à l\'unanimité', 'Surnommé Manu', 'Propriétaire du ranch du Maire', 'Dit aimer ses villageois', 'En secret : impôts élevés, bon temps et vacances'],
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
    { t: 'Comment êtes-vous devenu maire ?', lines: ["Élu à l'unanimité ! Les gens m'ont fait confiance tout de suite.", "Et depuis, je me donne corps et âme pour eux. Corps et âme !"] },
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
  look: { folk: 'franck', body: 'h', bottom: 'pant', skin: '#e8c4a4', hair: 0, curly: true, hairC: '#7a4a2a', hat: 'cowboy', shirt: '#a8432f', vest: '#6a4426', pants: '#6a4a2a', shoes: '#5a3a22', tall: true, sad: true },   // 18/11 : poupée dessinée par le code (src/render/paperdoll.js), tenue d'après son sprite
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
  look: { folk: 'myst', body: 'h', bottom: 'pant', skin: '#dcdcd6', hair: 2, hairC: '#1c1a20', shirt: '#1d1b22', pants: '#141218', shoes: '#2a2228', tall: true, coat: true },   // 18/11 : poupée dessinée par le code (src/render/paperdoll.js), tenue d'après son sprite
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
    "Et pense à prendre le bon outil dans ta roue 🛠️ avant de t'attaquer à quelque chose. Pour la cabane, c'est le marteau.",
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
  look: { folk: 'hailey', body: 'f', bottom: 'pant', skin: '#f3d0b4', hair: 1, curly: true, hairC: '#9a5a2a', shirt: '#f4f0e8', stetho: true, pants: '#3a5a8a', shoes: '#6a3a1e' },   // 18/11 : poupée dessinée par le code (src/render/paperdoll.js), tenue d'après son sprite
  home: 'hailey', inside: { x: 3.5, y: 3.7 },
  // Routine quotidienne (16/11, 💡 à adapter par l'utilisateur) : elle varie un peu chaque jour (voir docs/CARNET.md).
  // Lieux nommés, puis la journée : [heure de début, lieu]. Les variantes sont choisies selon le jour.
  places: {
    maison: { scene: 'hailey', x: 3.5, y: 3.7 }, clinique: { scene: 'clinique', x: 6.5, y: 3.7 },
    perron: { scene: 'quartier', x: 25.5, y: 15.8 }, place: { scene: 'town', x: 13.5, y: 6.2 },
    foret: { scene: 'foret', x: 19.5, y: 12.5 }
  },
  routine: {
    // jour de travail (6 jours sur 7) : déjeuner et fin de journée changent selon le jour
    travail: [[360, 'maison'], [420, 'clinique'], [720, ['place', 'perron', 'clinique']], [780, 'clinique'], [[1200, 1260, 1320], 'perron?'], [[1230, 1290, 1350], 'maison']],
    // jour de repos (1 jour sur 7) : grasse matinée, balade en forêt l'après-midi, soirée au calme
    repos: [[360, 'maison'], [840, 'foret'], [1020, 'perron'], [1110, 'maison']]
  },
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
  // 16/11 : appelée en dehors de ses heures, elle soigne quand même, mais le tarif est doublé (🆕)
  clinicRepos: [
    "Ah, vous vous réveillez… Vous savez qu'aujourd'hui, c'était mon jour de repos ?",
    "On m'a appelée en urgence. Je ne pouvais pas vous laisser comme ça.",
    "Mais en dehors de mes heures, le tarif est doublé. Je suis désolée."
  ],
  clinicNuit: [
    "Vous vous réveillez enfin. On m'a tirée du lit en pleine nuit pour vous, vous savez ?",
    "Il faut dormir, la nuit. Vous, et moi aussi d'ailleurs…",
    "Les soins de nuit, c'est le tarif double. Ce n'est pas moi qui l'ai décidé."
  ],
  questions: []
};

// Igor (décrit par l'utilisateur) : forgeron. Ancien sportif de haut niveau ; une cheville tordue a brisé ses rêves
// de Jeux olympiques. Il s'est reconverti en forgeron, et il est plutôt bon : il fait de bons outils et aimerait
// apprendre à faire des armes. Il traîne dans le quartier (sa quête du bijou a été retirée le 17/11).
export const IGOR = {
  id: 'igor', name: 'Igor', de: 'de lui', color: '#e0884a', voice: 'voiceChef',
  look: { folk: 'igor', body: 'h', bottom: 'pant', skin: '#d9a07a', bald: true, hat: 'bandeau', beard: '#4a4048', shirt: '#8a8a8a', tank: true, muscle: true, apron: '#7a4a2a', gloves: '#3a2a20', pants: '#5a4a3a', shoes: '#3a2a20', tall: true },   // 18/11 : poupée dessinée par le code (src/render/paperdoll.js), tenue d'après son sprite
  home: null, dayScene: 'quartier', day: { x: 18.5, y: 13.5 },   // il traîne dans la ruelle du quartier 💡
  traits: ['Forgeron', 'Ancien sportif de haut niveau', 'Cheville abîmée', 'Fait de bons outils', 'Rêve de forger des armes'],
  taste: { adore: [], aime: ['copper_ore', 'iron_ore'], naime: ['berry'], deteste: [] },   // 💡 un forgeron aime le minerai
  story: [
    { h: 0, t: "Salut. Moi, c'est Igor, le forgeron. Enfin… depuis quelques années." },
    { h: 1, t: "Avant, j'étais sportif. De haut niveau. Je m'entraînais pour les Jeux olympiques." },
    { h: 2, t: "Et puis je me suis tordu la cheville. Mal. Fini, les Jeux. Du jour au lendemain." },
    { h: 3, t: "Alors je me suis mis à la forge. Et tu sais quoi ? Je suis plutôt doué." },
    { h: 4, t: "Je fais de bons outils. Mais ce que j'aimerais vraiment apprendre, c'est forger des armes." }
  ],
  topics: [{ t: 'Tu fais quoi, à la forge ?', lines: ['Des outils, surtout. Solides. Qui durent.'] },
    { t: 'Tu vends quoi ?', lines: ['Des patrons, et de quoi bien travailler. Regarde.'], open: 'igorShop' }],
  chat: ['La cheville tient le coup, aujourd’hui.', "Un bon outil, ça se respecte."],
  questions: []
};

// Lot 9 : demandes de fabrication des habitants (une par semaine). {objet} = « 2 × Confiture de baies ». 🆕 à valider (💡 Claude).
export const CRAFT_LINES = {
  ask: "Dis, tu saurais me préparer {objet} ? Je te le revaudrai.",
  wait: "Toujours partant pour {objet} ? Rien ne presse, la semaine n'est pas finie.",
  give: "Oh, tu l'as ! Merci, ça me rend bien service.",
  done: "Merci encore pour ce que tu m'as apporté. Repasse la semaine prochaine, j'aurai sûrement autre chose à te demander.",
  none: "Pour l'instant, je n'ai besoin de rien. Mais si tu apprends à fabriquer des choses, je saurai m'en souvenir !"
};
// Lot 8 : rêves et prémonitions du héros pendant la nuit (💡 écrits par Claude, 🆕 à valider). Restent vagues :
// ils évoquent seulement ce que l'utilisateur a décrit (ferme hantée, caverne, grand arbre, forêt, cabane à rebâtir).
export const DREAMS = [
  "Je rêve que la cabane est entièrement reconstruite… et qu'une lumière brille à chaque fenêtre.",
  "Une vieille femme pleure au bout du champ. Quand je m'approche, il n'y a plus que le vent.",
  "Je marche dans la forêt. Les arbres se referment derrière moi… mais quelque chose brille tout au fond.",
  "J'entends un grondement sous la terre, très loin, du côté de la caverne. Comme si elle m'attendait.",
  "Le grand arbre de la ferme me parle. Je ne comprends pas les mots, mais sa voix est douce.",
  "Je vois mes champs couverts d'épis dorés jusqu'à l'horizon. Je me réveille presque en souriant.",
  "Un train siffle dans la nuit. Je suis sur le quai, mais cette fois, je ne monte pas.",
  "Je rêve d'une lanterne qui s'allume toute seule dans la grange… Prémonition, ou simple fatigue ?",
  "Des pas dans la poussière autour de la cabane. Au matin, je saurai peut-être à qui ils sont.",
  "Rien. Une nuit noire et paisible, sans aucun rêve. Ça fait du bien, parfois."
];
// Arrivée en train (pensées du héros, 🆕) : après un licenciement, il cherche un sens à sa vie.
export const INTRO_LINES = [
  "Après mon licenciement, j'ai voulu redonner un sens à ma vie.",
  "J'ai toujours rêvé de construire ma propre maison. Alors, quand j'ai vu l'annonce qui disait que cette cabane abandonnée était offerte à la personne qui voulait s'en occuper…",
  "Il paraît que peu de gens sont venus essayer, à cause de la fameuse rumeur comme quoi la ferme serait hantée !",
];
// Ed, le barman (décrit par l'utilisateur le 16/11) : ancien chauffeur routier, devenu barman parce qu'il aime le contact
// des gens. Rêve d'ouvrir un jour un magasin en ville (future quête). Marié à Suzie, papa de Jade. Répliques 🆕 à valider.
export const ED = {
  id: 'ed', name: 'Ed', de: 'de lui', color: '#e0a84a', voice: 'voiceChef',
  look: { folk: 'ed', body: 'h', bottom: 'pant', skin: '#e8b48c', hair: 0, hairC: '#5a3a22', hat: 'cap', beard: '#6a3a1e', shirt: '#9a9aa0', suspenders: '#6a4426', towel: true, pants: '#6a4a2a', shoes: '#5a3a22', stout: true, tall: true },   // 18/11 : poupée dessinée par le code (src/render/paperdoll.js), tenue d'après son sprite
  home: 'ed', inside: { x: 3.5, y: 4.6 }, worker: { scene: 'bar', at: { x: 10.5, y: 2.9 }, from: 660, to: 1410 },   // 💡 au bar de 11 h à 23 h 30
  traits: ['Barman du saloon', 'Ancien chauffeur routier', 'Aime le contact des gens', 'Rêve d’ouvrir un magasin en ville', 'Mari de Suzie, papa de Jade'],
  taste: { adore: [], aime: ['berry_cooked', 'confiture_baies'], naime: ['slime'], deteste: [] },   // 💡 en attendant les boissons
  story: [
    { h: 0, t: "Bienvenue au saloon ! Moi c'est Ed. Installe-toi, c'est la maison.", away: "Salut ! Moi c'est Ed, je tiens le saloon du centre-ville. Passe me voir un de ces soirs !" },   // 19/11 : 🆕 hors du saloon
    { h: 1, t: "Avant, je conduisais des camions. Des milliers de kilomètres, tout seul dans la cabine." },
    { h: 2, t: "Ce qui me manquait, c'était les gens. Alors j'ai posé le camion et j'ai ouvert ce saloon." }
  ],
  topics: [
    { t: 'Tu as besoin d’aide ?', lines: ["Toujours ! Il me faut de quoi servir : de l'alcool, des jus, des boissons…", "Si un jour tu sais en fabriquer, je t'achète tout. Promis."] },
    { t: 'Ta famille ?', lines: ["Suzie, ma femme, et notre petite Jade. On habite la grande maison au bout du quartier."] }
  ],
  chat: ["Qu'est-ce que je te sers ? …Ah, c'est vrai, la carte est encore vide.", "Un jour, j'aurai mon magasin en ville. Tu verras.", "Un bon saloon, c'est un endroit où on se sent attendu."],
  chatAway: ["Ah, une journée sans comptoir, ça fait du bien.", "Un jour, j'aurai mon magasin en ville. Tu verras.", "Jade a encore dessiné sur les murs… Suzie n'est pas ravie."],   // 19/11 : 🆕 quand il n'est pas au saloon
  questions: []
};
// Suzie (femme d'Ed) et Jade (leur enfant) : histoire à écrire plus tard (voir le carnet). Elles restent à la maison pour l'instant.
export const SUZIE = {
  id: 'suzie', name: 'Suzie', de: "d'elle", color: '#d88ab0', voice: 'voiceLuna',
  look: { folk: 'suzie', body: 'f', bottom: 'robe', skin: '#f1c7a5', hair: 4, braid: true, hairC: '#8a4a2a', shirt: '#8aa0d8', pants: '#8aa0d8', apron: '#f4eee0', apronFlowers: true, shoes: '#6a3a1e' },   // 18/11 : poupée dessinée par le code (src/render/paperdoll.js), tenue d'après son sprite
  home: 'ed', stay: true, inside: { x: 2.5, y: 3.6 },
  traits: ['Femme d’Ed', 'Maman de Jade'], taste: {},
  chat: ["Bonjour ! Vous connaissez mon mari, Ed ? Il passe ses journées au saloon.", "Jade joue en haut. Elle a toujours mille idées."],
  questions: []
};
export const JADE = {
  id: 'jade', name: 'Jade', de: "d'elle", color: '#8ad0a0', voice: 'voiceLuna',
  look: { folk: 'jade', body: 'f', bottom: 'pant', skin: '#f3c9a6', eye: '#4a2a1c', hair: 5, hairC: '#2a2234', ribbons: '#e0405a', shirt: '#f8f6f0', puffy: true, overalls: '#3a6ab0', pants: '#3a6ab0', shorts: true, socks: true, pocket: 'heart', shoes: '#d0402e', kid: true },   // 18/11 : poupée dessinée par le code (src/render/paperdoll.js), tenue d'après son sprite
  home: 'ed_etage', stay: true, inside: { x: 3.5, y: 4.6 },
  traits: ['Fille d’Ed et Suzie'], taste: {},
  chat: ["T'es qui, toi ? Moi c'est Jade !", "Papa, il dit qu'un jour il aura un magasin. Avec plein de bonbons dedans."],
  questions: []
};

export const NPCS = { luna: LUNA, chef: CHEF, franck: FRANCK, myst: MYST, hailey: HAILEY, igor: IGOR, ed: ED, suzie: SUZIE, jade: JADE };
// Luna est dehors de 8 h à 19 h, chez elle le reste du temps.
export const OUT_FROM = 480, OUT_TO = 1140;

// Quête « Ghostbuster » (décrite par l'utilisateur) : la ferme serait hantée. Pensées du héros, 🆕 à valider.
export const GHOST = { x: 22, y: 14, from: 1320, near: 2.2 };   // 💡 où et dès quelle heure (22h) l'esprit apparaît, la 3e nuit
export const GHOST_LINES = {
  n1: ['… Hou-hou… Hou-hou…', "Un hululement, dans la nuit. Sûrement une chouette… sûrement."],
  n2: ['… Hoooooou…', "Ça, ce n'était pas une chouette."],
  n3: ['… Hoooooou…', "Encore ce bruit. Cette fois, je vais voir ce qui se passe sur la ferme."],
  pleure: "On dirait… une vieille femme. Transparente. Elle pleure.",
  vanish: ["Elle a disparu dès que je me suis approché(e)…", "Il me faudrait un moyen de lui parler. Mais lequel ?"]
};

// Farmwest, lot 3 : nouveau début (répliques de Myst 🆕). Gare → diligence à travers le centre-ville → rond-point → choix de la ferme.
// Chaque arrêt de la diligence (x, en cases, dans le centre-ville) dure le temps que Myst parle.
export const INTRO_MYST = {
  gare: [
    "Bienvenue à Farmwest. Tu dois être la personne de l'annonce. Moi, c'est Myst.",
    "La diligence nous attend. Monte, je t'accompagne jusqu'aux fermes."
  ],
  legende: [
    "Tu sais pourquoi les fermes du Nord sont vides ? On raconte qu'un fantôme rôde là-haut, la nuit.",
    "Depuis, personne n'a osé s'y installer. Moi, je n'y crois pas trop."
  ],
  arrets: [
    { x: 5, t: "À droite, l'atelier du charpentier : c'est lui qui construit les bâtiments. En face, la halle du marché et le panneau d'affichage, où les habitants laissent leurs demandes." },
    { x: 11, t: "Le saloon d'Ed. Un ancien routier : il connaît tout le monde, et toutes les nouvelles passent par son comptoir." },
    { x: 17, t: "La place et sa fontaine. Manu, le Maire, y passe ses journées. Il te serrera la main… et te parlera des impôts." },
    { x: 27, t: "Là-haut, le magasin d'outils ; en face, le marchand d'animaux. Plus au sud, la rue des commerces : boulangerie, boucherie, poissonnerie et magasin général." },
    { x: 31, t: "Après le pont, c'est le rond-point. Les fermes sont juste au nord." }
  ],
  rond: [
    "Nous y voilà. Les quatre fermes du Nord sont là-haut, autour du chemin en croix.",
    "Choisis celle qui te plaît."
  ],
  fin: [
    "Bon choix. Le cocher va te déposer devant chez toi.",
    "Ta cabane ne tiendra pas la nuit. Ouvre ton sac 🎒, choisis la tente et appuie sur « Déployer », juste à côté de la cabane.",
    "Ta liste des tâches 📜, en haut à droite, te dira quoi faire. Et le plan est dans 🗺️.",
    "Moi, j'habite au fond de la zone résidentielle, à l'est du rond-point. … Et si tu entends des bruits la nuit, ce n'est sûrement rien. À plus tard."
  ]
};

// Remy Gusto, le cuistot du restaurant (décrit par l'utilisateur le 17/11). Fils abandonné d'un cuisinier renommé : partout,
// on ne voyait en lui que « le fils de », il a perdu beaucoup de concours à cause de son nom. Il est venu à Farmwest, loin de tout,
// pour vivre de sa passion. Il déteste son père ; quand celui-ci sera mort, il essaiera de percer à nouveau. Maison : zone résidentielle.
// Son four est en panne : le réparer (marteau, 30 pierres + 15 bois) rapporte le couteau (quête principale). Répliques 🆕.
export const CUISTOT = {
  id: 'cuistot', name: 'Remy Gusto', title: 'cuistot', de: 'de lui', color: '#f2a03a', voice: 'voiceFranck',
  look: { folk: 'remy', body: 'h', bottom: 'pant', skin: '#e8b48c', hair: 0, hairC: '#3a2a20', hat: 'toque', shirt: '#f4f4f0', buttons: true, bandana: '#c0392b', beard: '#a8582a', checkPants: true, pants: '#4a4a56', shoes: '#2a2a2a', stout: true },   // 18/11 : poupée dessinée par le code (src/render/paperdoll.js), tenue d'après son sprite
  home: 'remy', inside: { x: 3.5, y: 4.6 }, worker: { scene: 'resto', at: { x: 11.5, y: 4.6 }, from: 420, to: 1320 },   // 💡 en cuisine de 7 h à 22 h
  traits: ['Cuisinier du restaurant', 'Fils abandonné d’un cuisinier renommé', 'On ne voyait en lui que « le fils de »', 'Vit de sa passion, loin de tout', 'Déteste son père'],
  taste: { adore: [], aime: ['confiture_baies', 'confiture_mures'], naime: ['slime'], deteste: [] },   // 💡
  story: [
    { h: 0, t: "Remy Gusto, cuisinier. Ici, on vient pour manger, pas pour poser des questions. … Enfin, sauf toi, apparemment." },
    { h: 1, t: "Mon père est un cuisinier très connu. Il m'a abandonné quand j'étais petit." },
    { h: 2, t: "J'ai essayé de percer. Mais pour tout le monde, je n'étais que « le fils de ». Alors j'ai travaillé, encore et encore." },
    { h: 3, t: "J'ai perdu beaucoup de concours à cause de mon nom. Alors je suis venu à Farmwest, loin de tout, pour cuisiner en paix." },
    { h: 4, t: "Je le déteste pour ça. Le jour où il ne sera plus là… je retenterai ma chance. Sous mon nom." }
  ],
  topics: [{ t: 'Pourquoi Farmwest ?', h: 1, lines: ["Loin de tout. Ici, personne ne me compare à personne. Je fais juste à manger."] }],
  ask: [
    "Ah, un client ! Désolé, la cuisine est fermée… Mon four a rendu l'âme ce matin.",
    "Si tu sais manier un marteau, tu pourrais le réparer ? Il faudrait 30 pierres et 15 bois.",
    "En échange, je te donne mon vieux couteau. Il coupe encore très bien."
  ],
  reminder: "Le four, c'est par ici, au fond de la cuisine. 30 pierres et 15 bois, et un bon coup de marteau !",
  thanks: [
    "Il chauffe ! Il chauffe vraiment ! Merci !",
    "Comme promis, voici mon couteau. Pour les fleurs et les champignons, rien de mieux : une coupe nette, ça repousse mieux."
  ],
  chat: ["Le four ronronne comme au premier jour.", "Un jour, je ferai une carte avec les légumes de ta ferme."],
  questions: []
};
// Harry Fordson, le charpentier (décrit par l'utilisateur le 17/11) : charpentier de père en fils, très doué. Il a une maladie
// dont on ne sait rien, sans symptôme visible. Il aimerait se marier un jour, mais il travaille beaucoup et a beaucoup de dettes
// envers Manu, le Maire. C'est lui qui apprend à faire le coffre (quête principale). Répliques 🆕.
export const HARRY = {
  id: 'harry', name: 'Harry Fordson', title: 'charpentier', de: 'de lui', color: '#c99560', voice: 'voiceChef',
  look: { folk: 'harry', body: 'h', bottom: 'pant', skin: '#e8b48c', hair: 0, hairC: '#a86a32', hat: 'plat', shirt: '#c0392b', plaid: true, toolbelt: true, pants: '#3a5a8a', shoes: '#5a3a22', tall: true },   // 18/11 : poupée dessinée par le code (src/render/paperdoll.js), tenue d'après son sprite
  home: null, dayScene: 'town', day: { x: 7.5, y: 16.6 },   // devant son atelier
  traits: ['Charpentier de père en fils', 'Très doué', 'Malade, sans symptôme visible', 'Aimerait se marier un jour', 'Beaucoup de dettes envers Manu, le Maire'],
  taste: { adore: [], aime: ['wood'], naime: ['slime'], deteste: [] },   // 💡
  story: [
    { h: 0, t: "Harry Fordson, charpentier. Chez nous, le bois, c'est de père en fils." },
    { h: 1, t: "Mon père disait que j'avais ça dans les mains. Moi, j'aime juste le bruit du rabot." },
    { h: 2, t: "Je travaille beaucoup. Trop, sûrement. J'ai des dettes envers Manu, le Maire… et elles ne se paient pas toutes seules." },
    { h: 3, t: "Un jour, j'aimerais me marier. Encore faudrait-il que je lève le nez de mon établi." },
    { h: 4, t: "Je suis malade. Personne ne sait ce que c'est, et ça ne se voit pas. Alors je n'en parle pas." }
  ],
  topics: [{ t: 'Tu construis quoi ?', lines: ['Des bâtiments pour les fermes, et des meubles quand j’ai le temps. Regarde.'], open: 'carpenter' }],
  chest: [
    "Ta cabane tient debout ? Joli travail, pour un débutant.",
    "Tiens, je te montre comment faire un coffre. Tu y rangeras tes affaires : un vrai fermier ne garde pas tout sur son dos."
  ],
  chat: ["Le bois, ça se respecte : il a mis des années à pousser.", "Encore une commande pour Manu… Elles ne finissent jamais."],
  questions: []
};
// Lot 12 (décrit par l'utilisateur le 18/11) : Rouky, vieux monsieur qui vit de la pêche avec son chien Rox, à la cabane du pêcheur
// (ancienne station balnéaire). On ne sait pas grand-chose de lui : il semble être né ici et avoir travaillé dans les chemins de fer.
// Peu de gens viennent le voir. Le jour, il dort à côté de sa cabane ; le soir, il est chez lui. Répliques 🆕 (💡 Claude).
export const ROUKY = {
  id: 'rouky', name: 'Rouky', title: 'pêcheur', de: 'de lui', color: '#7aa6c8', voice: 'voiceChef',
  look: { folk: 'rouky', body: 'h', bottom: 'pant', skin: '#e2b08a', hair: 0, hairC: '#e8e4dc', beard: '#e8e4dc', hat: 'cap', shirt: '#5a7aa8', overalls: '#6a5a3a', pants: '#6a5a3a', shoes: '#4a3a2a', stout: true },
  home: 'rouky', inside: { x: 3.5, y: 4.6 }, worker: { scene: 'plage', at: { x: 16.5, y: 4.6 }, from: 360, to: 1080 }, napping: true,   // dort dehors le jour, chez lui le soir
  traits: ['Vieux pêcheur, vit de la pêche', 'Son chien s’appelle Rox', 'Semble être né ici', 'A travaillé dans les chemins de fer', 'Peu de gens viennent le voir'],
  taste: { adore: [], aime: [], naime: ['slime'], deteste: [] },   // 💡 à décrire
  story: [
    { h: 0, t: "Rouky. Et lui, c'est Rox. On pêche, on dort, on regarde la mer. Ça nous suffit." },
    { h: 2, t: "Les rails qui passent à la gare… J'en ai posé quelques-uns, dans le temps." },
    { h: 4, t: "Je suis né pas loin d'ici, je crois. Après un certain âge, on arrête de compter ces choses-là." }
  ],
  intro: [
    "Hm ? … Ah. De la visite. Ça faisait longtemps.",
    "Moi, c'est Rouky. Le vieux toutou, là, c'est Rox. Il a perdu son os favori et il boude depuis trois jours.",
    "Si tu lui en trouves un, je te donnerai ma vieille canne à pêche. Elle n'est pas toute jeune, mais elle attrape encore du poisson."
  ],
  need: ["Toujours pas d'os pour Rox ? Paraît qu'on en trouve en creusant les petits tas de terre, un peu partout."],
  rod: [
    "Regarde-le, il remue la queue comme un jeunot !",
    "Une promesse est une promesse : voilà ma canne. Elle est lente et les gros poissons lui échappent… mais c'est un début."
  ],
  chat: ["La mer est calme, aujourd'hui. Les poissons aussi.", "Rox ronfle plus fort que moi. Ne le lui dis pas."],
  questions: []
};
// Lot 13 (décrit par l'utilisateur le 18/11) : Golgolas, vieil elfe ermite, dans son centre caché au sud de la gare, écrasé par une
// météorite. Il a entendu parler de nos talents de bâtisseur. Répliques 🆕 (💡 Claude).
export const GOLGOLAS = {
  id: 'golgolas', name: 'Golgolas', title: 'elfe', de: 'de lui', color: '#a8c88a', voice: 'voiceFranck',
  look: { folk: 'golgolas', body: 'h' }, home: 'golgolas', stay: true, inside: { x: 21.5, y: 9.6 },
  traits: ['Vieil elfe ermite', 'Vit dans un centre caché au sud de la gare', 'Une météorite a écrasé son centre'],
  taste: { adore: [], aime: [], naime: ['slime'], deteste: [] },
  story: [{ h: 0, t: "Golgolas. Les années ont passé sur ce centre comme l'eau sur une pierre… mais la pierre, cette fois, est tombée du ciel." }],
  meteor: ["Te voilà ! Regarde ce rocher venu des étoiles : il bouche l'entrée de mon centre.", "Prends ta pioche. Il faudra des milliers de coups… mais chaque éclat fera un bon caillou."],
  need: ["Pour remettre le centre debout, il me faut beaucoup de matériaux : 500 bois, 500 pierres et 200 champignons."],
  merci: ["Merci, c'est précieux."],
  thanks: ["Le centre tient de nouveau debout ! Tu as un vrai don.", "En remerciement, mes vieux sortilèges de rangement sont à toi : tes piles tiendront plus d'objets."],
  chat: ["Le vent du sud porte l'odeur des pins. C'est bon signe."], questions: []
};
NPCS.cuistot = CUISTOT; NPCS.harry = HARRY; NPCS.rouky = ROUKY; NPCS.golgolas = GOLGOLAS;
