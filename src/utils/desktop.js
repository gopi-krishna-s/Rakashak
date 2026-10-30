/**
 * RESCUEBOT Desktop Helper
 * Safe abstraction over window.desktop exposed via Electron preload script contextBridge.
 * Provides web browser fallbacks when running outside Electron.
 */

export const desktop = {
  isElectron: typeof window !== 'undefined' && Boolean(window.desktop),

  getPlatform: async () => {
    if (window.desktop?.getPlatform) return await window.desktop.getPlatform();
    return 'browser-web';
  },

  getVersion: async () => {
    if (window.desktop?.getVersion) return await window.desktop.getVersion();
    return '1.0.0-web';
  },

  getMemoryUsage: async () => {
    if (window.desktop?.getMemoryUsage) return await window.desktop.getMemoryUsage();
    return { heapUsed: 0, heapTotal: 0 };
  },

  readConfig: async () => {
    if (window.desktop?.readConfig) return await window.desktop.readConfig();
    // Browser fallback to localStorage
    try {
      const saved = localStorage.getItem('rescuebot_config');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  },

  writeConfig: async (config) => {
    if (window.desktop?.writeConfig) return await window.desktop.writeConfig(config);
    try {
      localStorage.setItem('rescuebot_config', JSON.stringify(config));
      return true;
    } catch (e) {
      return false;
    }
  },

  openLogsFolder: async () => {
    if (window.desktop?.openLogsFolder) return await window.desktop.openLogsFolder();
    alert('Logs folder path is available in the desktop application.');
    return null;
  },

  saveFile: async (options) => {
    if (window.desktop?.saveFile) return await window.desktop.saveFile(options);

    // Web Fallback (Trigger download)
    try {
      const blob = new Blob([options.data], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = options.defaultName || 'export.txt';
      a.click();
      URL.revokeObjectURL(url);
      return { success: true, filePath: options.defaultName };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  appendLog: async (entry) => {
    if (window.desktop?.appendLog) return await window.desktop.appendLog(entry);
    console.log('[LOG APPEND]', entry);
    return true;
  },

  setPowerSaveBlocker: async (prevent) => {
    if (window.desktop?.setPowerSaveBlocker) return await window.desktop.setPowerSaveBlocker(prevent);
    return null;
  },

  startBackendProcess: async (path) => {
    if (window.desktop?.startBackendProcess) return await window.desktop.startBackendProcess(path);
    return { success: false, message: 'Backend process launcher available in desktop app.' };
  },

  stopBackendProcess: async () => {
    if (window.desktop?.stopBackendProcess) return await window.desktop.stopBackendProcess();
    return false;
  },

  getBackendStatus: async () => {
    if (window.desktop?.getBackendStatus) return await window.desktop.getBackendStatus();
    return { status: 'browser', pid: null };
  },

  onBackendStatus: (callback) => {
    if (window.desktop?.onBackendStatus) return window.desktop.onBackendStatus(callback);
    return () => {};
  },

  onMenuAction: (callback) => {
    if (window.desktop?.onMenuAction) return window.desktop.onMenuAction(callback);
    return () => {};
  },

  onExitCheck: (callback) => {
    if (window.desktop?.onExitCheck) return window.desktop.onExitCheck(callback);
    return () => {};
  },

  confirmExit: (shouldQuit) => {
    if (window.desktop?.confirmExit) window.desktop.confirmExit(shouldQuit);
  }
};
