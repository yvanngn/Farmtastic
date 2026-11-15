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
| **Luna** | Jeune femme célibataire, arrivée récemment. Travaillait dans l'informatique ; l'IA a remplacé son poste. Veut monter sa ferme mais doit d'abord gagner de l'argent ; pour l'instant elle essaie d'en gagner un peu. A sa maison. | ⏳ lot 6 |
| Charpentier | Vend poulailler, porcherie, etc. | ⏳ lot 4 |
| Marchand d'animaux | Vend les animaux. | ⏳ lot 4 |
| Boulanger, boucher, poissonnier | Commerces pour cuisiner de bons plats plus tard. | ⏳ lot 5 |

Règle des dialogues : répliques débloquées par paliers d'amitié ; Claude livre les répliques en **liste numérotée** pour correction, et applique les corrections telles quelles.

## 3. Lots de travail
| # | Lot | État |
|---|---|---|
| 1 | Écran titre façon Witch'rok (titre lumineux qui flotte, menu de jeu), police « jeu de ferme » | ✅ 15/11/2026 |
| 2 | Inventaire : 10 objets max par case, améliorations au magasin d'amélioration | ✅ 15/11/2026 |
| 3 | Arbres (zone de bois à l'est, 3 jours, nombre max, 3 types → bois) ; pierres (mêmes règles, 2 types, les grosses = 2 pierres) | ⏳ |
| 4 | Tout se débloque avec l'argent : pas de poulailler au départ, charpentier, marchand d'animaux | ⏳ |
| 5 | Boulanger, boucher, poissonnier | ⏳ |
| 6 | Luna et sa maison, dialogues qui distillent sa vie | ⏳ |
| 7 | Demandes à **code couleur** mélangeant 4 idées : reconstruction du village (jauge commune), fête de saison, demandes des habitants (amitié), caravane commerciale (graines, animaux, outils) | ⏳ |

## 4. Ce qui existe dans le jeu
- **Écran titre** : décor de ferme animé (aube, grange, silo, moulin, champ de blé, oiseaux, pollen), logo « Farm'tastic » en Lilita One doré qui flotte, « Touchez l'écran pour commencer », cascade d'étoiles, menu Continuer / Nouvelle partie / Comment jouer / Réglages, musique de titre.
- **Personnage** : personnalisation complète, marche de profil animée.
- **Ferme** : cultures en temps réel (blé, maïs, carotte ; pluie +25 %), bois/pierre, gros rochers, XP de minage (10 niveaux), forge (Cuivre → Iridium), énergie.
- **Inventaire** : 12 cases au départ (+6 par achat, max 36) ; **10 objets max par case** (25 bois = 3 cases). Magasin d'amélioration au village : sac plus grand, piles 10 → 20 → 30 → 50 → 99 (800 / 2 000 / 4 500 / 9 000 🪙).
- **Bâtiments** : maison (lit), poulailler (mangeoire). **Village** : halle du marché (marché entre joueurs), panneau d'affichage (6 demandes, renouvelées toutes les 2 h réelles), magasin d'amélioration, fontaine.
- **Animaux** : poule, lapin, mouton, chat à caresser.
- **Monde** : temps, saisons, météo, nuit éclairée, particules, combat (slimes la nuit), carte zoomable.
- **Commandes** : joystick, bouton d'action intelligent (maintenir = répéter), roues outils/sac.
- **Son** : musiques par ambiance, bruitages, réglages séparés.
- **Technique** : sauvegarde auto 30 s + manuelle, multijoueur Supabase prêt mais pas branché (jeu solo, sauvegarde locale).

## 5. Contradictions et points à trancher
- **Poulailler** : il existe dès le départ (avec une poule dans la sauvegarde neuve), alors qu'il doit être acheté au charpentier. → à corriger au lot 4.
- **Animaux** : la Boutique du menu vend encore les animaux ; ils doivent passer chez le marchand d'animaux. → lot 4.
- **Anciennes sauvegardes** : avec les piles de 10, un ancien sac (piles jusqu'à 99) peut dépasser le nombre de cases. Rien n'est perdu, mais on ne peut plus rien ramasser tant qu'on n'a pas vendu ou acheté une amélioration.
- **Nom de la page** : l'artefact claude.ai s'appelle encore « Moteur Ferme » dans la liste, alors que le jeu s'appelle Farm'tastic.

## 6. Idées de Claude (💡 à valider)
- Sous-titre de l'écran titre : « ✦ une ferme à partager ✦ » (déjà affiché, à garder ou retirer).
- Enseigne « AMÉLIORATIONS » et échoppe à toit d'ardoise pour le magasin ; pas encore de marchand dedans (un PNJ pourra y être placé si l'utilisateur en décrit un).

## 7. Abandonné
- Piles de 99 objets dès le départ (remplacées par 10 par case, lot 2).
