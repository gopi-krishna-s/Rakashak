import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Download, FolderOpen, Filter, Search, ShieldAlert } from 'lucide-react';
import { desktop } from '../utils/desktop';

export const IncidentLogs = () => {
  const { logs } = useApp();
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter((log) => {
    if (filterSeverity !== 'ALL' && log.severity !== filterSeverity) return false;
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase()) && !log.code.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleExportCSV = async () => {
    const headers = 'ID,Timestamp,Severity,Code,RobotID,Message\n';
    const rows = logs
      .map((l) => `"${l.id}","${l.timestamp}","${l.severity}","${l.code}","${l.robotId}","${l.message.replace(/"/g, '""')}"`)
      .join('\n');

    await desktop.saveFile({
      defaultName: `rescuebot-logs-${Date.now()}.csv`,
      filters: [{ name: 'CSV Files', extensions: ['csv'] }],
      data: headers + rows,
    });
  };

  const handleExportJSON = async () => {
    await desktop.saveFile({
      defaultName: `rescuebot-logs-${Date.now()}.json`,
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
      data: JSON.stringify(logs, null, 2),
    });
  };

  const handleOpenFolder = () => {
    desktop.openLogsFolder();
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-brand-600/20 text-brand-400 rounded">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">INCIDENT & EVENT LOGS</h1>
            <p className="text-xs text-slate-400">Rotating file log synced to OS user-data folder</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handleOpenFolder}
            className="flex items-center space-x-1.5 bg-brand-600 hover:bg-brand-500 text-white px-3 py-2 rounded text-xs font-bold transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Open Logs Folder</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search log code, message, or unit ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-500" />
          {['ALL', 'INFO', 'WARN', 'CRITICAL'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                filterSeverity === sev
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Log Entries Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-3 bg-slate-850 border-b border-slate-800 flex justify-between items-center text-xs font-mono font-bold text-slate-400">
          <span>EVENT TRAIL ({filteredLogs.length} LOGS)</span>
          <span>SYNC: rescuebot.log</span>
        </div>

        <div className="divide-y divide-slate-800 max-h-[500px] overflow-y-auto">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 hover:bg-slate-850/50 transition-colors flex items-start justify-between text-xs font-mono"
            >
              <div className="flex items-start space-x-3">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    log.severity === 'CRITICAL'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : log.severity === 'WARN'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}
                >
                  {log.severity}
                </span>

                <div>
                  <div className="text-slate-200 font-sans font-semibold">{log.message}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Code: <span className="text-slate-400">{log.code}</span> | Unit: <span className="text-slate-400">{log.robotId}</span>
                  </div>
                </div>
              </div>

              <span className="text-slate-500 text-[11px] whitespace-nowrap ml-4">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
