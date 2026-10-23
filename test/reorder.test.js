'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { dropIndex } = require('../ui/reorder');

test('soltar depois de uma aba mais à frente', () => {
  assert.strictEqual(dropIndex(0, 2, false), 2);
  assert.strictEqual(dropIndex(0, 2, true), 1);
  assert.strictEqual(dropIndex(0, 3, false), 3);
});

test('soltar antes de uma aba mais atrás', () => {
  assert.strictEqual(dropIndex(2, 0, true), 0);
  assert.strictEqual(dropIndex(3, 1, true), 1);
  assert.strictEqual(dropIndex(3, 1, false), 2);
});

test('soltar na própria aba ou ao lado dela, no mesmo lugar, não muda nada', () => {
  assert.strictEqual(dropIndex(1, 1, true), 1);
  assert.strictEqual(dropIndex(1, 1, false), 1);
  assert.strictEqual(dropIndex(2, 1, false), 2); // logo depois da aba anterior = onde já está
  assert.strictEqual(dropIndex(1, 2, true), 1);  // logo antes da aba seguinte = onde já está
});

test('o resultado é sempre uma posição possível', () => {
  for (let n = 1; n <= 4; n++) for (let from = 0; from < n; from++) for (let t = 0; t < n; t++) for (const b of [true, false]) {
    const to = dropIndex(from, t, b);
    assert.ok(to >= 0 && to < n, `n=${n} from=${from} t=${t} before=${b} -> ${to}`);
  }
});
