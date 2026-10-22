'use strict';
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('bar', {
  get: () => ipcRenderer.invoke('bar:get'),
  action: (name, arg, extra) =>
    ipcRenderer.send(
      'bar:action',
      String(name),
      Number.isInteger(arg) ? arg : null,
      typeof extra === 'string' ? extra.slice(0, 40) : Number.isFinite(extra) ? extra : null
    ),
  onState: (cb) => ipcRenderer.on('bar:state', (_e, s) => cb(s)),
});
