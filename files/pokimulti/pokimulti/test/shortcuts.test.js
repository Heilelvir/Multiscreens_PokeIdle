'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { resolve } = require('../src/shortcuts');

const k = (code, mods = {}) => resolve({ code, control: false, shift: false, alt: false, ...mods });

test('F1…F4 mostram a sessão; F5…F12 têm ações próprias', () => {
  for (let n = 1; n <= 4; n++) assert.deepStrictEqual(k(`F${n}`), { a: 'focus', n });
  assert.deepStrictEqual(k('F5'), { a: 'grid' });
  assert.deepStrictEqual(k('F6'), { a: 'add' });
  assert.deepStrictEqual(k('F7'), { a: 'close' });
  assert.deepStrictEqual(k('F8'), { a: 'count' });
  assert.deepStrictEqual(k('F9'), { a: 'lives' });
  assert.deepStrictEqual(k('F11'), { a: 'fullscreen' });
  assert.deepStrictEqual(k('F12'), { a: 'help' });
});

test('combinações com Shift e Ctrl', () => {
  assert.deepStrictEqual(k('F2', { shift: true }), { a: 'pop', n: 2 });
  assert.deepStrictEqual(k('F3', { control: true, shift: true }), { a: 'reset', n: 3 });
  assert.deepStrictEqual(k('KeyR', { control: true }), { a: 'reload' });
  assert.deepStrictEqual(k('KeyR', { control: true, shift: true }), { a: 'reloadAll' });
  assert.deepStrictEqual(k('ArrowLeft', { control: true, alt: true }), { a: 'move', dir: -1 });
  assert.deepStrictEqual(k('ArrowRight', { control: true, alt: true }), { a: 'move', dir: 1 });
});

test('teclas que não são do app passam direto', () => {
  assert.strictEqual(k('F4', { alt: true }), null);     // Alt+F4 fecha a janela no Windows
  assert.strictEqual(k('F10'), null);
  assert.strictEqual(k('F5', { shift: true }), null);
  assert.strictEqual(k('KeyA'), null);
  assert.strictEqual(k('Digit0', { control: true }), null);
  assert.strictEqual(k('KeyR'), null);
});
