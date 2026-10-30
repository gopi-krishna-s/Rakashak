import React from 'react';
import { useApp } from '../context/AppContext';
import { BarChart3, Download, Award, Compass, MapPin } from 'lucide-react';
import { desktop } from '../utils/desktop';

export const AnalyticsReports = () => {
  const { mission, robots } = useApp();

  const handleExportReport = async () => {
    const reportData = {
      missionSummary: mission,
      fleetSummary: robots.map((r) => ({ id: r.id, name: r.name, battery: r.battery, status: r.status })),
      generatedAt: new Date().toISOString(),
    };

    await desktop.saveFile({
      defaultName: `rescuebot-post-mission-report-${Date.now()}.json`,
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
      data: JSON.stringify(reportData, null, 2),
    });
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full select-none">
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-brand-600/20 text-brand-400 rounded">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">ANALYTICS & MISSION REPORTS</h1>
            <p className="text-xs text-slate-400">Field telemetry metrics, area coverage, and diagnostic reports</p>
          </div>
        </div>

        <button
          onClick={handleExportReport}
          className="flex items-center space-x-1.5 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded text-xs font-bold transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export Mission Report</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400">Total Search Area Covered</div>
          <div className="text-2xl font-bold text-slate-100 font-mono mt-1">
            {mission.areaCoveredSqM.toLocaleString()} m²
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">94% grid coverage target</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400">Active Mission Duration</div>
          <div className="text-2xl font-bold text-slate-100 font-mono mt-1">00:42:15</div>
          <p className="text-[11px] text-slate-500 mt-1">Started at 18:54:32</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400">Hazard Detection Hits</div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">3 Alerts</div>
          <p className="text-[11px] text-amber-400/80 mt-1">CO₂ Elevated in Sector B</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400">Fleet Average Battery</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {Math.round(robots.reduce((acc, r) => acc + r.battery, 0) / robots.length)}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Estimated 2.8 hrs remaining</p>
        </div>
      </div>
    </div>
  );
};
