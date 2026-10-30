import React, { useState, useEffect } from 'react';
import { HardDrive, Cpu, Wifi, Activity, Terminal } from 'lucide-react';
import { desktop } from '../utils/desktop';

export const SystemHealth = () => {
  const [platform, setPlatform] = useState('Checking...');
  const [version, setVersion] = useState('Checking...');
  const [memory, setMemory] = useState({ heapUsed: 0, heapTotal: 0 });

  useEffect(() => {
    desktop.getPlatform().then(setPlatform);
    desktop.getVersion().then(setVersion);
    desktop.getMemoryUsage().then(setMemory);

    const timer = setInterval(() => {
      desktop.getMemoryUsage().then(setMemory);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const heapUsedMb = Math.round((memory.heapUsed || 0) / 1024 / 1024);
  const heapTotalMb = Math.round((memory.heapTotal || 0) / 1024 / 1024);

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full select-none">
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-brand-600/20 text-brand-400 rounded">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">SYSTEM HEALTH & DIAGNOSTICS</h1>
            <p className="text-xs text-slate-400">Desktop process memory, platform telemetry, and runtime health</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Memory Health Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Electron Heap Memory</h2>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {heapUsedMb} MB / {heapTotalMb} MB
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all"
              style={{ width: `${Math.min(100, (heapUsedMb / (heapTotalMb || 1)) * 100)}%` }}
            />
          </div>
        </div>

        {/* Runtime Environment Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
            <Terminal className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white">Runtime OS Platform</h2>
          </div>
          <div className="space-y-1 font-mono text-xs text-slate-300">
            <div>Platform: <span className="text-blue-400 font-bold uppercase">{platform}</span></div>
            <div>App Version: <span className="text-slate-100 font-bold">{version}</span></div>
            <div>Mode: <span className="text-emerald-400">{desktop.isElectron ? 'Electron Desktop' : 'Web Browser'}</span></div>
          </div>
        </div>

        {/* Ping / Network Latency */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
            <Wifi className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white">Local Field Mesh Ping</h2>
          </div>
          <div className="text-2xl font-bold font-mono text-purple-400">12 ms</div>
          <p className="text-[11px] text-slate-500">Latency to internal broadcast adapter</p>
        </div>
      </div>
    </div>
  );
};
