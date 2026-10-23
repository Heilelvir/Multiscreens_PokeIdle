'use strict';
// Abre endereços no navegador padrão do Windows, todos juntos numa NOVA janela (uma aba por endereço).
// Descobre o navegador padrão pelo registro do Windows e o executa com --new-window. Se não conseguir,
// abre um por um com shell.openExternal.
const fs = require('fs');
const path = require('path');
const { execFile, spawn } = require('child_process');
const { hostAllowed } = require('./net-utils');

// delay: pausa entre aberturas no plano B. findBrowser e spawn podem ser trocados nos testes.
const settings = { delay: 600, findBrowser: null, spawn: null };

const CHROMIUM = new Set(['chrome.exe', 'msedge.exe', 'brave.exe', 'opera.exe', 'vivaldi.exe', 'chromium.exe', 'launcher.exe']);
const FIREFOX = new Set(['firefox.exe', 'librewolf.exe', 'waterfox.exe']);

const reg = (args) => new Promise((resolve) => {
  execFile('reg', args, { windowsHide: true, timeout: 5000 }, (err, out) => resolve(err ? '' : String(out)));
});

const parseProgId = (out) => {
  const m = /ProgId\s+REG_SZ\s+(\S+)/i.exec(out || '');
  return m && /^[\w.\-]+$/.test(m[1]) ? m[1] : null;
};

// Extrai o caminho do .exe de um comando de registro, como: "C:\...\chrome.exe" --single-argument %1
const parseExe = (out) => {
  const m = /REG_(?:EXPAND_)?SZ\s+(.+)/i.exec(out || '');
  if (!m) return null;
  const quoted = /^\s*"([^"]+\.exe)"/i.exec(m[1]);
  const bare = /^\s*([^\s"]+\.exe)/i.exec(m[1]);
  return (quoted || bare || [])[1] || null;
};

async function defaultBrowserExe() {
  if (process.platform !== 'win32') return null;
  if (process.env.NODE_TEST_CONTEXT) return null; // durante os testes nunca abre o navegador de verdade
  const choice = await reg(['query', 'HKCU\\Software\\Microsoft\\Windows\\Shell\\Associations\\UrlAssociations\\https\\UserChoice', '/v', 'ProgId']);
  const progId = parseProgId(choice);
  const key = progId ? `HKEY_CLASSES_ROOT\\${progId}\\shell\\open\\command` : 'HKEY_CLASSES_ROOT\\https\\shell\\open\\command';
  const exe = parseExe(await reg(['query', key, '/ve']));
  return exe && fs.existsSync(exe) ? exe : null;
}

// Argumentos para abrir várias abas numa nova janela, ou null se o navegador não é conhecido
function buildArgs(exe, urls) {
  const name = path.win32.basename(String(exe)).toLowerCase();
  if (CHROMIUM.has(name)) return ['--new-window', ...urls];
  if (FIREFOX.has(name)) return ['-new-window', urls[0], ...urls.slice(1).flatMap((u) => ['-new-tab', u])];
  return null;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Só endereços https dos domínios permitidos chegam aqui; vão como argumentos (sem passar por shell).
async function openUrls(urls, { allowedHosts, shell }) {
  const safe = urls.filter((u) => hostAllowed(u, allowedHosts));
  if (!safe.length) return 'none';
  const exe = await (settings.findBrowser || defaultBrowserExe)();
  const args = exe ? buildArgs(exe, safe) : null;
  if (exe && args) {
    try {
      (settings.spawn || spawn)(exe, args, { detached: true, stdio: 'ignore' }).unref();
      return 'window';
    } catch {}
  }
  for (let i = 0; i < safe.length; i++) {
    if (i) await sleep(settings.delay);
    shell.openExternal(safe[i]).catch(() => {});
  }
  return 'tabs';
}

module.exports = { openUrls, parseProgId, parseExe, buildArgs, settings };
