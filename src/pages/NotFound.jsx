import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex items-center justify-center p-6 text-center select-none bg-slate-950">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-6 shadow-2xl">
        <div className="flex justify-center">
          <div className="p-4 bg-amber-500/10 rounded-full border border-amber-500/30 text-amber-400">
            <AlertTriangle className="w-16 h-16" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white">404 - ROUTE NOT FOUND</h1>
          <p className="text-xs text-slate-400 font-mono">
            The hash route requested does not correspond to an active RESCUEBOT control page.
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-center space-x-2 bg-brand-600 hover:bg-brand-500 text-white font-bold py-2.5 px-4 rounded-lg text-xs shadow-lg shadow-brand-600/30 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Return to Fleet Dashboard</span>
        </button>
      </div>
    </div>
  );
};
