import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bot, Battery, Wifi, Cpu, Wrench, RefreshCw, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

export const FleetManagement = () => {
  const { robots, setRobots, addLog } = useApp();
  const [testingRobotId, setTestingRobotId] = useState(null);

  const handleRunDiagnostics = (robotId) => {
    setTestingRobotId(robotId);
    addLog('INFO', 'DIAG_START', `Diagnostic self-test initiated for ${robotId}`, robotId);

    setTimeout(() => {
      setTestingRobotId(null);
      setRobots((prev) =>
        prev.map((r) => (r.id === robotId ? { ...r, lastPing: `${Math.floor(Math.random() * 10 + 5)} ms` } : r))
      );
      addLog('INFO', 'DIAG_PASS', `All hardware subsystems PASSED for ${robotId}`, robotId);
    }, 1500);
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full select-none">
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <h1 className="text-xl font-black text-white flex items-center space-x-2">
            <Bot className="w-6 h-6 text-brand-500" />
            <span>FLEET HARDWARE & UNITS MANAGEMENT</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Hardware health diagnostics, connection IP configurations, and payload calibration.
          </p>
        </div>
        <div className="text-xs font-mono bg-slate-800 text-emerald-400 px-3 py-1.5 rounded border border-slate-700">
          4 Units Registered & Connected
        </div>
      </div>

      {/* Robot Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {robots.map((robot) => (
          <div
            key={robot.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg hover:border-slate-700 transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold font-mono text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                    {robot.id}
                  </span>
                  <h2 className="text-base font-bold text-white">{robot.name}</h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Type: {robot.type}</p>
              </div>

              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  robot.status === 'Moving' || robot.status === 'In-Flight'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {robot.status}
              </span>
            </div>

            {/* Subsystems & Specs Table */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">
              <div>
                <span className="text-slate-500">IP Address:</span>
                <span className="text-slate-200 block font-semibold">192.168.1.{robot.id === 'RB-01' ? '101' : robot.id === 'RB-02' ? '102' : robot.id === 'RB-03' ? '103' : '104'}</span>
              </div>

              <div>
                <span className="text-slate-500">Latency / Ping:</span>
                <span className="text-emerald-400 block font-semibold">{robot.lastPing}</span>
              </div>

              <div>
                <span className="text-slate-500">Payload Bay:</span>
                <span className="text-slate-300 block truncate">{robot.payload}</span>
              </div>

              <div>
                <span className="text-slate-500">Firmware:</span>
                <span className="text-slate-300 block">v2.4.1-rc3</span>
              </div>
            </div>

            {/* Health & Metrics */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-800/60 p-2.5 rounded border border-slate-800">
                <div className="text-slate-400 flex items-center space-x-1">
                  <Battery className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Battery</span>
                </div>
                <div className="text-sm font-bold text-slate-100 font-mono mt-1">{robot.battery}%</div>
              </div>

              <div className="bg-slate-800/60 p-2.5 rounded border border-slate-800">
                <div className="text-slate-400 flex items-center space-x-1">
                  <Wifi className="w-3.5 h-3.5 text-blue-400" />
                  <span>RSSI Signal</span>
                </div>
                <div className="text-sm font-bold text-slate-100 font-mono mt-1">{robot.signal}%</div>
              </div>

              <div className="bg-slate-800/60 p-2.5 rounded border border-slate-800">
                <div className="text-slate-400 flex items-center space-x-1">
                  <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  <span>LiDAR Status</span>
                </div>
                <div className="text-sm font-bold text-emerald-400 mt-1">{robot.lidarStatus}</div>
              </div>
            </div>

            {/* Diagnostic Action Button */}
            <div className="pt-2">
              <button
                onClick={() => handleRunDiagnostics(robot.id)}
                disabled={testingRobotId === robot.id}
                className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2 rounded text-xs border border-slate-700 transition-colors"
              >
                {testingRobotId === robot.id ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-brand-400" />
                    <span>Running Hardware Diagnostics...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Run Diagnostic Self-Test</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
