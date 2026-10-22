'use strict';
// Roda em cada quadrante de conta. Apenas LÊ as mensagens que o servidor do jogo já envia pelo WebSocket
// da própria página (blocos "twitch" e "kick" do estado). Não envia nada, não altera o jogo.
const { webFrame } = require('electron');

function hook() {
  if (window.__plv) return;
  const st = { tw: null, kk: null };
  const seen = new WeakSet();

  function onMessage(ev) {
    const d = ev.data;
    if (typeof d !== 'string' || (!d.includes('"twitch"') && !d.includes('"kick"'))) return;
    let m;
    try { m = JSON.parse(d); } catch { return; }
    const e = m && (m.t === 'welcome' || m.t === 'estado') ? m.estado : null;
    if (!e || typeof e !== 'object') return;
    if ('twitch' in e) st.tw = e.twitch; // o estado chega em delta: a chave só aparece quando muda
    if ('kick' in e) st.kk = e.kick;
  }

  const origSend = WebSocket.prototype.send;
  WebSocket.prototype.send = function (data) {
    try {
      if (typeof data === 'string' && !seen.has(this) && data.includes('"t":"hello"')) {
        seen.add(this);
        this.addEventListener('message', onMessage);
      }
    } catch {}
    return origSend.apply(this, arguments);
  };

  Object.defineProperty(window, '__plv', {
    value: { snap: () => JSON.stringify(st) },
    enumerable: false,
  });
}

webFrame.executeJavaScript(`(${hook.toString()})()`);
