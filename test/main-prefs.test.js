'use strict';
// Roda o main.js com um "Electron de mentira" para checar sessões, menus, idioma, preferências e atalhos.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const Module = require('module');
const { EventEmitter } = require('events');

const userData = fs.mkdtempSync(path.join(os.tmpdir(), 'pokimulti-'));
const created = [];
const opened = [];
const dialogs = [];   // caixas de diálogo exibidas
require('../src/browser').settings.delay = 0;    // endereços enviados ao navegador padrão
let snapshot = null;  // o que as contas "informam" sobre lives
let wcId = 0;
const menus = [];       // modelos passados a Menu.buildFromTemplate
const popups = [];      // menus de contexto exibidos
let appMenu = null;

class WC extends EventEmitter {
  constructor() {
    super();
    this.id = ++wcId;
    this.session = {
      setPermissionRequestHandler() {}, setPermissionCheckHandler() {}, setDevicePermissionHandler() {},
      setUserAgent: (ua) => { this.ua = ua; },
      webRequest: { onBeforeRequest: (filter) => { this.blocked = filter.urls; } },
    };
    this.muted = false; this.zoom = 1; this.sent = []; this.focusCount = 0; this.urls = []; this.closed = false; this.reloads = 0;
  }
  setWindowOpenHandler(fn) { this.openHandler = fn; }
  loadFile() {}
  reloadIgnoringCache() { this.hardReloads = (this.hardReloads || 0) + 1; }
  loadURL(u) { this.urls.push(u); }
  close() { this.closed = true; }
  reload() { this.reloads++; }
  setAudioMuted(m) { this.muted = m; }
  setZoomFactor(z) { this.zoom = z; }
  focus() { this.focusCount++; }
  isDestroyed() { return this.closed; } isLoading() { return false; }
  executeJavaScript() { return Promise.resolve(snapshot); }
  send(ch, payload) { this.sent.push([ch, payload]); }
}
class View { constructor(o) { this.webContents = new WC(); this.opts = o; created.push(this); } setBounds() {} setVisible() {} setBackgroundColor(c) { this.bg = c; } }
class Win extends EventEmitter {
  constructor() { super(); this.contentView = { addChildView() {}, removeChildView() {} }; this.title = ''; this.webContents = new WC(); }
  getContentBounds() { return { width: 1600, height: 900 }; }
  setTitle(x) { this.title = x; } maximize() {} isDestroyed() { return false; } close() {} focus() { this.focused = (this.focused || 0) + 1; } loadFile() {}
  isFullScreen() { return false; } setFullScreen() {}
}
const ipc = { on: {}, handle: {} };
const ses = { setPermissionRequestHandler() {}, setPermissionCheckHandler() {}, setDevicePermissionHandler() {} };
const electron = {
  app: { requestSingleInstanceLock: () => true, quit() {}, commandLine: { appendSwitch() {} }, whenReady: () => Promise.resolve(), on() {}, getPath: () => userData, getLocale: () => 'pt-BR', getVersion: () => '9.9.9' },
  BaseWindow: Win, BrowserWindow: Win, WebContentsView: View,
  Menu: {
    buildFromTemplate: (tpl) => { menus.push(tpl); return { tpl, popup() { popups.push(tpl); } }; },
    setApplicationMenu: (m) => { appMenu = m; },
    getApplicationMenu: () => appMenu,
  },
  ipcMain: { on: (n, f) => { ipc.on[n] = f; }, handle: (n, f) => { ipc.handle[n] = f; } },
  dialog: { showMessageBox: async (o) => { dialogs.push(o); return { response: 0 }; } }, Notification: class { show() {} }, nativeImage: { createFromPath: () => ({}) },
  shell: { openExternal: async (u) => { opened.push(u); } },
  nativeTheme: {}, session: { defaultSession: ses },
};
const origLoad = Module._load;
Module._load = function (req, ...rest) { return req === 'electron' ? electron : origLoad.call(this, req, ...rest); };

let bar;
const act = (...a) => ipc.on['bar:action']({ sender: bar }, ...a);
const state = () => bar.sent.filter(([c]) => c === 'bar:state').at(-1)[1];
const ids = () => state().slots.map((s) => s.id);
const saved = () => JSON.parse(fs.readFileSync(path.join(userData, 'config.json'), 'utf8'));
const submenu = (label) => appMenu.tpl.find((m) => m.label === label).submenu;

test.before(async () => {
  require('../main.js');
  await new Promise((r) => setTimeout(r, 50));
  bar = created[0].webContents; // a barra é a primeira view criada
  bar.emit('did-finish-load'); // o Electron real dispara isto ao carregar a página da barra
});

test('abre com o link de indicação do autor', () => {
  assert.strictEqual(require('../src/config').GAME_URL, 'https://pokeidle.io/?ref=656DPSE');
  assert.deepStrictEqual(created[1].webContents.urls, ['https://pokeidle.io/?ref=656DPSE']);
  assert.deepStrictEqual(created[2].webContents.urls, ['https://pokeidle.io/?ref=656DPSE']);
});

test('começa com 2 sessões e idioma do sistema', () => {
  assert.deepStrictEqual(ids(), [1, 2]);
  assert.strictEqual(state().lang, 'pt');
  assert.strictEqual(state().t.session, 'Sessão');
});

test('silenciar, zoom (com limites), renomear e persistência', () => {
  const acc1 = created[1].webContents;
  act('mute', 0); assert.strictEqual(acc1.muted, true); assert.strictEqual(state().slots[0].muted, true);
  act('mute', 0); assert.strictEqual(acc1.muted, false);
  act('zoom', 0, 1); assert.strictEqual(acc1.zoom, 1.1);
  for (let i = 0; i < 30; i++) act('zoom', 0, 1);
  assert.strictEqual(acc1.zoom, 2);
  for (let i = 0; i < 40; i++) act('zoom', 0, -1);
  assert.strictEqual(acc1.zoom, 0.5);
  act('zoom', 0, 0); assert.strictEqual(acc1.zoom, 1);
  act('rename', 0, '  <b>Ana</b>' + 'x'.repeat(50));
  const nome = state().slots[0].name;
  assert.ok(!/[<>]/.test(nome) && nome.length <= 20, nome);
  assert.strictEqual(saved().slotPrefs['1'].name, nome);
  assert.ok(acc1.focusCount > 0); // teclado volta ao jogo
});

test('entradas inválidas e origem errada são ignoradas', () => {
  const before = JSON.stringify(state());
  act('zoom', 0, 5); act('zoom', 99, 1); act('mute', -1); act('rename', 0, { evil: true }); act('naoexiste', 0); act('close', 'x');
  ipc.on['bar:action']({ sender: new WC() }, 'close', 0);
  assert.strictEqual(JSON.stringify(state()), before);
});

test('adicionar e fechar sessões específicas (login fica salvo)', () => {
  act('add'); assert.deepStrictEqual(ids(), [1, 2, 3]);
  assert.deepStrictEqual(saved().sessions, [1, 2, 3]);
  const wc2 = created[2].webContents;
  act('close', 1);                                   // fecha a sessão do meio
  assert.deepStrictEqual(ids(), [1, 3]);
  assert.strictEqual(wc2.closed, true);
  assert.deepStrictEqual(saved().sessions, [1, 3]);
  assert.ok(saved().slotPrefs);                      // preferências não são apagadas
  act('add'); assert.deepStrictEqual(ids(), [1, 3, 2]); // reabre o id livre
  act('add'); assert.deepStrictEqual(ids(), [1, 3, 2, 4]);
  act('add'); assert.strictEqual(state().count, 4);  // limite de 4
});

test('nunca fecha a última sessão', () => {
  act('close', 0); act('close', 0); act('close', 0);
  assert.strictEqual(state().count, 1);
  act('close', 0);
  assert.strictEqual(state().count, 1);
  assert.ok(state().selected === 0);
});

const press = (wc, code, mods = {}) => {
  let prevented = false;
  wc.emit('before-input-event', { preventDefault() { prevented = true; } }, { type: 'keyDown', code, control: false, shift: false, alt: false, ...mods });
  return prevented;
};

test('atalhos F1…F12 valem no jogo e também com o foco na barra', () => {
  const game = () => created.filter((v) => v !== created[0] && !v.webContents.closed).at(-1).webContents;
  assert.ok(press(game(), 'F6')); assert.strictEqual(state().count, 2);          // nova sessão
  assert.ok(press(bar, 'F6')); assert.strictEqual(state().count, 3);             // da barra também
  assert.ok(press(bar, 'F7')); assert.strictEqual(state().count, 2);             // fecha a selecionada
  assert.ok(press(game(), 'F7')); assert.strictEqual(state().count, 1);          // fecha a sessão que tem o teclado
  assert.ok(press(bar, 'F8')); assert.strictEqual(state().count, 4);             // alterna para 4
  assert.ok(press(bar, 'F8')); assert.strictEqual(state().count, 2);             // e de volta para 2
  assert.ok(press(bar, 'F1')); assert.strictEqual(state().focused, 0);           // mostra só a sessão 1
  assert.ok(press(bar, 'F1')); assert.strictEqual(state().focused, null);        // de novo: grade
  assert.ok(press(bar, 'F2')); assert.strictEqual(state().focused, 1);
  assert.ok(press(bar, 'F5')); assert.strictEqual(state().focused, null);        // F5 = grade
});

test('atalhos: recarregar, janela própria e teclas que não são nossas', () => {
  const g = created.filter((v) => v !== created[0] && !v.webContents.closed)[0].webContents;
  const r = g.reloads;
  assert.ok(press(g, 'KeyR', { control: true })); assert.strictEqual(g.reloads, r + 1);
  assert.ok(press(g, 'KeyR', { control: true, shift: true })); assert.ok(g.hardReloads >= 1);
  assert.strictEqual(press(g, 'F4', { alt: true }), false);   // Alt+F4 é do Windows
  assert.strictEqual(press(g, 'F10'), false);
  assert.strictEqual(press(g, 'Digit0', { control: true }), false); // os atalhos antigos saíram
  assert.strictEqual(press(g, 'KeyN', { control: true }), false);
});

test('botão direito: no jogo e na aba abrem o menu de contexto', () => {
  popups.length = 0;
  const slotWc = created.find((v) => v !== created[0] && !v.webContents.closed).webContents;
  slotWc.emit('context-menu', {}, {});
  assert.strictEqual(popups.length, 1);
  act('ctx', 0);
  assert.strictEqual(popups.length, 2);
  const labels = popups[0].filter((i) => i.label).map((i) => i.label);
  assert.ok(labels.includes('Recarregar') && labels.includes('Renomear…') && labels.includes('Fechar sessão') && labels.includes('Nova sessão'));
  // "Renomear…" pede à barra para abrir o campo de edição
  popups[0].find((i) => i.label === 'Renomear…').click();
  assert.ok(bar.sent.some(([c, i]) => c === 'bar:rename' && i === 0));
  // "Fechar sessão" fica desativado quando só resta uma (aqui há 2, então ativo)
  assert.strictEqual(popups[0].find((i) => i.label === 'Fechar sessão').enabled, state().count > 1);
});

test('menu do aplicativo troca o idioma e salva a escolha', () => {
  const idioma = submenu('&Idioma');
  idioma.find((i) => i.label === 'English').click();
  assert.strictEqual(state().lang, 'en');
  assert.strictEqual(state().t.session, 'Session');
  assert.strictEqual(saved().lang, 'en');
  assert.ok(appMenu.tpl.some((m) => m.label === '&Language'));      // menu reconstruído em inglês
  submenu('&Language').find((i) => i.label === 'Português').click();
  assert.strictEqual(state().lang, 'pt');
  assert.ok(appMenu.tpl.some((m) => m.label === '&Idioma'));
});

test('menu lista as sessões pelo nome e fecha a escolhida', () => {
  const sess = submenu('&Sessões');
  const fechar = sess.find((i) => i.label === 'Fechar sessão');
  assert.strictEqual(fechar.submenu.length, state().count);
  assert.ok(fechar.submenu[0].label.startsWith('1. '));
  while (state().count < 3) act('add');
  const n = state().count;
  submenu('&Sessões').find((i) => i.label === 'Fechar sessão').submenu[1].click();
  assert.strictEqual(state().count, n - 1);
});

test('menu ☰ da barra abre o menu do aplicativo; barra de menu clássica fica escondida', () => {
  popups.length = 0;
  act('menu');
  assert.strictEqual(popups.length, 1);
  assert.ok(popups[0].some((m) => m.label === '&Sessões' || m.label === '&Idioma'));
});

test('fundo preto nas contas', () => {
  const games = created.filter((v) => v !== created[0] && v.opts && v.opts.webPreferences.partition);
  assert.ok(games.length >= 2);
  assert.ok(games.every((v) => v.bg === '#000000'));
});

const liveMode = (label) => submenu('&Exibir').find((i) => i.label === 'Abrir lives em').submenu.find((i) => i.label.startsWith(label)).click();

test('Lives abrem no navegador padrão por padrão: todas juntas, sem janela interna e sem repetir', async () => {
  snapshot = JSON.stringify({ tw: { lives: ['ana', 'bia', 'caio', 'dani', 'edu', 'fabi', 'gil', 'hugo'].map((login) => ({ login })) }, kk: null });
  assert.strictEqual(require('../src/config').liveMode(), 'browser');
  const before = created.length;
  opened.length = 0;
  act('lives');
  await new Promise((r) => setTimeout(r, 80));
  assert.strictEqual(created.length, before, 'nenhuma view interna foi criada');
  assert.deepStrictEqual(opened, ['ana', 'bia', 'caio', 'dani', 'edu', 'fabi'].map((l) => `https://www.twitch.tv/${l}`)); // limite padrão de 6
  assert.strictEqual(state().lives.browser, true);
  assert.strictEqual(state().lives.dot, false, 'sem lives novas para abrir');
  opened.length = 0;
  act('lives');
  await new Promise((r) => setTimeout(r, 80));
  assert.deepStrictEqual(opened, [], 'apertar de novo não duplica as abas');
  // "Reabrir todas" abre de novo todas
  submenu('&Exibir').find((i) => i.label === 'Reabrir todas as lives no navegador').click();
  await new Promise((r) => setTimeout(r, 80));
  assert.strictEqual(opened.length, 6);
});

test('mudar o modo das Lives salva a escolha e habilita a qualidade só dentro do app', () => {
  const qualidade = () => submenu('&Exibir').find((i) => i.label === 'Qualidade das lives');
  assert.strictEqual(qualidade().enabled, false);
  liveMode('Dentro do app');
  assert.strictEqual(saved().liveMode, 'app');
  assert.strictEqual(qualidade().enabled, true);
  assert.strictEqual(submenu('&Exibir').find((i) => i.label === 'Reabrir todas as lives no navegador').enabled, false);
});

test('Lives: aba silenciada, fundo preto, UA de Chrome, rastreadores bloqueados e nenhum popup vai ao navegador', async () => {
  snapshot = JSON.stringify({ tw: { lives: ['ana', 'bia', 'caio', 'dani', 'edu', 'fabi', 'gil', 'hugo'].map((login) => ({ login })) }, kk: null });
  const before = created.length;
  act('lives');
  await new Promise((r) => setTimeout(r, 80));
  const lv = created.slice(before);
  assert.strictEqual(lv.length, 6, 'limite padrão de 6 lives da Twitch');
  for (const v of lv) {
    assert.strictEqual(v.webContents.muted, true);
    assert.strictEqual(v.bg, '#000000');
    assert.ok(v.webContents.ua && !/Electron/.test(v.webContents.ua) && /Chrome\/\d+/.test(v.webContents.ua));
    assert.ok(v.webContents.blocked.some((u) => u.includes('amazon-adsystem.com')));
    assert.ok(v.webContents.urls[0].startsWith('https://www.twitch.tv/'));
  }
  // anúncios tentando abrir popup ou redirecionar: bloqueados em silêncio
  opened.length = 0;
  const res = lv[0].webContents.openHandler({ url: 'https://s.amazon-adsystem.com/ecm3?id=OPTOUT' });
  assert.deepStrictEqual(res, { action: 'deny' });
  let prevented = false;
  lv[0].webContents.emit('will-redirect', { preventDefault() { prevented = true; } }, 'https://hde.tynt.com/deb/');
  assert.strictEqual(prevented, true);
  assert.deepStrictEqual(opened, []);
});

test('Lives: qualidade mínima por padrão, só responde às lives, e muda pelo menu', async () => {
  const lv = created.filter((v) => v.webContents.urls[0] && v.webContents.urls[0].includes('twitch.tv') && !v.webContents.closed);
  assert.ok(lv.length > 0);
  const ask = (sender) => { const e = { sender }; ipc.on['lives:quality'](e); return e.returnValue; };
  assert.strictEqual(ask(lv[0].webContents), '160p30');
  assert.strictEqual(ask(created[1].webContents), '');  // uma sessão do jogo não recebe resposta
  const reloads = lv[0].webContents.reloads;
  submenu('&Exibir').find((i) => i.label === 'Qualidade das lives').submenu.find((i) => i.label.startsWith('Automática')).click();
  assert.strictEqual(ask(lv[0].webContents), '');
  assert.strictEqual(saved().liveQuality, 'auto');
  assert.ok(lv[0].webContents.reloads > reloads, 'as lives abertas recarregam');
  submenu('&Exibir').find((i) => i.label === 'Qualidade das lives').submenu.find((i) => i.label.startsWith('Mínima')).click();
  assert.strictEqual(ask(lv[0].webContents), '160p30');
});

test('Lives: limite configurável pelo menu', async () => {
  submenu('&Exibir').find((i) => i.label === 'Limite de lives da Twitch').submenu.find((i) => i.label === '2').click();
  await new Promise((r) => setTimeout(r, 80));
  assert.strictEqual(saved().maxTwitch, 2);
  const abertas = created.filter((v) => v.webContents.urls[0] && v.webContents.urls[0].includes('twitch.tv') && !v.webContents.closed);
  assert.strictEqual(abertas.length, 2);
});

test('atalhos funcionam também nas Lives (e os que dependem de sessão são ignorados lá)', () => {
  const liveWc = created.filter((v) => v.webContents.urls[0] && v.webContents.urls[0].includes('twitch.tv') && !v.webContents.closed)[0].webContents;
  const n = state().count;
  assert.ok(press(liveWc, 'F6') || state().count === 4); // nova sessão (ou já no limite)
  assert.strictEqual(press(liveWc, 'F7'), false);          // fechar sessão não faz sentido a partir de uma live
  assert.strictEqual(press(liveWc, 'KeyR', { control: true }), false);
  assert.ok(press(liveWc, 'F5'));                          // grade
  assert.ok(state().count >= n);
});

test('em contas do jogo, links externos ainda abrem no navegador padrão (com limite de frequência)', () => {
  opened.length = 0;
  const g = created.filter((v) => v !== created[0] && v.opts && v.opts.webPreferences.partition === 'persist:conta1' && !v.webContents.closed).at(-1);
  g.webContents.openHandler({ url: 'https://discord.com/invite/x' });
  assert.deepStrictEqual(opened, ['https://discord.com/invite/x']);
});

test('"Todas": zoom, som e recarregar valem para todas as sessões de uma vez', () => {
  const games = () => created.filter((v) => v.opts && v.opts.webPreferences.partition && v.opts.webPreferences.partition.startsWith('persist:conta') && !v.webContents.closed);
  while (state().count < 3) act('add');
  submenu('&Sessões').find((i) => i.label === 'Zoom 100% em todas').click();
  assert.ok(games().every((g) => g.webContents.zoom === 1));
  assert.strictEqual(state().applyAll, false);

  act('zoom', 0, 1);                                              // sem "Todas": só uma
  assert.strictEqual(games().filter((g) => g.webContents.zoom === 1.1).length, 1);
  submenu('&Sessões').find((i) => i.label === 'Zoom 100% em todas').click();

  act('all');
  assert.strictEqual(state().applyAll, true);
  act('zoom', 0, -1);
  assert.ok(games().every((g) => g.webContents.zoom === 0.9));    // todas diminuíram
  act('zoom', 1, 1); act('zoom', 1, 1);
  assert.ok(games().every((g) => g.webContents.zoom === 1.1));
  act('zoom', 0, 0);
  assert.ok(games().every((g) => g.webContents.zoom === 1));      // reset em todas

  act('mute', 0);
  assert.ok(games().every((g) => g.webContents.muted === true));
  act('mute', 1);
  assert.ok(games().every((g) => g.webContents.muted === false));

  const antes = games().map((g) => g.webContents.reloads);
  act('reload', 0);
  assert.ok(games().every((g, i) => g.webContents.reloads === antes[i] + 1));

  act('all');                                                    // desliga: volta a valer só para uma
  assert.strictEqual(state().applyAll, false);
  act('zoom', 0, 1);
  assert.strictEqual(games().filter((g) => g.webContents.zoom === 1.1).length, 1);
  submenu('&Sessões').find((i) => i.label === 'Zoom 100% em todas').click();
});

test('menu Sessões: zoom e som de todas, independentes do botão "Todas"', () => {
  const games = () => created.filter((v) => v.opts && v.opts.webPreferences.partition && v.opts.webPreferences.partition.startsWith('persist:conta') && !v.webContents.closed);
  const item = (l) => submenu('&Sessões').find((i) => i.label === l);
  item('Aumentar zoom de todas').click();
  assert.ok(games().every((g) => g.webContents.zoom === 1.1));
  item('Diminuir zoom de todas').click(); item('Diminuir zoom de todas').click();
  assert.ok(games().every((g) => g.webContents.zoom === 0.9));
  item('Zoom 100% em todas').click();
  assert.ok(games().every((g) => g.webContents.zoom === 1));
  item('Silenciar / ativar som de todas').click();
  assert.ok(games().every((g) => g.webContents.muted === true));
  item('Silenciar / ativar som de todas').click();
  assert.ok(games().every((g) => g.webContents.muted === false));
});

test('atualizações: item no menu, caixa explica fora do app instalado e a opção de verificar ao iniciar liga/desliga', () => {
  const ajuda = () => submenu('A&juda');
  dialogs.length = 0;
  ajuda().find((i) => i.label === 'Verificar atualizações…').click();
  assert.ok(dialogs.length >= 1);
  assert.ok(String(dialogs.at(-1).message).includes('só funcionam no app instalado'));
  const auto = () => ajuda().find((i) => i.label === 'Verificar atualizações ao iniciar');
  assert.strictEqual(auto().checked, true);
  auto().click();
  assert.strictEqual(saved().updateCheck, false);
  assert.strictEqual(auto().checked, false);
  auto().click();
  assert.strictEqual(auto().checked, true);
});
