'use strict';
// Calcula o índice final de uma aba arrastada.
//   from   = posição de onde a aba saiu
//   target = posição da aba sobre a qual ela foi solta
//   before = true se soltou na metade esquerda da aba alvo
// Retorna a posição que a aba terá depois de movida (igual a `from` = nada a fazer).
function dropIndex(from, target, before) {
  const insertAt = before ? target : target + 1;
  return from < insertAt ? insertAt - 1 : insertAt;
}

if (typeof module !== 'undefined') module.exports = { dropIndex };
