'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { S, t, detect, barStrings } = require('../src/i18n');

test('português e inglês têm exatamente as mesmas chaves e tipos', () => {
  assert.deepStrictEqual(Object.keys(S.pt).sort(), Object.keys(S.en).sort());
  for (const k of Object.keys(S.pt)) assert.strictEqual(typeof S.pt[k], typeof S.en[k], k);
});

test('textos formatados e idioma de reserva', () => {
  assert.strictEqual(t('en', 'resetMsg', 'X'), 'Reset the data of "X"?');
  assert.strictEqual(t('xx', 'session'), 'Sessão');
  assert.strictEqual(t('en', 'chave-inexistente'), 'chave-inexistente');
  assert.ok(t('pt', 'aboutDetail', '656DPSE').includes('ref=656DPSE'));
});

test('detecta o idioma do sistema', () => {
  assert.strictEqual(detect('pt-BR'), 'pt');
  assert.strictEqual(detect('en-US'), 'en');
  assert.strictEqual(detect(undefined), 'en');
});

test('a barra só recebe strings simples (funções não atravessam o IPC)', () => {
  for (const lang of ['pt', 'en']) {
    const b = barStrings(lang);
    assert.ok(Object.values(b).every((v) => typeof v === 'string'));
    assert.ok(b.session && b.barGrid && b.barLives);
  }
  assert.strictEqual(barStrings('en').session, 'Session');
});
