'use strict';
// Janela "Lives": mostra, numa grade, as lives que dão bônus (Twitch + até 2 da Kick), cada uma numa aba
// SILENCIADA (só o áudio daquela aba). O vídeo continua tocando normalmente, como em qualquer aba muda.
// Uma aba por live (não por conta), para não multiplicar espectadores.
const path = require('path');
const { BaseWindow, WebContentsView } = require('electron');
const cfg = require('./config');
const sec = require('./security');
const { parseSnapshot, urlFor, MAX_KICK } = require('./lives-parse');
const { chromeUA } = require('./net-utils');

const POLL_MS = 5000;

function createLives({ getSlots, onChange, notify, onInput, launchBrowser, t = (k) => k }) {
  let desired = { tw: [], kick: [] };
  let win = null;
  const views = new Map(); // "tw:login" | "kick:slug" -> { view, nome }
  let primed = false; // a 1ª carga não gera notificação (só mudanças depois dela)
  const opened = new Set();    // lives já abertas no navegador padrão
  const announced = new Set(); // lives novas já avisadas (não repete o aviso)
  const liveIds = new Set(); // ids dos webContents das lives (para o preload poder pedir a qualidade)

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

  const liveList = () => [
    ...desired.tw.map((l) => ({ key: 'tw:' + l.id, p: 'tw', id: l.id, nome: l.nome })),
    ...desired.kick.map((l) => ({ key: 'kick:' + l.id, p: 'kick', id: l.id, nome: l.nome })),
  ];
  const browserMode = () => cfg.liveMode() === 'browser';

  // Kick: mantém as que já estão abertas e completa até o limite
  function pickKick(live) {
    const open = (l) => views.has('kick:' + l.id);
    return [...live.filter(open), ...live.filter((l) => !open(l))].slice(0, MAX_KICK);
  }

  function makeView(url) {
    const view = new WebContentsView({
      webPreferences: {
        partition: 'persist:lives', // login da Twitch/Kick feito uma vez, aqui dentro
        preload: path.join(__dirname, 'live-preload.js'),
        sandbox: true, contextIsolation: true, nodeIntegration: false,
        autoplayPolicy: 'no-user-gesture-required', // aba muda precisa tocar sozinha
        backgroundThrottling: false,
        spellcheck: false,
      },
    });
    view.setBackgroundColor('#000000');
    const wc = view.webContents;
    const ses = wc.session;
    sec.hardenSession(ses);
    sec.blockHosts(ses, cfg.LIVE_BLOCKED_HOSTS);
    if (!ses.__ua) { ses.__ua = true; ses.setUserAgent(chromeUA(process.versions.chrome, process.platform)); } // login sem "navegador não suportado"
    sec.hardenContents(wc, cfg.LIVE_HOSTS, { external: false }); // popups/redirecionamentos de anúncio são só bloqueados
    if (onInput) wc.on('before-input-event', onInput);
    liveIds.add(wc.id);
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
    win.setTitle(n ? t('livesTitle', n) : t('livesNone'));
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
      liveIds.delete(v.view.webContents.id);
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
    desired = { tw: c.tw.slice(0, cfg.maxTwitch()), kick: pickKick(c.kick) };
    sync(!primed);
    const list = liveList();
    const keys = new Set(list.map((l) => l.key));
    for (const set of [opened, announced]) for (const k of set) if (!keys.has(k)) set.delete(k); // live que acabou e voltar conta como nova
    if (browserMode() && primed) {
      const fresh = list.filter((l) => !opened.has(l.key) && !announced.has(l.key));
      fresh.forEach((l) => announced.add(l.key));
      if (fresh.length) notify?.(t('livesNew', fresh.map((l) => l.nome).join(', ')));
    }
    primed = true;
    onChange?.();
  }

  // Abre as lives no navegador padrão, todas juntas numa nova janela. `all` reabre também as já abertas.
  async function openInBrowser(all) {
    await refresh();
    const list = liveList();
    const fresh = all ? list : list.filter((l) => !opened.has(l.key));
    if (!fresh.length) { if (list.length) notify?.(t('livesNothingNew')); return; }
    fresh.forEach((l) => opened.add(l.key));
    await launchBrowser?.(fresh.map((l) => urlFor(l.p, l.id)));
    onChange?.();
  }

  function open(all = false) {
    if (browserMode()) { openInBrowser(all); return; }
    if (win && !win.isDestroyed()) { win.show(); win.focus(); return; }
    win = new BaseWindow({ width: 1280, height: 720, title: 'Lives', autoHideMenuBar: true, backgroundColor: '#000000' });
    win.on('focus', () => { // clicar na janela devolve o teclado a uma live, para os atalhos continuarem valendo
      const first = views.values().next().value;
      if (first && !first.view.webContents.isDestroyed()) first.view.webContents.focus();
    });
    win.on('resize', layout);
    win.on('closed', () => {
      for (const { view } of views.values()) if (!view.webContents.isDestroyed()) view.webContents.close();
      views.clear();
      liveIds.clear();
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
    retitle: layout,
    refresh,
    owns: (wc) => !!wc && liveIds.has(wc.id),
    reload() { for (const { view } of views.values()) if (!view.webContents.isDestroyed()) view.webContents.reload(); },
    closeWindow() { if (win && !win.isDestroyed()) win.close(); },
    state() {
      const list = liveList();
      const inApp = !!win && !win.isDestroyed();
      const dot = browserMode() ? list.some((l) => !opened.has(l.key)) : list.length > 0 && !inApp;
      return { count: list.length, open: inApp, dot, browser: browserMode() };
    },
    destroy() { clearInterval(timer); if (win && !win.isDestroyed()) win.close(); },
  };
}

module.exports = { createLives };
