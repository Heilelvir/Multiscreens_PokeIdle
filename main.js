'use strict';
const path = require('path');
const { app, BaseWindow, WebContentsView, BrowserWindow, ipcMain, dialog, Notification, nativeImage } = require('electron');
const cfg = require('./src/config');
const sec = require('./src/security');
const { createLives } = require('./src/lives');

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();

// Idle game: não deixar o Chromium tratar quadrantes sem foco como "ocultos"
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');
app.commandLine.appendSwitch('disable-renderer-backgrounding');

const APP_ICON = nativeImage.createFromPath(path.join(__dirname, 'assets', 'icon.png')); // ícone da janela/barra de tarefas
const BAR_H = 36;

// ---------- preferências por conta (nome, som, zoom): ficam salvas por id de conta ----------
let slotPrefs = {};
const clampZoom = (z) => Math.min(2, Math.max(0.5, Math.round(z * 10) / 10));
const cleanName = (v) => String(v).replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, 20);
function getPrefs(id) {
  const p = slotPrefs[id] || {};
  return { name: typeof p.name === 'string' ? cleanName(p.name) : '', muted: p.muted === true, zoom: Number.isFinite(p.zoom) ? clampZoom(p.zoom) : 1 };
}
function setPrefs(id, patch) {
  slotPrefs = { ...slotPrefs, [id]: { ...getPrefs(id), ...patch } };
  cfg.save({ slotPrefs });
}
function applyPrefs(s) {
  const wc = s.view.webContents;
  if (wc.isDestroyed()) return;
  const p = getPrefs(s.id);
  wc.setAudioMuted(p.muted);
  wc.setZoomFactor(p.zoom);
}
const slotTitle = (s) => `PokeMulti: ${getPrefs(s.id).name || 'conta ' + s.id}`;
const MAX_COLS = 2;

let mainWin = null;
let barView = null;
let helpWin = null;
let lives = null;
let focused = null; // null = grade; índice em `slots` = só essa conta em tela cheia
const slots = []; // [{ id, view, win }]  win = janela própria quando a conta está "destacada"

// ---------- barra superior ----------
const BAR_ACTIONS = new Set(['accounts', 'grid', 'lives', 'help', 'pop', 'mute', 'zoom', 'rename']);

function barState() {
  return {
    count: slots.length,
    max: cfg.MAX_ACCOUNTS,
    focused,
    lives: lives ? lives.state() : { count: 0, open: false },
    slots: slots.map((s) => {
      const p = getPrefs(s.id);
      return { id: s.id, popped: !!s.win, name: p.name, muted: p.muted, zoom: Math.round(p.zoom * 100) };
    }),
  };
}
const pushBar = () => {
  if (barView && !barView.webContents.isDestroyed()) barView.webContents.send('bar:state', barState());
};

function createBar() {
  barView = new WebContentsView({
    webPreferences: {
      preload: path.join(__dirname, 'src', 'bar-preload.js'),
      sandbox: true, contextIsolation: true, nodeIntegration: false,
    },
  });
  barView.setBackgroundColor('#1b1220');
  sec.hardenContents(barView.webContents, []); // a barra nunca navega
  mainWin.contentView.addChildView(barView);
  barView.webContents.loadFile(path.join(__dirname, 'ui', 'bar.html'));

  ipcMain.handle('bar:get', (e) => (e.sender === barView.webContents ? barState() : null));
  ipcMain.on('bar:action', (e, name, arg, extra) => {
    if (e.sender !== barView.webContents || !BAR_ACTIONS.has(name)) return;
    const slot = Number.isInteger(arg) && arg >= 0 && arg < slots.length ? slots[arg] : null;
    let back = false; // devolve o teclado ao jogo, para os atalhos continuarem valendo
    if (name === 'accounts') { setAccountCount(slots.length >= cfg.MAX_ACCOUNTS ? 2 : cfg.MAX_ACCOUNTS); back = true; }
    else if (name === 'grid') { setFocus(null); back = true; }
    else if (name === 'lives') lives.open();
    else if (name === 'help') toggleHelp();
    else if (name === 'pop' && slot) togglePopOut(arg);
    else if (name === 'mute' && slot) { setPrefs(slot.id, { muted: !getPrefs(slot.id).muted }); applyPrefs(slot); back = true; }
    else if (name === 'zoom' && slot && [-1, 0, 1].includes(extra)) {
      const z = extra === 0 ? 1 : getPrefs(slot.id).zoom + extra * 0.1;
      setPrefs(slot.id, { zoom: clampZoom(z) });
      applyPrefs(slot);
      back = true;
    } else if (name === 'rename' && slot && typeof extra === 'string') {
      setPrefs(slot.id, { name: cleanName(extra) });
      if (slot.win) slot.win.setTitle(slotTitle(slot));
      updateTitle();
      back = true;
    }
    pushBar();
    if (back) refocus();
  });
}

function refocus() {
  const s = (focused !== null && slots[focused]) || slots.find((x) => !x.win);
  if (s && !s.win) s.view.webContents.focus();
}

// ---------- ajuda ----------
function toggleHelp() {
  if (helpWin && !helpWin.isDestroyed()) {
    helpWin.close();
    return;
  }
  helpWin = new BrowserWindow({
    width: 640, height: 560, title: 'Atalhos', autoHideMenuBar: true, icon: APP_ICON,
    webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false },
  });
  sec.hardenContents(helpWin.webContents, []);
  helpWin.loadFile(path.join(__dirname, 'ui', 'help.html'));
  helpWin.webContents.on('before-input-event', (e, input) => {
    if (input.type === 'keyDown' && (input.code === 'F1' || input.code === 'Escape')) { e.preventDefault(); helpWin.close(); }
  });
}

// ---------- grade ----------
function layout() {
  if (!mainWin || mainWin.isDestroyed()) return;
  const { width, height } = mainWin.getContentBounds();
  barView.setBounds({ x: 0, y: 0, width, height: BAR_H });
  const grid = slots.filter((s) => !s.win);
  const solo = focused !== null && slots[focused] && !slots[focused].win ? slots[focused] : null;
  const top = BAR_H;
  const h = Math.max(0, height - top);
  if (solo) {
    grid.forEach((s) => s.view.setVisible(s === solo));
    solo.view.setBounds({ x: 0, y: top, width, height: h });
    return;
  }
  const cols = Math.max(1, Math.min(MAX_COLS, grid.length));
  const rows = Math.max(1, Math.ceil(grid.length / cols));
  const w = Math.floor(width / cols);
  const rh = Math.floor(h / rows);
  grid.forEach((s, i) => {
    const c = i % cols;
    const r = Math.floor(i / cols);
    s.view.setVisible(true);
    s.view.setBounds({
      x: c * w, y: top + r * rh,
      width: c === cols - 1 ? width - c * w : w,
      height: r === rows - 1 ? h - r * rh : rh,
    });
  });
}

function updateTitle() {
  if (!mainWin || mainWin.isDestroyed()) return;
  mainWin.setTitle(focused === null ? 'PokeMulti' : `PokeMulti: ${getPrefs(slots[focused].id).name || `conta ${slots[focused].id}`} (posição ${focused + 1})`);
}

function setFocus(index) {
  focused = index;
  layout();
  if (index !== null && slots[index]) (slots[index].win ? slots[index].win.focus() : slots[index].view.webContents.focus());
  updateTitle();
  pushBar();
}

function saveOrder() {
  cfg.save({ order: slots.map((s) => s.id) });
}

function moveSlot(from, dir) {
  const to = from + dir;
  if (from < 0 || to < 0 || to >= slots.length) return;
  [slots[from], slots[to]] = [slots[to], slots[from]];
  if (focused === from) focused = to;
  else if (focused === to) focused = from;
  saveOrder();
  layout();
  slots[to].view.webContents.focus();
  updateTitle();
  pushBar();
}

// ---------- abrir uma conta em janela própria (e devolver à grade) ----------
function togglePopOut(index) {
  const s = slots[index];
  if (!s) return;
  if (s.win) { s.win.close(); return; } // o 'close' abaixo devolve a conta à grade

  const w = new BaseWindow({ width: 1100, height: 700, title: slotTitle(s), autoHideMenuBar: true, icon: APP_ICON });
  mainWin.contentView.removeChildView(s.view);
  w.contentView.addChildView(s.view);
  s.view.setVisible(true);
  s.win = w;
  const fit = () => { const b = w.getContentBounds(); s.view.setBounds({ x: 0, y: 0, width: b.width, height: b.height }); };
  w.on('resize', fit);
  fit();
  w.on('close', () => {
    if (s.win !== w) return;
    s.win = null;
    try { w.contentView.removeChildView(s.view); } catch {}
    if (slots.includes(s) && mainWin && !mainWin.isDestroyed()) mainWin.contentView.addChildView(s.view);
    layout();
    pushBar();
  });
  if (focused === index) focused = null;
  layout();
  s.view.webContents.focus();
  pushBar();
}

// ---------- reset de sessão ----------
async function resetAccount(index) {
  const s = slots[index];
  if (!s) return;
  const { response } = await dialog.showMessageBox({
    type: 'warning', buttons: ['Cancelar', 'Resetar'], defaultId: 0, cancelId: 0,
    title: 'Resetar conta',
    message: `Resetar a sessão da conta ${s.id} (posição ${index + 1})?`,
    detail: 'Apaga cookies, login e dados locais desse quadrante. A conta no jogo continua existindo.',
  });
  if (response !== 1) return;
  const ses = s.view.webContents.session;
  await ses.clearStorageData();
  await ses.clearCache();
  s.view.webContents.loadURL(cfg.GAME_URL);
}

// ---------- atalhos (só valem com o app em foco) ----------
function shortcutHandler(id) {
  return (event, input) => {
    if (input.type !== 'keyDown') return;
    const owner = () => slots.find((s) => s.id === id);
    if (input.code === 'F1') { event.preventDefault(); toggleHelp(); return; }
    if (input.code === 'F11') { event.preventDefault(); mainWin.setFullScreen(!mainWin.isFullScreen()); return; }
    if (input.code === 'F5') {
      event.preventDefault();
      const targets = input.control && input.shift ? slots : [owner()].filter(Boolean);
      for (const s of targets) input.control ? s.view.webContents.reloadIgnoringCache() : s.view.webContents.reload();
      return;
    }
    if (!input.control) return;

    const digit = /^Digit([0-9])$/.exec(input.code);
    const n = digit ? Number(digit[1]) : null;
    const pos = slots.findIndex((s) => s.id === id);
    const total = slots.length;
    const valid = n !== null && n >= 1 && n <= total;

    if (input.shift && n === 0) {                       // Ctrl+Shift+0 (ou Ctrl+Alt+Shift+0)
      event.preventDefault(); setAccountCount(total >= cfg.MAX_ACCOUNTS ? 2 : cfg.MAX_ACCOUNTS);
    } else if (input.alt && !input.shift && (input.code === 'ArrowLeft' || input.code === 'ArrowRight')) {
      event.preventDefault(); moveSlot(pos, input.code === 'ArrowLeft' ? -1 : 1);
    } else if (input.alt && !input.shift && valid) {    // Ctrl+Alt+1..4: destacar/devolver a conta
      event.preventDefault(); togglePopOut(n - 1);
    } else if (!input.alt && input.shift && valid) {    // Ctrl+Shift+1..4: resetar sessão
      event.preventDefault(); resetAccount(n - 1);
    } else if (!input.alt && !input.shift && valid) {   // Ctrl+1..4: foco (de novo = volta à grade)
      event.preventDefault();
      if (slots[n - 1].win) slots[n - 1].win.focus(); else setFocus(focused === n - 1 ? null : n - 1);
    } else if (!input.alt && !input.shift && n === 0) { // Ctrl+0
      event.preventDefault(); setFocus(null);
    } else if (!input.alt && !input.shift && input.code === 'KeyT') { // Ctrl+T
      event.preventDefault(); lives.open();
    }
  };
}

// ---------- contas ----------
function createSlot(id) {
  const view = new WebContentsView({
    webPreferences: {
      partition: `persist:conta${id}`, // cookies/localStorage separados por conta, salvos em disco
      preload: path.join(__dirname, 'src', 'game-preload.js'),
      sandbox: true, contextIsolation: true, nodeIntegration: false,
      backgroundThrottling: false,
    },
  });
  const wc = view.webContents;
  sec.hardenSession(wc.session);
  sec.hardenContents(wc, cfg.GAME_HOSTS);
  wc.on('before-input-event', shortcutHandler(id));
  mainWin.contentView.addChildView(view);
  const slot = { id, view, win: null };
  slots.push(slot);
  applyPrefs(slot);
  ['dom-ready', 'did-navigate'].forEach((ev) => wc.on(ev, () => applyPrefs(slot))); // o zoom zera ao navegar
  wc.loadURL(cfg.GAME_URL);
}

function removeSlotAt(i) {
  const s = slots[i];
  if (s.win) { const w = s.win; s.win = null; try { w.contentView.removeChildView(s.view); } catch {} w.close(); }
  else mainWin.contentView.removeChildView(s.view);
  s.view.webContents.close();
  slots.splice(i, 1);
}

function setAccountCount(count) {
  count = Math.max(1, Math.min(cfg.MAX_ACCOUNTS, count));
  for (let i = slots.length - 1; i >= 0; i--) if (slots[i].id > count) removeSlotAt(i);
  for (let id = 1; id <= count; id++) if (!slots.some((s) => s.id === id)) createSlot(id);
  if (focused !== null && focused >= slots.length) focused = null;
  cfg.save({ accounts: count });
  saveOrder();
  mainWin.contentView.addChildView(barView);
  layout();
  updateTitle();
  pushBar();
}

function createWindow() {
  slotPrefs = cfg.load().slotPrefs || {};
  mainWin = new BaseWindow({
    width: 1600, height: 900, minWidth: 1000, minHeight: 600, autoHideMenuBar: true, title: 'PokeMulti', icon: APP_ICON,
  });
  mainWin.maximize(); // maximizada, não em tela cheia: a barra de tarefas continua à vista (F11 alterna)
  createBar();
  for (const id of cfg.accountOrder(cfg.accountCount())) createSlot(id);
  lives = createLives({
    getSlots: () => slots,
    onChange: pushBar,
    notify: (body) => { try { new Notification({ title: 'Lives mudaram', body }).show(); } catch {} },
  });
  ['resize', 'maximize', 'unmaximize', 'enter-full-screen', 'leave-full-screen'].forEach((ev) => mainWin.on(ev, layout));
  mainWin.on('closed', () => { lives?.destroy(); app.quit(); });
  barView.webContents.on('did-finish-load', pushBar);
  layout();
}

if (gotLock) app.whenReady().then(() => {
  sec.hardenSession(require('electron').session.defaultSession);
  createWindow();
});
app.on('second-instance', () => { if (mainWin && !mainWin.isDestroyed()) mainWin.focus(); });
app.on('window-all-closed', () => app.quit());
