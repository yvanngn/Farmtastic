// Habitants. story = répliques qui dévoilent leur vie, une nouvelle par jour au plus,
// débloquées par paliers d'amitié (h = cœurs requis). chat = petites phrases une fois tout dit.
// Toutes les répliques sont à faire valider par l'utilisateur (liste numérotée dans docs/CARNET.md).
export const LUNA = {
  id: 'luna', name: 'Luna', color: '#c9a0ff', voice: 'voiceLuna',
  look: { body: 'f', bottom: 'pant', skin: '#f1c7a5', hair: 1, hairC: '#3a2a3e', shirt: '#5aa88a', pants: '#4a4a6a' },
  home: 'luna', day: { x: 21.5, y: 33.2 }, inside: { x: 5.5, y: 4.6 },
  loves: [], hates: [],
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
  thanks: "Oh, pour moi ? Merci, c'est vraiment gentil.",
  already: "Tu m'as déjà fait un cadeau aujourd'hui !",
  night: "Il est tard… on se voit demain ?"
};
export const NPCS = { luna: LUNA };
// Luna est dehors de 8 h à 19 h, chez elle le reste du temps.
export const OUT_FROM = 480, OUT_TO = 1140;
