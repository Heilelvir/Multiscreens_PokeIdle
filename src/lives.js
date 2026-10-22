'use strict';
// Janela "Lives": mostra, numa grade, as lives que dão bônus (Twitch + até 2 da Kick), cada uma numa aba
// SILENCIADA (só o áudio daquela aba). O vídeo continua tocando normalmente, como em qualquer aba muda.
// Uma aba por live (não por conta), para não multiplicar espectadores.
const { BaseWindow, WebContentsView } = require('electron');
const cfg = require('./config');
const sec = require('./security');
const { parseSnapshot, urlFor, MAX_KICK } = require('./lives-parse');

const POLL_MS = 5000;

function createLives({ getSlots, onChange, notify }) {
  let desired = { tw: [], kick: [] };
  let win = null;
  const views = new Map(); // "tw:login" | "kick:slug" -> { view, nome }
  let primed = false; // a 1ª carga não gera notificação (só mudanças depois dela)
  const twitchCap = () => {
    const n = cfg.load().maxTwitch; // opcional em config.json: limita as lives da Twitch para gastar menos RAM
    return Number.isInteger(n) ? Math.min(12, Math.max(0, n)) : 12;
  };

  async function collect() {
    const tw = new Map();
    const kick = new Map();
    let any = false;
    for (const { view } of getSlots()) {
      const wc = view.webContents;
      if (wc.isDestroyed() || wc.isLoading()) continue;
      try {
        const raw = await wc.executeJavaScript('window.__plv ? window.__plv.snap() : null');
        const snap = parseSnapshot(raw);
        if (snap.twitch) { any = true; snap.twitch.forEach((l) => tw.set(l.id, l)); }
        if (snap.kick) { any = true; snap.kick.forEach((l) => kick.set(l.id, l)); }
      } catch {}
    }
    return { any, tw: [...tw.values()], kick: [...kick.values()] };
  }

  // Kick: mantém as que já estão abertas e completa até o limite
  function pickKick(live) {
    const open = (l) => views.has('kick:' + l.id);
    return [...live.filter(open), ...live.filter((l) => !open(l))].slice(0, MAX_KICK);
  }

  function makeView(url) {
    const view = new WebContentsView({
      webPreferences: {
        partition: 'persist:lives', // login da Twitch/Kick feito uma vez, aqui dentro
        sandbox: true, contextIsolation: true, nodeIntegration: false,
        autoplayPolicy: 'no-user-gesture-required', // aba muda precisa tocar sozinha
        backgroundThrottling: false,
      },
    });
    const wc = view.webContents;
    sec.hardenSession(wc.session);
    sec.hardenContents(wc, cfg.LIVE_HOSTS);
    const mute = () => { if (!wc.isDestroyed()) wc.setAudioMuted(true); };
    mute();
    wc.on('did-finish-load', mute);
    wc.on('media-started-playing', mute);
    wc.loadURL(url);
    return view;
  }

  function layout() {
    if (!win || win.isDestroyed()) return;
    const n = views.size;
    win.setTitle(n ? `Lives (${n}), abas silenciadas` : 'Lives: nenhuma live com bônus no ar');
    if (!n) return;
    const { width, height } = win.getContentBounds();
    const cols = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / cols);
    const w = Math.floor(width / cols);
    const h = Math.floor(height / rows);
    [...views.values()].forEach(({ view }, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      view.setBounds({ x: c * w, y: r * h, width: c === cols - 1 ? width - c * w : w, height: r === rows - 1 ? height - r * h : h });
    });
  }

  function sync(silent = false) {
    if (!win || win.isDestroyed()) return;
    const want = new Map();
    desired.tw.forEach((l) => want.set('tw:' + l.id, { ...l, p: 'tw' }));
    desired.kick.forEach((l) => want.set('kick:' + l.id, { ...l, p: 'kick' }));
    const added = [];
    const removed = [];
    for (const [key, v] of views) {
      if (want.has(key)) continue;
      win.contentView.removeChildView(v.view);
      v.view.webContents.close();
      views.delete(key);
      removed.push(v.nome);
    }
    for (const [key, l] of want) {
      if (views.has(key)) continue;
      const view = makeView(urlFor(l.p, l.id));
      win.contentView.addChildView(view);
      views.set(key, { view, nome: l.nome });
      added.push(l.nome);
    }
    layout();
    if (!silent && (added.length || removed.length)) {
      notify?.([added.length ? `+ ${added.join(', ')}` : '', removed.length ? `− ${removed.join(', ')}` : ''].filter(Boolean).join('\n'));
    }
  }

  async function refresh() {
    const c = await collect();
    if (!c.any) return; // contas ainda carregando: mantém o que já se sabe
    desired = { tw: c.tw.slice(0, twitchCap()), kick: pickKick(c.kick) };
    sync(!primed);
    primed = true;
    onChange?.();
  }

  function open() {
    if (win && !win.isDestroyed()) { win.show(); win.focus(); return; }
    win = new BaseWindow({ width: 1280, height: 720, title: 'Lives', autoHideMenuBar: true });
    win.on('resize', layout);
    win.on('closed', () => {
      for (const { view } of views.values()) if (!view.webContents.isDestroyed()) view.webContents.close();
      views.clear();
      win = null;
      onChange?.();
    });
    sync(true);
    layout();
    refresh();
    onChange?.();
  }

  const timer = setInterval(refresh, POLL_MS);
  timer.unref?.();

  return {
    open,
    state: () => ({ count: desired.tw.length + desired.kick.length, open: !!win && !win.isDestroyed() }),
    destroy() { clearInterval(timer); if (win && !win.isDestroyed()) win.close(); },
  };
}

module.exports = { createLives };
