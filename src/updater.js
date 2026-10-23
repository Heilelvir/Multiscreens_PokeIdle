'use strict';
// Atualização sem voltar ao GitHub: consulta a última Release, pergunta ao usuário e instala sozinha.
// Nada é baixado nem instalado sem o "sim" do usuário. O pacote é verificado pelo electron-updater
// (hash SHA-512 publicado no latest.yml da Release).
function createUpdater({ app, dialog, getWindow, t, packaged = app.isPackaged, getUpdater }) {
  let updater = null;
  let state = 'idle'; // idle | checking | downloading | ready
  let manual = false;
  let version = '';

  const say = (message, detail = '') => dialog.showMessageBox({ type: 'info', buttons: ['OK'], title: t('updTitle'), message, detail });
  const progress = (p) => { const w = getWindow(); if (w && !w.isDestroyed()) w.setProgressBar(p); };

  async function ask(message, detail, yes, no) {
    const { response } = await dialog.showMessageBox({ type: 'info', buttons: [yes, no], defaultId: 0, cancelId: 1, title: t('updTitle'), message, detail });
    return response === 0;
  }

  function load() {
    if (updater) return updater;
    try {
      updater = getUpdater ? getUpdater() : require('electron-updater').autoUpdater;
    } catch {
      return null;
    }
    updater.autoDownload = false;
    updater.autoInstallOnAppQuit = false;
    updater.allowPrerelease = false;
    updater.logger = null;

    updater.on('update-available', async (info) => {
      version = String((info && info.version) || '');
      if (!(await ask(t('updAvailable', version), t('updAvailableDetail'), t('updNow'), t('updLater')))) { state = 'idle'; return; }
      state = 'downloading';
      progress(2);
      updater.downloadUpdate().catch(() => {});
    });
    updater.on('update-not-available', () => {
      state = 'idle';
      if (manual) say(t('updNone', app.getVersion()));
    });
    updater.on('download-progress', (p) => progress(Math.max(0.02, Math.min(1, (p && p.percent ? p.percent : 0) / 100))));
    updater.on('update-downloaded', async () => {
      state = 'ready';
      progress(-1);
      if (await ask(t('updReady', version), t('updReadyDetail'), t('updRestart'), t('updLater'))) updater.quitAndInstall(true, true);
    });
    updater.on('error', () => {
      const wasManual = manual;
      state = 'idle';
      progress(-1);
      if (wasManual) say(t('updError'));
    });
    return updater;
  }

  async function check(isManual = false) {
    manual = isManual;
    if (!packaged) { if (isManual) say(t('updOnlyInstalled')); return; }
    if (state === 'checking' || state === 'downloading') return;
    if (state === 'ready') {
      if (isManual && (await ask(t('updReady', version), t('updReadyDetail'), t('updRestart'), t('updLater')))) updater.quitAndInstall(true, true);
      return;
    }
    const u = load();
    if (!u) { if (isManual) say(t('updError')); return; }
    state = 'checking';
    try {
      await u.checkForUpdates();
    } catch {
      state = 'idle';
      if (isManual) say(t('updError'));
    }
  }

  return { check, state: () => state };
}

module.exports = { createUpdater };
