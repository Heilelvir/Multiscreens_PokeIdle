'use strict';
const path = require('path');
const { app, BaseWindow, WebContentsView, BrowserWindow, Menu, ipcMain, dialog, Notification, nativeImage, nativeTheme } = require('electron');
const cfg = require('./src/config');
const sec = require('./src/security');
const i18n = require('./src/i18n');
const shortcuts = require('./src/shortcuts');
const { createLives } = require('./src/lives');

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();

// Idle game: não deixar o Chromium tratar quadrantes sem foco como "ocultos"
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');
app.commandLine.appendSwitch('disable-renderer-backgrounding');

const APP_ICON = nativeImage.createFromPath(path.join(__dirname, 'assets', 'icon.png')); // ícone da janela/barra de tarefas
const BAR_H = 40; // barra inferior
const MAX_COLS = 2;

let mainWin = null;
let barView = null;
let helpWin = null;
let lives = null;
let focused = null; // null = grade; índice em `slots` = só essa sessão em tela cheia
let selected = 0; // sessão cujos controles (zoom, recarregar, janela) aparecem na barra
let lang = 'pt';
const slots = []; // [{ id, view, win }]  win = janela própria quando a sessão está "destacada"

const t = (key, ...args) => i18n.t(lang, key, ...args);

// ---------- preferências por sessão (nome, som, zoom): ficam salvas por id ----------
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
const slotLabel = (s, i = slots.indexOf(s)) => getPrefs(s.id).name || `${t('session')} ${i + 1}`;
const slotTitle = (s) => t('titlePop', slotLabel(s));
const validIndex = (i) => Number.isInteger(i) && i >= 0 && i < slots.length;

// ---------- barra inferior ----------
const BAR_ACTIONS = new Set(['menu', 'tab', 'add', 'close', 'mute', 'zoom', 'reload', 'pop', 'rename', 'grid', 'lives', 'ctx']);

function barState() {
  return {
    lang,
    t: i18n.barStrings(lang),
    count: slots.length,
    max: cfg.MAX_ACCOUNTS,
    focused,
    selected: Math.min(selected, Math.max(0, slots.length - 1)),
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
      sandbox: true, contextIsolation: true, nodeIntegration: false, spellcheck: false,
    },
  });
  barView.setBackgroundColor('#161019');
  barView.webContents.on('before-input-event', makeInputHandler(() => slots[selected], 'bar')); // atalhos valem também com o foco na barra
  sec.hardenContents(barView.webContents, []); // a barra nunca navega
  mainWin.contentView.addChildView(barView);
  barView.webContents.loadFile(path.join(__dirname, 'ui', 'bar.html'));

  ipcMain.handle('bar:get', (e) => (e.sender === barView.webContents ? barState() : null));
  ipcMain.on('bar:action', (e, name, arg, extra) => {
    if (e.sender !== barView.webContents || !BAR_ACTIONS.has(name)) return;
    const slot = validIndex(arg) ? slots[arg] : null;
    let back = false; // devolve o teclado ao jogo, para os atalhos continuarem valendo
    switch (name) {
      case 'menu': try { Menu.getApplicationMenu()?.popup({ window: mainWin }); } catch {} break;
      case 'tab':
        if (slot) {
          selected = arg;
          if (slot.win) slot.win.focus();
          else setFocus(focused === arg ? null : arg);
        }
        break;
      case 'add': addSession(); back = true; break;
      case 'close': if (slot) closeSession(arg); back = true; break;
      case 'mute': if (slot) toggleMute(slot); back = true; break;
      case 'zoom': if (slot && [-1, 0, 1].includes(extra)) zoomBy(slot, extra); back = true; break;
      case 'reload': if (slot) reloadSlot(slot); back = true; break;
      case 'pop': if (slot) togglePopOut(arg); break;
      case 'rename': if (slot && typeof extra === 'string') renameSlot(slot, extra); back = true; break;
      case 'grid': setFocus(null); back = true; break;
      case 'lives': lives.open(); break;
      case 'ctx': if (slot) showSessionMenu(slot); break;
    }
    pushBar();
    if (back) refocus();
  });
}

function refocus() {
  const s = (focused !== null && slots[focused]) || slots.find((x) => !x.win);
  if (s && !s.win) s.view.webContents.focus();
}

// ---------- ações sobre uma sessão (usadas pela barra, pelos menus e pelos atalhos) ----------
function toggleMute(s) { setPrefs(s.id, { muted: !getPrefs(s.id).muted }); applyPrefs(s); pushBar(); }
function zoomBy(s, dir) {
  setPrefs(s.id, { zoom: clampZoom(dir === 0 ? 1 : getPrefs(s.id).zoom + dir * 0.1) });
  applyPrefs(s);
  pushBar();
}
function reloadSlot(s) { if (s && !s.view.webContents.isDestroyed()) s.view.webContents.reload(); }
function renameSlot(s, name) {
  setPrefs(s.id, { name: cleanName(name) });
  if (s.win) s.win.setTitle(slotTitle(s));
  updateTitle();
  buildMenu();
  pushBar();
}
function requestRename(i) {
  if (!barView || !validIndex(i)) return;
  barView.webContents.focus();
  barView.webContents.send('bar:rename', i);
}

// ---------- menu de contexto (botão direito) numa sessão ----------
function showSessionMenu(slot) {
  const i = slots.indexOf(slot);
  if (i < 0) return;
  const idx = () => slots.indexOf(slot);
  const menu = Menu.buildFromTemplate([
    { label: t('ctxReload'), click: () => reloadSlot(slot) },
    { label: t('ctxRename'), click: () => requestRename(idx()) },
    { type: 'separator' },
    { label: getPrefs(slot.id).muted ? t('ctxUnmute') : t('ctxMute'), click: () => toggleMute(slot) },
    { label: t('ctxZoomIn'), click: () => zoomBy(slot, 1) },
    { label: t('ctxZoomOut'), click: () => zoomBy(slot, -1) },
    { label: t('ctxZoomReset'), click: () => zoomBy(slot, 0) },
    { type: 'separator' },
    { label: slot.win ? t('ctxPopIn') : t('ctxPopOut'), click: () => togglePopOut(idx()) },
    { label: focused === i ? t('ctxGrid') : t('ctxFocus'), click: () => { if (slot.win) slot.win.focus(); else setFocus(focused === idx() ? null : idx()); } },
    { label: t('ctxReset'), click: () => resetAccount(idx()) },
    { type: 'separator' },
    { label: t('ctxAdd'), enabled: slots.length < cfg.MAX_ACCOUNTS, click: () => addSession() },
    { label: t('ctxClose'), enabled: slots.length > 1, click: () => closeSession(idx()) },
  ]);
  try { menu.popup({ window: slot.win || mainWin }); } catch { menu.popup(); }
}

// ---------- menu do aplicativo ----------
function buildMenu() {
  const per = (fn) => slots.map((s, i) => ({
    label: `${i + 1}. ${slotLabel(s, i)}`,
    click: () => { const j = slots.indexOf(s); if (j >= 0) fn(j); },
  }));
  const hint = (accelerator) => ({ accelerator, registerAccelerator: false }); // só exibe o atalho; quem trata é o app
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: t('menuSessions'), submenu: [
      { label: t('menuNew'), ...hint('F6'), enabled: slots.length < cfg.MAX_ACCOUNTS, click: () => addSession() },
      { label: t('menuClose'), enabled: slots.length > 1, submenu: slots.length > 1 ? per(closeSession) : [{ label: '—', enabled: false }] },
      { label: t('menuWindow'), submenu: per(togglePopOut) },
      { label: t('menuReload'), submenu: per((j) => reloadSlot(slots[j])) },
      { label: t('menuReset'), submenu: per(resetAccount) },
      { type: 'separator' },
      { label: t('menuToggleCount'), ...hint('F8'), click: () => toggleCount() },
    ] },
    { label: t('menuView'), submenu: [
      { label: t('menuGrid'), ...hint('F5'), click: () => setFocus(null) },
      { label: t('menuLives'), ...hint('F9'), click: () => lives && lives.open() },
      { label: t('menuLiveLimit'), submenu: [2, 4, 6, 12].map((n) => ({ label: String(n), type: 'radio', checked: cfg.maxTwitch() === n, click: () => setLiveLimit(n) })) },
      { label: t('menuLiveQuality'), submenu: [['min', 'qMin'], ['low', 'qLow'], ['mid', 'qMid'], ['high', 'qHigh'], ['auto', 'qAuto']]
        .map(([k, label]) => ({ label: t(label), type: 'radio', checked: cfg.liveQuality() === k, click: () => setLiveQuality(k) })) },
      { label: t('menuFullscreen'), ...hint('F11'), click: () => mainWin.setFullScreen(!mainWin.isFullScreen()) },
    ] },
    { label: t('menuLanguage'), submenu: [
      { label: 'Português', type: 'radio', checked: lang === 'pt', click: () => setLang('pt') },
      { label: 'English', type: 'radio', checked: lang === 'en', click: () => setLang('en') },
    ] },
    { label: t('menuHelp'), submenu: [
      { label: t('menuShortcuts'), ...hint('F12'), click: () => toggleHelp() },
      { label: t('menuAbout'), click: () => showAbout() },
    ] },
  ]));
  mainWin?.setMenuBarVisibility?.(false); // a barra de menu clássica fica escondida (Alt mostra); o menu abre pelo botão ☰
}

function setLiveLimit(n) {
  cfg.save({ maxTwitch: n });
  buildMenu();
  lives?.refresh();
}

function setLiveQuality(k) {
  cfg.save({ liveQuality: k });
  buildMenu();
  lives?.reload(); // as lives abertas recarregam já na qualidade nova
}

function setLang(next) {
  if (next !== 'pt' && next !== 'en') return;
  lang = next;
  cfg.save({ lang });
  buildMenu();
  slots.forEach((s) => { if (s.win) s.win.setTitle(slotTitle(s)); });
  updateTitle();
  lives?.retitle();
  if (helpWin && !helpWin.isDestroyed()) helpWin.loadFile(helpFile());
  pushBar();
}

function showAbout() {
  let ref = '';
  try { ref = new URL(cfg.GAME_URL).searchParams.get('ref') || ''; } catch {}
  dialog.showMessageBox({ type: 'info', buttons: ['OK'], title: t('aboutTitle'), message: t('aboutMsg', app.getVersion()), detail: t('aboutDetail', ref) });
}

// ---------- ajuda ----------
const helpFile = () => path.join(__dirname, 'ui', lang === 'en' ? 'help.en.html' : 'help.pt.html');
function toggleHelp() {
  if (helpWin && !helpWin.isDestroyed()) {
    helpWin.close();
    return;
  }
  helpWin = new BrowserWindow({
    width: 680, height: 640, title: t('menuShortcuts'), autoHideMenuBar: true, icon: APP_ICON,
    webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false },
  });
  sec.hardenContents(helpWin.webContents, []);
  helpWin.loadFile(helpFile());
  helpWin.webContents.on('before-input-event', (e, input) => {
    if (input.type === 'keyDown' && (input.code === 'F12' || input.code === 'Escape')) { e.preventDefault(); helpWin.close(); }
  });
}

// ---------- grade ----------
function layout() {
  if (!mainWin || mainWin.isDestroyed()) return;
  const { width, height } = mainWin.getContentBounds();
  barView.setBounds({ x: 0, y: Math.max(0, height - BAR_H), width, height: BAR_H });
  const grid = slots.filter((s) => !s.win);
  const solo = focused !== null && slots[focused] && !slots[focused].win ? slots[focused] : null;
  const h = Math.max(0, height - BAR_H);
  if (solo) {
    grid.forEach((s) => s.view.setVisible(s === solo));
    solo.view.setBounds({ x: 0, y: 0, width, height: h });
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
      x: c * w, y: r * rh,
      width: c === cols - 1 ? width - c * w : w,
      height: r === rows - 1 ? h - r * rh : rh,
    });
  });
}

function updateTitle() {
  if (!mainWin || mainWin.isDestroyed()) return;
  mainWin.setTitle(focused === null || !slots[focused] ? t('titleMain') : t('titleFocus', slotLabel(slots[focused]), focused + 1));
}

function setFocus(index) {
  focused = index;
  if (index !== null) selected = index;
  layout();
  if (index !== null && slots[index]) (slots[index].win ? slots[index].win.focus() : slots[index].view.webContents.focus());
  updateTitle();
  pushBar();
}

const saveOrder = () => cfg.save({ sessions: slots.map((s) => s.id) });

function afterSlotsChanged() {
  saveOrder();
  layout();
  updateTitle();
  buildMenu();
  pushBar();
}

function moveSlot(from, dir) {
  const to = from + dir;
  if (from < 0 || to < 0 || to >= slots.length) return;
  [slots[from], slots[to]] = [slots[to], slots[from]];
  if (focused === from) focused = to; else if (focused === to) focused = from;
  if (selected === from) selected = to; else if (selected === to) selected = from;
  saveOrder();
  layout();
  slots[to].view.webContents.focus();
  updateTitle();
  buildMenu();
  pushBar();
}

// ---------- abrir uma sessão em janela própria (e devolver à grade) ----------
function togglePopOut(index) {
  const s = slots[index];
  if (!s) return;
  if (s.win) { s.win.close(); return; } // o 'close' abaixo devolve a sessão à grade

  const w = new BaseWindow({ width: 1100, height: 700, title: slotTitle(s), autoHideMenuBar: true, icon: APP_ICON, backgroundColor: '#000000' });
  w.on('focus', () => { if (!s.view.webContents.isDestroyed()) s.view.webContents.focus(); }); // clicar na janela devolve o teclado ao jogo
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

// ---------- reset de dados ----------
async function resetAccount(index) {
  const s = slots[index];
  if (!s) return;
  const { response } = await dialog.showMessageBox({
    type: 'warning', buttons: [t('cancel'), t('reset')], defaultId: 0, cancelId: 0,
    title: t('resetTitle'), message: t('resetMsg', slotLabel(s, index)), detail: t('resetDetail'),
  });
  if (response !== 1) return;
  const ses = s.view.webContents.session;
  await ses.clearStorageData();
  await ses.clearCache();
  s.view.webContents.loadURL(cfg.GAME_URL);
}

// ---------- atalhos (valem em qualquer parte do app: jogo, barra, janelas próprias e Lives) ----------
const OWNER_ONLY = new Set(['reload', 'close', 'move']); // precisam saber de qual sessão se fala
const STAY_PUT = new Set(['lives', 'help', 'fullscreen']); // não precisam trazer a janela principal para a frente

function runShortcut(r, owner, scope) {
  if (scope === 'lives' && OWNER_ONLY.has(r.a)) return false;
  const pos = owner ? slots.indexOf(owner) : -1;
  if (scope !== 'main' && !STAY_PUT.has(r.a) && mainWin && !mainWin.isDestroyed()) mainWin.focus();
  switch (r.a) {
    case 'focus': {
      const i = r.n - 1;
      if (!validIndex(i)) break;
      if (slots[i].win) slots[i].win.focus(); else setFocus(focused === i ? null : i);
      break;
    }
    case 'grid': setFocus(null); break;
    case 'add': addSession(); break;
    case 'close': if (pos >= 0) closeSession(pos); break;
    case 'count': toggleCount(); break;
    case 'lives': lives.open(); break;
    case 'fullscreen': mainWin.setFullScreen(!mainWin.isFullScreen()); break;
    case 'help': toggleHelp(); break;
    case 'pop': togglePopOut(r.n - 1); break;
    case 'reset': resetAccount(r.n - 1); break;
    case 'reload': if (owner) reloadSlot(owner); break;
    case 'reloadAll': slots.forEach((s) => s.view.webContents.reloadIgnoringCache()); break;
    case 'move': if (pos >= 0) moveSlot(pos, r.dir); break;
  }
  return true;
}

function makeInputHandler(getOwner, scope) {
  return (event, input) => {
    if (input.type !== 'keyDown') return;
    const r = shortcuts.resolve(input);
    if (!r) return;
    const owner = getOwner() || slots[selected] || null; // sem dono claro: a sessão selecionada
    if (runShortcut(r, owner, scope)) event.preventDefault();
  };
}

// ---------- sessões ----------
function createSlot(id) {
  const view = new WebContentsView({
    webPreferences: {
      partition: `persist:conta${id}`, // cookies/localStorage separados por sessão, salvos em disco
      preload: path.join(__dirname, 'src', 'game-preload.js'),
      sandbox: true, contextIsolation: true, nodeIntegration: false,
      backgroundThrottling: false, spellcheck: false,
    },
  });
  view.setBackgroundColor('#000000'); // fundo preto enquanto o jogo carrega
  const wc = view.webContents;
  sec.hardenSession(wc.session);
  sec.hardenContents(wc, cfg.GAME_HOSTS);
  wc.on('before-input-event', makeInputHandler(() => slots.find((x) => x.id === id), 'main'));
  mainWin.contentView.addChildView(view);
  const slot = { id, view, win: null };
  slots.push(slot);
  wc.on('context-menu', () => showSessionMenu(slot)); // botão direito (só quando o jogo não trata o clique)
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

// Fechar uma sessão só tira a aba: cookies e login ficam salvos e voltam ao reabrir.
function closeSession(i) {
  if (slots.length <= 1 || !validIndex(i)) return;
  removeSlotAt(i);
  if (focused !== null) focused = focused === i ? null : focused > i ? focused - 1 : focused;
  if (selected > i) selected--;
  selected = Math.min(selected, slots.length - 1);
  afterSlotsChanged();
}

function addSession() {
  if (slots.length >= cfg.MAX_ACCOUNTS) return;
  let id = 1;
  while (slots.some((s) => s.id === id)) id++;
  createSlot(id);
  focused = null;
  selected = slots.length - 1;
  afterSlotsChanged();
}

function toggleCount() {
  if (slots.length < cfg.MAX_ACCOUNTS) while (slots.length < cfg.MAX_ACCOUNTS) addSession();
  else while (slots.length > 2) closeSession(slots.length - 1);
}

function createWindow() {
  const cfgNow = cfg.load();
  slotPrefs = cfgNow.slotPrefs || {};
  lang = cfgNow.lang === 'en' || cfgNow.lang === 'pt' ? cfgNow.lang : i18n.detect(app.getLocale());
  mainWin = new BaseWindow({ width: 1600, height: 900, minWidth: 1000, minHeight: 600, title: t('titleMain'), icon: APP_ICON, backgroundColor: '#000000', autoHideMenuBar: true });
  mainWin.setMenuBarVisibility?.(false);
  mainWin.on('focus', refocus); // clicar na janela (borda, título, barra de tarefas) devolve o teclado ao jogo
  mainWin.maximize(); // maximizada, não em tela cheia: a barra de tarefas continua à vista (F11 alterna)
  createBar();
  for (const id of cfg.sessionIds()) createSlot(id);
  selected = 0;
  lives = createLives({
    getSlots: () => slots,
    onChange: pushBar,
    notify: (body) => { try { new Notification({ title: t('livesChanged'), body }).show(); } catch {} },
    onInput: makeInputHandler(() => null, 'lives'),
    t,
  });
  buildMenu();
  ['resize', 'maximize', 'unmaximize', 'enter-full-screen', 'leave-full-screen'].forEach((ev) => mainWin.on(ev, layout));
  mainWin.on('closed', () => { lives?.destroy(); app.quit(); });
  barView.webContents.on('did-finish-load', pushBar);
  layout();
}

if (gotLock) app.whenReady().then(() => {
  nativeTheme.themeSource = 'dark'; // menus e diálogos do sistema em modo escuro
  sec.hardenSession(require('electron').session.defaultSession);
  // as páginas de live pedem a qualidade configurada; só quem é uma live recebe resposta
  ipcMain.on('lives:quality', (e) => { e.returnValue = lives && lives.owns(e.sender) ? cfg.QUALITIES[cfg.liveQuality()] : ''; });
  createWindow();
});
app.on('second-instance', () => { if (mainWin && !mainWin.isDestroyed()) mainWin.focus(); });
app.on('window-all-closed', () => app.quit());
