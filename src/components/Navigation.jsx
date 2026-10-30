import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Gamepad2,
  Bot,
  Compass,
  Activity,
  Video,
  FileText,
  BarChart3,
  Settings,
  HardDrive,
} from 'lucide-react';
import { desktop } from '../utils/desktop';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, shortcut: 'Ctrl+1' },
  { path: '/map', label: 'Operational Map', icon: MapPin, shortcut: 'Ctrl+2' },
  { path: '/teleop', label: 'Teleoperation', icon: Gamepad2, shortcut: 'Ctrl+3' },
  { path: '/fleet', label: 'Fleet Management', icon: Bot, shortcut: 'Ctrl+4' },
  { path: '/missions', label: 'Mission Planner', icon: Compass, shortcut: 'Ctrl+5' },
  { path: '/sensors', label: 'Sensors & Telemetry', icon: Activity, shortcut: 'Ctrl+6' },
  { path: '/video', label: 'Video Matrix', icon: Video, shortcut: 'Ctrl+7' },
  { path: '/logs', label: 'Incident Logs', icon: FileText, shortcut: 'Ctrl+8' },
  { path: '/analytics', label: 'Analytics & Reports', icon: BarChart3, shortcut: 'Ctrl+9' },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/system', label: 'System Health', icon: HardDrive },
];

export const Navigation = () => {
  const navigate = useNavigate();

  // Listen to menu navigation events from main process menu!
  useEffect(() => {
    const unsub = desktop.onMenuAction((action) => {
      switch (action) {
        case 'nav-dashboard':
          navigate('/');
          break;
        case 'nav-map':
          navigate('/map');
          break;
        case 'nav-teleop':
          navigate('/teleop');
          break;
        case 'show-shortcuts':
          alert(
            'RESCUEBOT Keybindings:\n\n' +
              'Shift + Esc : Global Emergency Stop (E-Stop)\n' +
              'Ctrl + Space : Stop Selected Robot\n' +
              'Ctrl + 1..9  : Page Navigation Shortcuts\n' +
              'Ctrl + T     : Toggle Theme\n' +
              'F11          : Full Screen Mode\n' +
              'WASD / Arrow : Teleoperation Driving Controls'
          );
          break;
        case 'show-about':
          alert(
            'RESCUEBOT Field Control Station v1.0.0\n\n' +
              'Offline Desktop Application for Field Teleoperation and Disaster Response.\n' +
              'Engineered with React + Vite + Electron.'
          );
          break;
        default:
          break;
      }
    });

    return () => unsub();
  }, [navigate]);

  return (
    <aside className="w-60 bg-slate-900 border-r border-slate-800 flex flex-col justify-between select-none">
      <nav className="p-2 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
          Navigation Control
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-600/15 border border-brand-500/30 text-brand-400 font-bold shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center space-x-2.5">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.shortcut && (
                <span className="text-[10px] text-slate-600 font-mono font-normal">
                  {item.shortcut}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer info in sidebar */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-500 space-y-1">
        <div className="flex justify-between">
          <span>Operating System:</span>
          <span className="text-slate-400 font-mono">Linux/Win</span>
        </div>
        <div className="flex justify-between">
          <span>Network Status:</span>
          <span className="text-emerald-400 font-semibold">Offline Ready</span>
        </div>
      </div>
    </aside>
  );
};
