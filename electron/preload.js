const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  // App Telemetry
  getPlatform: () => ipcRenderer.invoke('app:get-platform'),
  getVersion: () => ipcRenderer.invoke('app:get-version'),
  getMemoryUsage: () => ipcRenderer.invoke('app:get-memory'),

  // Config Management
  readConfig: () => ipcRenderer.invoke('config:read'),
  writeConfig: (config) => ipcRenderer.invoke('config:write', config),

  // File System & Native Dialogs
  openLogsFolder: () => ipcRenderer.invoke('logs:open-folder'),
  saveFile: (options) => ipcRenderer.invoke('dialog:save-file', options),
  appendLog: (entry) => ipcRenderer.invoke('logs:append', entry),

  // Power Save Blocker (prevent laptop sleep during active mission)
  setPowerSaveBlocker: (prevent) => ipcRenderer.invoke('power-save:set', prevent),

  // Backend Child Process Management
  startBackendProcess: (exePath) => ipcRenderer.invoke('backend:start', exePath),
  stopBackendProcess: () => ipcRenderer.invoke('backend:stop'),
  getBackendStatus: () => ipcRenderer.invoke('backend:get-status'),
  onBackendStatus: (callback) => {
    const subscription = (event, status) => callback(status);
    ipcRenderer.on('backend:status', subscription);
    return () => ipcRenderer.removeListener('backend:status', subscription);
  },

  // App Menu & Shortcut Listeners
  onMenuAction: (callback) => {
    const subscription = (event, action, payload) => callback(action, payload);
    ipcRenderer.on('menu:action', subscription);
    return () => ipcRenderer.removeListener('menu:action', subscription);
  },

  // Exit Check Callback
  onExitCheck: (callback) => {
    const subscription = () => callback();
    ipcRenderer.on('app:check-exit', subscription);
    return () => ipcRenderer.removeListener('app:check-exit', subscription);
  },
  confirmExit: (shouldQuit) => ipcRenderer.send('app:confirm-exit', shouldQuit),
});
