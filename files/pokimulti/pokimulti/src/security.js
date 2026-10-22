'use strict';
const { shell } = require('electron');
const { hostAllowed, hostBlocked } = require('./net-utils');

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

// Cancela pedidos a domínios de rastreamento/anúncio listados (só dispara para esses domínios, custo desprezível).
function blockHosts(ses, hosts) {
  if (ses.__blocked) return;
  ses.__blocked = true;
  const urls = hosts.flatMap((h) => [`*://${h}/*`, `*://*.${h}/*`]);
  ses.webRequest.onBeforeRequest({ urls }, (details, cb) => cb({ cancel: hostBlocked(details.url, hosts) }));
}

// external: true  → endereços fora da lista abrem no navegador padrão (usado nas contas do jogo)
// external: false → são apenas bloqueados, em silêncio (usado nas Lives: ali popups/redirecionamentos são anúncios)
function hardenContents(wc, allowedHosts, { external = true } = {}) {
  wc.setWindowOpenHandler(({ url }) => {
    if (external) openExternalSafe(url);
    return { action: 'deny' };
  });
  const guard = (event, url) => {
    if (hostAllowed(url, allowedHosts)) return;
    event.preventDefault();
    if (external) openExternalSafe(url);
  };
  wc.on('will-navigate', guard);
  wc.on('will-redirect', guard);
  wc.on('will-attach-webview', (e) => e.preventDefault());
}

module.exports = { hostAllowed, openExternalSafe, hardenSession, hardenContents, blockHosts };
