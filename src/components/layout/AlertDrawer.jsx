import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Check, Bell, AlertTriangle } from 'lucide-react';
import { alertService } from '../../services/factory';

export const AlertDrawer = () => {
  const { isAlertDrawerOpen, setIsAlertDrawerOpen, alerts } = useApp();

  if (!isAlertDrawerOpen) return null;

  const handleAck = (id) => {
    alertService.acknowledgeAlert(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs select-none">
      <div className="w-96 bg-[var(--surface)] border-l border-[var(--line-strong)] h-full flex flex-col justify-between shadow-2xl">
        <div className="panel-header">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-[var(--ink)]" />
            <span>Active System Alerts ({alerts.length})</span>
          </div>
          <button
            onClick={() => setIsAlertDrawerOpen(false)}
            className="text-[var(--ink-2)] hover:text-[var(--ink)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-xs">
          {alerts.length === 0 ? (
            <div className="text-[var(--ink-3)] italic text-center py-8">No active system alerts</div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded border flex flex-col space-y-2 ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-[var(--danger-bg)] border-[var(--danger)] text-[var(--danger)]'
                    : alert.severity === 'WARNING'
                    ? 'bg-[var(--warn-bg)] border-[var(--warn)] text-[var(--warn)]'
                    : 'bg-[var(--surface-2)] border-[var(--line)] text-[var(--ink)]'
                }`}
              >
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span>[{alert.severity}] {alert.source}</span>
                  <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                </div>

                <div className="font-sans font-semibold text-xs leading-snug">{alert.message}</div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-[10px] uppercase font-bold">
                    Status: {alert.status}
                  </span>
                  {alert.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleAck(alert.id)}
                      className="px-2 py-0.5 rounded bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] text-[10px] font-bold hover:bg-[var(--surface-2)]"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
