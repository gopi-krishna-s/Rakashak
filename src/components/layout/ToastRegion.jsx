import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export const ToastRegion = () => {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none select-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-3 rounded border shadow-lg flex items-start space-x-2.5 text-xs font-mono animate-slide-in ${
            toast.type === 'error'
              ? 'bg-[var(--danger-bg)] text-[var(--danger)] border-[var(--danger)]'
              : toast.type === 'warn'
              ? 'bg-[var(--warn-bg)] text-[var(--warn)] border-[var(--warn)]'
              : 'bg-[var(--ok-bg)] text-[var(--ok)] border-[var(--ok)]'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1 font-semibold">{toast.message}</div>
        </div>
      ))}
    </div>
  );
};
