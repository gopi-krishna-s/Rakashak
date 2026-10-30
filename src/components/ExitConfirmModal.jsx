import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, LogOut, X, Square } from 'lucide-react';
import { desktop } from '../utils/desktop';

export const ExitConfirmModal = () => {
  const { showExitModal, setShowExitModal, triggerEstop } = useApp();

  if (!showExitModal) return null;

  const handleStopAndQuit = () => {
    triggerEstop();
    setTimeout(() => {
      setShowExitModal(false);
      desktop.confirmExit(true);
    }, 300);
  };

  const handleForceQuit = () => {
    setShowExitModal(false);
    desktop.confirmExit(true);
  };

  const handleCancel = () => {
    setShowExitModal(false);
    desktop.confirmExit(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-lg p-6 shadow-2xl space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/10 rounded border border-amber-500/30 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Active Mission in Progress</h3>
              <p className="text-xs text-slate-400">A robot mission is running or a unit is currently moving.</p>
            </div>
          </div>
          <button onClick={handleCancel} className="text-slate-500 hover:text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 bg-slate-800/60 p-3 rounded border border-slate-700/60 leading-relaxed">
          Closing RESCUEBOT will sever teleoperation streams and autonomous waypoint tracking.
          Would you like to issue a global stop to all robots before exiting?
        </p>

        <div className="flex flex-col space-y-2 pt-1">
          <button
            onClick={handleStopAndQuit}
            className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded text-xs transition-colors"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Issue E-Stop & Quit</span>
          </button>
          <button
            onClick={handleForceQuit}
            className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 px-4 rounded text-xs border border-slate-700"
          >
            <LogOut className="w-4 h-4" />
            <span>Force Exit Station</span>
          </button>
          <button
            onClick={handleCancel}
            className="w-full py-1.5 text-xs text-slate-400 hover:text-slate-200"
          >
            Cancel (Return to Control Station)
          </button>
        </div>
      </div>
    </div>
  );
};
