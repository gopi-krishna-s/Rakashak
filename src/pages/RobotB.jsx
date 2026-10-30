import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DeadManPad } from '../components/robots/DeadManPad';
import { Radio, Battery, Wifi, Activity, AlertTriangle, MapPin, Compass } from 'lucide-react';
import { commsService } from '../services/factory';

export const RobotB = () => {
  const { robots, comms, addToast } = useApp();
  const robotB = robots.find((r) => r.id === 'ROBOT-B') || {};

  const [confirmRelayOffModal, setConfirmRelayOffModal] = useState(false);
  const [repositionModal, setRepositionModal] = useState(false);
  const [targetLat, setTargetLat] = useState('37.7753');
  const [targetLng, setTargetLng] = useState('-122.4185');

  const handleToggleRelay = () => {
    if (robotB.relayState?.active) {
      setConfirmRelayOffModal(true);
    } else {
      commsService.toggleRelay('ROBOT-B', true);
      addToast('info', 'Robot B Mobile Communication Relay ENGAGED');
    }
  };

  const confirmTurnRelayOff = () => {
    commsService.toggleRelay('ROBOT-B', false);
    setConfirmRelayOffModal(false);
    addToast('warn', 'Robot B Relay Deactivated - Returning to Direct Communication');
  };

  const handleRepositionRelay = (e) => {
    e.preventDefault();
    setRepositionModal(false);
    addToast('info', `Robot B Repositioning to Target Coords: ${targetLat}, ${targetLng}`);
  };

  return (
    <div className="space-y-4 overflow-y-auto h-full select-none font-sans text-xs">
      {/* Header Panel */}
      <div className="bg-[var(--surface-2)] border border-[var(--line)] p-3 rounded flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Radio className="w-5 h-5 text-[var(--relay)]" />
          <div>
            <h1 className="text-sm font-bold text-[var(--ink)]">ROBOT B "RELAY" CONTROL STATION</h1>
            <p className="text-[11px] text-[var(--ink-2)] font-mono">
              Type: {robotB.type || 'Mobile Communication Relay'} | ID: ROBOT-B
            </p>
          </div>
        </div>

        {/* Relay Toggle Switch */}
        <div className="flex items-center space-x-2 font-mono">
          <span className="text-[var(--ink-2)] font-bold">RELAY MESH STATE:</span>
          <button
            onClick={handleToggleRelay}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
              robotB.relayState?.active
                ? 'bg-[var(--relay)] text-white'
                : 'bg-[var(--surface)] text-[var(--ink-2)] border border-[var(--line)]'
            }`}
          >
            {robotB.relayState?.active ? 'RELAY ACTIVE (ROUTING B->A)' : 'RELAY STANDBY'}
          </button>
        </div>
      </div>

      {/* Telemetry Metrics & Relay Connection Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Unit Status */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded p-3 space-y-2 font-mono">
          <div className="panel-header -mx-3 -mt-3 mb-2">
            <span>UNIT TELEMETRY & HARDWARE</span>
            <span className="text-[var(--ok)]">● HEALTHY</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              State: <strong className="text-[var(--ink)]">{robotB.status || 'IDLE'}</strong>
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
              Temp: <strong className="text-[var(--ink)]">{robotB.tempC || 0} °C</strong>
            </div>
          </div>

          <div className="text-[11px] text-[var(--ink-2)] pt-2 border-t border-[var(--line)]">
            Current GPS: {robotB.location?.latitude}, {robotB.location?.longitude}
          </div>
        </div>

        {/* Relay Network Info */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded p-3 space-y-2 font-mono">
          <div className="panel-header -mx-3 -mt-3 mb-2">
            <span>MOBILE RELAY MESH SPECS</span>
            <span className="text-[var(--relay)]">
              {robotB.relayState?.active ? 'ACTIVE ROUTE' : 'STANDBY'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              Route Quality: <strong className="text-[var(--ok)]">98%</strong>
            </div>
            <div>
              Hop Count: <strong className="text-[var(--ink)]">2 Hops</strong>
            </div>
            <div>
              Connected Units:{' '}
              <strong className="text-[var(--ink)]">
                {robotB.relayState?.connectedDevices?.join(', ') || 'ROBOT-A'}
              </strong>
            </div>
            <div>
              Antenna Mode: <strong className="text-[var(--ink)]">High-Gain Directional</strong>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--line)] flex justify-end">
            <button
              onClick={() => setRepositionModal(true)}
              className="bg-[var(--surface-2)] hover:bg-[var(--line)] text-[var(--ink)] font-bold py-1 px-3 rounded border border-[var(--line-strong)] text-xs font-sans"
            >
              Reposition Relay Unit &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Dead-Man Movement Pad for Robot B */}
      <div className="max-w-xl">
        <DeadManPad robotId="ROBOT-B" isAutonomous={robotB.mode === 'AUTONOMOUS'} />
      </div>

      {/* Confirm Relay OFF Modal */}
      {confirmRelayOffModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[var(--surface)] border border-[var(--line-strong)] rounded p-5 space-y-4 shadow-xl">
            <div className="flex items-center space-x-2 text-[var(--danger)]">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold">Deactivate Robot B Communication Relay?</h3>
            </div>
            <p className="text-xs text-[var(--ink-2)] leading-relaxed font-mono">
              Turning off the relay will break the active relay route (Station &harr; Robot B &harr; Robot A). If direct signal to Robot A is obstructed, communication link will be LOST.
            </p>
            <div className="flex justify-end space-x-2 pt-2 font-mono">
              <button
                onClick={() => setConfirmRelayOffModal(false)}
                className="px-3 py-1.5 rounded border border-[var(--line)] text-[var(--ink-2)] hover:bg-[var(--surface-2)]"
              >
                Cancel
              </button>
              <button
                onClick={confirmTurnRelayOff}
                className="px-3 py-1.5 rounded bg-[var(--danger)] text-white font-bold hover:opacity-90"
              >
                Confirm Deactivate Relay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reposition Relay Target Modal */}
      {repositionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleRepositionRelay}
            className="max-w-md w-full bg-[var(--surface)] border border-[var(--line-strong)] rounded p-5 space-y-4 shadow-xl"
          >
            <div className="flex items-center space-x-2 text-[var(--accent)]">
              <MapPin className="w-5 h-5" />
              <h3 className="text-sm font-bold">Reposition Robot B Relay Target Coords</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <label className="block text-[var(--ink-2)] mb-1">Target Latitude</label>
                <input
                  type="text"
                  value={targetLat}
                  onChange={(e) => setTargetLat(e.target.value)}
                  className="w-full bg-[var(--bg)] border border-[var(--line)] rounded p-2 text-[var(--ink)] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[var(--ink-2)] mb-1">Target Longitude</label>
                <input
                  type="text"
                  value={targetLng}
                  onChange={(e) => setTargetLng(e.target.value)}
                  className="w-full bg-[var(--bg)] border border-[var(--line)] rounded p-2 text-[var(--ink)] focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2 font-mono">
              <button
                type="button"
                onClick={() => setRepositionModal(false)}
                className="px-3 py-1.5 rounded border border-[var(--line)] text-[var(--ink-2)] hover:bg-[var(--surface-2)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded bg-[var(--accent)] text-white font-bold hover:opacity-90"
              >
                Execute Repositioning
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
