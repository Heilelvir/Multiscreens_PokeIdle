'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { openUrls, parseProgId, parseExe, buildArgs, settings } = require('../src/browser');

const HOSTS = ['twitch.tv', 'kick.com'];

test('lê o ProgId do navegador padrão no registro', () => {
  const out = '\r\nHKEY_CURRENT_USER\\...\\https\\UserChoice\r\n    ProgId    REG_SZ    ChromeHTML\r\n';
  assert.strictEqual(parseProgId(out), 'ChromeHTML');
  assert.strictEqual(parseProgId('    ProgId    REG_SZ    MSEdgeHTM\r\n'), 'MSEdgeHTM');
  assert.strictEqual(parseProgId('    ProgId    REG_SZ    Evil&calc\r\n'), null);
  assert.strictEqual(parseProgId(''), null);
});

test('extrai o .exe do comando de abertura', () => {
  const chrome = '    (Padrão)    REG_SZ    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --single-argument %1\r\n';
  assert.strictEqual(parseExe(chrome), 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe');
  const edge = '    (Padrão)    REG_SZ    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" --single-argument %1\r\n';
  assert.ok(parseExe(edge).endsWith('msedge.exe'));
  assert.strictEqual(parseExe('    REG_EXPAND_SZ    C:\\Apps\\brave.exe %1'), 'C:\\Apps\\brave.exe');
  assert.strictEqual(parseExe('    REG_SZ    notepad %1'), null);
  assert.strictEqual(parseExe(''), null);
});

test('argumentos para abrir várias abas numa nova janela', () => {
  const urls = ['https://www.twitch.tv/a', 'https://www.twitch.tv/b'];
  assert.deepStrictEqual(buildArgs('C:\\x\\Google\\Chrome\\chrome.exe', urls), ['--new-window', ...urls]);
  assert.deepStrictEqual(buildArgs('C:\\Edge\\MSEDGE.EXE', urls), ['--new-window', ...urls]);
  assert.deepStrictEqual(buildArgs('C:\\Mozilla Firefox\\firefox.exe', urls), ['-new-window', urls[0], '-new-tab', urls[1]]);
  assert.strictEqual(buildArgs('C:\\Outro\\navegador-desconhecido.exe', urls), null);
});

test('só abre endereços https dos domínios permitidos', async () => {
  const opened = [];
  const shell = { openExternal: async (u) => { opened.push(u); } };
  settings.delay = 0; settings.findBrowser = async () => null;
  const r = await openUrls(['https://www.twitch.tv/a', 'http://www.twitch.tv/b', 'https://evil.example/x', 'javascript:alert(1)', 'https://kick.com/c'], { allowedHosts: HOSTS, shell });
  assert.strictEqual(r, 'tabs');
  assert.deepStrictEqual(opened, ['https://www.twitch.tv/a', 'https://kick.com/c']);
  assert.strictEqual(await openUrls(['https://evil.example/x'], { allowedHosts: HOSTS, shell }), 'none');
});

test('com navegador conhecido: uma única janela, sem passar por shell', async () => {
  const calls = [];
  const shell = { openExternal: async () => { throw new Error('não deveria usar o plano B'); } };
  settings.findBrowser = async () => 'C:\\Chrome\\chrome.exe';
  settings.spawn = (exe, args, opts) => { calls.push({ exe, args, opts }); return { unref() {} }; };
  const r = await openUrls(['https://www.twitch.tv/a', 'https://www.twitch.tv/b'], { allowedHosts: HOSTS, shell });
  assert.strictEqual(r, 'window');
  assert.strictEqual(calls.length, 1);
  assert.deepStrictEqual(calls[0].args, ['--new-window', 'https://www.twitch.tv/a', 'https://www.twitch.tv/b']);
  assert.strictEqual(calls[0].opts.detached, true);
  settings.findBrowser = async () => 'C:\\Outro\\desconhecido.exe'; // desconhecido: cai no plano B
  const opened = [];
  assert.strictEqual(await openUrls(['https://kick.com/z'], { allowedHosts: HOSTS, shell: { openExternal: async (u) => { opened.push(u); } } }), 'tabs');
  assert.deepStrictEqual(opened, ['https://kick.com/z']);
  settings.findBrowser = null; settings.spawn = null;
});
