// Configuration globale du moteur. Seul fichier à modifier pour brancher Supabase.
export const CFG = {
  SUPABASE_URL: '',
  SUPABASE_KEY: '',
  WORLD: 'monde-principal',  // nom du canal multijoueur
  T: 16,                     // taille d'une tuile (px)
  W: 48, H: 36,              // taille de la carte (tuiles)
  AUTOSAVE_MS: 30000,        // sauvegarde auto
  NET_MS: 100,               // 10 envois réseau / s max
  MS_PER_MIN: 700,           // 1 min de jeu = 0,7 s réelle
  DAY_START: 360,            // 6h00
  DAY_END: 1560,             // 2h00 : évanouissement
  SLEEP_FROM: 1080,          // dormir possible dès 18h
  NIGHT_FROM: 1200,          // monstres dès 20h
  INV_SLOTS: 12,             // places du sac au départ
  INV_MAX: 36,               // places max après agrandissements
  VERSION: 1,
  LSKEY: 'ferme_save_v1'
};
