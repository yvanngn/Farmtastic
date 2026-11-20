// 19/11 : numéro du jour pour la carrière (les gros cailloux repoussent au bout de quelques jours).
// 21/11 : les bouches vers l'ancienne carrière profonde sont retirées (le dédale profond du lot 30 la remplace).
export const quarryDay = S => ((S.year || 1) - 1) * 120 + (S.season || 0) * 30 + (S.day || 1);
