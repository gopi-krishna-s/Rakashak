import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Download, FolderOpen, Filter, AlertTriangle, ShieldAlert, CheckCircle, Info } from 'lucide-react';
import { desktop } from '../utils/desktop';

export const EventLogs = () => {
  const { logs, addToast } = useApp();
  const [filterLevel, setFilterLevel] = useState('ALL');

  const filteredLogs = filterLevel === 'ALL'
    ? logs
    : logs.filter((l) => l.level === filterLevel || l.type === filterLevel);

  const handleExportLogs = async () => {
    const textContent = logs
      .map((l) => `[${l.timestamp || new Date().toISOString()}] [${l.level || l.type || 'INFO'}] [${l.source || 'SYSTEM'}] ${l.message || l.details}`)
      .join('\n');

    await desktop.saveFile({
      defaultName: `rescuebot-event-logs-${Date.now()}.txt`,
      filters: [{ name: 'Text Documents', extensions: ['txt'] }],
      data: textContent,
      isBinary: false,
    });
    addToast('info', 'Incident Logs Exported Successfully');
  };

  const getLevelBadge = (lvl) => {
    switch (lvl) {
      case 'ERROR':
      case 'ESTOP':
        return 'bg-red-950/40 text-red-400 border-red-500 font-bold';
      case 'WARN':
        return 'bg-amber-950/40 text-amber-400 border-amber-500 font-bold';
      case 'INFO':
        return 'bg-sky-950/40 text-sky-400 border-sky-500 font-bold';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-4 overflow-y-auto h-full select-none font-sans text-xs">
      {/* Header Bar */}
      <div className="bg-[var(--surface-2)] border border-[var(--line)] p-3 rounded flex flex-wrap items-center justify-between gap-2 font-mono">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-[var(--accent)]" />
          <div>
            <h1 className="text-sm font-bold text-[var(--ink)]">EVENT LOGS & INCIDENT AUDIT TRAIL</h1>
            <p className="text-[11px] text-[var(--ink-2)]">
              Total Recorded Events: <strong>{logs.length}</strong> | Filter Level: <strong className="text-[var(--accent)]">{filterLevel}</strong>
            </p>
          </div>
        </div>

        {/* Filter Pills & Export Buttons */}
        <div className="flex flex-wrap items-center gap-2 font-mono">
          <div className="flex items-center space-x-1 border border-[var(--line)] bg-[var(--surface)] p-1 rounded">
            {['ALL', 'INFO', 'WARN', 'ERROR'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-2.5 py-0.5 rounded text-[11px] font-bold border transition-colors ${
                  filterLevel === lvl
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                    : 'bg-transparent text-[var(--ink-2)] border-transparent hover:text-[var(--ink)]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <button
            onClick={() => desktop.openLogsFolder()}
            className="px-3 py-1 bg-[var(--surface)] hover:bg-[var(--line)] text-[var(--ink)] border border-[var(--line-strong)] text-xs font-bold rounded flex items-center space-x-1"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Open Log Dir</span>
          </button>

          <button
            onClick={handleExportLogs}
            className="px-3 py-1 bg-[var(--accent)] hover:opacity-90 text-white font-bold rounded text-xs flex items-center space-x-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export TXT</span>
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded overflow-hidden font-mono">
        <table className="w-full text-left text-xs">
          <thead className="bg-[var(--surface-2)] text-[var(--ink-2)] border-b border-[var(--line)] text-[10px] uppercase">
            <tr>
              <th className="p-2.5">Timestamp (UTC)</th>
              <th className="p-2.5">Level</th>
              <th className="p-2.5">Source Node</th>
              <th className="p-2.5">Message / Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {filteredLogs.map((log, idx) => (
              <tr key={log.id || idx} className="hover:bg-[var(--surface-2)]/50">
                <td className="p-2.5 text-[var(--ink-3)] text-[11px] whitespace-nowrap">
                  {log.timestamp || new Date().toISOString()}
                </td>
                <td className="p-2.5">
                  <span className={`px-2 py-0.5 rounded border text-[10px] ${getLevelBadge(log.level || log.type)}`}>
                    {log.level || log.type || 'INFO'}
                  </span>
                </td>
                <td className="p-2.5 text-[var(--ink)] font-bold">
                  {log.source || 'SYSTEM'}
                </td>
                <td className="p-2.5 text-[var(--ink-2)] font-sans">
                  {log.message || log.details || 'Event logged'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
