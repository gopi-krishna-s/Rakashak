import React from 'react';
import { useApp } from '../context/AppContext';
import { CommsDiagram } from '../components/comms/CommsDiagram';
import { NavLink, useNavigate } from 'react-router-dom';
import { Activity, ShieldAlert, Bot, Radio, Compass, MapPin, FileText, AlertTriangle } from 'lucide-react';

export const CommandCenter = () => {
  const { robots, comms, mission, logs, alerts, victims } = useApp();
  const navigate = useNavigate();

  const robotA = robots.find((r) => r.id === 'ROBOT-A') || {};
  const robotB = robots.find((r) => r.id === 'ROBOT-B') || {};

  const activeVictims = victims.filter((v) => v.status === 'POSSIBLE' || v.status === 'CONFIRMED');

  return (
    <div className="space-y-4 overflow-y-auto h-full select-none font-sans text-xs">
      {/* 5-Second System Status Strip */}
      <div className="bg-[var(--surface-2)] border border-[var(--line)] p-3 rounded flex flex-wrap items-center justify-between gap-2 font-mono">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-[var(--ink)] text-sm flex items-center space-x-1">
            <ShieldAlert className="w-4 h-4 text-[var(--accent)]" />
            <span>COMMAND CENTER STATUS</span>
          </span>
          <span className="text-[var(--line-strong)]">|</span>
          <span>
            Fleet: <strong className="text-[var(--ok)]">2/2 UNITS ONLINE</strong>
          </span>
          <span className="text-[var(--line-strong)]">|</span>
          <span>
            Comms:{' '}
            <strong className={comms.state === 'CONNECTED_DIRECT' ? 'text-[var(--ok)]' : 'text-[var(--relay)]'}>
              {comms.state}
            </strong>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <span>
            Victims:<strong className="text-[var(--warn)]"> {activeVictims.length} UNRESOLVED</strong>
          </span>
          <span className="text-[var(--line-strong)]">|</span>
          <span>
            Alerts:<strong className="text-[var(--danger)]"> {alerts.length} ACTIVE</strong>
          </span>
        </div>
      </div>

      {/* Active Alerts Banner */}
      {alerts.length > 0 && (
        <div className="bg-[var(--danger-bg)] border border-[var(--danger)] p-2.5 rounded text-[var(--danger)] font-mono flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span className="font-bold">ALERT NOTICE:</span>
            <span className="font-sans">{alerts[0].message}</span>
          </div>
          <NavLink to="/logs" className="underline hover:opacity-80 font-bold">
            View Log Audit &rarr;
          </NavLink>
        </div>
      )}

      {/* Top 2 Columns: Summary Panels for Robot A & Robot B */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Robot A Summary Panel */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded overflow-hidden">
          <div className="panel-header">
            <div className="flex items-center space-x-1.5">
              <Bot className="w-3.5 h-3.5 text-[var(--ink-2)]" />
              <span>ROBOT A (LEADER) SUMMARY</span>
            </div>
            <span className="font-mono text-[10px] text-[var(--ok)]">● ONLINE</span>
          </div>

          <div className="p-3 space-y-2 font-mono">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                State: <strong className="text-[var(--ink)]">{robotA.status || 'IDLE'}</strong>
              </div>
              <div>
                Mode: <strong className="text-[var(--ink)]">{robotA.mode || 'MANUAL'}</strong>
              </div>
              <div>
                Battery:{' '}
                <strong className={robotA.battery > 20 ? 'text-[var(--ok)]' : 'text-[var(--danger)]'}>
                  {robotA.battery || 0}%
                </strong>
              </div>
              <div>
                Signal: <strong className="text-[var(--accent)]">{robotA.signal || 0}%</strong>
              </div>
              <div>
                Speed: <strong className="text-[var(--ink)]">{robotA.speed || 0} m/s</strong>
              </div>
              <div>
                Temp: <strong className="text-[var(--ink)]">{robotA.tempC || 0} °C</strong>
              </div>
            </div>

            <div className="text-[11px] text-[var(--ink-2)] pt-1 border-t border-[var(--line)]">
              GPS: {robotA.location?.latitude}, {robotA.location?.longitude}
            </div>

            <div className="pt-1">
              <button
                onClick={() => navigate('/robot-a')}
                className="w-full bg-[var(--surface-2)] hover:bg-[var(--line)] text-[var(--ink)] font-bold py-1 px-2 rounded border border-[var(--line-strong)] transition-colors text-xs font-sans"
              >
                Control Robot A &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Robot B Summary Panel */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded overflow-hidden">
          <div className="panel-header">
            <div className="flex items-center space-x-1.5">
              <Radio className="w-3.5 h-3.5 text-[var(--relay)]" />
              <span>ROBOT B (RELAY) SUMMARY</span>
            </div>
            <span className="font-mono text-[10px] text-[var(--ok)]">● ONLINE</span>
          </div>

          <div className="p-3 space-y-2 font-mono">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                State: <strong className="text-[var(--ink)]">{robotB.status || 'IDLE'}</strong>
              </div>
              <div>
                Relay Mode:{' '}
                <strong className={robotB.relayState?.active ? 'text-[var(--relay)]' : 'text-[var(--ink-2)]'}>
                  {robotB.relayState?.active ? 'ACTIVE ROUTE' : 'STANDBY'}
                </strong>
              </div>
              <div>
                Battery:{' '}
                <strong className={robotB.battery > 20 ? 'text-[var(--ok)]' : 'text-[var(--danger)]'}>
                  {robotB.battery || 0}%
                </strong>
              </div>
              <div>
                Signal: <strong className="text-[var(--accent)]">{robotB.signal || 0}%</strong>
              </div>
              <div>
                Connected: <strong className="text-[var(--ink)]">{robotB.relayState?.connectedDevices?.join(', ')}</strong>
              </div>
              <div>
                Temp: <strong className="text-[var(--ink)]">{robotB.tempC || 0} °C</strong>
              </div>
            </div>

            <div className="text-[11px] text-[var(--ink-2)] pt-1 border-t border-[var(--line)]">
              GPS: {robotB.location?.latitude}, {robotB.location?.longitude}
            </div>

            <div className="pt-1">
              <button
                onClick={() => navigate('/robot-b')}
                className="w-full bg-[var(--surface-2)] hover:bg-[var(--line)] text-[var(--ink)] font-bold py-1 px-2 rounded border border-[var(--line-strong)] transition-colors text-xs font-sans"
              >
                Manage Robot B Relay &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Communication Topology & Mission Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <CommsDiagram state={comms.state} activePath={comms.activePath} />
        </div>

        {/* Mission Summary Card */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded overflow-hidden flex flex-col justify-between">
          <div className="panel-header">
            <div className="flex items-center space-x-1.5">
              <Compass className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>ACTIVE MISSION</span>
            </div>
            <span className="font-mono text-[10px] text-[var(--ok)]">{mission.status}</span>
          </div>

          <div className="p-3 space-y-3 font-mono">
            <div className="font-sans font-bold text-sm text-[var(--ink)]">{mission.name}</div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-[var(--ink-2)]">
                <span>Search Area Coverage:</span>
                <span className="font-bold text-[var(--accent)]">
                  {Math.round(((mission.coveredAreaSqM || 0) / (mission.searchAreaSqM || 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-[var(--surface-2)] h-2 rounded overflow-hidden border border-[var(--line)]">
                <div
                  className="bg-[var(--accent)] h-full transition-all"
                  style={{
                    width: `${Math.round(((mission.coveredAreaSqM || 0) / (mission.searchAreaSqM || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="text-[11px] text-[var(--ink-2)] leading-relaxed">
              Objective: {mission.objective}
            </div>
          </div>

          <div className="p-3 border-t border-[var(--line)]">
            <button
              onClick={() => navigate('/operations')}
              className="w-full bg-[var(--surface-2)] hover:bg-[var(--line)] text-[var(--ink)] font-bold py-1 px-2 rounded border border-[var(--line-strong)] text-xs font-sans"
            >
              Open Operations & Search &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Event Trail (8 events) & Mini Map Link */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Event Log Feed */}
        <div className="lg:col-span-2 bg-[var(--surface)] border border-[var(--line)] rounded overflow-hidden">
          <div className="panel-header">
            <div className="flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-[var(--ink-2)]" />
              <span>RECENT EVENT AUDIT TRAIL (LAST 8 EVENTS)</span>
            </div>
            <NavLink to="/logs" className="hover:underline text-[10px]">
              Full Logs &rarr;
            </NavLink>
          </div>

          <div className="divide-y divide-[var(--line)] font-mono text-[11px] max-h-48 overflow-y-auto">
            {logs.slice(0, 8).map((log) => (
              <div key={log.id} className="p-2 flex items-center justify-between hover:bg-[var(--surface-2)]">
                <div className="flex items-center space-x-2 truncate">
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      log.category === 'Communication'
                        ? 'bg-[var(--warn-bg)] text-[var(--warn)]'
                        : log.category === 'System'
                        ? 'bg-[var(--danger-bg)] text-[var(--danger)]'
                        : 'bg-[var(--ok-bg)] text-[var(--ok)]'
                    }`}
                  >
                    {log.category}
                  </span>
                  <span className="text-[var(--ink)] font-sans">{log.message}</span>
                </div>
                <span className="text-[var(--ink-3)] flex-shrink-0 ml-2">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mini Map Quick Link */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded overflow-hidden flex flex-col justify-between">
          <div className="panel-header">
            <div className="flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>FIELD MAP PREVIEW</span>
            </div>
          </div>

          <div className="p-4 text-center space-y-2 bg-[var(--surface-2)] flex-1 flex flex-col items-center justify-center">
            <MapPin className="w-8 h-8 text-[var(--accent)]" />
            <div className="font-mono text-xs text-[var(--ink-2)]">
              San Francisco Disaster Sector Alpha Grid
            </div>
            <button
              onClick={() => navigate('/map')}
              className="bg-[var(--accent)] text-white font-bold px-4 py-1.5 rounded text-xs hover:opacity-90 transition-opacity font-sans"
            >
              Open Full Operational Map &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
