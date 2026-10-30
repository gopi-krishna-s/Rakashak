import React from 'react';
import { useApp } from '../context/AppContext';
import { Compass, Play, Pause, CheckCircle2, AlertTriangle, Shield, MapPin, Bot } from 'lucide-react';

export const Operations = () => {
  const { mission, setMission, robots, addToast } = useApp();

  const handleStatusChange = (newStatus) => {
    setMission((prev) => ({ ...prev, status: newStatus }));
    addToast('info', `Mission status changed to ${newStatus}`);
  };

  const sectors = [
    { id: 'SEC-A', name: 'Sector A (North Collapse)', progress: 85, status: 'SEARCHING', robot: 'ROBOT-A' },
    { id: 'SEC-B', name: 'Sector B (East Rubble Pile)', progress: 60, status: 'RELAY_ACTIVE', robot: 'ROBOT-B' },
    { id: 'SEC-C', name: 'Sector C (South Perimeter)', progress: 40, status: 'PENDING', robot: 'ROBOT-A' },
    { id: 'SEC-D', name: 'Sector D (West Tunnel Access)', progress: 10, status: 'UNEXPLORED', robot: 'UNASSIGNED' },
  ];

  return (
    <div className="space-y-4 overflow-y-auto h-full select-none font-sans text-xs">
      {/* Header Panel */}
      <div className="bg-[var(--surface-2)] border border-[var(--line)] p-3 rounded flex flex-wrap items-center justify-between gap-2 font-mono">
        <div className="flex items-center space-x-2">
          <Compass className="w-5 h-5 text-[var(--accent)]" />
          <div>
            <h1 className="text-sm font-bold text-[var(--ink)]">DISASTER RESPONSE OPERATIONS CONTROL</h1>
            <p className="text-[11px] text-[var(--ink-2)]">
              Current Mission: <strong className="text-[var(--ink)]">{mission.name || 'Disaster Zone Search Alpha'}</strong> | Status: <strong className="text-[var(--ok)]">{mission.status || 'ACTIVE'}</strong>
            </p>
          </div>
        </div>

        {/* Mission Status Switcher */}
        <div className="flex items-center space-x-1.5 border border-[var(--line)] bg-[var(--surface)] p-1 rounded font-mono">
          <button
            onClick={() => handleStatusChange('ACTIVE')}
            className={`px-3 py-1 rounded text-xs font-bold border transition-colors ${
              mission.status === 'ACTIVE'
                ? 'bg-[var(--ok)] text-white border-[var(--ok)]'
                : 'bg-transparent text-[var(--ink-2)] border-transparent hover:text-[var(--ink)]'
            }`}
          >
            ACTIVE
          </button>
          <button
            onClick={() => handleStatusChange('PAUSED')}
            className={`px-3 py-1 rounded text-xs font-bold border transition-colors ${
              mission.status === 'PAUSED'
                ? 'bg-[var(--warn)] text-white border-[var(--warn)]'
                : 'bg-transparent text-[var(--ink-2)] border-transparent hover:text-[var(--ink)]'
            }`}
          >
            PAUSED
          </button>
          <button
            onClick={() => handleStatusChange('COMPLETED')}
            className={`px-3 py-1 rounded text-xs font-bold border transition-colors ${
              mission.status === 'COMPLETED'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-transparent text-[var(--ink-2)] border-transparent hover:text-[var(--ink)]'
            }`}
          >
            COMPLETED
          </button>
        </div>
      </div>

      {/* Sector Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sectors.map((sec) => (
          <div key={sec.id} className="bg-[var(--surface)] border border-[var(--line)] rounded-lg p-3 space-y-2 font-mono">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[var(--ink)]">{sec.name}</span>
              <span className="px-2 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--line-strong)] text-[10px] text-[var(--accent)] font-bold">
                {sec.status}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-[var(--ink-2)] font-sans">Coverage Search Progress:</span>
                <strong className="text-[var(--ink)]">{sec.progress}%</strong>
              </div>
              <div className="w-full bg-[var(--surface-2)] h-2 rounded overflow-hidden border border-[var(--line)]">
                <div className="bg-[var(--accent)] h-full transition-all" style={{ width: `${sec.progress}%` }} />
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] text-[var(--ink-2)] pt-1 border-t border-[var(--line)]">
              <span>Assigned Unit: <strong className="text-[var(--ink)]">{sec.robot}</strong></span>
              <span className="text-[var(--ink-3)] font-sans">Target Area: 450 m²</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
