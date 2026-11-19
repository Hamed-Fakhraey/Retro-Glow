const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('retroGlowDesktop', {
  showWindow: () => ipcRenderer.invoke('retroglow:show-window'),
  quit: () => ipcRenderer.invoke('retroglow:quit'),
  getLaunchAtStartup: () => ipcRenderer.invoke('retroglow:get-launch-at-startup'),
  setLaunchAtStartup: (enabled) => ipcRenderer.invoke('retroglow:set-launch-at-startup', enabled),
  alertFired: (kind) => ipcRenderer.invoke('retroglow:alert-fired', kind),
})
