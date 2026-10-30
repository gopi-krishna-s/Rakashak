import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, Activity, Wifi, Cpu, Sun, Moon, AlertTriangle, Play, Square } from 'lucide-react';
import { desktop } from '../utils/desktop';

export const HeaderBar = () => {
  const { config, mission, isEstopActive, triggerEstop, theme, toggleTheme, backendStatusInfo } = useApp();
  const [clock, setClock] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-40 select-none">
      {/* Left Branding & Station Title */}
      <div className="flex items-center space-x-3">
        <div className="bg-brand-600 text-white font-black px-2.5 py-1 rounded tracking-wider text-sm flex items-center space-x-1 shadow-lg shadow-brand-600/30">
          <ShieldAlert className="w-4 h-4 mr-1 animate-pulse" />
          <span>RESCUEBOT</span>
        </div>
        <span className="text-xs font-semibold text-slate-400 border-l border-slate-700 pl-3">
          FIELD CONTROL STATION v1.0
        </span>
      </div>

      {/* Center Status Indicators */}
      <div className="flex items-center space-x-4 text-xs font-medium">
        {/* Demo Mode Badge */}
        {config.demoMode && (
          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>DEMO MODE (OFFLINE)</span>
          </div>
        )}

        {/* Mission Status Badge */}
        <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1 rounded border border-slate-700">
          <Activity className="w-3.5 h-3.5 text-brand-500" />
          <span className="text-slate-400">Mission:</span>
          <span className="text-slate-200 font-semibold">{mission.name}</span>
          <span className="text-brand-400 font-mono font-bold">({mission.progress}%)</span>
        </div>

        {/* Backend Status Pill */}
        <div className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
          <Cpu className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Backend:</span>
          {backendStatusInfo.status === 'running' ? (
            <span className="text-emerald-400 font-semibold flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1" />
              PID {backendStatusInfo.pid}
            </span>
          ) : (
            <span className="text-slate-400 italic">Offline</span>
          )}
        </div>
      </div>

      {/* Right Controls & E-STOP */}
      <div className="flex items-center space-x-3">
        {/* Clock */}
        <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800/50 px-2.5 py-1 rounded border border-slate-800">
          {clock}
        </span>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle Dark/Light Theme (Ctrl+T)"
          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* GLOBAL E-STOP BUTTON */}
        <button
          onClick={triggerEstop}
          disabled={isEstopActive}
          title="Global Emergency Stop (Shift+Esc)"
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded font-black text-xs tracking-wide transition-all shadow-md ${
            isEstopActive
              ? 'bg-red-950 text-red-400 border border-red-800 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-500 text-white animate-bounce-short shadow-red-600/40 hover:shadow-red-500/60'
          }`}
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>GLOBAL E-STOP</span>
          <span className="text-[10px] bg-red-800/80 px-1 py-0.5 rounded font-mono font-normal">Shift+Esc</span>
        </button>
      </div>
    </header>
  );
};
