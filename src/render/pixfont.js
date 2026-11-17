// Petite police pixel (3 × 5) pour les enseignes et panneaux dessinés dans le décor :
// nette à tout zoom, contrairement à une police du navigateur réduite à 6-8 px.
const G = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111',
  F: '111100110100100', G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010',
  K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010',
  P: '110101110100100', Q: '010101101111011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
  U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101', Y: '101101010010010',
  Z: '111001010100111', '-': '000000111000000', "'": '010010000000000', '.': '000000000000010', ' ': '000000000000000',
  '→': '000010111010000', '0': '111101101101111', '1': '010110010010111', '2': '110001010100111', '3': '110001010001110'
};
const ACCENT = { 'É': 'E', 'È': 'E', 'Ê': 'E', 'À': 'A', 'Ç': 'C', 'Ô': 'O', 'Û': 'U', 'Î': 'I' };
export const pixTextWidth = t => Math.max(0, [...t].length * 4 - 1);
// Écrit le texte centré sur cx, haut des lettres en y (accents dessinés au-dessus, en y-1).
export function pixText(R, text, cx, y, col) {
  const s = [...String(text).toUpperCase()];
  let x = Math.round(cx - pixTextWidth(s.join('')) / 2);
  for (const ch of s) {
    const base = ACCENT[ch] || ch, g = G[base] || G[' '];
    for (let i = 0; i < 15; i++) if (g[i] === '1') R(x + i % 3, y + (i / 3 | 0), 1, 1, col);
    if (ch === 'É') R(x + 1, y - 2, 2, 1, col); else if (ch === 'È' || ch === 'À') R(x, y - 2, 2, 1, col);
    else if ('ÊÔÛÎ'.includes(ch)) { R(x + 1, y - 2, 1, 1, col); R(x, y - 1, 1, 1, col); R(x + 2, y - 1, 1, 1, col); }
    else if (ch === 'Ç') R(x + 1, y + 5, 1, 1, col);
    x += 4;
  }
}
// Enseigne en bois : cadre sombre, fond doré, texte pixel ; s'élargit selon le texte.
// Les enseignes cuites dans le décor sont aussi notées ici, pour que le rendu réécrive leur texte net, à la résolution de l'écran.
export const SIGN_SINK = { list: null };
export function signBoard(R, cx, y, text, minW = 0) {
  const w = Math.max(minW, pixTextWidth(text) + 8);
  if (SIGN_SINK.list) SIGN_SINK.list.push({ x: Math.round(cx - w / 2), y, w, h: 10, text: String(text) });
  R(Math.round(cx - w / 2), y, w, 10, '#3f2615'); R(Math.round(cx - w / 2) + 1, y + 1, w - 2, 8, '#e8c26a');
  R(Math.round(cx - w / 2) + 1, y + 1, w - 2, 1, '#f6dc94');
  pixText(R, text, cx, y + 3, '#3b2414');
}
