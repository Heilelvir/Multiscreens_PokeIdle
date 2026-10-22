'use strict';
const root = document.getElementById('bar');
let editing = false; // enquanto renomeia, não redesenha a barra (senão o campo some)
let latest = null;

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function btn(label, title, onClick, { on = false, count = '', dot = false, cls = '' } = {}) {
  const b = el('button', [on ? 'on' : '', cls].filter(Boolean).join(' '));
  b.title = title;
  if (dot) b.append(el('span', 'dot'));
  b.append(label);
  if (count !== '') b.append(el('span', 'count', count));
  b.addEventListener('click', onClick);
  return b;
}

const group = (...items) => { const g = el('div', 'group'); g.append(...items); return g; };
const divider = () => el('span', 'divider');

function startRename(i, current, nameEl) {
  editing = true;
  const input = el('input');
  input.value = current;
  input.maxLength = 20;
  input.title = 'Enter salva, Esc cancela';
  nameEl.replaceWith(input);
  input.focus();
  input.select();
  const done = (save) => {
    if (!editing) return;
    editing = false;
    if (save) window.bar.action('rename', i, input.value);
    else if (latest) render(latest);
  };
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') done(true);
    else if (e.key === 'Escape') done(false);
  });
  input.addEventListener('blur', () => done(true));
}

function accountChip(sl, i) {
  const label = sl.name || `Conta ${i + 1}`;
  const chip = el('div', 'chip' + (sl.popped ? ' popped' : ''));

  const pop = btn(sl.popped ? '⤓' : '⧉',
    sl.popped ? `Devolve a conta ${i + 1} à grade (Ctrl+Alt+${i + 1})` : `Abre a conta ${i + 1} em janela própria (Ctrl+Alt+${i + 1})`,
    () => window.bar.action('pop', i));

  const name = btn(label, 'Clique para renomear', () => startRename(i, sl.name, name));
  name.firstChild.replaceWith(el('span', 'name', label)); // texto com reticências quando longo

  const mute = btn(sl.muted ? '🔇' : '🔊', sl.muted ? 'Som desligado: clique para ligar' : 'Clique para silenciar esta conta',
    () => window.bar.action('mute', i), { cls: sl.muted ? 'muted' : '' });

  const minus = btn('−', 'Diminuir o zoom (o jogo ganha mais espaço na tela)', () => window.bar.action('zoom', i, -1));
  const val = btn(`${sl.zoom}%`, 'Zoom da conta: clique para voltar a 100%', () => window.bar.action('zoom', i, 0),
    { cls: 'zoomval' + (sl.zoom !== 100 ? ' changed' : '') });
  const plus = btn('+', 'Aumentar o zoom', () => window.bar.action('zoom', i, 1));

  chip.append(pop, name, mute, minus, val, plus);
  return chip;
}

function render(s) {
  if (!s) return;
  latest = s;
  if (editing) return;
  root.textContent = '';

  const principal = group(
    btn('Contas', 'Alterna entre 2 e 4 contas (Ctrl+Shift+0)', () => window.bar.action('accounts'), { count: `${s.count}/${s.max}` }),
    btn('Grade', 'Volta à grade (Ctrl+0)', () => window.bar.action('grid'))
  );

  const contas = group(...s.slots.map(accountChip));

  const lv = s.lives;
  const extras = group(
    btn('Lives', 'Abre as lives com bônus, silenciadas (Ctrl+T)', () => window.bar.action('lives'),
      { on: lv.open, count: String(lv.count), dot: !lv.open && lv.count > 0 }),
    btn('Ajuda', 'Atalhos (F1)', () => window.bar.action('help'))
  );

  root.append(principal, divider(), contas, divider(), extras);
}

window.bar.onState(render);
window.bar.get().then(render);
