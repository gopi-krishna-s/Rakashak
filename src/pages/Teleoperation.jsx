import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Gamepad2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Square,
  Video,
  Eye,
  Sliders,
  ShieldAlert,
  Gauge,
  Wifi,
  Battery,
} from 'lucide-react';

export const Teleoperation = () => {
  const { robots, selectedRobotId, setSelectedRobotId, selectedRobot, setRobots, triggerEstop } = useApp();
  const [speedProfile, setSpeedProfile] = useState('Standard'); // 'Turtle' | 'Standard' | 'Sprint'
  const [ptzZoom, setPtzZoom] = useState(1);
  const [activeDirection, setActiveDirection] = useState(null);

  const maxSpeed = speedProfile === 'Turtle' ? 0.5 : speedProfile === 'Standard' ? 1.5 : 3.0;

  // Handle Motor Command (WASD / D-Pad)
  const sendDriveCommand = (dir) => {
    setActiveDirection(dir);
    setRobots((prev) =>
      prev.map((r) => {
        if (r.id !== selectedRobot.id) return r;

        let latDelta = 0;
        let lngDelta = 0;
        const speedVal = dir === 'STOP' ? 0 : maxSpeed;

        if (dir === 'FORWARD') latDelta = 0.00008;
        if (dir === 'BACKWARD') latDelta = -0.00008;
        if (dir === 'LEFT') lngDelta = -0.00008;
        if (dir === 'RIGHT') lngDelta = 0.00008;

        return {
          ...r,
          status: dir === 'STOP' ? 'Idle' : 'Moving',
          speed: speedVal,
          lat: r.lat + latDelta,
          lng: r.lng + lngDelta,
        };
      })
    );
  };

  // Keyboard driving controls (WASD & Arrow Keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['input', 'textarea'].includes(document.activeElement?.tagName?.toLowerCase())) return;
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') sendDriveCommand('FORWARD');
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') sendDriveCommand('BACKWARD');
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') sendDriveCommand('LEFT');
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') sendDriveCommand('RIGHT');
      if (e.key === ' ') sendDriveCommand('STOP');
    };

    const handleKeyUp = () => setActiveDirection(null);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedRobot.id, maxSpeed]);

  return (
    <div className="p-6 h-full flex flex-col space-y-4 overflow-y-auto select-none">
      {/* Top Teleop Header & Unit Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-brand-600/20 text-brand-400 rounded">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">TELEOPERATION CONTROLLER</h1>
            <p className="text-xs text-slate-400">Direct manual driving & PTZ camera control</p>
          </div>
        </div>

        {/* Robot Selector Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto">
          {robots.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRobotId(r.id)}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                r.id === selectedRobot.id
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {r.id}: {r.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Viewport & Driving Controls Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left 2 Cols: Live Video Stream Display */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl relative overflow-hidden flex flex-col justify-between p-4 min-h-[380px]">
          {/* Video Stream Simulated Viewport */}
          <div className="absolute inset-0 bg-slate-950 flex items-center justify-center">
            {/* Simulated Live Grid Pattern / Video Feed */}
            <div className="w-full h-full bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 flex items-center justify-center">
              <div className="text-center space-y-2">
                <Video className="w-12 h-12 text-slate-700 mx-auto animate-pulse" />
                <p className="text-xs font-mono text-slate-500">
                  LIVE STREAM FEED: {selectedRobot.id} ({selectedRobot.payload})
                </p>
                <p className="text-[10px] text-slate-600 font-mono">Zoom Level: {ptzZoom}x | 1080p 30fps</p>
              </div>
            </div>
          </div>

          {/* Stream Overlay HUD Header */}
          <div className="relative z-10 flex justify-between items-center bg-slate-900/80 backdrop-blur p-2.5 rounded-lg border border-slate-800 text-xs">
            <div className="flex items-center space-x-2 font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-slate-200 font-bold">LIVE FEED - {selectedRobot.name}</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-400 font-mono">
              <span className="flex items-center space-x-1">
                <Battery className="w-3.5 h-3.5 text-emerald-400" />
                <span>{selectedRobot.battery}%</span>
              </span>
              <span className="flex items-center space-x-1">
                <Wifi className="w-3.5 h-3.5 text-blue-400" />
                <span>{selectedRobot.signal}%</span>
              </span>
            </div>
          </div>

          {/* Stream Overlay HUD Footer (Attitude & Speed) */}
          <div className="relative z-10 flex justify-between items-end bg-slate-900/80 backdrop-blur p-3 rounded-lg border border-slate-800 text-xs font-mono">
            <div>
              <div className="text-slate-400">PITCH / ROLL / YAW</div>
              <div className="text-emerald-400 font-bold">0.4° / -1.2° / 184°</div>
            </div>
            <div className="text-right">
              <div className="text-slate-400">TELEOP SPEED</div>
              <div className="text-brand-400 font-bold text-sm">{selectedRobot.speed} m/s</div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: D-Pad & Controls Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6 flex flex-col justify-between">
          {/* Speed Profile Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Speed Profile</label>
            <div className="grid grid-cols-3 gap-2">
              {['Turtle', 'Standard', 'Sprint'].map((prof) => (
                <button
                  key={prof}
                  onClick={() => setSpeedProfile(prof)}
                  className={`py-1.5 text-xs font-bold rounded border transition-colors ${
                    speedProfile === prof
                      ? 'bg-brand-600 border-brand-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {prof}
                </button>
              ))}
            </div>
          </div>

          {/* Directional Driving D-Pad */}
          <div className="space-y-2 text-center">
            <span className="text-xs font-bold text-slate-400 uppercase">Driving D-Pad (WASD)</span>
            <div className="flex flex-col items-center space-y-2 pt-2">
              <button
                onMouseDown={() => sendDriveCommand('FORWARD')}
                onMouseUp={() => sendDriveCommand('STOP')}
                className={`p-4 rounded-lg bg-slate-800 border transition-all ${
                  activeDirection === 'FORWARD' ? 'bg-brand-600 text-white' : 'text-slate-200 hover:bg-slate-700'
                }`}
              >
                <ArrowUp className="w-6 h-6" />
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onMouseDown={() => sendDriveCommand('LEFT')}
                  onMouseUp={() => sendDriveCommand('STOP')}
                  className={`p-4 rounded-lg bg-slate-800 border transition-all ${
                    activeDirection === 'LEFT' ? 'bg-brand-600 text-white' : 'text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={() => sendDriveCommand('STOP')}
                  className="p-4 rounded-lg bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs"
                >
                  <Square className="w-6 h-6 fill-current" />
                </button>

                <button
                  onMouseDown={() => sendDriveCommand('RIGHT')}
                  onMouseUp={() => sendDriveCommand('STOP')}
                  className={`p-4 rounded-lg bg-slate-800 border transition-all ${
                    activeDirection === 'RIGHT' ? 'bg-brand-600 text-white' : 'text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>

              <button
                onMouseDown={() => sendDriveCommand('BACKWARD')}
                onMouseUp={() => sendDriveCommand('STOP')}
                className={`p-4 rounded-lg bg-slate-800 border transition-all ${
                  activeDirection === 'BACKWARD' ? 'bg-brand-600 text-white' : 'text-slate-200 hover:bg-slate-700'
                }`}
              >
                <ArrowDown className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* PTZ Camera Controls */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-400">PTZ Optical Zoom</span>
              <span className="font-mono text-slate-200">{ptzZoom}x</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPtzZoom((z) => Math.min(10, z + 1))}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-1.5 rounded text-xs font-semibold"
              >
                Zoom In +
              </button>
              <button
                onClick={() => setPtzZoom((z) => Math.max(1, z - 1))}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-1.5 rounded text-xs font-semibold"
              >
                Zoom Out -
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
