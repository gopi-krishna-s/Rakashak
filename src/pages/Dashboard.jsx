import React from 'react';
import { useApp } from '../context/AppContext';
import { Bot, Battery, Wifi, Gauge, AlertTriangle, Compass, ShieldAlert, FileDown, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { desktop } from '../utils/desktop';

export const Dashboard = () => {
  const { robots, selectedRobotId, setSelectedRobotId, mission, logs, isEstopActive, triggerEstop } = useApp();
  const navigate = useNavigate();

  const handleExportSnapshot = async () => {
    const data = JSON.stringify({ mission, robots, timestamp: new Date().toISOString() }, null, 2);
    await desktop.saveFile({
      defaultName: `mission-snapshot-${Date.now()}.json`,
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
      data,
    });
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full select-none">
      {/* Top Banner / Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
        <div>
          <h1 className="text-xl font-black text-white flex items-center space-x-2">
            <span>FLEET COMMAND OVERVIEW</span>
            <span className="text-xs font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              4 UNITS ONLINE
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time telemetry and operational control for field deployment units.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/teleop')}
            className="flex items-center space-x-1.5 bg-brand-600 hover:bg-brand-500 text-white px-3 py-2 rounded text-xs font-bold transition-colors"
          >
            <Gauge className="w-4 h-4" />
            <span>Launch Teleoperation</span>
          </button>

          <button
            onClick={handleExportSnapshot}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Camera className="w-4 h-4" />
            <span>Export Snapshot</span>
          </button>
        </div>
      </div>

      {/* Active Alerts Banner */}
      {logs.some((l) => l.severity === 'WARN' || l.severity === 'CRITICAL') && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-3 text-amber-400 text-xs font-medium">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 animate-pulse" />
            <span>
              <strong>Alert Notice:</strong> {logs.find((l) => l.severity === 'WARN' || l.severity === 'CRITICAL')?.message}
            </span>
          </div>
          <button
            onClick={() => navigate('/logs')}
            className="text-xs text-amber-400 underline hover:text-amber-300 font-semibold"
          >
            View Logs
          </button>
        </div>
      )}

      {/* Robot Cards Grid (4 Units) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {robots.map((robot) => {
          const isSelected = robot.id === selectedRobotId;
          return (
            <div
              key={robot.id}
              onClick={() => setSelectedRobotId(robot.id)}
              className={`cursor-pointer bg-slate-900 border rounded-xl p-4 transition-all ${
                isSelected
                  ? 'border-brand-500 ring-1 ring-brand-500/50 shadow-lg shadow-brand-500/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                    {robot.id}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1">{robot.name}</h3>
                  <span className="text-xs text-slate-400">{robot.type}</span>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    robot.status === 'Moving' || robot.status === 'In-Flight'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : robot.status === 'E-STOPPED'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {robot.status}
                </span>
              </div>

              {/* Telemetry Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
                <div className="flex items-center space-x-1.5 text-slate-300">
                  <Battery className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{robot.battery}% Battery</span>
                </div>

                <div className="flex items-center space-x-1.5 text-slate-300">
                  <Wifi className="w-3.5 h-3.5 text-blue-400" />
                  <span>{robot.signal}% RSSI</span>
                </div>

                <div className="text-slate-400">
                  Speed: <span className="text-slate-200 font-mono">{robot.speed} m/s</span>
                </div>

                <div className="text-slate-400">
                  Gas: <span className="text-amber-400 font-mono">{robot.gasPpm} ppm</span>
                </div>
              </div>

              {/* Action Button inside card */}
              <div className="mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRobotId(robot.id);
                    navigate('/teleop');
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-1.5 rounded transition-colors"
                >
                  Control Unit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Mission Overview Card & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mission Summary */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Compass className="w-5 h-5 text-brand-500" />
              <h2 className="text-base font-bold text-white">Active Autonomous Mission</h2>
            </div>
            <button
              onClick={() => navigate('/missions')}
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold"
            >
              Mission Planner &rarr;
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-slate-200">{mission.name}</span>
              <span className="text-xs text-slate-400 font-mono">Pattern: {mission.pattern}</span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Progress</span>
                <span className="font-bold text-brand-400">{mission.progress}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-brand-500 h-full transition-all duration-500"
                  style={{ width: `${mission.progress}%` }}
                />
              </div>
            </div>

            {/* Mission Stats */}
            <div className="grid grid-cols-3 gap-4 pt-2 text-xs">
              <div className="bg-slate-850 p-2.5 rounded border border-slate-800">
                <div className="text-slate-400">Area Covered</div>
                <div className="text-base font-bold text-slate-100 font-mono mt-0.5">
                  {mission.areaCoveredSqM.toLocaleString()} m²
                </div>
              </div>

              <div className="bg-slate-850 p-2.5 rounded border border-slate-800">
                <div className="text-slate-400">Waypoints</div>
                <div className="text-base font-bold text-slate-100 font-mono mt-0.5">
                  {mission.waypoints.filter((w) => w.status === 'visited').length} / {mission.waypoints.length}
                </div>
              </div>

              <div className="bg-slate-850 p-2.5 rounded border border-slate-800">
                <div className="text-slate-400">Status</div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">
                  {mission.status}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Incident Log Stream */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white">Live Event Feed</h3>
            <span className="text-[10px] text-slate-500 font-mono">Recent 4 Logs</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {logs.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="bg-slate-850 p-2 rounded border border-slate-800 flex items-start space-x-2"
              >
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    log.severity === 'CRITICAL'
                      ? 'bg-red-500/20 text-red-400'
                      : log.severity === 'WARN'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  {log.severity}
                </span>
                <div className="flex-1 truncate">
                  <span className="text-slate-300">{log.message}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/logs')}
            className="w-full text-center text-xs text-slate-400 hover:text-slate-200 pt-2"
          >
            Open Incident Logs &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
