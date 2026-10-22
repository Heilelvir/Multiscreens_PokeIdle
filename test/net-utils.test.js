'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { hostAllowed, hostBlocked, chromeUA } = require('../src/net-utils');

test('hostAllowed só aceita https nos domínios da lista (e subdomínios)', () => {
  const hosts = ['twitch.tv', 'kick.com'];
  assert.ok(hostAllowed('https://www.twitch.tv/ana', hosts));
  assert.ok(hostAllowed('https://kick.com/x', hosts));
  assert.ok(!hostAllowed('http://www.twitch.tv/ana', hosts));
  assert.ok(!hostAllowed('https://twitch.tv.evil.com/', hosts));
  assert.ok(!hostAllowed('https://eviltwitch.tv/', hosts));
  assert.ok(!hostAllowed('javascript:alert(1)', hosts));
  assert.ok(!hostAllowed('não é url', hosts));
});

test('hostBlocked pega os rastreadores citados, inclusive subdomínios', () => {
  const hosts = ['amazon-adsystem.com', 'eskimi.com', 'tynt.com', 'krushmedia.com'];
  for (const u of [
    'https://s.amazon-adsystem.com/ecm3?id=OPTOUT&ex=r1uam.com',
    'https://ittpx-us-e.eskimi.com/sync?gdpr=0',
    'https://hde.tynt.com/deb/?m=xch',
    'https://cs.krushmedia.com/x.gif',
  ]) assert.ok(hostBlocked(u, hosts), u);
  assert.ok(!hostBlocked('https://www.twitch.tv/ana', hosts));
  assert.ok(!hostBlocked('https://notamazon-adsystem.com.example.org/', hosts));
});

test('User-Agent de Chrome comum, sem "Electron"', () => {
  const ua = chromeUA('142.0.7444.59', 'win32');
  assert.ok(/Chrome\/142\.0\.0\.0/.test(ua) && /Windows NT 10\.0/.test(ua) && !/Electron/.test(ua));
  assert.ok(/X11; Linux/.test(chromeUA('142.1.2', 'linux')));
});
