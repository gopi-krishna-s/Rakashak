import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserCheck, AlertTriangle, Filter, Plus, CheckCircle2, XCircle, Heart, Camera, Radio, Activity } from 'lucide-react';
import { victimService } from '../services/factory';

export const VictimDetection = () => {
  const { victims, setVictims, addToast } = useApp();
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVictimForm, setNewVictimForm] = useState({
    label: 'Thermal Anomaly Alpha',
    source: 'THERMAL',
    confidence: 90,
    status: 'POSSIBLE',
    lat: 37.7750,
    lng: -122.4190,
    zone: 'Sector Alpha Collapse',
    notes: 'Detected heat signature and motion pattern',
  });

  const filteredVictims = filterStatus === 'ALL'
    ? victims
    : victims.filter((v) => v.status === filterStatus);

  const handleUpdateStatus = async (vicId, newStatus) => {
    setVictims((prev) =>
      prev.map((v) => (v.id === vicId ? { ...v, status: newStatus } : v))
    );
    addToast('info', `Victim ${vicId} status updated to ${newStatus}`);
    await victimService.updateStatus(vicId, newStatus);
  };

  const handleAddVictim = async (e) => {
    e.preventDefault();
    const vicId = `VIC-${Date.now().toString().slice(-3)}`;
    const createdVictim = {
      id: vicId,
      label: newVictimForm.label,
      source: newVictimForm.source,
      confidence: parseInt(newVictimForm.confidence, 10),
      status: newVictimForm.status,
      location: {
        latitude: parseFloat(newVictimForm.lat),
        longitude: parseFloat(newVictimForm.lng),
        zone: newVictimForm.zone,
      },
      timestamp: new Date().toISOString(),
      notes: newVictimForm.notes,
      origin: 'simulated',
    };

    setVictims((prev) => [createdVictim, ...prev]);
    setShowAddModal(false);
    addToast('warn', `New Victim Detection Added: ${vicId}`);
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'CAMERA':
        return <Camera className="w-4 h-4 text-sky-400" />;
      case 'THERMAL':
        return <Activity className="w-4 h-4 text-amber-400" />;
      case 'CSI-WIFI':
        return <Radio className="w-4 h-4 text-purple-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-red-950/40 text-red-400 border-red-500';
      case 'POSSIBLE':
        return 'bg-amber-950/40 text-amber-400 border-amber-500';
      case 'RESCUED':
        return 'bg-emerald-950/40 text-emerald-400 border-emerald-500';
      case 'FALSE_POSITIVE':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-4 overflow-y-auto h-full select-none font-sans text-xs">
      {/* Header Panel */}
      <div className="bg-[var(--surface-2)] border border-[var(--line)] p-3 rounded flex flex-wrap items-center justify-between gap-2 font-mono">
        <div className="flex items-center space-x-2">
          <UserCheck className="w-5 h-5 text-[var(--accent)]" />
          <div>
            <h1 className="text-sm font-bold text-[var(--ink)]">VICTIM DETECTION & SEARCH TRIAGE</h1>
            <p className="text-[11px] text-[var(--ink-2)]">
              Unresolved Anomalies: <strong className="text-[var(--warn)]">{victims.filter((v) => v.status === 'POSSIBLE' || v.status === 'CONFIRMED').length}</strong> | Total Tracked: <strong>{victims.length}</strong>
            </p>
          </div>
        </div>

        {/* Filter Pills & Add Button */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1 border border-[var(--line)] bg-[var(--surface)] p-1 rounded">
            {['ALL', 'POSSIBLE', 'CONFIRMED', 'RESCUED', 'FALSE_POSITIVE'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-0.5 rounded text-[11px] font-bold border transition-colors ${
                  filterStatus === st
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                    : 'bg-transparent text-[var(--ink-2)] border-transparent hover:text-[var(--ink)]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1 bg-[var(--accent)] hover:opacity-90 text-white font-bold rounded text-xs flex items-center space-x-1 font-mono"
          >
            <Plus className="w-4 h-4" />
            <span>Flag Victim Anomaly</span>
          </button>
        </div>
      </div>

      {/* Victim Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVictims.map((vic) => (
          <div
            key={vic.id}
            className="bg-[var(--surface)] border border-[var(--line)] rounded-lg p-3 space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              {/* Top Card Header */}
              <div className="flex justify-between items-start font-mono">
                <div className="flex items-center space-x-1.5">
                  {getSourceIcon(vic.source)}
                  <span className="font-bold text-[var(--ink)]">{vic.id}</span>
                </div>
                <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getStatusBadge(vic.status)}`}>
                  {vic.status}
                </span>
              </div>

              {/* Victim Title & Confidence */}
              <div>
                <h3 className="font-bold text-sm text-[var(--ink)]">{vic.label || `Detection ${vic.id}`}</h3>
                <div className="flex items-center space-x-2 font-mono text-[11px] text-[var(--ink-2)] pt-1">
                  <span>Source: <strong className="text-[var(--ink)]">{vic.source}</strong></span>
                  <span>|</span>
                  <span>Confidence: <strong className="text-[var(--accent)]">{vic.confidence}%</strong></span>
                </div>
              </div>

              {/* Location & Notes */}
              <div className="bg-[var(--surface-2)] p-2.5 rounded border border-[var(--line)] font-mono space-y-1 text-[11px]">
                <div className="text-[var(--ink-2)]">Zone: <strong className="text-[var(--ink)]">{vic.location?.zone || 'Disaster Sector'}</strong></div>
                <div className="text-[var(--ink-3)]">
                  GPS: {vic.location?.latitude?.toFixed(5)}, {vic.location?.longitude?.toFixed(5)}
                </div>
                <p className="text-[var(--ink-2)] font-sans italic pt-1">{vic.notes || 'No operator notes added.'}</p>
              </div>
            </div>

            {/* Triage Action Buttons */}
            <div className="pt-2 border-t border-[var(--line)] flex flex-wrap gap-1.5 font-mono">
              <button
                onClick={() => handleUpdateStatus(vic.id, 'CONFIRMED')}
                className="flex-1 py-1 bg-red-950/30 hover:bg-red-950/60 text-red-400 border border-red-500 rounded text-[11px] font-bold text-center"
              >
                Confirm
              </button>
              <button
                onClick={() => handleUpdateStatus(vic.id, 'RESCUED')}
                className="flex-1 py-1 bg-emerald-950/30 hover:bg-emerald-950/60 text-emerald-400 border border-emerald-500 rounded text-[11px] font-bold text-center"
              >
                Rescued
              </button>
              <button
                onClick={() => handleUpdateStatus(vic.id, 'FALSE_POSITIVE')}
                className="py-1 px-2 bg-[var(--surface-2)] hover:bg-[var(--line)] text-[var(--ink-2)] border border-[var(--line)] rounded text-[11px] font-bold text-center"
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Victim Anomaly Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
          <form onSubmit={handleAddVictim} className="bg-[var(--surface)] border border-[var(--line)] rounded-lg p-5 max-w-md w-full space-y-3 font-mono">
            <div className="flex justify-between items-center border-b border-[var(--line)] pb-2 font-bold text-sm text-[var(--ink)]">
              <span>FLAG NEW VICTIM ANOMALY</span>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-[var(--ink-3)] hover:text-[var(--ink)]">✕</button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-[var(--ink-2)] font-bold mb-1">Anomaly Label</label>
                <input
                  type="text"
                  value={newVictimForm.label}
                  onChange={(e) => setNewVictimForm({ ...newVictimForm, label: e.target.value })}
                  className="w-full bg-[var(--surface-2)] border border-[var(--line)] rounded p-2 text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--ink-2)] font-bold mb-1">Detection Source</label>
                  <select
                    value={newVictimForm.source}
                    onChange={(e) => setNewVictimForm({ ...newVictimForm, source: e.target.value })}
                    className="w-full bg-[var(--surface-2)] border border-[var(--line)] rounded p-2 text-[var(--ink)]"
                  >
                    <option value="THERMAL">THERMAL</option>
                    <option value="CAMERA">CAMERA</option>
                    <option value="CSI-WIFI">CSI-WIFI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[var(--ink-2)] font-bold mb-1">Confidence %</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newVictimForm.confidence}
                    onChange={(e) => setNewVictimForm({ ...newVictimForm, confidence: e.target.value })}
                    className="w-full bg-[var(--surface-2)] border border-[var(--line)] rounded p-2 text-[var(--ink)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--ink-2)] font-bold mb-1">Sector Zone</label>
                <input
                  type="text"
                  value={newVictimForm.zone}
                  onChange={(e) => setNewVictimForm({ ...newVictimForm, zone: e.target.value })}
                  className="w-full bg-[var(--surface-2)] border border-[var(--line)] rounded p-2 text-[var(--ink)]"
                />
              </div>

              <div>
                <label className="block text-[var(--ink-2)] font-bold mb-1">Operator Notes</label>
                <textarea
                  rows="2"
                  value={newVictimForm.notes}
                  onChange={(e) => setNewVictimForm({ ...newVictimForm, notes: e.target.value })}
                  className="w-full bg-[var(--surface-2)] border border-[var(--line)] rounded p-2 text-[var(--ink)] font-sans"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--line)] rounded text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[var(--accent)] text-white rounded text-xs font-bold"
              >
                Save Anomaly
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
