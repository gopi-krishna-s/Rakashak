import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Wrench, Shield, ShieldAlert, AlertTriangle, RotateCcw, CheckCircle, Lock, Unlock, Play, Square, Activity, ArrowRight } from 'lucide-react';
import { armService } from '../services/factory';

export const ArmControl = () => {
  const { robots, setRobots, addToast } = useApp();
  const robotA = robots.find((r) => r.id === 'ROBOT-A') || {};

  const armState = robotA.armState || {
    status: 'IDLE',
    armed: false,
    gripper: 'OPEN',
    joints: { base: 0, shoulder: 15, elbow: 45, wrist: 0, gripper: 30 },
  };

  const [isArmed, setIsArmed] = useState(armState.armed || false);
  const [armModalOpen, setArmModalOpen] = useState(false);
  const [joints, setJoints] = useState(armState.joints || { base: 0, shoulder: 15, elbow: 45, wrist: 0, gripper: 30 });
  const [commandLogs, setCommandLogs] = useState([
    { id: 'CMD-101', action: 'ARM_HOME_STOW', status: 'COMPLETED', time: new Date(Date.now() - 120000).toLocaleTimeString() },
    { id: 'CMD-102', action: 'GRIPPER_OPEN', status: 'COMPLETED', time: new Date(Date.now() - 45000).toLocaleTimeString() },
  ]);

  const canvasRef = useRef(null);

  // Sync joint angles when robotA data updates
  useEffect(() => {
    if (robotA.armState?.joints) {
      setJoints(robotA.armState.joints);
    }
    if (robotA.armState?.armed !== undefined) {
      setIsArmed(robotA.armState.armed);
    }
  }, [robotA.armState]);

  // 2D Arm Kinematic Canvas Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const renderArmKinematics = () => {
      const width = (canvas.width = canvas.parentElement?.clientWidth || 600);
      const height = (canvas.height = canvas.parentElement?.clientHeight || 400);

      ctx.clearRect(0, 0, width, height);

      // Canvas Background Grid
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Base Platform Origin (Center-bottom)
      const bx = width / 2;
      const by = height - 60;

      // Joint Angles (in Radians)
      const radBase = (joints.base * Math.PI) / 180;
      const radShoulder = (joints.shoulder * Math.PI) / 180;
      const radElbow = (joints.elbow * Math.PI) / 180;
      const radWrist = (joints.wrist * Math.PI) / 180;

      // Link Lengths
      const lShoulder = 90;
      const lElbow = 80;
      const lWrist = 45;

      // Compute Kinematic Joint Coordinates (Forward Kinematics)
      const j1x = bx;
      const j1y = by;

      // Shoulder Joint End (J2)
      const angle2 = -Math.PI / 2 + radShoulder + radBase * 0.2;
      const j2x = j1x + Math.cos(angle2) * lShoulder;
      const j2y = j1y + Math.sin(angle2) * lShoulder;

      // Elbow Joint End (J3)
      const angle3 = angle2 + radElbow;
      const j3x = j2x + Math.cos(angle3) * lElbow;
      const j3y = j2y + Math.sin(angle3) * lElbow;

      // Wrist End / Gripper (J4)
      const angle4 = angle3 + radWrist;
      const j4x = j3x + Math.cos(angle4) * lWrist;
      const j4y = j3y + Math.sin(angle4) * lWrist;

      // Base Mounting Pad
      ctx.fillStyle = '#334155';
      ctx.fillRect(bx - 40, by, 80, 20);
      ctx.strokeStyle = '#64748b';
      ctx.strokeRect(bx - 40, by, 80, 20);

      // Arm Segment Links
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';

      // Link 1 (Base to Shoulder)
      ctx.strokeStyle = isArmed ? '#f97316' : '#64748b';
      ctx.beginPath();
      ctx.moveTo(j1x, j1y);
      ctx.lineTo(j2x, j2y);
      ctx.stroke();

      // Link 2 (Shoulder to Elbow)
      ctx.strokeStyle = isArmed ? '#38bdf8' : '#475569';
      ctx.beginPath();
      ctx.moveTo(j2x, j2y);
      ctx.lineTo(j3x, j3y);
      ctx.stroke();

      // Link 3 (Elbow to Wrist)
      ctx.strokeStyle = isArmed ? '#10b981' : '#334155';
      ctx.beginPath();
      ctx.moveTo(j3x, j3y);
      ctx.lineTo(j4x, j4y);
      ctx.stroke();

      // Joint Nodes (Circles)
      const drawJointNode = (x, y, label, angleVal) => {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '10px monospace';
        ctx.fillText(`${label}: ${angleVal}°`, x + 10, y + 4);
      };

      drawJointNode(j1x, j1y, 'J1 (Base)', joints.base);
      drawJointNode(j2x, j2y, 'J2 (Shoulder)', joints.shoulder);
      drawJointNode(j3x, j3y, 'J3 (Elbow)', joints.elbow);
      drawJointNode(j4x, j4y, 'J4 (Wrist)', joints.wrist);

      // Gripper Jaw Drawing
      const gripOpening = (joints.gripper / 100) * 16;
      ctx.strokeStyle = joints.gripper > 0 ? '#f59e0b' : '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(j4x, j4y - gripOpening);
      ctx.lineTo(j4x + 15, j4y - gripOpening);
      ctx.moveTo(j4x, j4y + gripOpening);
      ctx.lineTo(j4x + 15, j4y + gripOpening);
      ctx.stroke();

      // HUD Arm State Header Overlay
      ctx.fillStyle = isArmed ? '#f97316' : '#94a3b8';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`SYSTEM STATE: ${isArmed ? 'ARMED (ACTIVE)' : 'DISARMED (LOCKED)'}`, 14, 24);

      animationId = requestAnimationFrame(renderArmKinematics);
    };

    renderArmKinematics();
    return () => cancelAnimationFrame(animationId);
  }, [joints, isArmed]);

  // Joint angle change handler
  const handleJointSlider = (jointName, value) => {
    if (!isArmed) {
      addToast('warn', 'Robotic arm is DISARMED. Arm system first to adjust joints.');
      return;
    }
    const valNum = parseInt(value, 10);
    setJoints((prev) => ({ ...prev, [jointName]: valNum }));
  };

  // Dispatch arm command
  const dispatchArmCommand = async (actionName, newJoints = joints) => {
    if (!isArmed && actionName !== 'TOGGLE_ARM') {
      addToast('warn', 'Robotic arm is DISARMED. Arm system first to dispatch commands.');
      return;
    }

    const cmdId = `CMD-${Date.now().toString().slice(-4)}`;
    const newLog = {
      id: cmdId,
      action: actionName,
      status: 'SENT',
      time: new Date().toLocaleTimeString(),
    };

    setCommandLogs((prev) => [newLog, ...prev.slice(0, 7)]);
    addToast('info', `Arm Command Sent: ${actionName}`);

    await armService.sendCommand('ROBOT-A', actionName, newJoints);

    setRobots((prev) =>
      prev.map((r) =>
        r.id === 'ROBOT-A'
          ? {
              ...r,
              armState: {
                ...r.armState,
                status: 'MOVING',
                joints: newJoints,
              },
            }
          : r
      )
    );

    setTimeout(() => {
      setCommandLogs((prev) =>
        prev.map((l) => (l.id === cmdId ? { ...l, status: 'COMPLETED' } : l))
      );
      setRobots((prev) =>
        prev.map((r) =>
          r.id === 'ROBOT-A'
            ? {
                ...r,
                armState: {
                  ...r.armState,
                  status: 'HOLDING',
                  joints: newJoints,
                },
              }
            : r
        )
      );
      addToast('info', `Arm Command Completed: ${actionName}`);
    }, 1200);
  };

  // Preset Position Shortcuts
  const applyPreset = (name, presetJoints) => {
    if (!isArmed) {
      addToast('warn', 'System is DISARMED. Arm system before applying presets.');
      return;
    }
    setJoints(presetJoints);
    dispatchArmCommand(`PRESET_${name}`, presetJoints);
  };

  const confirmToggleArming = () => {
    const nextArmed = !isArmed;
    setIsArmed(nextArmed);
    setArmModalOpen(false);

    setRobots((prev) =>
      prev.map((r) =>
        r.id === 'ROBOT-A'
          ? {
              ...r,
              armState: {
                ...r.armState,
                armed: nextArmed,
                status: nextArmed ? 'HOLDING' : 'IDLE',
              },
            }
          : r
      )
    );

    addToast(nextArmed ? 'warn' : 'info', `Robotic Arm ${nextArmed ? 'ARMED' : 'DISARMED'}`);
  };

  return (
    <div className="space-y-4 overflow-y-auto h-full select-none font-sans text-xs">
      {/* Top Header Panel */}
      <div className="bg-[var(--surface-2)] border border-[var(--line)] p-3 rounded flex flex-wrap items-center justify-between gap-2 font-mono">
        <div className="flex items-center space-x-2">
          <Wrench className="w-5 h-5 text-[var(--accent)]" />
          <div>
            <h1 className="text-sm font-bold text-[var(--ink)]">5-DOF ROBOTIC ARM CONTROL STATION</h1>
            <p className="text-[11px] text-[var(--ink-2)]">
              Target Unit: <strong className="text-[var(--ink)]">ROBOT A "LEADER"</strong> | Arm Status: <strong className={isArmed ? 'text-[var(--warn)]' : 'text-[var(--ink-2)]'}>{isArmed ? 'ARMED' : 'DISARMED'}</strong>
            </p>
          </div>
        </div>

        {/* Safety Arming Toggle Button */}
        <button
          onClick={() => setArmModalOpen(true)}
          className={`px-4 py-1.5 rounded font-bold text-xs flex items-center space-x-2 transition-colors ${
            isArmed
              ? 'bg-[var(--warn)] text-white hover:opacity-90'
              : 'bg-[var(--surface)] text-[var(--ink)] border border-[var(--line-strong)] hover:bg-[var(--line)]'
          }`}
        >
          {isArmed ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          <span>{isArmed ? 'SYSTEM ARMED (CLICK TO DISARM)' : 'DISARMED (CLICK TO ARM SYSTEM)'}</span>
        </button>
      </div>

      {/* Arm Safety Warning Banner */}
      {!isArmed && (
        <div className="p-3 bg-[var(--warn-bg)] border border-[var(--warn)] rounded font-mono text-[var(--warn)] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>SAFETY LOCK ENGAGED: Joint movement controls disabled. Click arming toggle to activate manipulator controls.</span>
          </div>
        </div>
      )}

      {/* Main Grid: Kinematic Display & Joint Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 2D Arm Kinematics Visualization Box */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded overflow-hidden flex flex-col justify-between min-h-[380px]">
          <div className="panel-header">
            <div className="flex items-center space-x-1.5 font-mono">
              <Activity className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>REAL-TIME 5-DOF KINEMATIC SCHEMATIC</span>
            </div>
            <span className="font-mono text-[10px] text-[var(--ink-2)]">2D PROFILE VIEW</span>
          </div>

          <div className="flex-1 relative bg-black overflow-hidden min-h-[320px]">
            <canvas ref={canvasRef} className="w-full h-full absolute inset-0" />
          </div>

          {/* Quick Preset Buttons Bar */}
          <div className="p-2.5 bg-[var(--surface-2)] border-t border-[var(--line)] space-y-1.5 font-mono">
            <div className="text-[10px] text-[var(--ink-2)] font-bold">PRESET POSITIONS:</div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => applyPreset('HOME_STOW', { base: 0, shoulder: 0, elbow: 0, wrist: 0, gripper: 0 })}
                className="px-2.5 py-1 bg-[var(--surface)] hover:bg-[var(--line)] border border-[var(--line-strong)] text-[var(--ink)] text-[11px] font-bold rounded"
              >
                Home / Stow
              </button>
              <button
                onClick={() => applyPreset('REACH_EXTEND', { base: 0, shoulder: 45, elbow: 60, wrist: -30, gripper: 50 })}
                className="px-2.5 py-1 bg-[var(--surface)] hover:bg-[var(--line)] border border-[var(--line-strong)] text-[var(--ink)] text-[11px] font-bold rounded"
              >
                Reach / Extend
              </button>
              <button
                onClick={() => applyPreset('GROUND_INSPECT', { base: 0, shoulder: -30, elbow: 80, wrist: 45, gripper: 0 })}
                className="px-2.5 py-1 bg-[var(--surface)] hover:bg-[var(--line)] border border-[var(--line-strong)] text-[var(--ink)] text-[11px] font-bold rounded"
              >
                Inspect Ground
              </button>
              <button
                onClick={() => applyPreset('GRIPPER_OPEN', { ...joints, gripper: 100 })}
                className="px-2.5 py-1 bg-[var(--ok-bg)] text-[var(--ok)] border border-[var(--ok)] text-[11px] font-bold rounded"
              >
                Open Gripper
              </button>
              <button
                onClick={() => applyPreset('GRIPPER_CLOSE', { ...joints, gripper: 0 })}
                className="px-2.5 py-1 bg-[var(--danger-bg)] text-[var(--danger)] border border-[var(--danger)] text-[11px] font-bold rounded"
              >
                Close Gripper
              </button>
            </div>
          </div>
        </div>

        {/* Joint Angle Sliders & Precision Controls */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded p-4 space-y-4 font-mono">
          <div className="panel-header -mx-4 -mt-4 mb-2">
            <span>JOINT ANGLE MANIPULATION CONTROLS</span>
            <span className="text-[var(--ink-2)] text-[10px]">SERVO RESOLUTION: 0.1°</span>
          </div>

          <div className="space-y-3">
            {/* Joint 1: Base Rotation */}
            <div className="p-2.5 bg-[var(--surface-2)] border border-[var(--line)] rounded space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span>Joint 1 (Base Rotation):</span>
                <strong className="text-[var(--accent)]">{joints.base}°</strong>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={joints.base}
                disabled={!isArmed}
                onChange={(e) => handleJointSlider('base', e.target.value)}
                className="w-full accent-[var(--accent)] cursor-pointer disabled:opacity-50"
              />
              <div className="flex justify-between text-[10px] text-[var(--ink-3)]">
                <span>-180°</span>
                <span>0°</span>
                <span>+180°</span>
              </div>
            </div>

            {/* Joint 2: Shoulder Pitch */}
            <div className="p-2.5 bg-[var(--surface-2)] border border-[var(--line)] rounded space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span>Joint 2 (Shoulder Pitch):</span>
                <strong className="text-[var(--accent)]">{joints.shoulder}°</strong>
              </div>
              <input
                type="range"
                min="-90"
                max="90"
                value={joints.shoulder}
                disabled={!isArmed}
                onChange={(e) => handleJointSlider('shoulder', e.target.value)}
                className="w-full accent-[var(--accent)] cursor-pointer disabled:opacity-50"
              />
              <div className="flex justify-between text-[10px] text-[var(--ink-3)]">
                <span>-90°</span>
                <span>0°</span>
                <span>+90°</span>
              </div>
            </div>

            {/* Joint 3: Elbow Pitch */}
            <div className="p-2.5 bg-[var(--surface-2)] border border-[var(--line)] rounded space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span>Joint 3 (Elbow Pitch):</span>
                <strong className="text-[var(--accent)]">{joints.elbow}°</strong>
              </div>
              <input
                type="range"
                min="-135"
                max="135"
                value={joints.elbow}
                disabled={!isArmed}
                onChange={(e) => handleJointSlider('elbow', e.target.value)}
                className="w-full accent-[var(--accent)] cursor-pointer disabled:opacity-50"
              />
              <div className="flex justify-between text-[10px] text-[var(--ink-3)]">
                <span>-135°</span>
                <span>0°</span>
                <span>+135°</span>
              </div>
            </div>

            {/* Joint 4: Wrist Pitch */}
            <div className="p-2.5 bg-[var(--surface-2)] border border-[var(--line)] rounded space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span>Joint 4 (Wrist Pitch):</span>
                <strong className="text-[var(--accent)]">{joints.wrist}°</strong>
              </div>
              <input
                type="range"
                min="-90"
                max="90"
                value={joints.wrist}
                disabled={!isArmed}
                onChange={(e) => handleJointSlider('wrist', e.target.value)}
                className="w-full accent-[var(--accent)] cursor-pointer disabled:opacity-50"
              />
              <div className="flex justify-between text-[10px] text-[var(--ink-3)]">
                <span>-90°</span>
                <span>0°</span>
                <span>+90°</span>
              </div>
            </div>

            {/* Joint 5: Gripper Aperture */}
            <div className="p-2.5 bg-[var(--surface-2)] border border-[var(--line)] rounded space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span>Joint 5 (Gripper Aperture):</span>
                <strong className="text-[var(--warn)]">{joints.gripper}% ({joints.gripper > 0 ? 'OPEN' : 'CLOSED'})</strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={joints.gripper}
                disabled={!isArmed}
                onChange={(e) => handleJointSlider('gripper', e.target.value)}
                className="w-full accent-[var(--warn)] cursor-pointer disabled:opacity-50"
              />
              <div className="flex justify-between text-[10px] text-[var(--ink-3)]">
                <span>0% (CLOSED)</span>
                <span>50%</span>
                <span>100% (OPEN)</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => dispatchArmCommand('EXECUTE_CUSTOM_POSE', joints)}
            disabled={!isArmed}
            className="w-full bg-[var(--accent)] hover:opacity-90 disabled:opacity-50 text-white font-bold py-2 px-4 rounded text-xs transition-opacity flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>DISPATCH JOINT ANGLE COMMAND</span>
          </button>
        </div>
      </div>

      {/* Command Lifecycle Audit Trail Log */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded overflow-hidden font-mono">
        <div className="panel-header">
          <span>ROBOTIC ARM DISPATCH LOG & LIFECYCLE AUDIT</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-[var(--surface-2)] text-[var(--ink-2)] border-b border-[var(--line)] text-[10px] uppercase">
            <tr>
              <th className="p-2.5">Command ID</th>
              <th className="p-2.5">Action Target</th>
              <th className="p-2.5">Time</th>
              <th className="p-2.5 text-right">Lifecycle Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {commandLogs.map((log) => (
              <tr key={log.id} className="hover:bg-[var(--surface-2)]/50">
                <td className="p-2.5 text-[var(--ink-2)]">{log.id}</td>
                <td className="p-2.5 font-bold text-[var(--ink)]">{log.action}</td>
                <td className="p-2.5 text-[var(--ink-3)]">{log.time}</td>
                <td className="p-2.5 text-right">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.status === 'COMPLETED'
                        ? 'bg-[var(--ok-bg)] text-[var(--ok)]'
                        : 'bg-[var(--warn-bg)] text-[var(--warn)] animate-pulse'
                    }`}
                  >
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Safety Toggle Modal Confirmation */}
      {armModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
          <div className="bg-[var(--surface)] border-2 border-[var(--warn)] rounded-lg p-5 max-w-md w-full space-y-4 shadow-2xl font-mono">
            <div className="flex items-center space-x-2 text-[var(--warn)] font-bold text-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>CONFIRM ARMING SAFETY SWITCH</span>
            </div>

            <p className="text-xs text-[var(--ink)] leading-relaxed font-sans">
              You are about to {isArmed ? 'DISARM' : 'ARM'} the 5-DOF robotic manipulator on <strong>ROBOT A ("Leader")</strong>. {isArmed ? 'Joint servos will lock in safe holding state.' : 'Joint servos will receive active power and accept operator movement commands.'}
            </p>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setArmModalOpen(false)}
                className="px-4 py-2 bg-[var(--surface-2)] hover:bg-[var(--line)] text-[var(--ink)] rounded text-xs font-bold border border-[var(--line-strong)]"
              >
                Cancel
              </button>
              <button
                onClick={confirmToggleArming}
                className="px-4 py-2 bg-[var(--warn)] hover:opacity-90 text-white rounded text-xs font-bold"
              >
                Confirm {isArmed ? 'Disarm' : 'Arm System'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
