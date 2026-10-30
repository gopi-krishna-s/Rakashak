import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Compass, Play, Pause, Square, Plus, Trash2, MapPin, CheckCircle2 } from 'lucide-react';

export const MissionPlanner = () => {
  const { mission, setMission, addLog } = useApp();
  const [selectedPattern, setSelectedPattern] = useState(mission.pattern || 'Lawnmower Grid');
  const [wptNameInput, setWptNameInput] = useState('');
  const [wptLatInput, setWptLatInput] = useState('37.7750');
  const [wptLngInput, setWptLngInput] = useState('-122.4190');

  const handleStartMission = () => {
    setMission((prev) => ({ ...prev, status: 'ACTIVE' }));
    addLog('INFO', 'MIS_START', `Autonomous mission "${mission.name}" started`, 'SYSTEM');
  };

  const handlePauseMission = () => {
    setMission((prev) => ({ ...prev, status: 'PAUSED' }));
    addLog('WARN', 'MIS_PAUSE', `Autonomous mission "${mission.name}" paused by operator`, 'SYSTEM');
  };

  const handleAbortMission = () => {
    setMission((prev) => ({ ...prev, status: 'ABORTED' }));
    addLog('CRITICAL', 'MIS_ABORT', `Autonomous mission "${mission.name}" ABORTED`, 'SYSTEM');
  };

  const handleAddWaypoint = (e) => {
    e.preventDefault();
    if (!wptNameInput) return;
    const newWpt = {
      id: `W${mission.waypoints.length + 1}`,
      lat: parseFloat(wptLatInput) || 37.7749,
      lng: parseFloat(wptLngInput) || -122.4194,
      status: 'pending',
      name: wptNameInput,
    };
    setMission((prev) => ({ ...prev, waypoints: [...prev.waypoints, newWpt] }));
    setWptNameInput('');
  };

  const handleRemoveWaypoint = (wptId) => {
    setMission((prev) => ({
      ...prev,
      waypoints: prev.waypoints.filter((w) => w.id !== wptId),
    }));
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-brand-600/20 text-brand-400 rounded">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">AUTONOMOUS MISSION PLANNER</h1>
            <p className="text-xs text-slate-400">Search pattern generator & waypoint route planner</p>
          </div>
        </div>

        {/* Mission Status Action Controls */}
        <div className="flex items-center space-x-2">
          {mission.status !== 'ACTIVE' ? (
            <button
              onClick={handleStartMission}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded text-xs font-bold transition-colors shadow-lg shadow-emerald-600/30"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Mission</span>
            </button>
          ) : (
            <button
              onClick={handlePauseMission}
              className="flex items-center space-x-1.5 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded text-xs font-bold transition-colors"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause Mission</span>
            </button>
          )}

          <button
            onClick={handleAbortMission}
            className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded text-xs font-bold transition-colors"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Abort Mission</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Search Pattern Config & Add Wpt */}
        <div className="space-y-6">
          {/* Search Pattern Generator */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
              Select Autonomous Pattern
            </h2>
            <div className="space-y-2">
              {['Lawnmower Grid', 'Perimeter Sweep', 'Spiral Outward', 'Point-to-Point Waypoints'].map((pat) => (
                <button
                  key={pat}
                  onClick={() => {
                    setSelectedPattern(pat);
                    setMission((prev) => ({ ...prev, pattern: pat }));
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border text-xs font-semibold transition-all ${
                    selectedPattern === pat
                      ? 'bg-brand-600/15 border-brand-500 text-brand-400'
                      : 'bg-slate-850 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{pat}</span>
                  {selectedPattern === pat && <CheckCircle2 className="w-4 h-4 text-brand-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Add Waypoint Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
              Add Manual Checkpoint
            </h2>
            <form onSubmit={handleAddWaypoint} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Checkpoint Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sector C North Entrance"
                  value={wptNameInput}
                  onChange={(e) => setWptNameInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Latitude</label>
                  <input
                    type="text"
                    value={wptLatInput}
                    onChange={(e) => setWptLatInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100 font-mono focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Longitude</label>
                  <input
                    type="text"
                    value={wptLngInput}
                    onChange={(e) => setWptLngInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100 font-mono focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-1.5 bg-brand-600 hover:bg-brand-500 text-white font-bold py-2 rounded transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Waypoint to Route</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right 2 Cols: Waypoint Sequence List */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white">Mission Waypoint Sequence</h2>
            <span className="text-xs text-slate-400 font-mono">
              Total Checkpoints: {mission.waypoints.length}
            </span>
          </div>

          <div className="space-y-2">
            {mission.waypoints.map((wpt, idx) => (
              <div
                key={wpt.id}
                className="flex items-center justify-between bg-slate-850 p-3 rounded-lg border border-slate-800 text-xs font-mono"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="text-slate-100 font-bold font-sans block">{wpt.name}</span>
                    <span className="text-slate-500 text-[11px]">
                      {wpt.lat}, {wpt.lng}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      wpt.status === 'visited'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : wpt.status === 'current'
                        ? 'bg-brand-500/20 text-brand-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {wpt.status.toUpperCase()}
                  </span>

                  <button
                    onClick={() => handleRemoveWaypoint(wpt.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
