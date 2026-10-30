import React from 'react';
import { useApp } from '../context/AppContext';
import { Bot, Battery, Wifi, Activity, Check, Gauge, Square } from 'lucide-react';
import { robotService } from '../services/factory';

export const Robots = () => {
  const { robots, selectedRobotId, setSelectedRobotId } = useApp();

  return (
    <div className="space-y-4 overflow-y-auto h-full select-none font-sans text-xs">
      <div className="panel-header -mx-4 -mt-4 mb-2">
        <div className="flex items-center space-x-2">
          <Bot className="w-4 h-4 text-[var(--ink)]" />
          <span>FLEET OVERVIEW & SELECTION</span>
        </div>
        <span className="font-mono text-[10px] text-[var(--ink-2)]">
          SELECT UNIT TO TARGET KEYBOARD COMMANDS (ESC / SPACE HALTS SELECTED UNIT)
        </span>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--line)] rounded overflow-hidden">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-[var(--surface-2)] text-[var(--ink-2)] border-b border-[var(--line)] uppercase text-[10px]">
            <tr>
              <th className="p-2.5">Select</th>
              <th className="p-2.5">Unit ID</th>
              <th className="p-2.5">Name / Type</th>
              <th className="p-2.5">Status</th>
              <th className="p-2.5">Mode</th>
              <th className="p-2.5">Battery</th>
              <th className="p-2.5">Signal</th>
              <th className="p-2.5">GPS Location</th>
              <th className="p-2.5">Last Heartbeat</th>
              <th className="p-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {robots.map((robot) => {
              const isSelected = robot.id === selectedRobotId;
              return (
                <tr
                  key={robot.id}
                  onClick={() => setSelectedRobotId(robot.id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-[var(--surface-2)] font-bold' : 'hover:bg-[var(--surface-2)]/50'
                  }`}
                >
                  <td className="p-2.5">
                    <input
                      type="radio"
                      name="selectedRobot"
                      checked={isSelected}
                      onChange={() => setSelectedRobotId(robot.id)}
                      className="accent-[var(--accent)] cursor-pointer"
                    />
                  </td>

                  <td className="p-2.5">
                    <span className="px-1.5 py-0.5 rounded border border-[var(--line-strong)] bg-[var(--surface-2)] text-[var(--ink)]">
                      {robot.id}
                    </span>
                  </td>

                  <td className="p-2.5 font-sans font-semibold text-[var(--ink)]">
                    {robot.name}
                    <span className="block text-[10px] font-mono text-[var(--ink-3)] font-normal">{robot.type}</span>
                  </td>

                  <td className="p-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        robot.status === 'MOVING'
                          ? 'bg-[var(--ok-bg)] text-[var(--ok)]'
                          : robot.status === 'STOPPED'
                          ? 'bg-[var(--danger-bg)] text-[var(--danger)]'
                          : 'bg-[var(--surface-2)] text-[var(--ink-2)]'
                      }`}
                    >
                      {robot.status}
                    </span>
                  </td>

                  <td className="p-2.5">
                    <span className="text-[var(--ink-2)]">{robot.mode}</span>
                  </td>

                  <td className="p-2.5">
                    <span className={robot.battery > 20 ? 'text-[var(--ok)]' : 'text-[var(--danger)]'}>
                      {robot.battery}%
                    </span>
                  </td>

                  <td className="p-2.5">
                    <span className="text-[var(--accent)]">{robot.signal}%</span>
                  </td>

                  <td className="p-2.5 text-[var(--ink-2)] text-[11px]">
                    {robot.location?.latitude}, {robot.location?.longitude}
                  </td>

                  <td className="p-2.5 text-[var(--ink-3)] text-[11px]">
                    {new Date(robot.lastHeartbeat).toLocaleTimeString()}
                  </td>

                  <td className="p-2.5 text-right space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        robotService.stopRobot(robot.id);
                      }}
                      className="px-2 py-1 bg-[var(--danger)] text-white rounded text-[10px] font-bold hover:opacity-90 font-sans"
                    >
                      Halt Unit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
