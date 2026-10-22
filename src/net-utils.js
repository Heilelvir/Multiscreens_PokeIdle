'use strict';
// Funções puras (sem Electron), fáceis de testar.

function hostMatches(hostname, hosts) {
  return hosts.some((h) => hostname === h || hostname.endsWith('.' + h));
}

function hostAllowed(url, hosts) {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && hostMatches(u.hostname, hosts);
  } catch {
    return false;
  }
}

function hostBlocked(url, hosts) {
  try {
    return hostMatches(new URL(url).hostname, hosts);
  } catch {
    return false;
  }
}

// User-Agent de um Chrome comum, com a versão do Chromium embutido. O "Electron/x.y" no UA faz alguns sites
// (login da Twitch, por exemplo) recusarem o navegador como "não suportado".
function chromeUA(chromeVersion, platform) {
  const major = String(chromeVersion || '').split('.')[0] || '130';
  const os = platform === 'win32' ? 'Windows NT 10.0; Win64; x64' : platform === 'darwin' ? 'Macintosh; Intel Mac OS X 10_15_7' : 'X11; Linux x86_64';
  return `Mozilla/5.0 (${os}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${major}.0.0.0 Safari/537.36`;
}

module.exports = { hostMatches, hostAllowed, hostBlocked, chromeUA };
