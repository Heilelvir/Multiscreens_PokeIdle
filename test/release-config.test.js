'use strict';
// Guarda de configuração: erros aqui quebram as atualizações automáticas sem aviso.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

test('versão semântica e nome do instalador sem espaços (o GitHub trocaria os espaços e o atualizador não acharia o arquivo)', () => {
  assert.match(pkg.version, /^\d+\.\d+\.\d+$/);
  assert.ok(!/\s/.test(pkg.build.nsis.artifactName));
});

test('publicação no GitHub configurada e atualizador entre as dependências do app', () => {
  assert.strictEqual(pkg.build.publish[0].provider, 'github');
  assert.ok(pkg.build.publish[0].owner && pkg.build.publish[0].repo);
  assert.ok(pkg.dependencies['electron-updater'], 'electron-updater precisa estar em dependencies, não em devDependencies');
  assert.ok(!(pkg.devDependencies || {})['electron-updater']);
});

test('o appId não pode mudar entre versões (identifica o programa no Windows)', () => {
  assert.strictEqual(pkg.build.appId, 'com.Heil.pokemulti');
});

test('o workflow publica o latest.yml na Release e confere a tag', () => {
  const wf = fs.readFileSync(path.join(root, '.github', 'workflows', 'build.yml'), 'utf8');
  const release = wf.split('\n').find((l) => l.includes('gh release create'));
  assert.ok(release, 'comando de publicar a Release não encontrado');
  assert.ok(release.includes('dist/latest.yml'), 'a Release precisa incluir o latest.yml');
  assert.ok(release.includes('dist/*.blockmap'));
  assert.ok(release.includes('dist/*.exe'));
  assert.ok(/Test-Path dist\/latest\.yml/.test(wf), 'o build deve falhar se o latest.yml não for gerado');
  assert.ok(/package\.json/.test(wf) && /ref_name/.test(wf));
});
