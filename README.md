# Moteur Ferme

Moteur de jeu de ferme pixel art multijoueur (style Stardew Valley, cultures façon Hay Day), en JavaScript natif (modules ES), sans build.

## Lancer
- `npm run serve` puis http://localhost:8080 (les modules ES exigent un serveur, pas `file://`).
- GitHub Pages fonctionne tel quel.

## Supabase
1. Authentication → activer **Anonymous sign-ins**.
2. SQL Editor → exécuter `supabase_schema.sql`.
3. Renseigner `SUPABASE_URL` et `SUPABASE_KEY` (clé anon) dans `src/config.js`.
Sans configuration : jeu solo, sauvegarde locale.

## Arborescence
```
src/
  config.js         réglages (Supabase, temps, autosave, réseau)
  data/             registres : items, crops, recipes, animals, look
  core/             état sauvegardé (state), contexte de jeu (game), bus d'événements
  world/map.js      zones, collisions, génération déterministe
  systems/          logique pure, SANS DOM : farming, animals, resources, combat,
                    economy, inventory, player, social, time, weather, movement, actions
  net/              supabase (auth), save (adaptateurs local/cloud), multiplayer (Realtime)
  render/           sprites procéduraux, sol pré-rendu, renderer (caméra, culling, tri Y)
  ui/               hud, menu, customize, input, dom
  main.js           assemble tout + boucle de jeu
tests/              un fichier par système (node:test)
```

## Tests
- Tout : `npm test`
- Un système : `node --test tests/farming.test.js`
- Les systèmes reçoivent `rnd` et `now` injectables (voir `tests/helpers.js`) → tests déterministes, sans navigateur.

## Étendre
- Objet / culture / recette / animal : ajouter une entrée dans `src/data/`.
- PNJ : `Engine.registerNPC({ id, name, look, x, y, dialog: [...], loves: [...] })`.
- Nouveau système : fichier dans `src/systems/` (fonctions `(g, ...)`, événements via `g.bus`), appel dans la boucle de `main.js`, test dans `tests/`.
