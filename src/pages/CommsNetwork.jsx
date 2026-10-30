import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Radio, Wifi, Server, Bot, Activity, AlertTriangle, RefreshCw, Play, CheckCircle2, ShieldAlert, Zap, Layers } from 'lucide-react';
import { runRecoveryDemoScenario } from '../mock/scenarios';

export const CommsNetwork = () => {
  const { comms, robots, setMission, setAlerts, addToast, setDemoStepNotice } = useApp();
  const [isSimulatingScenario, setIsSimulatingScenario] = useState(false);

  const robotA = robots.find((r) => r.id === 'ROBOT-A') || {};
  const robotB = robots.find((r) => r.id === 'ROBOT-B') || {};

  const handleRunScenario = () => {
    setIsSimulatingScenario(true);
    addToast('info', 'Executing 5-Stage Link Recovery Scenario...');
    runRecoveryDemoScenario((notice) => {
      setDemoStepNotice(notice);
      addToast('warn', notice);
      if (notice.includes('STAGE 5') || notice.includes('RECOVERY COMPLETE')) {
        setIsSimulatingScenario(false);
      }
    });
  };

  const getStateColor = (state) => {
    switch (state) {
      case 'CONNECTED_DIRECT':
        return 'text-[var(--ok)] bg-[var(--ok-bg)] border-[var(--ok)]';
      case 'RELAY_ACTIVE':
        return 'text-[var(--relay)] bg-amber-950/20 border-[var(--relay)]';
      case 'RECOVERING':
        return 'text-[var(--warn)] bg-[var(--warn-bg)] border-[var(--warn)]';
      case 'LOST':
        return 'text-[var(--danger)] bg-[var(--danger-bg)] border-[var(--danger)]';
      default:
        return 'text-[var(--ink-2)] bg-[var(--surface-2)] border-[var(--line)]';
    }
  };

  return (
    <div className="space-y-4 overflow-y-auto h-full select-none font-sans text-xs">
      {/* Top Header Panel */}
      <div className="bg-[var(--surface-2)] border border-[var(--line)] p-3 rounded flex flex-wrap items-center justify-between gap-2 font-mono">
        <div className="flex items-center space-x-2">
          <Radio className="w-5 h-5 text-[var(--accent)]" />
          <div>
            <h1 className="text-sm font-bold text-[var(--ink)]">COMMUNICATION NETWORK TOPOLOGY & LINK RECOVERY</h1>
            <p className="text-[11px] text-[var(--ink-2)]">
              Station Base Host IP: <strong className="text-[var(--accent)]">10.229.134.76</strong> | Topology State: <strong className={getStateColor(comms.state).split(' ')[0]}>{comms.state}</strong>
            </p>
          </div>
        </div>

        {/* Trigger Link Recovery Scenario Button */}
        <button
          onClick={handleRunScenario}
          disabled={isSimulatingScenario}
          className="px-3.5 py-1.5 bg-[var(--accent)] hover:opacity-90 disabled:opacity-50 text-white font-bold rounded text-xs transition-opacity flex items-center space-x-2 font-mono"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingScenario ? 'animate-spin' : ''}`} />
          <span>{isSimulatingScenario ? 'RUNNING RECOVERY SCENARIO...' : 'RUN LINK RECOVERY DEMO'}</span>
        </button>
      </div>

      {/* Network Topology Visual Diagram Panel */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded overflow-hidden">
        <div className="panel-header">
          <div className="flex items-center space-x-1.5 font-mono">
            <Layers className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>ACTIVE COMMUNICATION ROUTE & MESH TOPOLOGY</span>
          </div>
          <span className={`font-mono text-[10px] px-2 py-0.5 rounded border font-bold ${getStateColor(comms.state)}`}>
            ● {comms.state}
          </span>
        </div>

        <div className="p-6 bg-slate-950 flex flex-col md:flex-row items-center justify-between gap-6 min-h-[220px]">
          {/* Node 1: Station Base */}
          <div className="flex flex-col items-center p-4 bg-slate-900 border border-indigo-500/40 rounded-xl w-56 text-center space-y-1.5 shadow-lg font-mono">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-full">
              <Server className="w-6 h-6" />
            </div>
            <div className="font-bold text-white text-xs">STATION BASE</div>
            <div className="text-[11px] text-indigo-300 font-bold">10.229.134.76</div>
            <div className="text-[10px] text-slate-400">Direct Link Power: 100%</div>
          </div>

          {/* Link Connection 1 (Station -> Relay B) */}
          <div className="flex-1 flex flex-col items-center space-y-1 font-mono text-center">
            <span className="text-[10px] text-slate-400">
              {comms.state === 'RELAY_ACTIVE' ? 'Station <-> Relay Mesh' : 'Direct Link Monitor'}
            </span>
            <div className="w-full flex items-center justify-center">
              <div className={`h-1 flex-1 rounded ${comms.state === 'RELAY_ACTIVE' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">98% Link Quality</span>
          </div>

          {/* Node 2: Robot B Mobile Relay */}
          <div className={`flex flex-col items-center p-4 bg-slate-900 border rounded-xl w-56 text-center space-y-1.5 shadow-lg font-mono ${
            comms.state === 'RELAY_ACTIVE' ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-slate-800 opacity-80'
          }`}>
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-full">
              <Radio className="w-6 h-6" />
            </div>
            <div className="font-bold text-white text-xs">ROBOT B (RELAY)</div>
            <div className="text-[11px] text-amber-300 font-bold">10.229.134.77</div>
            <div className="text-[10px] text-slate-400">
              Mode: {comms.state === 'RELAY_ACTIVE' ? 'RELAY ACTIVE' : 'STANDBY'}
            </div>
          </div>

          {/* Link Connection 2 (Relay B -> Leader A) */}
          <div className="flex-1 flex flex-col items-center space-y-1 font-mono text-center">
            <span className="text-[10px] text-slate-400">
              {comms.state === 'CONNECTED_DIRECT' ? 'Direct Microwave Link' : 'Relay Hop 2'}
            </span>
            <div className="w-full flex items-center justify-center">
              <div
                className={`h-1 flex-1 rounded ${
                  comms.state === 'CONNECTED_DIRECT'
                    ? 'bg-emerald-500'
                    : comms.state === 'RELAY_ACTIVE'
                    ? 'bg-amber-500'
                    : comms.state === 'RECOVERING'
                    ? 'bg-amber-500 border-dashed animate-pulse'
                    : 'bg-red-500 border-dashed'
                }`}
              />
            </div>
            <span className={comms.state === 'LOST' ? 'text-red-400 font-bold text-[10px]' : 'text-emerald-400 font-bold text-[10px]'}>
              {comms.state === 'LOST' ? 'LINK BROKEN (0%)' : `${robotA.signal || 92}% RSSI (-64 dBm)`}
            </span>
          </div>

          {/* Node 3: Robot A Leader */}
          <div className="flex flex-col items-center p-4 bg-slate-900 border border-emerald-500/40 rounded-xl w-56 text-center space-y-1.5 shadow-lg font-mono">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-full">
              <Bot className="w-6 h-6" />
            </div>
            <div className="font-bold text-white text-xs">ROBOT A (LEADER)</div>
            <div className="text-[11px] text-emerald-300 font-bold">Feed: 10.229.134.182</div>
            <div className="text-[10px] text-slate-400">Target Unit Leader</div>
          </div>
        </div>
      </div>

      {/* Real-time Link Metrics Table */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
        {/* Metric 1: Signal RSSI */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded p-3 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-[var(--ink-2)]">Direct Wireless RSSI:</span>
            <strong className="text-[var(--ok)]">{robotA.signal || 92}% (-64 dBm)</strong>
          </div>
          <div className="w-full bg-[var(--surface-2)] h-2 rounded overflow-hidden border border-[var(--line)]">
            <div className="bg-[var(--ok)] h-full transition-all" style={{ width: `${robotA.signal || 92}%` }} />
          </div>
          <div className="text-[10px] text-[var(--ink-3)]">Frequency Band: 5.8 GHz High-Throughput</div>
        </div>

        {/* Metric 2: Mesh Hop Count */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded p-3 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-[var(--ink-2)]">Mesh Topology Hops:</span>
            <strong className="text-[var(--accent)]">{comms.state === 'RELAY_ACTIVE' ? '2 HOPS (VIA B)' : '1 HOP (DIRECT)'}</strong>
          </div>
          <div className="w-full bg-[var(--surface-2)] h-2 rounded overflow-hidden border border-[var(--line)]">
            <div className="bg-[var(--accent)] h-full" style={{ width: comms.state === 'RELAY_ACTIVE' ? '100%' : '50%' }} />
          </div>
          <div className="text-[10px] text-[var(--ink-3)]">Active Route: {comms.state === 'RELAY_ACTIVE' ? 'Station -> Robot B -> Robot A' : 'Station -> Robot A'}</div>
        </div>

        {/* Metric 3: Heartbeat Latency */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded p-3 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-[var(--ink-2)]">Heartbeat Ping Latency:</span>
            <strong className="text-[var(--ink)]">14 ms</strong>
          </div>
          <div className="w-full bg-[var(--surface-2)] h-2 rounded overflow-hidden border border-[var(--line)]">
            <div className="bg-[var(--ink)] h-full" style={{ width: '25%' }} />
          </div>
          <div className="text-[10px] text-[var(--ink-3)]">Packet Loss: 0.00% (Lossless)</div>
        </div>
      </div>

      {/* 5-Stage Link Recovery State Machine Explanation */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded p-4 space-y-3 font-mono">
        <div className="panel-header -mx-4 -mt-4 mb-2">
          <span>5-STAGE COMMUNICATION LINK RECOVERY SPECIFICATION</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs">
          <div className="p-2.5 bg-[var(--surface-2)] border border-[var(--line)] rounded space-y-1">
            <div className="font-bold text-[var(--ok)]">1. CONNECTED_DIRECT</div>
            <p className="text-[10px] text-[var(--ink-2)] font-sans leading-tight">
              Station & Robot A communicate directly over high-gain 5.8GHz link.
            </p>
          </div>

          <div className="p-2.5 bg-[var(--surface-2)] border border-[var(--line)] rounded space-y-1">
            <div className="font-bold text-[var(--warn)]">2. DEGRADED</div>
            <p className="text-[10px] text-[var(--ink-2)] font-sans leading-tight">
              RSSI drops below -75 dBm due to rubble collapse obstruction.
            </p>
          </div>

          <div className="p-2.5 bg-[var(--surface-2)] border border-[var(--line)] rounded space-y-1">
            <div className="font-bold text-[var(--danger)]">3. LOST</div>
            <p className="text-[10px] text-[var(--ink-2)] font-sans leading-tight">
              Direct connection lost. Robot A halts motion and waits for relay.
            </p>
          </div>

          <div className="p-2.5 bg-[var(--surface-2)] border border-[var(--line)] rounded space-y-1">
            <div className="font-bold text-[var(--relay)]">4. RECOVERING</div>
            <p className="text-[10px] text-[var(--ink-2)] font-sans leading-tight">
              Robot B moves to optimal position between Station & Robot A.
            </p>
          </div>

          <div className="p-2.5 bg-[var(--surface-2)] border border-[var(--line)] rounded space-y-1">
            <div className="font-bold text-[var(--ok)]">5. RELAY_ACTIVE</div>
            <p className="text-[10px] text-[var(--ink-2)] font-sans leading-tight">
              Mesh route established: Station &harr; Robot B &harr; Robot A.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
