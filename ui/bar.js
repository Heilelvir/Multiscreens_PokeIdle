'use strict';
const root = document.getElementById('bar');

function btn(text, title, onClick, cls) {
  const b = document.createElement('button');
  b.textContent = text;
  b.title = title;
  if (cls) b.className = cls;
  b.addEventListener('click', onClick);
  return b;
}

function render(s) {
  if (!s) return;
  root.textContent = '';
  root.append(btn(`Contas ${s.count}/${s.max}`, 'Alterna entre 2 e 4 contas (Ctrl+Shift+0)', () => window.bar.action('accounts')));
  root.append(btn('Grade', 'Volta à grade (Ctrl+0)', () => window.bar.action('grid')));
  s.slots.forEach((sl, i) =>
    root.append(btn(`${sl.popped ? '⤓' : '⧉'} ${i + 1}`, sl.popped ? 'Devolve a conta à grade (Ctrl+Alt+' + (i + 1) + ')' : 'Abre a conta em janela própria (Ctrl+Alt+' + (i + 1) + ')',
      () => window.bar.action('pop', i), sl.popped ? 'on' : ''))
  );
  const sp = document.createElement('span');
  sp.className = 'sep';
  root.append(sp);
  const lv = s.lives;
  root.append(btn(lv.open ? `Lives (${lv.count}) ✓` : `Lives (${lv.count})`, 'Abre as lives com bônus, silenciadas (Ctrl+T)', () => window.bar.action('lives'),
    lv.open ? 'on' : ''));
  root.append(btn('Ajuda', 'Atalhos (F1)', () => window.bar.action('help')));
}

window.bar.onState(render);
window.bar.get().then(render);
