'use strict';
const root = document.getElementById('bar');
let editing = false; // enquanto renomeia, não redesenha a barra (senão o campo some)
let latest = null;
let nameEls = [];
let clickTimer = null;

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function btn(label, title, onClick, { on = false, count = '', dot = false, cls = '', disabled = false } = {}) {
  const b = el('button', [on ? 'on' : '', cls].filter(Boolean).join(' '));
  b.title = title;
  b.disabled = disabled;
  if (dot) b.append(el('span', 'dot'));
  b.append(label);
  if (count !== '') b.append(el('span', 'count', count));
  b.addEventListener('click', onClick);
  return b;
}

const group = (...items) => { const g = el('div', 'group'); g.append(...items); return g; };
const divider = () => el('span', 'divider');

function startRename(i, current, nameEl) {
  if (editing || !nameEl) return;
  editing = true;
  const input = el('input');
  input.value = current;
  input.maxLength = 20;
  input.title = latest.t.barRenameTip;
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

function tab(sl, i, s) {
  const T = s.t;
  const label = sl.name || `${T.session} ${i + 1}`;
  const box = el('div', 'tab' + (i === s.selected ? ' selected' : '') + (sl.popped ? ' popped' : ''));

  const name = el('span', 'name', label);
  name.title = T.barTabTip;
  name.addEventListener('click', () => { // clique simples espera um instante, para não atrapalhar o duplo clique
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => window.bar.action('tab', i), 220);
  });
  name.addEventListener('dblclick', () => { clearTimeout(clickTimer); startRename(i, sl.name, name); });
  box.addEventListener('contextmenu', (e) => { e.preventDefault(); window.bar.action('ctx', i); });
  nameEls[i] = name;

  const mute = btn(sl.muted ? '🔇' : '🔊', sl.muted ? T.barUnmuteTip : T.barMuteTip, () => window.bar.action('mute', i), { cls: sl.muted ? 'muted' : '' });
  const close = btn('✕', s.count > 1 ? T.barCloseTip : T.barLastTip, () => window.bar.action('close', i), { disabled: s.count <= 1 });
  box.append(name, mute, close);
  return box;
}

function tools(sl, i, s) {
  const T = s.t;
  const box = el('div', 'tools');
  box.append(
    btn('−', T.barZoomOutTip, () => window.bar.action('zoom', i, -1)),
    btn(`${sl.zoom}%`, T.barZoomResetTip, () => window.bar.action('zoom', i, 0), { cls: 'zoomval' + (sl.zoom !== 100 ? ' changed' : '') }),
    btn('+', T.barZoomInTip, () => window.bar.action('zoom', i, 1)),
    btn('↻', T.barReloadTip, () => window.bar.action('reload', i)),
    btn(sl.popped ? '⤓' : '⧉', sl.popped ? T.barPopInTip : T.barPopTip, () => window.bar.action('pop', i), { on: sl.popped })
  );
  return box;
}

function render(s) {
  if (!s) return;
  latest = s;
  if (editing) return;
  document.documentElement.lang = s.lang === 'en' ? 'en' : 'pt-BR';
  const T = s.t;
  root.textContent = '';
  nameEls = [];

  const full = s.count >= s.max;
  const tabs = group(
    ...s.slots.map((sl, i) => tab(sl, i, s)),
    btn('+', full ? T.barLimitTip : T.barAddTip, () => window.bar.action('add'), { disabled: full })
  );
  const sel = s.slots[s.selected];

  const lv = s.lives;
  root.append(
    btn('☰', T.barMenuTip, () => window.bar.action('menu'), { cls: 'menu' }),
    btn(T.barGrid, T.barGridTip, () => window.bar.action('grid'), { on: s.focused === null }),
    divider(),
    tabs,
    divider(),
    sel ? tools(sel, s.selected, s) : el('span'),
    el('span', 'grow'),
    btn(T.barLives, T.barLivesTip, () => window.bar.action('lives'), { on: lv.open, count: String(lv.count), dot: !lv.open && lv.count > 0 })
  );
}

window.bar.onState(render);
window.bar.onRename((i) => { if (latest && latest.slots[i]) startRename(i, latest.slots[i].name, nameEls[i]); });
window.bar.get().then(render);
