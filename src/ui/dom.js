export const $ = s => document.querySelector(s);

let toastT;
export function toast(t) {
  const el = $('#toast');
  el.textContent = t; el.style.display = 'block'; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  clearTimeout(toastT); toastT = setTimeout(() => { el.style.display = 'none'; }, 2200);
}
