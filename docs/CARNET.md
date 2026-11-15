# Carnet de Farm'tastic

Mémoire du projet : tout ce qui a été dit, décidé, fait ou pas encore fait. À lire avant chaque séance, à compléter à la fin. On n'efface rien : une idée abandonnée passe en « Abandonné » avec la raison.

Légende : ✅ fait · 🔨 en cours · ⏳ à faire · 💡 idée de Claude (à valider) · ❌ abandonné

## 1. L'histoire et le monde (résumé)
- Jeu de ferme pixel art multijoueur, style Stardew Valley, cultures façon Hay Day. Les joueurs partagent un même village.
- Le village est à reconstruire petit à petit : au départ presque tout est fermé, on **débloque avec de l'argent** (bâtiments, commerces, animaux).
- Ton : doux, un peu d'humour. Les habitants dévoilent **lentement** leur vie et leurs ambitions au fil de l'amitié.
- Pas d'histoire inventée par Claude : seulement ce que l'utilisateur décrit (les idées de Claude vont en 💡).

## 2. Personnages
| Qui | Ce qu'on sait (dit par l'utilisateur) | État |
|---|---|---|
| Le joueur | Fermier personnalisable (homme/femme, peau, coiffure, couleurs, pantalon/jupe). | ✅ |
| **Luna** | Jeune femme célibataire, arrivée récemment. Travaillait dans l'informatique ; l'IA a remplacé son poste. Veut monter sa ferme mais doit d'abord gagner de l'argent ; pour l'instant elle essaie d'en gagner un peu. A sa maison. | ✅ lot 6 (répliques à valider) |
| Charpentier | Vend poulailler, porcherie, etc. | ⏳ lot 4 |
| Marchand d'animaux | Vend les animaux. | ⏳ lot 4 |
| Boulanger, boucher, poissonnier | Commerces pour cuisiner de bons plats plus tard. | ⏳ lot 5 |

Règle des dialogues : répliques débloquées par paliers d'amitié ; Claude livre les répliques en **liste numérotée** pour correction, et applique les corrections telles quelles.

## 3. Lots de travail
| # | Lot | État |
|---|---|---|
| 1 | Écran titre façon Witch'rok (titre lumineux qui flotte, menu de jeu), police « jeu de ferme » | ✅ 15/11/2026 |
| 2 | Inventaire : 10 objets max par case, améliorations au magasin d'amélioration | ✅ 15/11/2026 |
| 3 | Arbres (zone de bois à l'est, 3 jours, nombre max, 3 types → bois) ; pierres (mêmes règles, 2 types, les grosses = 2 pierres) | ✅ 15/11/2026 |
| 4 | Tout se débloque avec l'argent : pas de poulailler au départ, charpentier, marchand d'animaux | ✅ 15/11/2026 |
| 5 | Boulanger, boucher, poissonnier | ✅ 15/11/2026 |
| 6 | Luna et sa maison, dialogues qui distillent sa vie | ✅ 15/11/2026 (répliques à valider) |
| 7 | Demandes à **code couleur** mélangeant 4 idées : reconstruction du village (jauge commune), fête de saison, demandes des habitants (amitié), caravane commerciale (graines, animaux, outils) | ✅ 15/11/2026 |

## 4. Ce qui existe dans le jeu
- **Écran titre** : décor de ferme animé (aube, grange, silo, moulin, champ de blé, oiseaux, pollen), logo « Farm'tastic » en Lilita One doré qui flotte, « Touchez l'écran pour commencer », cascade d'étoiles, menu Continuer / Nouvelle partie / Comment jouer / Réglages, musique de titre.
- **Personnage** : personnalisation complète, marche de profil animée.
- **Ferme** : cultures en temps réel (blé, maïs, carotte ; pluie +25 %), bois/pierre, gros rochers, XP de minage (10 niveaux), forge (Cuivre → Iridium), énergie.
- **Inventaire** : 12 cases au départ (+6 par achat, max 36) ; **10 objets max par case** (25 bois = 3 cases). Magasin d'amélioration au village : sac plus grand, piles 10 → 20 → 30 → 50 → 99 (800 / 2 000 / 4 500 / 9 000 🪙).
- **Bois de l'est** (à partir de la colonne 34) : 3 essences, **chêne, sapin, bouleau**, qui donnent toutes 3 à 5 bois. Chaque nuit, jusqu'à 4 pousses apparaissent au hasard, sans dépasser **70 arbres** dans le bois. Une pousse devient arbuste puis petit arbre, et elle est adulte au bout de **3 jours** ; avant ça, la hache refuse (« pousse encore (n j) »). Le sapin reste vert l'hiver, le bouleau perd ses feuilles.
- **Pierres du bois** : la petite pierre donne **1 pierre**, la plus grosse **2 pierres**. Chaque nuit, jusqu'à 3 pierres sont prévues, sans dépasser **30** ; elles sortent de terre **3 jours** plus tard. Rien ne repousse sur la ferme elle-même : on la défriche une fois pour toutes.
- **Départ** : ni poulailler, ni animaux. L'enclos est agrandi jusqu'au bois. Il garde trois emplacements balisés (piquets, cordeau, panneau) au nord.
- **Charpentier** (village, en bas à gauche) : poulailler (3 000 🪙, 40 🪵, 10 🪨, 8 places, poules et lapins), porcherie (5 000 🪙, 60 🪵, 20 🪨, 6 places, cochons), bergerie (8 000 🪙, 80 🪵, 30 🪨, 6 places, moutons). Les prix ont été doublés à la demande de l'utilisateur. Chaque bâtiment a son intérieur : la porcherie (boue, foin, mangeoire) et la bergerie (grange rouge, longue mangeoire, foin). La mangeoire ne nourrit que les animaux de son bâtiment. Le bâtiment apparaît tout de suite sur son emplacement.
- **Marchand d'animaux** (village, en bas à droite) : poule, lapin, cochon, mouton, chat. Il faut le bon bâtiment, avec de la place ; le chat vit en liberté.
- **Cochon** : produit une truffe (160 🪙) tous les 2 jours s'il est nourri au foin.
- **Village agrandi vers le sud**, avec trois commerces : **boulangerie** (pain, croissant, farine), **boucherie** (bœuf, jambon, saucisse), **poissonnerie** (poisson, crevettes, saumon). Le pain et le croissant se mangent ; le reste servira à la cuisine.
- **Plus de « Boutique » dans le menu** : les graines s'achètent à l'**étal de la halle du marché**, le foin chez le **marchand d'animaux**. Chaque commerce a un bouton ×5.
- **Luna** : sa petite maison mauve est au bord du chemin, près du portail du village. On y trouve des cartons de déménagement, un lit, une plante et une table. Elle est dehors devant chez elle de 8 h à 19 h, et chez elle le soir. On lui parle avec le bouton d'action, et on lui offre l'objet qu'on tient en main (un cadeau par jour).
- **Dialogues** : une bulle en bas de l'écran, avec le nom en couleur, un ▸ qui clignote, et un bouton « Passer ». Sur téléphone, la caméra remonte pour que la bulle ne cache personne. Chaque PNJ a une petite voix.
- **Amitié** : parler rapporte 20 points par jour, un cadeau 20 (80 s'il est aimé), et 250 points font 1 cœur. Luna dévoile au plus **une réplique d'histoire par jour**, débloquée selon ses cœurs ; une fois tout dit, elle fait la conversation.
- **Panneau d'affichage (lot 7)** : 6 demandes en 4 familles à code couleur.
  - 🔨 **Chantier du village** (orange) : bois, pierre, clôtures. Chaque objet livré remplit la jauge du chantier en cours : lampadaires (60), puis place du marché (120), puis vieux pont (200). Un chantier fini rapporte une prime.
  - 🎉 **Fête de saison** (rose) : produits de la ferme. Il faut réunir 50 objets avant la fin de la saison (prime de 500 🪙) ; la jauge repart à zéro à chaque saison.
  - 💚 **Demande d'un habitant** (vert) : un objet qu'il aime ou adore, avec +40 d'amitié.
  - 🐪 **Caravane commerciale** (or) : moins d'argent, mais des **jetons**. Ils s'échangent contre des graines de carotte (2), de maïs (4), des lapins (5), des cochons (6), des moutons (8) et les plans de forge Or et Iridium (10).
  - Une demande ne réclame jamais un objet qu'on ne peut pas encore produire.
- **Départ d'une nouvelle partie** : seules les graines de blé, les poules et le chat sont disponibles ; tout le reste vient de la caravane. Une ancienne sauvegarde garde tout débloqué.
- **Goûts des habitants par degrés** : adore +80, aime +45, neutre +20, n'aime pas −20, déteste −40. Le goût est découvert en offrant l'objet, et s'affiche ensuite dans la fiche du menu (onglet Liens).
- **Questions à réponses** : une discussion sur trois, Luna pose une question à 2 ou 3 réponses (touches 1-2-3). Chaque question ne se pose qu'une fois, et l'effet reste faible (−8 à +12) pour que l'amitié avance lentement.
- **Fiche des habitants** (onglet Liens) : nom, cœurs, points vers le prochain cœur, discussion et cadeau du jour, goûts découverts par degré, nombre de goûts encore à découvrir, et ce qu'on sait de sa vie.
- **Bâtiments** : maison (lit), poulailler (mangeoire). **Village** : halle du marché (marché entre joueurs), panneau d'affichage (6 demandes, renouvelées toutes les 2 h réelles), magasin d'amélioration, fontaine.
- **Animaux** : poule, lapin, mouton, chat à caresser.
- **Monde** : temps, saisons, météo, nuit éclairée, particules, combat (slimes la nuit), carte zoomable.
- **Commandes** : joystick, bouton d'action intelligent (maintenir = répéter), roues outils/sac.
- **Son** : musiques par ambiance, bruitages, réglages séparés.
- **Technique** : sauvegarde auto 30 s + manuelle, multijoueur Supabase prêt mais pas branché (jeu solo, sauvegarde locale).

## 4 bis. Répliques de Luna (à valider par l'utilisateur)
Paliers : il faut le nombre de cœurs indiqué pour qu'elle en parle.
1. (0 ♥) Oh, bonjour ! Je m'appelle Luna. Je viens d'emménager dans la petite maison, là.
2. (0 ♥) Tout est encore dans les cartons. Je ne sais même plus où j'ai rangé la bouilloire.
3. (0 ♥) C'est toujours aussi calme, par ici ? Ça me change de la ville.
4. (1 ♥) Avant d'arriver, je travaillais dans l'informatique. Toute la journée devant des écrans.
5. (1 ♥) Je n'avais jamais vu un vrai champ de blé de près. C'est beau, en fait.
6. (2 ♥) Mon poste a été remplacé par une IA. Du jour au lendemain.
7. (2 ♥) Le pire, c'est qu'elle fait mon ancien travail mieux que moi. Ça pique un peu.
8. (3 ♥) Alors j'ai décidé de tout recommencer ici. Mon rêve, ce serait d'avoir ma propre ferme.
9. (3 ♥) Des poules, un potager… quelque chose de vrai, que je fais de mes mains.
10. (4 ♥) Mais pour l'instant, je n'ai presque rien de côté. Il faut d'abord que je gagne un peu d'argent.
11. (4 ♥) Je prends tous les petits boulots que je trouve. Un jour, j'aurai ma ferme. Promis.
12. (conversation) Bonne journée ! Ne travaille pas trop, hein.
13. (conversation) Tu sens cette odeur d'herbe ? Je ne m'en lasse pas.
14. (cadeau) Oh, pour moi ? Merci, c'est vraiment gentil.
15. (deuxième cadeau du jour) Tu m'as déjà fait un cadeau aujourd'hui !
16. (soir, non utilisée pour l'instant) Il est tard… on se voit demain ?

### Questions de Luna (à valider)
17. (0 ♥) Dis… tu crois qu'on peut vraiment vivre de la terre, aujourd'hui ?
   a. Bien sûr, il faut juste de la patience. (+12) → « Tu as raison. La patience, ça s'apprend. »
   b. Ça dépend de la météo… et de la chance. (+5) → « Ha ! Alors je vais prier pour le soleil. »
   c. Franchement ? Non. (−8) → « Ah… merci pour l'encouragement. »
18. (1 ♥) Tu n'as jamais l'impression que les machines vont tout faire à notre place ?
   a. Pas planter des carottes avec amour, en tout cas. (+12) → « Ha ! J'aime bien cette idée. »
   b. Si, et ça me fait un peu peur aussi. (+8) → « Au moins, on est deux. »
   c. Tant mieux, je ferai la sieste. (−5) → « Facile à dire quand on a encore son travail… »
19. (2 ♥) Si tu avais une ferme de rêve, tu y mettrais quoi en premier ?
   a. Des poules, évidemment. (+12) → « Pareil ! On est faits pour s'entendre. »
   b. Un grand potager. (+10) → « Bon choix. Les carottes ne répondent jamais. »
   c. Un hamac. (+3) → « … Je note. Le hamac. »
### Réactions aux cadeaux (à valider)
20. (adore) Des graines ?! Pour mon futur potager ? Tu es un amour !
21. (aime) Oh, merci ! Ça me fait vraiment plaisir.
22. (n'aime pas) Ah… merci. Je vais bien lui trouver une utilité.
23. (déteste) Euh… c'est gluant. Tu peux le reprendre ?
(La réplique 14 « Oh, pour moi ? Merci… » est remplacée par ces réactions.)

## 5. Contradictions et points à trancher
- ✅ Réglé au lot 4 : le poulailler n'existe plus au départ, et les animaux ne se vendent plus que chez le marchand d'animaux. Une ancienne sauvegarde garde son poulailler, et sa bergerie si elle avait des moutons.
- ✅ Réglé au lot 5 : la porcherie et la bergerie ont leur intérieur, et la Boutique du menu est supprimée.
- **Bug corrigé (lot 5)** : la halle du marché plantait à l'ouverture (variable manquante) depuis le début. Elle affiche maintenant l'étal de graines, puis le marché entre joueurs (ou « hors ligne »).
- **Vente** : les commerces ne rachètent rien ; on vend tout au bac près de la maison. L'utilisateur y réfléchira plus tard (15/11/2026).
- **Anciennes sauvegardes** : avec les piles de 10, un ancien sac (piles jusqu'à 99) peut dépasser le nombre de cases. Rien n'est perdu, mais on ne peut plus rien ramasser tant qu'on n'a pas vendu ou acheté une amélioration.
- **Nom de la page** : l'artefact claude.ai s'appelle encore « Moteur Ferme » dans la liste, alors que le jeu s'appelle Farm'tastic.

- **Gros rochers** : ils existaient avant le lot 3 (pioche Cuivre, 8 à 12 pierres). Je les ai gardés dans la carte de départ, en plus des 2 types de pierres demandés, mais ils ne réapparaissent pas. → à confirmer : les garder, les faire repousser ou les retirer.
- **Pierres « mêmes règles » que les arbres** : mon interprétation, c'est qu'une pierre met 3 jours à réapparaître (elle est prévue, puis sort de terre au bout de 3 jours), au lieu de grandir à vue comme un arbre. À valider.
- **Moins de pierres qu'avant** : une pierre donnait 2 à 4 pierres, maintenant 1 ou 2. La forge demande 15, 30, 45 puis 60 pierres par amélioration : la progression sera plus lente. À équilibrer si c'est trop long.
- **Anciennes sauvegardes** : le bois peut contenir plus de 70 arbres (ancienne génération plus dense). Rien ne repousse tant qu'on n'est pas repassé sous la limite.

## 6. Idées de Claude (💡 à valider)
- Sous-titre de l'écran titre : « ✦ une ferme à partager ✦ » (déjà affiché, à garder ou retirer).
- **Goûts de Luna** (tirés de sa personnalité : ancienne informaticienne, rêve de ferme, budget serré, retape sa maison) : adore les graines de carotte et de blé ; aime le pain, le croissant et le bois ; n'aime pas la pierre ni le foin ; déteste la gelée. Il n'existe pas encore de fleurs ni de bijoux à offrir.
- **Lot 7** : noms et objectifs des chantiers, primes, nom des fêtes, coûts en jetons de la caravane, poids de chaque famille de demandes.
- **Luna** : son apparence (cheveux longs foncés, haut vert), sa maison mauve, ses horaires, le détail de la bouilloire, de la ville, du champ de blé et des petits boulots. Elle n'a pas encore de cadeau préféré : dis-moi ce qu'elle aime et déteste.
- Produits et prix des trois commerces, l'étal de graines à la halle, le foin chez le marchand d'animaux.
- Cochon et truffe (pour que la porcherie serve à quelque chose), les prix et le nombre de places des bâtiments, leur position au nord de l'enclos, la bergerie pour les moutons.
- Noms des essences (chêne, sapin, bouleau) et leurs looks : choisis par Claude, l'utilisateur avait seulement demandé « 3 types ».
- Enseigne « AMÉLIORATIONS » et échoppe à toit d'ardoise pour le magasin ; pas encore de marchand dedans (un PNJ pourra y être placé si l'utilisateur en décrit un).

## 7. Abandonné
- Piles de 99 objets dès le départ (remplacées par 10 par case, lot 2).
