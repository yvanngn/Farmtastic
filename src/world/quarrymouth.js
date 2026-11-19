// 19/11 : quelle bouche de la carrière est ouverte aujourd'hui (même calcul que systems/quarry.js, sans dépendance circulaire).
const QM = [{ x: 6, y: 0 }, { x: 16, y: 0 }, { x: 26, y: 0 }];
const hash = n => { let h = (n * 2654435761) >>> 0; h = (h ^ (h >>> 15)) * 2246822519 >>> 0; return (h ^ (h >>> 13)) >>> 0; };
export const quarryDay = S => ((S.year || 1) - 1) * 120 + (S.season || 0) * 30 + (S.day || 1);
export const quarryMouthOpen = (S, x, y) => { const m = QM[hash(quarryDay(S) * 7 + 3) % QM.length]; return m.x === x && m.y === y; };
