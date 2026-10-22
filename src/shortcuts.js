'use strict';
// Mapa de atalhos em um só lugar. Para trocar uma tecla, edite aqui.
//   F1…F4  mostrar só a sessão 1…4 (de novo = grade)      F5   grade
//   F6     nova sessão      F7  fechar a sessão atual      F8   alternar 2 ↔ 4 sessões
//   F9     lives            F11 tela cheia                 F12  ajuda
//   Shift+F1…F4  janela própria   Ctrl+Shift+F1…F4  resetar dados
//   Ctrl+R recarregar   Ctrl+Shift+R recarregar todas (sem cache)   Ctrl+Alt+←/→ mover
const SINGLE = { 5: 'grid', 6: 'add', 7: 'close', 8: 'count', 9: 'lives', 11: 'fullscreen', 12: 'help' };

function resolve(i) {
  const m = /^F(\d{1,2})$/.exec(i.code || '');
  if (m) {
    const n = Number(m[1]);
    const session = n >= 1 && n <= 4;
    if (!i.control && !i.alt && !i.shift && !i.meta) {
      if (session) return { a: 'focus', n };
      if (SINGLE[n]) return { a: SINGLE[n] };
    }
    if (i.shift && !i.control && !i.alt && session) return { a: 'pop', n };
    if (i.control && i.shift && !i.alt && session) return { a: 'reset', n };
    return null; // inclui Alt+F4 (fechar janela do Windows), que não é nosso
  }
  if (i.control && !i.alt && !i.meta && i.code === 'KeyR') return { a: i.shift ? 'reloadAll' : 'reload' };
  if (i.control && i.alt && !i.shift && (i.code === 'ArrowLeft' || i.code === 'ArrowRight')) {
    return { a: 'move', dir: i.code === 'ArrowLeft' ? -1 : 1 };
  }
  return null;
}

module.exports = { resolve };
