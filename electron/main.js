import { app, BrowserWindow, Menu, ipcMain, dialog, shell, powerSaveBlocker } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Disable GPU Hardware Acceleration for Linux NVIDIA/Hybrid graphics compatibility (prevents GL VSync hangs)
app.disableHardwareAcceleration();

let mainWindow = null;
let powerSaveBlockerId = null;
let backendProcess = null;
let backendStatus = 'stopped';
let pendingQuit = false;

// Paths initialized inside ready lifecycle
let userDataPath = null;
let configFilePath = null;
let logsDirPath = null;
let logFilePath = null;

function initPaths() {
  if (!userDataPath) {
    userDataPath = app.getPath('userData');
    configFilePath = path.join(userDataPath, 'config.json');
    logsDirPath = path.join(userDataPath, 'logs');
    logFilePath = path.join(logsDirPath, 'rescuebot.log');
    if (!fs.existsSync(logsDirPath)) {
      fs.mkdirSync(logsDirPath, { recursive: true });
    }
  }
}

// Config Helpers
function loadConfig() {
  initPaths();
  let config = {
    demoMode: true,
    apiBaseUrl: 'http://10.229.134.76:8000',
    wsUrl: 'ws://10.229.134.76:8000/ws',
    mapStyleUrl: '',
    localTilePath: '',
    autoStartBackend: false,
    backendPath: '',
    theme: 'light',
    windowBounds: { width: 1366, height: 768, x: undefined, y: undefined },
  };

  const externalConfig = path.join(path.dirname(app.getPath('exe')), 'config.json');
  if (fs.existsSync(externalConfig)) {
    try {
      const data = JSON.parse(fs.readFileSync(externalConfig, 'utf8'));
      config = { ...config, ...data };
    } catch (e) {
      console.error('Failed to parse external config.json', e);
    }
  }

  if (configFilePath && fs.existsSync(configFilePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
      config = { ...config, ...data };
    } catch (e) {
      console.error('Failed to parse user-data config.json', e);
    }
  }

  return config;
}

function saveConfig(config) {
  initPaths();
  try {
    const existing = loadConfig();
    const merged = { ...existing, ...config };
    fs.writeFileSync(configFilePath, JSON.stringify(merged, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Failed to write config.json', e);
    return false;
  }
}

// Log Rotation Helper
function writeLogEntry(entry) {
  initPaths();
  try {
    const timestamp = new Date().toISOString();
    const formatted = typeof entry === 'object' ? JSON.stringify({ timestamp, ...entry }) : `[${timestamp}] ${entry}`;
    const logLine = formatted + '\n';

    if (logFilePath && fs.existsSync(logFilePath)) {
      const stats = fs.statSync(logFilePath);
      if (stats.size > 5 * 1024 * 1024) {
        for (let i = 2; i >= 1; i--) {
          const oldPath = `${logFilePath}.${i}`;
          const newPath = `${logFilePath}.${i + 1}`;
          if (fs.existsSync(oldPath)) fs.renameSync(oldPath, newPath);
        }
        fs.renameSync(logFilePath, `${logFilePath}.1`);
      }
    }

    if (logFilePath) {
      fs.appendFileSync(logFilePath, logLine, 'utf8');
    }
  } catch (e) {
    console.error('Log write error:', e);
  }
}

function createApplicationMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Export Incident Logs...',
          accelerator: 'CmdOrCtrl+E',
          click: () => mainWindow?.webContents.send('menu:action', 'export-logs'),
        },
        {
          label: 'Export Map Snapshot...',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow?.webContents.send('menu:action', 'export-snapshot'),
        },
        { type: 'separator' },
        {
          label: 'Quit RESCUEBOT',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            if (mainWindow) {
              mainWindow.close();
            }
          },
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Theme (Light/Dark)',
          accelerator: 'CmdOrCtrl+T',
          click: () => mainWindow?.webContents.send('menu:action', 'toggle-theme'),
        },
        { type: 'separator' },
        { role: 'togglefullscreen', accelerator: 'F11' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
      ],
    },
    {
      label: 'Robots',
      submenu: [
        {
          label: 'Global Emergency Stop',
          accelerator: 'Shift+Escape',
          click: () => mainWindow?.webContents.send('menu:action', 'global-estop'),
        },
        {
          label: 'Stop Selected Robot',
          accelerator: 'CmdOrCtrl+Space',
          click: () => mainWindow?.webContents.send('menu:action', 'stop-selected'),
        },
        { type: 'separator' },
        {
          label: 'Command Center',
          accelerator: 'CmdOrCtrl+1',
          click: () => mainWindow?.webContents.send('menu:action', 'nav-dashboard'),
        },
        {
          label: 'Operational Map',
          accelerator: 'CmdOrCtrl+2',
          click: () => mainWindow?.webContents.send('menu:action', 'nav-map'),
        },
        {
          label: 'Robot Vision',
          accelerator: 'CmdOrCtrl+3',
          click: () => mainWindow?.webContents.send('menu:action', 'nav-vision'),
        },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Keyboard Shortcuts',
          click: () => mainWindow?.webContents.send('menu:action', 'show-shortcuts'),
        },
        {
          label: 'Open Logs Folder',
          click: () => {
            initPaths();
            shell.openPath(logsDirPath);
          },
        },
        { type: 'separator' },
        {
          label: 'About RESCUEBOT',
          click: () => mainWindow?.webContents.send('menu:action', 'show-about'),
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  initPaths();
  const currentConfig = loadConfig();
  const { width, height, x, y } = currentConfig.windowBounds || {};

  mainWindow = new BrowserWindow({
    title: 'RESCUEBOT',
    width: width || 1366,
    height: height || 768,
    minWidth: 1280,
    minHeight: 720,
    x,
    y,
    backgroundColor: '#EFEDE6',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // Sandbox false so local network camera streams load without protocol isolation
      webSecurity: false, // Disable web security cross-origin restriction for local robot camera feeds (10.229.134.x)
      allowRunningInsecureContent: true,
    },
  });

  // Window State Persistence
  const saveBounds = () => {
    if (!mainWindow.isMinimized() && !mainWindow.isMaximized()) {
      const bounds = mainWindow.getBounds();
      saveConfig({ windowBounds: bounds });
    }
  };
  mainWindow.on('resize', saveBounds);
  mainWindow.on('move', saveBounds);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    writeLogEntry({ event: 'APP_START', details: 'RESCUEBOT desktop window initialized' });
  });

  // External Links Protection (Only open target="_blank" in external system browser)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      if (!url.includes('10.229.134.')) {
        shell.openExternal(url);
      }
    }
    return { action: 'deny' };
  });

  // Handle window close & active mission check
  mainWindow.on('close', (e) => {
    if (!pendingQuit) {
      e.preventDefault();
      mainWindow.webContents.send('app:check-exit');
    }
  });

  // Load URL or File
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html');
    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath);
    } else {
      mainWindow.loadURL(`file://${path.join(__dirname, '../dist/index.html')}`);
    }
  }
}

// Single Instance Lock
const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// IPC Handlers
ipcMain.handle('app:get-platform', () => process.platform);
ipcMain.handle('app:get-version', () => app.getVersion());
ipcMain.handle('app:get-memory', () => process.memoryUsage());

ipcMain.handle('config:read', () => loadConfig());
ipcMain.handle('config:write', (event, newConfig) => saveConfig(newConfig));

ipcMain.handle('logs:open-folder', () => {
  initPaths();
  shell.openPath(logsDirPath);
  return logsDirPath;
});

ipcMain.handle('logs:append', (event, entry) => {
  writeLogEntry(entry);
  return true;
});

ipcMain.handle('power-save:set', (event, prevent) => {
  if (prevent) {
    if (!powerSaveBlockerId || !powerSaveBlocker.isStarted(powerSaveBlockerId)) {
      powerSaveBlockerId = powerSaveBlocker.start('prevent-app-suspension');
      writeLogEntry({ event: 'POWER_SAVE', state: 'BLOCKED_SUSPENSION' });
    }
  } else {
    if (powerSaveBlockerId !== null && powerSaveBlocker.isStarted(powerSaveBlockerId)) {
      powerSaveBlocker.stop(powerSaveBlockerId);
      powerSaveBlockerId = null;
      writeLogEntry({ event: 'POWER_SAVE', state: 'RELEASED' });
    }
  }
  return powerSaveBlockerId;
});

ipcMain.handle('dialog:save-file', async (event, { defaultName, filters, data, isBinary }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName || 'export.csv',
    filters: filters || [{ name: 'All Files', extensions: ['*'] }],
  });

  if (!result.canceled && result.filePath) {
    try {
      if (isBinary) {
        const buffer = Buffer.from(data, 'base64');
        fs.writeFileSync(result.filePath, buffer);
      } else {
        fs.writeFileSync(result.filePath, data, 'utf8');
      }
      writeLogEntry({ event: 'FILE_EXPORT', path: result.filePath });
      return { success: true, filePath: result.filePath };
    } catch (err) {
      console.error('Failed to save file:', err);
      return { success: false, error: err.message };
    }
  }
  return { success: false, canceled: true };
});

// Backend Child Process Management (Optional setting)
ipcMain.handle('backend:start', (event, exePath) => {
  if (backendProcess) {
    return { success: false, message: 'Backend already running' };
  }
  if (!exePath || !fs.existsSync(exePath)) {
    return { success: false, message: 'Executable path invalid' };
  }

  try {
    backendProcess = spawn(exePath, [], { cwd: path.dirname(exePath) });
    backendStatus = 'running';
    mainWindow?.webContents.send('backend:status', { status: 'running', pid: backendProcess.pid });

    backendProcess.stdout?.on('data', (data) => {
      writeLogEntry(`[BACKEND STDOUT] ${data.toString()}`);
    });

    backendProcess.stderr?.on('data', (data) => {
      writeLogEntry(`[BACKEND STDERR] ${data.toString()}`);
    });

    backendProcess.on('exit', (code) => {
      backendProcess = null;
      backendStatus = 'stopped';
      mainWindow?.webContents.send('backend:status', { status: 'stopped', exitCode: code });
    });

    return { success: true, pid: backendProcess.pid };
  } catch (err) {
    backendStatus = 'error';
    return { success: false, error: err.message };
  }
});

ipcMain.handle('backend:stop', () => {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
    backendStatus = 'stopped';
    mainWindow?.webContents.send('backend:status', { status: 'stopped' });
    return true;
  }
  return false;
});

ipcMain.handle('backend:get-status', () => ({ status: backendStatus, pid: backendProcess?.pid }));

// Confirm exit response from renderer
ipcMain.on('app:confirm-exit', (event, shouldQuit) => {
  if (shouldQuit) {
    pendingQuit = true;
    if (powerSaveBlockerId !== null && powerSaveBlocker.isStarted(powerSaveBlockerId)) {
      powerSaveBlocker.stop(powerSaveBlockerId);
    }
    if (backendProcess) {
      backendProcess.kill();
    }
    app.quit();
  }
});

app.whenReady().then(() => {
  initPaths();
  createApplicationMenu();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
