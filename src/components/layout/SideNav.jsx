import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  Gamepad2,
  Wrench,
  Radio,
  MapPin,
  Eye,
  Activity,
  Users,
  Compass,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const NAV_GROUPS = [
  {
    title: 'OPERATIONS',
    items: [
      { path: '/', label: 'Command Center', icon: LayoutDashboard },
      { path: '/map', label: 'Operational Map', icon: MapPin },
      { path: '/operations', label: 'Mission / Operations', icon: Compass },
    ],
  },
  {
    title: 'FLEET UNITS',
    items: [
      { path: '/robots', label: 'Fleet Overview', icon: Bot },
      { path: '/robot-a', label: 'Robot A (Leader)', icon: Gamepad2 },
      { path: '/robot-a/arm', label: 'Robotic Arm Control', icon: Wrench },
      { path: '/robot-b', label: 'Robot B (Relay)', icon: Radio },
    ],
  },
  {
    title: 'SENSORS & COMMS',
    items: [
      { path: '/network', label: 'Comms Network', icon: Activity },
      { path: '/vision', label: 'Robot Vision', icon: Eye },
      { path: '/victims', label: 'Victim Detection', icon: Users },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { path: '/logs', label: 'Event Audit Logs', icon: FileText },
      { path: '/settings', label: 'Settings & Config', icon: Settings },
    ],
  },
];

export const SideNav = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`bg-[var(--surface)] border-r border-[var(--line)] flex flex-col justify-between transition-all duration-200 select-none z-30 ${
        collapsed ? 'w-14' : 'w-56'
      }`}
    >
      <div className="overflow-y-auto p-2 space-y-4">
        {NAV_GROUPS.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!collapsed && (
              <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-[var(--ink-3)] uppercase">
                {group.title}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center space-x-2.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[var(--surface-2)] text-[var(--ink)] font-bold border border-[var(--line-strong)]'
                        : 'text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]'
                    }`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-2 border-t border-[var(--line)] flex justify-end">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded hover:bg-[var(--surface-2)] text-[var(--ink-2)] transition-colors"
          title={collapsed ? 'Expand Navigation' : 'Collapse Navigation'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
