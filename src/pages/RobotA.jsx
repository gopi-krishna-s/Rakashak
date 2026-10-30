import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { DeadManPad } from '../components/robots/DeadManPad';
import { Sparkline } from '../components/robots/Sparkline';
import { NavLink } from 'react-router-dom';
import { Bot, Battery, Wifi, Activity, Wrench, ShieldAlert, AlertTriangle, CheckCircle, Clock, Video, Camera } from 'lucide-react';
import { desktop } from '../utils/desktop.js';

export const RobotA = () => {
  const { robots, setRobots, addToast } = useApp();
  const robotA = robots.find((r) => r.id === 'ROBOT-A') || {};

  const cameraFeedUrl = 'http://10.229.134.182/';

  const [confirmAutonomousModal, setConfirmAutonomousModal] = useState(false);
  const [batteryHistory, setBatteryHistory] = useState([85, 84, 84, 83, 83, 82]);
  const [signalHistory, setSignalHistory] = useState([95, 94, 92, 93, 91, 92]);
  const [tempHistory, setTempHistory] = useState([35.5, 35.8, 36.0, 36.1, 36.2]);
  const [imgError, setImgError] = useState(false);

  const canvasRef = useRef(null);

  // Maintain 60s sparkline buffers
  useEffect(() => {
    if (robotA.battery !== undefined) {
      setBatteryHistory((prev) => [...prev.slice(-59), robotA.battery]);
    }
    if (robotA.signal !== undefined) {
      setSignalHistory((prev) => [...prev.slice(-59), robotA.signal]);
    }
    if (robotA.tempC !== undefined) {
      setTempHistory((prev) => [...prev.slice(-59), robotA.tempC]);
    }
  }, [robotA.battery, robotA.signal, robotA.tempC]);

  // Canvas HUD overlay on camera feed
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const renderOverlay = () => {
      const width = (canvas.width = canvas.parentElement.clientWidth);
      const height = (canvas.height = canvas.parentElement.clientHeight);

      ctx.clearRect(0, 0, width, height);

      // HUD Reticle
      const cx = width / 2;
      const cy = height / 2;
      ctx.strokeStyle = 'rgba(92, 156, 85, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 45, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - 65, cy);
      ctx.lineTo(cx + 65, cy);
      ctx.moveTo(cx, cy - 65);
      ctx.lineTo(cx, cy + 65);
      ctx.stroke();

      // Top Header Overlay
      ctx.fillStyle = 'rgba(217, 150, 48, 0.95)';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`ROBOT A FEED: ${cameraFeedUrl}`, 12, 20);

      // Bottom Timestamp Overlay
      ctx.fillStyle = '#A9B0AA';
      ctx.font = '10px monospace';
      ctx.fillText(`UTC: ${new Date().toISOString()}`, 12, height - 12);

      animationId = requestAnimationFrame(renderOverlay);
    };

    renderOverlay();
    return () => cancelAnimationFrame(animationId);
  }, [cameraFeedUrl]);

  const handleToggleMode = (newMode) => {
    if (newMode === 'AUTONOMOUS') {
      setConfirmAutonomousModal(true);
    } else {
      setRobots((prev) =>
        prev.map((r) => (r.id === 'ROBOT-A' ? { ...r, mode: 'MANUAL' } : r))
      );
      addToast('info', 'Robot A mode switched to MANUAL');
    }
  };

  const confirmAutonomous = () => {
    setRobots((prev) =>
      prev.map((r) => (r.id === 'ROBOT-A' ? { ...r, mode: 'AUTONOMOUS', speed: 0 } : r))
    );
    setConfirmAutonomousModal(false);
    addToast('warn', 'Robot A mode switched to AUTONOMOUS');
  };

  const isStale = robotA.lastHeartbeat
    ? Date.now() - new Date(robotA.lastHeartbeat).getTime() > 10000
    : false;

  return (
    <div className="space-y-4 overflow-y-auto h-full select-none font-sans text-xs">
      {/* Header Panel */}
      <div className="bg-[var(--surface-2)] border border-[var(--line)] p-3 rounded flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-[var(--accent)]" />
          <div>
            <h1 className="text-sm font-bold text-[var(--ink)]">ROBOT A "LEADER" CONTROL STATION</h1>
            <p className="text-[11px] text-[var(--ink-2)] font-mono">
              Type: {robotA.type || 'Rescue/Leader'} | Camera Feed: <strong className="text-[var(--accent)]">{cameraFeedUrl}</strong>
            </p>
          </div>
        </div>

        {/* Mode Switcher Buttons */}
        <div className="flex items-center space-x-2 font-mono">
          <span className="text-[var(--ink-2)] font-bold">MODE:</span>
          <button
            onClick={() => handleToggleMode('MANUAL')}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
              robotA.mode === 'MANUAL'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--surface)] text-[var(--ink-2)] border border-[var(--line)]'
            }`}
          >
            MANUAL
          </button>
          <button
            onClick={() => handleToggleMode('AUTONOMOUS')}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
              robotA.mode === 'AUTONOMOUS'
                ? 'bg-[var(--warn)] text-white'
                : 'bg-[var(--surface)] text-[var(--ink-2)] border border-[var(--line)]'
            }`}
          >
            AUTONOMOUS
          </button>
        </div>
      </div>

      {/* Robot A Primary Camera Stream Panel */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded overflow-hidden">
        <div className="panel-header">
          <div className="flex items-center space-x-2 font-mono">
            <Video className="w-4 h-4 text-[var(--accent)]" />
            <span>ROBOT A (1ST BOT) PRIMARY CAMERA FEED [{cameraFeedUrl}]</span>
          </div>
          <span className="font-mono text-[10px] text-[var(--ok)]">● LIVE FEED</span>
        </div>

        <div className="h-64 relative bg-black overflow-hidden">
          {/* Live Image Stream */}
          {!imgError ? (
            <img
              src={cameraFeedUrl}
              alt="Robot A Live Feed"
              onError={() => setImgError(true)}
              className="w-full h-full object-contain absolute inset-0 z-0"
            />
          ) : (
            <iframe
              src={cameraFeedUrl}
              title="Robot A Camera Stream"
              className="w-full h-full border-0 absolute inset-0 z-0"
            />
          )}

          {/* Tactical Canvas Overlay */}
          <canvas ref={canvasRef} className="w-full h-full absolute inset-0 z-10 pointer-events-none" />
        </div>
      </div>

      {/* Telemetry Metrics Grid with Sparklines */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded p-3 space-y-3">
        <div className="panel-header -mx-3 -mt-3 mb-2">
          <span>REAL-TIME TELEMETRY (60s HISTORY)</span>
          {isStale && <span className="font-mono text-[var(--danger)]">▲ STALE TELEMETRY</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
          {/* Battery */}
          <div className="p-2.5 bg-[var(--surface-2)] rounded border border-[var(--line)] space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--ink-2)]">Battery Level:</span>
              <strong className={robotA.battery > 20 ? 'text-[var(--ok)]' : 'text-[var(--danger)]'}>
                {robotA.battery || 0}%
              </strong>
            </div>
            <Sparkline data={batteryHistory} color="var(--ok)" label="60s Battery" />
          </div>

          {/* Signal RSSI */}
          <div className="p-2.5 bg-[var(--surface-2)] rounded border border-[var(--line)] space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--ink-2)]">Wireless Link RSSI:</span>
              <strong className="text-[var(--accent)]">{robotA.signal || 0}% (-64 dBm)</strong>
            </div>
            <Sparkline data={signalHistory} color="var(--accent)" label="60s Signal" />
          </div>

          {/* Temperature */}
          <div className="p-2.5 bg-[var(--surface-2)] rounded border border-[var(--line)] space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--ink-2)]">Internal Temp:</span>
              <strong className="text-[var(--ink)]">{robotA.tempC || 0} °C</strong>
            </div>
            <Sparkline data={tempHistory} color="var(--warn)" label="60s Temp" />
          </div>
        </div>

        {/* GPS Coordinates & Speed */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-xs pt-2 border-t border-[var(--line)]">
          <div>
            Latitude: <strong className="text-[var(--ink)]">{robotA.location?.latitude}</strong>
          </div>
          <div>
            Longitude: <strong className="text-[var(--ink)]">{robotA.location?.longitude}</strong>
          </div>
          <div>
            Speed: <strong className="text-[var(--ink)]">{robotA.speed} m/s</strong>
          </div>
          <div>
            Heading: <strong className="text-[var(--ink)]">{robotA.heading}° N</strong>
          </div>
        </div>
      </div>

      {/* Dead-Man Movement Pad & Arm Shortcut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Dead-Man Movement Control */}
        <DeadManPad robotId="ROBOT-A" isAutonomous={robotA.mode === 'AUTONOMOUS'} />

        {/* Robotic Arm Shortcut Panel */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded overflow-hidden flex flex-col justify-between">
          <div className="panel-header">
            <div className="flex items-center space-x-1.5">
              <Wrench className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>ROBOTIC ARM QUICK PANEL</span>
            </div>
            <span className="font-mono text-[10px] text-[var(--ink-2)]">
              ARM STATUS: {robotA.armState?.status || 'IDLE'}
            </span>
          </div>

          <div className="p-4 space-y-3 font-mono">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                Arming State:{' '}
                <strong className={robotA.armState?.armed ? 'text-[var(--ok)]' : 'text-[var(--warn)]'}>
                  {robotA.armState?.armed ? 'ARMED' : 'DISARMED'}
                </strong>
              </div>
              <div>
                Gripper:{' '}
                <strong className="text-[var(--ink)]">{robotA.armState?.gripper || 'OPEN'}</strong>
              </div>
            </div>

            <div className="p-3 bg-[var(--surface-2)] rounded border border-[var(--line)] text-xs space-y-1">
              <div>Joint Angles:</div>
              <div className="text-[var(--ink-2)]">
                Base: {robotA.armState?.joints?.base}° | Shoulder: {robotA.armState?.joints?.shoulder}° | Elbow:{' '}
                {robotA.armState?.joints?.elbow}°
              </div>
            </div>
          </div>

          <div className="p-3 border-t border-[var(--line)]">
            <NavLink
              to="/robot-a/arm"
              className="w-full block text-center bg-[var(--surface-2)] hover:bg-[var(--line)] text-[var(--ink)] font-bold py-1.5 px-3 rounded border border-[var(--line-strong)] text-xs font-sans"
            >
              Open 5-DOF Robotic Arm Control Center &rarr;
            </NavLink>
          </div>
        </div>
      </div>

      {/* Autonomous Confirmation Modal */}
      {confirmAutonomousModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[var(--surface)] border border-[var(--line-strong)] rounded p-5 space-y-4 shadow-xl">
            <div className="flex items-center space-x-2 text-[var(--warn)]">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold">Switch Robot A to AUTONOMOUS Mode?</h3>
            </div>
            <p className="text-xs text-[var(--ink-2)] leading-relaxed font-mono">
              Enabling autonomous navigation transfers waypoint pathing to the onboard obstacle avoidance algorithm. Manual dead-man controls will be locked.
            </p>
            <div className="flex justify-end space-x-2 pt-2 font-mono">
              <button
                onClick={() => setConfirmAutonomousModal(false)}
                className="px-3 py-1.5 rounded border border-[var(--line)] text-[var(--ink-2)] hover:bg-[var(--surface-2)]"
              >
                Cancel
              </button>
              <button
                onClick={confirmAutonomous}
                className="px-3 py-1.5 rounded bg-[var(--warn)] text-white font-bold hover:opacity-90"
              >
                Confirm Autonomous Mode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
