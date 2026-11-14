// Bus d'événements : les systèmes n'accèdent jamais au DOM, ils émettent
// 'toast', 'pop', 'inv', 'newDay'… et l'UI écoute.
export function createBus() {
  const h = {};
  return {
    on(e, f) { (h[e] ||= []).push(f); return () => { h[e] = h[e].filter(x => x !== f); }; },
    emit(e, d) { (h[e] || []).forEach(f => f(d)); }
  };
}
