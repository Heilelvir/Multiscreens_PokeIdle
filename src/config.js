'use strict';
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

// Link com o seu código de indicação
const GAME_URL = 'https://pokeidle.io/?ref=656DPSE';
const MAX_ACCOUNTS = 4;
const DEFAULT_ACCOUNTS = 2;

// Domínios em que o quadrante de uma conta pode navegar. Qualquer outro endereço https
// abre no navegador padrão. Se o login/vínculo do jogo usar outro provedor, inclua aqui.
const GAME_HOSTS = ['pokeidle.io', 'twitch.tv', 'kick.com', 'discord.com', 'google.com'];
const LIVE_HOSTS = ['twitch.tv', 'kick.com'];
// Rastreadores/sincronização de cookies que as páginas de live tentavam abrir (editável)
const LIVE_BLOCKED_HOSTS = ['amazon-adsystem.com', 'eskimi.com', 'tynt.com', 'krushmedia.com'];
// Qualidade do vídeo das lives (menos qualidade = menos CPU, memória e rede). 'auto' não força nada.
const QUALITIES = { min: '160p30', low: '360p30', mid: '480p30', high: '720p60', auto: '' };

const file = () => path.join(app.getPath('userData'), 'config.json');

function load() {
  try {
    const raw = JSON.parse(fs.readFileSync(file(), 'utf8'));
    return raw && typeof raw === 'object' ? raw : {};
  } catch {
    return {};
  }
}

function save(patch) {
  try {
    const tmp = file() + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify({ ...load(), ...patch }, null, 2));
    fs.renameSync(tmp, file()); // escrita atômica: não corrompe o arquivo se o app fechar no meio
  } catch (err) {
    console.error('não foi possível salvar a configuração:', err);
  }
}

function accountCount() {
  const n = load().accounts;
  return Number.isInteger(n) && n >= 1 && n <= MAX_ACCOUNTS ? n : DEFAULT_ACCOUNTS;
}

// ids 1..count na ordem salva; ids sem posição vão para o fim
function accountOrder(count) {
  const saved = Array.isArray(load().order) ? load().order : [];
  const ids = saved.filter((id, i) => Number.isInteger(id) && id >= 1 && id <= count && saved.indexOf(id) === i);
  for (let id = 1; id <= count; id++) if (!ids.includes(id)) ids.push(id);
  return ids;
}

function liveQuality() {
  const k = load().liveQuality;
  return Object.prototype.hasOwnProperty.call(QUALITIES, k) ? k : 'min';
}
const liveQualityValue = () => QUALITIES[liveQuality()];

// Quantas lives da Twitch abrir no máximo (cada uma é um player de vídeo: é o que mais pesa)
function maxTwitch() {
  const n = load().maxTwitch;
  return Number.isInteger(n) && n >= 0 && n <= 12 ? n : 6;
}

// Sessões abertas, na ordem das abas. Migra a configuração antiga (contagem + ordem) quando não há lista salva.
function sessionIds() {
  const saved = load().sessions;
  if (Array.isArray(saved)) {
    const ids = saved.filter((id, i) => Number.isInteger(id) && id >= 1 && id <= MAX_ACCOUNTS && saved.indexOf(id) === i);
    if (ids.length) return ids;
  }
  return accountOrder(accountCount());
}

module.exports = { LIVE_BLOCKED_HOSTS, QUALITIES, liveQuality, liveQualityValue, maxTwitch, sessionIds, GAME_URL, MAX_ACCOUNTS, GAME_HOSTS, LIVE_HOSTS, load, save, accountCount, accountOrder };
