import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings as SettingsIcon, Save, FolderOpen, Server, CheckCircle2, RefreshCw } from 'lucide-react';
import { desktop } from '../utils/desktop.js';
import { runRecoveryDemoScenario } from '../mock/scenarios.js';

export const Settings = () => {
  const { isDemoMode, theme, toggleTheme, addToast, setDemoStepNotice } = useApp();

  const [form, setForm] = useState({
    apiBaseUrl: 'http://10.229.134.76:8000',
    wsUrl: 'ws://10.229.134.76:8000/ws',
    mapStyleUrl: '',
    localTilePath: '/tiles/sf_disaster_zone',
    updateIntervalMs: 1000,
    staleHeartbeatThresholdSec: 10,
    theme: theme,
  });

  const [saveMessage, setSaveMessage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    desktop.writeConfig(form);
    setSaveMessage('Settings saved successfully! Backend Host IP updated to 10.229.134.76.');
    addToast('info', 'Configuration saved to OS user-data config.json');
    setTimeout(() => setSaveMessage(null), 3500);
  };

  const handleRunRecoveryDemo = () => {
    addToast('info', 'Auto-Running Communication Link Recovery Demo Scenario...');
    runRecoveryDemoScenario((notice) => {
      setDemoStepNotice(notice);
      addToast('info', notice);
    });
  };

  return (
    <div className="space-y-4 overflow-y-auto h-full select-none font-sans text-xs">
      <div className="panel-header -mx-4 -mt-4 mb-2">
        <div className="flex items-center space-x-2">
          <SettingsIcon className="w-4 h-4 text-[var(--ink)]" />
          <span>SYSTEM SETTINGS & FIELD CONFIGURATION</span>
        </div>
        <span className="font-mono text-[10px] text-[var(--ink-2)]">
          TARGET BACKEND HOST IP: 10.229.134.76
        </span>
      </div>

      {saveMessage && (
        <div className="p-3 bg-[var(--ok-bg)] text-[var(--ok)] border border-[var(--ok)] rounded font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{saveMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Network & Backend Configuration Panel */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded p-4 space-y-3 font-mono">
          <div className="panel-header -mx-4 -mt-4 mb-2">
            <div className="flex items-center space-x-1.5">
              <Server className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>COMMUNICATION & FASTAPI BACKEND CONFIGURATION</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[var(--ink-2)] font-bold mb-1">FastAPI Backend HTTP Base URL</label>
              <input
                type="text"
                value={form.apiBaseUrl}
                onChange={(e) => setForm({ ...form, apiBaseUrl: e.target.value })}
                className="w-full bg-[var(--surface-2)] border border-[var(--line)] rounded p-2 text-[var(--ink)] font-mono focus:outline-none focus:border-[var(--accent)] font-bold"
              />
              <span className="text-[10px] text-[var(--ink-3)] block mt-0.5">Host Target IP: 10.229.134.76:8000</span>
            </div>

            <div>
              <label className="block text-[var(--ink-2)] font-bold mb-1">WebSocket Live Stream URL</label>
              <input
                type="text"
                value={form.wsUrl}
                onChange={(e) => setForm({ ...form, wsUrl: e.target.value })}
                className="w-full bg-[var(--surface-2)] border border-[var(--line)] rounded p-2 text-[var(--ink)] font-mono focus:outline-none focus:border-[var(--accent)] font-bold"
              />
              <span className="text-[10px] text-[var(--ink-3)] block mt-0.5">WebSocket Target: ws://10.229.134.76:8000/ws</span>
            </div>

            <div>
              <label className="block text-[var(--ink-2)] font-bold mb-1">Local Map Tile Source Path</label>
              <input
                type="text"
                value={form.localTilePath}
                onChange={(e) => setForm({ ...form, localTilePath: e.target.value })}
                className="w-full bg-[var(--surface-2)] border border-[var(--line)] rounded p-2 text-[var(--ink)] font-mono focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div>
              <label className="block text-[var(--ink-2)] font-bold mb-1">Stale Heartbeat Threshold (Seconds)</label>
              <input
                type="number"
                value={form.staleHeartbeatThresholdSec}
                onChange={(e) => setForm({ ...form, staleHeartbeatThresholdSec: parseInt(e.target.value) || 10 })}
                className="w-full bg-[var(--surface-2)] border border-[var(--line)] rounded p-2 text-[var(--ink)] font-mono focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>
        </div>

        {/* Demo Scenario Controls (Visible in Demo Mode) */}
        {isDemoMode && (
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded p-4 space-y-3 font-mono">
            <div className="panel-header -mx-4 -mt-4 mb-2">
              <span>DEMO SCENARIO CONTROLS & LINK RECOVERY RUNNER</span>
              <span className="text-[var(--warn)] font-bold">VITE_DEMO_MODE=true</span>
            </div>

            <p className="text-xs text-[var(--ink-2)] leading-relaxed font-sans">
              Test full communication recovery pipeline (`CONNECTED_DIRECT` &rarr; `LOST` &rarr; `RECOVERING` &rarr; `RELAY_ACTIVE` &rarr; `CONNECTED_DIRECT`) across top bar, overview diagram, map, and network topology.
            </p>

            <button
              type="button"
              onClick={handleRunRecoveryDemo}
              className="bg-[var(--accent)] hover:opacity-95 text-white font-bold py-2 px-4 rounded text-xs transition-opacity font-sans flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Auto-Run Communication Link Recovery Demo</span>
            </button>
          </div>
        )}

        {/* Form Action Controls */}
        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={() => desktop.openLogsFolder()}
            className="flex items-center space-x-2 bg-[var(--surface-2)] hover:bg-[var(--line)] text-[var(--ink)] px-3 py-2 rounded text-xs font-bold border border-[var(--line-strong)] font-sans"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Open OS Logs Folder</span>
          </button>

          <button
            type="submit"
            className="flex items-center space-x-2 bg-[var(--accent)] hover:opacity-95 text-white px-5 py-2 rounded text-xs font-bold font-sans"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
