'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { parseSnapshot, urlFor } = require('../src/lives-parse');

const snap = (o) => JSON.stringify(o);

test('só lives com bônus quando há informação de bônus', () => {
  const r = parseSnapshot(snap({ tw: { lives: [{ login: 'Ana', nome: 'Ana' }, { login: 'bob' }], oficiais: [{ login: 'ana', bonus: true }, { login: 'bob', bonus: false }] } }));
  assert.deepStrictEqual(r.twitch.map((l) => l.id), ['ana']);
});

test('sem informação de bônus, considera todas', () => {
  const r = parseSnapshot(snap({ tw: { lives: [{ login: 'ana' }, { login: 'bob' }] } }));
  assert.strictEqual(r.twitch.length, 2);
});

test('rejeita logins maliciosos e limita a quantidade', () => {
  const bad = ['../evil', 'a/b', 'x?y=1', 'https://evil.com', 'a'.repeat(40), ''];
  const lives = [...bad, ...Array.from({ length: 30 }, (_, i) => `ok${i}`)].map((login) => ({ login }));
  const r = parseSnapshot(snap({ tw: { lives } }));
  assert.ok(r.twitch.length <= 12);
  assert.ok(r.twitch.every((l) => /^[a-z0-9_]{1,25}$/.test(l.id)));
});

test('Kick: só no ar e ativas', () => {
  const r = parseSnapshot(snap({ kk: { oficiais: [{ slug: 'a', aoVivo: true, ativo: true }, { slug: 'b', aoVivo: false, ativo: true }, { slug: 'c bad', aoVivo: true, ativo: true }] } }));
  assert.deepStrictEqual(r.kick.map((l) => l.id), ['a']);
});

test('entrada inválida ou gigante não quebra', () => {
  assert.deepStrictEqual(parseSnapshot(null), { twitch: null, kick: null });
  assert.deepStrictEqual(parseSnapshot('{{{'), { twitch: null, kick: null });
  assert.deepStrictEqual(parseSnapshot('x'.repeat(600000)), { twitch: null, kick: null });
});

test('URLs sempre apontam para o domínio fixo', () => {
  assert.strictEqual(urlFor('tw', 'ana'), 'https://www.twitch.tv/ana');
  assert.strictEqual(urlFor('kick', 'a b'), 'https://kick.com/a%20b');
});

test('nome é higienizado', () => {
  const r = parseSnapshot(snap({ tw: { lives: [{ login: 'ana', nome: '<img src=x onerror=1>' + 'z'.repeat(100) }] } }));
  assert.ok(!r.twitch[0].nome.includes('<') && r.twitch[0].nome.length <= 40);
});
