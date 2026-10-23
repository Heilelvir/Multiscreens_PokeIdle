'use strict';
// Textos do app em português e inglês. As chaves que começam com "bar" (e "session") vão para a barra inferior.
const S = {
  pt: {
    session: 'Sessão',
    menuSessions: '&Sessões', menuNew: 'Nova sessão', menuClose: 'Fechar sessão', menuWindow: 'Janela própria',
    menuReload: 'Recarregar', menuReset: 'Resetar dados da sessão…', menuToggleCount: 'Alternar entre 2 e 4 sessões',
    menuView: '&Exibir', menuGrid: 'Grade', menuFullscreen: 'Tela cheia', menuLives: 'Lives (abas silenciadas)',
    menuLanguage: '&Idioma', menuHelp: 'A&juda', menuShortcuts: 'Atalhos', menuAbout: 'Sobre',
    menuLiveLimit: 'Limite de lives da Twitch', menuLiveQuality: 'Qualidade das lives',
    qMin: 'Mínima (160p, menos memória)', qLow: 'Baixa (360p)', qMid: 'Média (480p)', qHigh: 'Alta (720p)', qAuto: 'Automática (do site)',
    menuLiveMode: 'Abrir lives em', modeBrowser: 'Navegador padrão (nova janela)', modeApp: 'Dentro do app (abas silenciadas)',
    menuOpenAllAgain: 'Reabrir todas as lives no navegador',
    menuAllZoomIn: 'Aumentar zoom de todas', menuAllZoomOut: 'Diminuir zoom de todas', menuAllZoomReset: 'Zoom 100% em todas', menuAllMute: 'Silenciar / ativar som de todas',
    menuCheckUpdates: 'Verificar atualizações…', menuAutoUpdate: 'Verificar atualizações ao iniciar',
    ctxReload: 'Recarregar', ctxRename: 'Renomear…', ctxMute: 'Silenciar', ctxUnmute: 'Ativar som',
    ctxZoomIn: 'Aumentar zoom', ctxZoomOut: 'Diminuir zoom', ctxZoomReset: 'Zoom 100%',
    ctxPopOut: 'Abrir em janela própria', ctxPopIn: 'Devolver à grade', ctxFocus: 'Mostrar só esta sessão',
    ctxGrid: 'Voltar à grade', ctxReset: 'Resetar dados…', ctxMoveLeft: 'Mover para a esquerda', ctxMoveRight: 'Mover para a direita', ctxAdd: 'Nova sessão', ctxClose: 'Fechar sessão',
    barMenuTip: 'Menu: sessões, exibir, idioma e ajuda',
    barGrid: 'Grade', barGridTip: 'Mostra todas as sessões (F5)',
    barAddTip: 'Nova sessão (F6)', barLimitTip: 'Máximo de 4 sessões',
    barCloseTip: 'Fechar esta sessão (F7). Login e dados ficam salvos', barLastTip: 'É preciso manter ao menos uma sessão',
    barMuteTip: 'Silenciar esta sessão', barUnmuteTip: 'Som desligado: clique para ligar',
    barZoomOutTip: 'Diminuir o zoom (o jogo ganha mais espaço)', barZoomInTip: 'Aumentar o zoom',
    barZoomResetTip: 'Zoom: clique para voltar a 100%', barReloadTip: 'Recarregar a sessão (Ctrl+R)',
    barPopTip: 'Abrir em janela própria (Shift+F1…F4)', barPopInTip: 'Devolver à grade',
    barTabTip: 'Clique: mostrar só esta · Duplo clique: renomear · Arraste: reordenar · Botão direito: mais opções',
    barAll: 'Todas', barAllTip: 'Ligado: zoom, som e recarregar valem para todas as sessões de uma vez',
    barRenameTip: 'Enter salva, Esc cancela', barLives: 'Lives', barLivesTip: 'Abre as lives com bônus, silenciadas (F9)',
    resetTitle: 'Resetar dados da sessão', resetMsg: (n) => `Resetar os dados de "${n}"?`,
    resetDetail: 'Apaga cookies, login e dados locais dessa sessão. A conta no jogo continua existindo.',
    cancel: 'Cancelar', reset: 'Resetar',
    aboutTitle: 'Sobre o PokeMulti', aboutMsg: (v) => `PokeMulti ${v}`,
    aboutDetail: (ref) => `Projeto de fã, não oficial, sem afiliação com o PokeIdle ou com a The Pokémon Company.\n\nEste app abre o jogo com o código de indicação do autor${ref ? ` (ref=${ref})` : ''}.\n\nCódigo aberto (MIT): github.com/Heilelvir/Multiscreens_PokeIdle`,
    livesTitle: (n) => `Lives (${n}), abas silenciadas`, livesNone: 'Lives: nenhuma live com bônus no ar', livesChanged: 'Lives mudaram',
    livesNew: (names) => `Nova live no ar: ${names}. Aperte F9 para abrir.`, livesNothingNew: 'Nenhuma live nova: todas já foram abertas. Use Exibir → Reabrir todas as lives.',
    updTitle: 'Atualização do PokeMulti', updAvailable: (v) => `Nova versão disponível: ${v}`,
    updAvailableDetail: 'Quer baixar e instalar agora? O app fecha, atualiza e abre sozinho. Seus logins e dados são mantidos.',
    updNow: 'Atualizar agora', updLater: 'Depois', updNone: (v) => `Você já está na versão mais recente (${v}).`,
    updError: 'Não foi possível verificar atualizações agora. Confira sua conexão e tente de novo.',
    updReady: (v) => `A versão ${v} foi baixada.`, updReadyDetail: 'Reiniciar agora para instalar?', updRestart: 'Reiniciar agora',
    updOnlyInstalled: 'As atualizações só funcionam no app instalado, não ao rodar pelo código.',
    titleMain: 'PokeMulti', titleFocus: (name, pos) => `PokeMulti: ${name} (posição ${pos})`, titlePop: (name) => `PokeMulti: ${name}`,
  },
  en: {
    session: 'Session',
    menuSessions: '&Sessions', menuNew: 'New session', menuClose: 'Close session', menuWindow: 'Separate window',
    menuReload: 'Reload', menuReset: 'Reset session data…', menuToggleCount: 'Switch between 2 and 4 sessions',
    menuView: '&View', menuGrid: 'Grid', menuFullscreen: 'Full screen', menuLives: 'Lives (muted tabs)',
    menuLanguage: '&Language', menuHelp: '&Help', menuShortcuts: 'Shortcuts', menuAbout: 'About',
    menuLiveLimit: 'Twitch live limit', menuLiveQuality: 'Live quality',
    qMin: 'Minimum (160p, least memory)', qLow: 'Low (360p)', qMid: 'Medium (480p)', qHigh: 'High (720p)', qAuto: 'Automatic (site default)',
    menuLiveMode: 'Open lives in', modeBrowser: 'Default browser (new window)', modeApp: 'Inside the app (muted tabs)',
    menuOpenAllAgain: 'Reopen all lives in the browser',
    menuAllZoomIn: 'Zoom in all', menuAllZoomOut: 'Zoom out all', menuAllZoomReset: 'Zoom 100% on all', menuAllMute: 'Mute / unmute all',
    menuCheckUpdates: 'Check for updates…', menuAutoUpdate: 'Check for updates on startup',
    ctxReload: 'Reload', ctxRename: 'Rename…', ctxMute: 'Mute', ctxUnmute: 'Unmute',
    ctxZoomIn: 'Zoom in', ctxZoomOut: 'Zoom out', ctxZoomReset: 'Zoom 100%',
    ctxPopOut: 'Open in its own window', ctxPopIn: 'Return to grid', ctxFocus: 'Show only this session',
    ctxGrid: 'Back to grid', ctxReset: 'Reset data…', ctxMoveLeft: 'Move left', ctxMoveRight: 'Move right', ctxAdd: 'New session', ctxClose: 'Close session',
    barMenuTip: 'Menu: sessions, view, language and help',
    barGrid: 'Grid', barGridTip: 'Show all sessions (F5)',
    barAddTip: 'New session (F6)', barLimitTip: 'Maximum of 4 sessions',
    barCloseTip: 'Close this session (F7). Login and data are kept', barLastTip: 'At least one session must stay open',
    barMuteTip: 'Mute this session', barUnmuteTip: 'Muted: click to unmute',
    barZoomOutTip: 'Zoom out (the game gets more room)', barZoomInTip: 'Zoom in',
    barZoomResetTip: 'Zoom: click to return to 100%', barReloadTip: 'Reload the session (Ctrl+R)',
    barPopTip: 'Open in its own window (Shift+F1…F4)', barPopInTip: 'Return to the grid',
    barTabTip: 'Click: show only this · Double-click: rename · Drag: reorder · Right-click: more options',
    barAll: 'All', barAllTip: 'On: zoom, sound and reload apply to all sessions at once',
    barRenameTip: 'Enter saves, Esc cancels', barLives: 'Lives', barLivesTip: 'Open the bonus livestreams, muted (F9)',
    resetTitle: 'Reset session data', resetMsg: (n) => `Reset the data of "${n}"?`,
    resetDetail: 'Deletes cookies, login and local data for this session. Your game account still exists.',
    cancel: 'Cancel', reset: 'Reset',
    aboutTitle: 'About PokeMulti', aboutMsg: (v) => `PokeMulti ${v}`,
    aboutDetail: (ref) => `Unofficial fan project, not affiliated with PokeIdle or The Pokémon Company.\n\nThis app opens the game with the author's referral code${ref ? ` (ref=${ref})` : ''}.\n\nOpen source (MIT): github.com/Heilelvir/Multiscreens_PokeIdle`,
    livesTitle: (n) => `Lives (${n}), muted tabs`, livesNone: 'Lives: no bonus streams live right now', livesChanged: 'Lives changed',
    livesNew: (names) => `New live: ${names}. Press F9 to open.`, livesNothingNew: 'No new lives: all were already opened. Use View → Reopen all lives.',
    updTitle: 'PokeMulti update', updAvailable: (v) => `New version available: ${v}`,
    updAvailableDetail: 'Download and install it now? The app closes, updates and reopens by itself. Your logins and data are kept.',
    updNow: 'Update now', updLater: 'Later', updNone: (v) => `You already have the latest version (${v}).`,
    updError: 'Could not check for updates right now. Check your connection and try again.',
    updReady: (v) => `Version ${v} has been downloaded.`, updReadyDetail: 'Restart now to install it?', updRestart: 'Restart now',
    updOnlyInstalled: 'Updates only work in the installed app, not when running from source.',
    titleMain: 'PokeMulti', titleFocus: (name, pos) => `PokeMulti: ${name} (position ${pos})`, titlePop: (name) => `PokeMulti: ${name}`,
  },
};

const detect = (locale) => (/^pt/i.test(String(locale || '')) ? 'pt' : 'en');

function t(lang, key, ...args) {
  const v = (S[lang] && S[lang][key]) ?? S.pt[key] ?? key;
  return typeof v === 'function' ? v(...args) : v;
}

// só strings simples podem atravessar o IPC (funções não são clonáveis)
function barStrings(lang) {
  const d = { ...S.pt, ...(S[lang] || {}) };
  const out = {};
  for (const [k, v] of Object.entries(d)) if ((k.startsWith('bar') || k === 'session') && typeof v === 'string') out[k] = v;
  return out;
}

module.exports = { S, t, detect, barStrings };
