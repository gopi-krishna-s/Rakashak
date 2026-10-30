import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, Sun, Moon, Square, ShieldAlert, Cpu, Activity, Radio, AlertOctagon, Server } from 'lucide-react';

export const TopBar = () => {
  const {
    isDemoMode,
    mission,
    robots,
    comms,
    unacknowledgedAlertsCount,
    isAlertDrawerOpen,
    setIsAlertDrawerOpen,
    estopLatched,
    triggerEstop,
    theme,
    toggleTheme,
  } = useApp();

  const [elapsed, setElapsed] = useState('00:00:00');

  // Mission Timer
  useEffect(() => {
    const startTime = mission.startTime ? new Date(mission.startTime).getTime() : Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((now - startTime) / 1000));
      const hrs = String(Math.floor(diffSec / 3600)).padStart(2, '0');
      const mins = String(Math.floor((diffSec % 3600) / 60)).padStart(2, '0');
      const secs = String(diffSec % 60).padStart(2, '0');
      setElapsed(`${hrs}:${mins}:${secs}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [mission.startTime]);

  const robotA = robots.find((r) => r.id === 'ROBOT-A') || {};
  const robotB = robots.find((r) => r.id === 'ROBOT-B') || {};

  return (
    <header className="h-12 bg-[var(--surface-2)] border-b border-[var(--line)] px-3 flex items-center justify-between z-40 select-none font-sans text-xs">
      {/* Left Wordmark & Mission Status */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 font-bold tracking-wider text-[var(--ink)] bg-[var(--surface)] px-2 py-1 rounded border border-[var(--line-strong)]">
          <ShieldAlert className="w-4 h-4 text-[var(--danger)]" />
          <span>RESCUEBOT</span>
        </div>

        {/* Backend Host IP Badge */}
        <div className="flex items-center space-x-1 px-2 py-0.5 bg-[var(--surface)] border border-[var(--line-strong)] rounded font-mono text-[11px] text-[var(--ink-2)]" title="FastAPI Station IP">
          <Server className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="font-bold text-[var(--ink)]">10.229.134.76</span>
        </div>

        {/* Mode Banner */}
        {isDemoMode ? (
          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-[var(--warn-bg)] text-[var(--warn)] border border-[var(--warn)] flex items-center space-x-1">
            <span>DEMO MODE - SIMULATED DATA</span>
            <span className="text-[9px] bg-[var(--warn)] text-white px-1 rounded">SIM</span>
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-[var(--ok-bg)] text-[var(--ok)] border border-[var(--ok)]">
            LIVE - HARDWARE
          </span>
        )}

        {/* Mission Timer */}
        <div className="flex items-center space-x-1.5 text-[var(--ink-2)] border-l border-[var(--line)] pl-3">
          <span className="font-semibold">{mission.name || 'Search Mission'}</span>
          <span className="font-mono text-[11px] bg-[var(--surface)] px-1.5 py-0.5 rounded border border-[var(--line)]">
            {elapsed}
          </span>
        </div>
      </div>

      {/* Center Robot Chips & Communication Path */}
      <div className="flex items-center space-x-3">
        {/* Robot A Chip */}
        <div className="flex items-center space-x-1.5 px-2 py-0.5 bg-[var(--surface)] border border-[var(--line)] rounded font-mono text-[11px]">
          <span className="font-bold text-[var(--ink)]">A:</span>
          <span className={robotA.battery > 20 ? 'text-[var(--ok)]' : 'text-[var(--danger)]'}>
            {robotA.battery || 0}%
          </span>
          <span className="text-[var(--ink-3)]">({robotA.mode || 'MANUAL'})</span>
        </div>

        {/* Robot B Chip */}
        <div className="flex items-center space-x-1.5 px-2 py-0.5 bg-[var(--surface)] border border-[var(--line)] rounded font-mono text-[11px]">
          <span className="font-bold text-[var(--ink)]">B:</span>
          <span className={robotB.battery > 20 ? 'text-[var(--ok)]' : 'text-[var(--danger)]'}>
            {robotB.battery || 0}%
          </span>
          <span className="text-[var(--ink-3)]">({robotB.relayState?.active ? 'RELAY' : 'STANDBY'})</span>
        </div>

        {/* Communication Path Chip */}
        <div className="flex items-center space-x-1.5 px-2.5 py-0.5 bg-[var(--surface)] border border-[var(--line-strong)] rounded font-mono text-[11px]">
          <Radio className="w-3.5 h-3.5 text-[var(--relay)]" />
          <span className="text-[var(--ink-2)]">PATH:</span>
          <span
            className={`font-bold ${
              comms.state === 'CONNECTED_DIRECT'
                ? 'text-[var(--ok)]'
                : comms.state === 'RELAY_ACTIVE'
                ? 'text-[var(--relay)]'
                : comms.state === 'RECOVERING'
                ? 'text-[var(--warn)]'
                : 'text-[var(--danger)]'
            }`}
          >
            {comms.state === 'CONNECTED_DIRECT'
              ? '● DIRECT'
              : comms.state === 'RELAY_ACTIVE'
              ? '▲ RELAY ACTIVE (B->A)'
              : comms.state === 'RECOVERING'
              ? '⏳ RECOVERING...'
              : '■ LOST'}
          </span>
        </div>
      </div>

      {/* Right Controls & Global E-STOP */}
      <div className="flex items-center space-x-3">
        {/* Alerts Bell */}
        <button
          onClick={() => setIsAlertDrawerOpen(!isAlertDrawerOpen)}
          className="relative p-1.5 rounded hover:bg-[var(--surface)] transition-colors border border-[var(--line)]"
          title="System Alerts"
        >
          <Bell className="w-4 h-4 text-[var(--ink-2)]" />
          {unacknowledgedAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[var(--danger)] text-white text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {unacknowledgedAlertsCount}
            </span>
          )}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded hover:bg-[var(--surface)] transition-colors border border-[var(--line)]"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-[var(--ink-2)]" />
          ) : (
            <Moon className="w-4 h-4 text-[var(--ink-2)]" />
          )}
        </button>

        {/* GLOBAL E-STOP BUTTON */}
        <button
          onClick={triggerEstop}
          disabled={estopLatched}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded font-black text-xs tracking-wide border transition-all ${
            estopLatched
              ? 'bg-[var(--danger-bg)] text-[var(--danger)] border-[var(--danger)] cursor-not-allowed'
              : 'bg-[var(--danger)] text-white border-[var(--danger)] hover:opacity-95 shadow-sm'
          }`}
          title="Global Emergency Stop (Shift+Esc)"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>GLOBAL E-STOP</span>
          <span className="text-[9px] bg-black/20 px-1 py-0.5 rounded font-mono font-normal">Shift+Esc</span>
        </button>
      </div>
    </header>
  );
};
