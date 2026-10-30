import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, Camera, UserPlus, Video, Wifi, Circle, RefreshCw, Server } from 'lucide-react';
import { desktop } from '../utils/desktop.js';
import { victimService } from '../services/factory.js';

export const RobotVision = () => {
  const { robots, selectedRobotId, setSelectedRobotId, addToast } = useApp();
  const selectedRobot = robots.find((r) => r.id === selectedRobotId) || robots[0] || {};

  const [feedMode, setFeedMode] = useState('LIVE'); // Default to LIVE feed
  const [streamUrl, setStreamUrl] = useState('http://10.229.134.182/');
  const [snapshots, setSnapshots] = useState([]);
  const canvasRef = useRef(null);

  // Sync stream URL whenever selected robot changes
  useEffect(() => {
    const targetUrl = selectedRobot.id === 'ROBOT-A' ? 'http://10.229.134.182/' : (selectedRobot.cameraUrl || 'http://10.229.134.76:8080/video_feed');
    setStreamUrl(targetUrl);
  }, [selectedRobot]);

  // Render Tactical HUD Overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const renderOverlay = () => {
      const width = (canvas.width = canvas.parentElement.clientWidth);
      const height = (canvas.height = canvas.parentElement.clientHeight);

      ctx.clearRect(0, 0, width, height);

      // Center Reticle
      const cx = width / 2;
      const cy = height / 2;
      ctx.strokeStyle = 'rgba(92, 156, 85, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 60, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - 80, cy);
      ctx.lineTo(cx + 80, cy);
      ctx.moveTo(cx, cy - 80);
      ctx.lineTo(cx, cy + 80);
      ctx.stroke();

      // Top Header Overlay
      ctx.fillStyle = 'rgba(217, 150, 48, 0.95)';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`CAM FEED URL: ${streamUrl}`, 16, 26);
      ctx.fillText(`TARGET UNIT: ${selectedRobot.id} (${selectedRobot.name})`, 16, 44);

      // Bottom Timestamp Overlay
      ctx.fillStyle = '#A9B0AA';
      ctx.font = '11px monospace';
      ctx.fillText(`UTC TIMESTAMP: ${new Date().toISOString()}`, 16, height - 16);

      animationId = requestAnimationFrame(renderOverlay);
    };

    renderOverlay();
    return () => cancelAnimationFrame(animationId);
  }, [selectedRobot, streamUrl]);

  // Capture Snapshot
  const handleSnapshot = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const base64Data = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');

    const snapshotName = `snapshot-${selectedRobot.id}-${Date.now()}.png`;
    setSnapshots((prev) => [snapshotName, ...prev.slice(0, 5)]);

    await desktop.saveFile({
      defaultName: snapshotName,
      filters: [{ name: 'PNG Images', extensions: ['png'] }],
      data: base64Data,
      isBinary: true,
    });
    addToast('info', `Snapshot captured: ${snapshotName}`);
  };

  // Flag Possible Victim
  const handleFlagVictim = () => {
    const newVic = {
      id: `VIC-${Date.now().toString().slice(-3)}`,
      label: `Victim Flagged from Camera Feed (${selectedRobot.id})`,
      source: 'CAMERA',
      confidence: 88,
      status: 'POSSIBLE',
      location: {
        latitude: selectedRobot.location?.latitude || 37.7749,
        longitude: selectedRobot.location?.longitude || -122.4194,
        zone: 'Sector B Target Area',
      },
      timestamp: new Date().toISOString(),
      notes: `Flagged by operator from feed ${streamUrl}`,
      origin: 'simulated',
    };
    victimService.getVictims().then((vics) => {
      vics.unshift(newVic);
    });
    addToast('warn', `New possible victim flagged from camera feed (${newVic.id})`);
  };

  return (
    <div className="space-y-4 overflow-y-auto h-full select-none font-sans text-xs">
      {/* Header Panel */}
      <div className="bg-[var(--surface-2)] border border-[var(--line)] p-3 rounded flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Eye className="w-5 h-5 text-[var(--accent)]" />
          <div>
            <h1 className="text-sm font-bold text-[var(--ink)]">1ST BOT CAMERA FEED MONITOR</h1>
            <p className="text-[11px] text-[var(--ink-2)] font-mono">
              Live Stream Input Feed: <strong className="text-[var(--accent)]">{streamUrl}</strong>
            </p>
          </div>
        </div>

        {/* Robot Selector Pills */}
        <div className="flex items-center space-x-2 font-mono">
          {robots.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRobotId(r.id)}
              className={`px-2.5 py-1 rounded text-xs font-bold border transition-colors ${
                r.id === selectedRobot.id
                  ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                  : 'bg-[var(--surface)] text-[var(--ink-2)] border-[var(--line)] hover:bg-[var(--surface-2)]'
              }`}
            >
              {r.id}: {r.name}
            </button>
          ))}
        </div>
      </div>

      {/* Feed URL Bar */}
      <div className="bg-[var(--surface)] border border-[var(--line)] p-3 rounded flex flex-wrap items-center justify-between gap-3 font-mono">
        <div className="flex items-center space-x-2 flex-1">
          <span className="text-[var(--ink-2)] font-bold">CAM FEED URL:</span>
          <input
            type="text"
            value={streamUrl}
            onChange={(e) => setStreamUrl(e.target.value)}
            className="flex-1 bg-[var(--surface-2)] border border-[var(--line-strong)] rounded px-2.5 py-1 text-[var(--ink)] font-bold font-mono focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFeedMode('LIVE')}
            className={`px-3 py-1 rounded text-xs font-bold border transition-colors ${
              feedMode === 'LIVE'
                ? 'bg-[var(--ok)] text-white border-[var(--ok)]'
                : 'bg-[var(--surface-2)] text-[var(--ink-2)] border-[var(--line)]'
            }`}
          >
            ● LIVE STREAM
          </button>
          <button
            onClick={() => setFeedMode('SIMULATED')}
            className={`px-3 py-1 rounded text-xs font-bold border transition-colors ${
              feedMode === 'SIMULATED'
                ? 'bg-[var(--warn)] text-white border-[var(--warn)]'
                : 'bg-[var(--surface-2)] text-[var(--ink-2)] border-[var(--line)]'
            }`}
          >
            SIMULATED FEED
          </button>
        </div>
      </div>

      {/* Main Stream Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main Feed Viewport */}
        <div className="lg:col-span-3 bg-[var(--surface)] border border-[var(--line)] rounded overflow-hidden flex flex-col justify-between min-h-[420px] relative">
          <div className="panel-header">
            <div className="flex items-center space-x-2 font-mono">
              <span className="w-2 h-2 rounded-full bg-[var(--ok)] animate-ping"></span>
              <span>LIVE CAMERA STREAM FEED - {selectedRobot.id}</span>
            </div>
            <span className="font-mono text-[10px] text-[var(--ok)]">● STREAM ACTIVE</span>
          </div>

          <div className="flex-1 relative bg-black overflow-hidden min-h-[380px]">
            {/* Direct Live Stream Elements */}
            {feedMode === 'LIVE' ? (
              <div className="w-full h-full relative">
                {/* Image Stream Tag for MJPEG/HTTP camera */}
                <img
                  src={streamUrl}
                  alt="1st Bot Live Camera Feed"
                  className="w-full h-full object-contain absolute inset-0 z-0"
                  onError={(e) => {
                    // Fallback to iframe if img fails to parse HTML stream
                    e.target.style.display = 'none';
                    const iframe = document.getElementById('camera-iframe-fallback');
                    if (iframe) iframe.style.display = 'block';
                  }}
                />
                {/* Fallback iframe for HTML/embedded camera streams */}
                <iframe
                  id="camera-iframe-fallback"
                  src={streamUrl}
                  title="Camera Stream"
                  className="w-full h-full border-0 absolute inset-0 z-0 hidden"
                />
              </div>
            ) : null}

            {/* Tactical Canvas Overlay */}
            <canvas ref={canvasRef} className="w-full h-full absolute inset-0 z-10 pointer-events-none" />
          </div>

          {/* Action Controls Bar */}
          <div className="p-3 bg-[var(--surface-2)] border-t border-[var(--line)] flex justify-between items-center font-mono">
            <div className="text-[var(--ink-2)] text-[11px] truncate">
              URL: <span className="text-[var(--ink)] font-bold">{streamUrl}</span>
            </div>

            <div className="flex space-x-2 font-sans">
              <button
                onClick={handleSnapshot}
                className="bg-[var(--surface)] hover:bg-[var(--line)] text-[var(--ink)] px-3 py-1.5 rounded border border-[var(--line-strong)] text-xs font-bold flex items-center space-x-1.5"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Snapshot</span>
              </button>

              <button
                onClick={handleFlagVictim}
                className="bg-[var(--warn)] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center space-x-1.5 hover:opacity-90"
              >
                <UserPlus className="w-4 h-4" />
                <span>Flag Possible Victim</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Snapshot History */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded overflow-hidden flex flex-col justify-between font-mono">
          <div className="panel-header">
            <span>SNAPSHOT STRIP ({snapshots.length})</span>
          </div>

          <div className="p-3 space-y-2 overflow-y-auto max-h-[380px]">
            {snapshots.length === 0 ? (
              <div className="text-[var(--ink-3)] italic text-center py-8 text-xs">
                No snapshots captured yet
              </div>
            ) : (
              snapshots.map((snap, idx) => (
                <div key={idx} className="p-2 bg-[var(--surface-2)] rounded border border-[var(--line)] text-[11px] text-[var(--ink)]">
                  <div className="font-bold truncate">{snap}</div>
                  <div className="text-[10px] text-[var(--ink-3)]">Source: {streamUrl}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
