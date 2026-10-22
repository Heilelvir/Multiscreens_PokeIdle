'use strict';
const root = document.getElementById('bar');

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function btn(label, title, onClick, { on = false, count = '', dot = false } = {}) {
  const b = el('button', on ? 'on' : '');
  b.title = title;
  if (dot) b.append(el('span', 'dot'));
  b.append(label);
  if (count !== '') b.append(el('span', 'count', count));
  b.addEventListener('click', onClick);
  return b;
}

const group = (...items) => { const g = el('div', 'group'); g.append(...items); return g; };
const divider = () => el('span', 'divider');

function render(s) {
  if (!s) return;
  root.textContent = '';

  const principal = group(
    btn('Contas', 'Alterna entre 2 e 4 contas (Ctrl+Shift+0)', () => window.bar.action('accounts'), { count: `${s.count}/${s.max}` }),
    btn('Grade', 'Volta à grade (Ctrl+0)', () => window.bar.action('grid'))
  );

  const janelas = group(
    ...s.slots.map((sl, i) =>
      btn(`${sl.popped ? '⤓' : '⧉'} ${i + 1}`,
        sl.popped ? `Devolve a conta ${i + 1} à grade (Ctrl+Alt+${i + 1})` : `Abre a conta ${i + 1} em janela própria (Ctrl+Alt+${i + 1})`,
        () => window.bar.action('pop', i), { on: sl.popped }))
  );

  const lv = s.lives;
  const extras = group(
    btn('Lives', 'Abre as lives com bônus, silenciadas (Ctrl+T)', () => window.bar.action('lives'),
      { on: lv.open, count: String(lv.count), dot: !lv.open && lv.count > 0 }),
    btn('Ajuda', 'Atalhos (F1)', () => window.bar.action('help'))
  );

  root.append(principal, divider(), janelas, divider(), extras);
}

window.bar.onState(render);
window.bar.get().then(render);
