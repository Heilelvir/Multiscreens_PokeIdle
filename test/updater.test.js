'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { EventEmitter } = require('events');
const { createUpdater } = require('../src/updater');
const { t } = (() => { const i = require('../src/i18n'); return { t: (k, ...a) => i.t('pt', k, ...a) }; })();

function setup({ packaged = true, answers = [0, 0], failCheck = false } = {}) {
  const calls = { dialogs: [], progress: [], download: 0, install: [], check: 0 };
  const fake = new EventEmitter();
  fake.checkForUpdates = async () => { calls.check++; if (failCheck) throw new Error('rede'); };
  fake.downloadUpdate = async () => { calls.download++; };
  fake.quitAndInstall = (...a) => calls.install.push(a);
  const queue = [...answers];
  const dialog = { showMessageBox: async (o) => { calls.dialogs.push(o); return { response: o.buttons.length > 1 ? (queue.shift() ?? 1) : 0 }; } };
  const win = { isDestroyed: () => false, setProgressBar: (p) => calls.progress.push(p) };
  const app = { isPackaged: packaged, getVersion: () => '1.2.0' };
  const u = createUpdater({ app, dialog, getWindow: () => win, t, packaged, getUpdater: () => fake });
  return { u, fake, calls };
}
const tick = () => new Promise((r) => setTimeout(r, 5));

test('fluxo completo: pergunta, baixa, pergunta de novo e instala em silêncio', async () => {
  const { u, fake, calls } = setup();
  await u.check(true);
  assert.strictEqual(fake.autoDownload, false);          // nunca baixa sem perguntar
  assert.strictEqual(fake.autoInstallOnAppQuit, false);
  fake.emit('update-available', { version: '1.3.0' });
  await tick();
  assert.ok(calls.dialogs[0].message.includes('1.3.0'));
  assert.strictEqual(calls.download, 1);
  fake.emit('download-progress', { percent: 50 });
  assert.strictEqual(calls.progress.at(-1), 0.5);
  fake.emit('update-downloaded', {});
  await tick();
  assert.strictEqual(calls.progress.at(-1), -1);
  assert.deepStrictEqual(calls.install, [[true, true]]); // silencioso e reabre o app
});

test('"Depois" não baixa nada', async () => {
  const { u, fake, calls } = setup({ answers: [1] });
  await u.check(false);
  fake.emit('update-available', { version: '1.3.0' });
  await tick();
  assert.strictEqual(calls.download, 0);
  assert.strictEqual(u.state(), 'idle');
});

test('verificação automática é silenciosa quando não há novidade ou há erro; a manual avisa', async () => {
  const a = setup();
  await a.u.check(false);
  a.fake.emit('update-not-available');
  a.fake.emit('error', new Error('x'));
  await tick();
  assert.strictEqual(a.calls.dialogs.length, 0);
  const b = setup();
  await b.u.check(true);
  b.fake.emit('update-not-available');
  await tick();
  assert.ok(b.calls.dialogs[0].message.includes('1.2.0'));
  const c = setup({ failCheck: true });
  await c.u.check(true);
  await tick();
  assert.strictEqual(c.calls.dialogs[0].message, t('updError'));
});

test('fora do app instalado só a verificação manual explica, e nada é consultado', async () => {
  const { u, calls } = setup({ packaged: false });
  await u.check(false);
  assert.strictEqual(calls.dialogs.length, 0);
  await u.check(true);
  assert.strictEqual(calls.dialogs[0].message, t('updOnlyInstalled'));
  assert.strictEqual(calls.check, 0);
});

test('não consulta duas vezes ao mesmo tempo', async () => {
  const { u, calls } = setup();
  await u.check(true); await u.check(true);
  assert.strictEqual(calls.check, 1);
});
