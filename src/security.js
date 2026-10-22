'use strict';
const { shell } = require('electron');

function hostAllowed(url, hosts) {
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:') return false;
    return hosts.some((h) => u.hostname === h || u.hostname.endsWith('.' + h));
  } catch {
    return false;
  }
}

// Evita que uma página abra dezenas de abas no navegador do usuário
let lastExternal = 0;
function openExternalSafe(url) {
  const now = Date.now();
  if (now - lastExternal < 1500) return;
  try {
    if (new URL(url).protocol !== 'https:') return;
  } catch {
    return;
  }
  lastExternal = now;
  shell.openExternal(url).catch(() => {});
}

// O Electron concede TODAS as permissões (câmera, microfone, localização...) se ninguém tratar o pedido.
function hardenSession(ses) {
  if (ses.__hardened) return;
  ses.__hardened = true;
  const ok = (permission) => permission === 'fullscreen';
  ses.setPermissionRequestHandler((_wc, permission, cb) => cb(ok(permission)));
  ses.setPermissionCheckHandler((_wc, permission) => ok(permission));
  ses.setDevicePermissionHandler(() => false);
}

function hardenContents(wc, allowedHosts) {
  wc.setWindowOpenHandler(({ url }) => {
    openExternalSafe(url);
    return { action: 'deny' };
  });
  const guard = (event, url) => {
    if (hostAllowed(url, allowedHosts)) return;
    event.preventDefault();
    openExternalSafe(url);
  };
  wc.on('will-navigate', guard);
  wc.on('will-redirect', guard);
  wc.on('will-attach-webview', (e) => e.preventDefault());
}

module.exports = { hostAllowed, openExternalSafe, hardenSession, hardenContents };
