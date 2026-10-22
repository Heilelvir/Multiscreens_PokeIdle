'use strict';
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('bar', {
  get: () => ipcRenderer.invoke('bar:get'),
  action: (name, arg) => ipcRenderer.send('bar:action', String(name), Number.isInteger(arg) ? arg : null),
  onState: (cb) => ipcRenderer.on('bar:state', (_e, s) => cb(s)),
});
