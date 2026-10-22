'use strict';
// Transforma o que a página do jogo entrega em uma lista SEGURA de lives. A página é tratada como
// não confiável: só passam ids no formato válido de login, com limites de quantidade e de tamanho.
const TWITCH_ID = /^[a-z0-9_]{1,25}$/;
const KICK_ID = /^[a-z0-9_-]{1,40}$/;
const MAX_TWITCH = 12;
const MAX_KICK = 2; // a Kick só conta 2 lives
const MAX_RAW = 500_000;

const lower = (x) => String(x ?? '').toLowerCase();
const cleanName = (s, fallback) => String(s ?? '').replace(/[\u0000-\u001f\u007f<>]/g, '').slice(0, 40) || fallback;
const EMPTY = () => ({ twitch: null, kick: null });

function parseSnapshot(raw) {
  if (typeof raw !== 'string' || raw.length > MAX_RAW) return EMPTY();
  let o;
  try { o = JSON.parse(raw); } catch { return EMPTY(); }
  if (!o || typeof o !== 'object') return EMPTY();

  let twitch = null;
  const tw = o.tw;
  if (tw && typeof tw === 'object') {
    const oficiais = Array.isArray(tw.oficiais) ? tw.oficiais : [];
    const bonus = new Set(oficiais.filter((x) => x && x.bonus === true).map((x) => lower(x.login)));
    const temInfo = oficiais.length > 0;
    twitch = (Array.isArray(tw.lives) ? tw.lives : [])
      .filter((l) => l && typeof l === 'object')
      .map((l) => ({ id: lower(l.login), nome: cleanName(l.nome, lower(l.login)) }))
      .filter((l) => TWITCH_ID.test(l.id) && (!temInfo || bonus.has(l.id)))
      .slice(0, MAX_TWITCH);
  }

  let kick = null;
  const kk = o.kk;
  if (kk && typeof kk === 'object') {
    kick = (Array.isArray(kk.oficiais) ? kk.oficiais : [])
      .filter((x) => x && typeof x === 'object' && x.aoVivo && x.ativo)
      .map((x) => ({ id: lower(x.slug), nome: cleanName(x.nome, lower(x.slug)) }))
      .filter((l) => KICK_ID.test(l.id));
  }
  return { twitch, kick };
}

const urlFor = (platform, id) =>
  platform === 'tw' ? `https://www.twitch.tv/${encodeURIComponent(id)}` : `https://kick.com/${encodeURIComponent(id)}`;

module.exports = { parseSnapshot, urlFor, MAX_KICK, MAX_TWITCH };
