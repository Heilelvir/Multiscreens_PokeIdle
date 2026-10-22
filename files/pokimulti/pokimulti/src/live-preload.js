'use strict';
// Roda nas páginas de live (Twitch/Kick). Pede ao app a qualidade configurada e a grava onde o player da Twitch
// a lê, antes do player iniciar. Não lê nada da página e não envia nada além desse pedido.
const { ipcRenderer, webFrame } = require('electron');

try {
  const q = ipcRenderer.sendSync('lives:quality');
  if (typeof q === 'string' && /^\d{3,4}p\d{2}$/.test(q) && /(^|\.)twitch\.tv$/.test(location.hostname)) {
    const value = JSON.stringify(JSON.stringify({ default: q }));
    webFrame.executeJavaScript(`try { localStorage.setItem('video-quality', ${value}); } catch (e) {}`);
  }
} catch {}
