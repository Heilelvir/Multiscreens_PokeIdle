'use strict';
// Roda o main.js com um "Electron de mentira" para checar a lógica das preferências por conta.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const Module = require('module');
const { EventEmitter } = require('events');

const userData = fs.mkdtempSync(path.join(os.tmpdir(), 'pokimulti-'));
const created = [];

class WC extends EventEmitter {
  constructor() {
    super();
    this.session = { setPermissionRequestHandler() {}, setPermissionCheckHandler() {}, setDevicePermissionHandler() {} };
    this.muted = false; this.zoom = 1; this.sent = []; this.focusCount = 0;
  }
  setWindowOpenHandler() {} loadURL() {} loadFile() {} close() {} reload() {} reloadIgnoringCache() {}
  setAudioMuted(m) { this.muted = m; }
  setZoomFactor(z) { this.zoom = z; }
  focus() { this.focusCount++; }
  isDestroyed() { return false; } isLoading() { return false; }
  executeJavaScript() { return Promise.resolve(null); }
  send(ch, payload) { this.sent.push([ch, payload]); }
}
class View { constructor() { this.webContents = new WC(); created.push(this); } setBounds() {} setVisible() {} setBackgroundColor() {} }
class Win extends EventEmitter {
  constructor() { super(); this.contentView = { addChildView() {}, removeChildView() {} }; this.title = ''; }
  getContentBounds() { return { width: 1600, height: 900 }; }
  setTitle(t) { this.title = t; } maximize() {} isDestroyed() { return false; } close() {} focus() {}
  isFullScreen() { return false; } setFullScreen() {}
}
const ipc = { on: {}, handle: {} };
const ses = { setPermissionRequestHandler() {}, setPermissionCheckHandler() {}, setDevicePermissionHandler() {} };
const electron = {
  app: { requestSingleInstanceLock: () => true, quit() {}, commandLine: { appendSwitch() {} }, whenReady: () => Promise.resolve(), on() {}, getPath: () => userData },
  BaseWindow: Win, BrowserWindow: Win, WebContentsView: View,
  ipcMain: { on: (n, f) => { ipc.on[n] = f; }, handle: (n, f) => { ipc.handle[n] = f; } },
  dialog: {}, Notification: class { show() {} }, nativeImage: { createFromPath: () => ({}) },
  shell: { openExternal: async () => {} }, session: { defaultSession: ses },
};
const origLoad = Module._load;
Module._load = function (req, ...rest) { return req === 'electron' ? electron : origLoad.call(this, req, ...rest); };

test('preferências por conta: silenciar, zoom, renomear, persistência e entradas inválidas', async () => {
  require('../main.js');
  await new Promise((r) => setTimeout(r, 50));
  const bar = created[0].webContents;      // a barra é a primeira view criada
  const acc1 = created[1].webContents;     // conta na posição 1
  const act = (...args) => ipc.on['bar:action']({ sender: bar }, ...args);
  const lastState = () => bar.sent.filter(([c]) => c === 'bar:state').at(-1)[1];

  act('mute', 0);
  assert.strictEqual(acc1.muted, true);
  assert.strictEqual(lastState().slots[0].muted, true);
  act('mute', 0);
  assert.strictEqual(acc1.muted, false);

  act('zoom', 0, 1);
  assert.strictEqual(acc1.zoom, 1.1);
  for (let i = 0; i < 30; i++) act('zoom', 0, 1);
  assert.strictEqual(acc1.zoom, 2);        // limite máximo
  for (let i = 0; i < 40; i++) act('zoom', 0, -1);
  assert.strictEqual(acc1.zoom, 0.5);      // limite mínimo
  act('zoom', 0, 0);
  assert.strictEqual(acc1.zoom, 1);        // reset

  act('rename', 0, '  <b>Ana</b>' + 'x'.repeat(50));
  const nome = lastState().slots[0].name;
  assert.ok(!/[<>]/.test(nome) && nome.length <= 20, nome);

  // entradas inválidas são ignoradas
  act('zoom', 0, 5); assert.strictEqual(acc1.zoom, 1);
  act('zoom', 99, 1); act('mute', -1); act('rename', 0, { evil: true }); act('naoexiste', 0);
  // origem errada é ignorada
  ipc.on['bar:action']({ sender: new WC() }, 'mute', 0);
  assert.strictEqual(acc1.muted, false);

  // o teclado volta para o jogo depois de usar a barra
  assert.ok(acc1.focusCount > 0);

  // salvo em disco, por id da conta
  const saved = JSON.parse(fs.readFileSync(path.join(userData, 'config.json'), 'utf8'));
  assert.strictEqual(saved.slotPrefs['1'].zoom, 1);
  assert.strictEqual(saved.slotPrefs['1'].name, nome);
});
