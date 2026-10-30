import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertOctagon, RotateCcw, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const EStopOverlay = () => {
  const { isEstopActive, resetEstop } = useApp();
  const navigate = useNavigate();

  if (!isEstopActive) return null;

  return (
    <div className="fixed inset-0 bg-red-950/90 backdrop-blur-md z-50 flex items-center justify-center p-6 text-center select-none animate-fade-in">
      <div className="max-w-lg w-full bg-slate-900 border-2 border-red-600 rounded-xl p-6 shadow-2xl shadow-red-900/50 space-y-6">
        <div className="flex justify-center">
          <AlertOctagon className="w-20 h-20 text-red-500 animate-bounce" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">
            GLOBAL EMERGENCY STOP ACTIVE
          </h2>
          <p className="text-sm text-red-300 mt-2 font-medium">
            All robot motors, thrusters, and autonomous navigation missions have been immediately halted.
          </p>
        </div>

        <div className="bg-red-950/50 border border-red-800/60 p-3 rounded text-xs text-red-200 font-mono">
          STATUS: ROBOTS HALTED | MISSION ABORTED | LOG ENTRY CREATED
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={resetEstop}
            className="flex-1 flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded transition-colors text-xs tracking-wider shadow-lg shadow-emerald-600/30"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESET EMERGENCY STOP</span>
          </button>
          <button
            onClick={() => navigate('/logs')}
            className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2.5 px-4 rounded transition-colors text-xs border border-slate-700"
          >
            <FileText className="w-4 h-4" />
            <span>VIEW EVENT LOGS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
