import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Navigation, Layers, Compass, ZoomIn, ZoomOut, RotateCcw, AlertTriangle, Radio, Bot, Shield, Eye } from 'lucide-react';

export const OperationalMap = () => {
  const { robots = [], selectedRobotId, setSelectedRobotId, comms = {}, victims = [], mission = {}, setMission } = useApp();
  const [mapMode, setMapMode] = useState('offline-canvas'); // 'offline-canvas' | 'maplibre'
  const canvasRef = useRef(null);

  const activeRobot = robots.find((r) => r.id === selectedRobotId) || robots[0] || {};
  const waypoints = mission.waypoints || [
    { id: 'W1', lat: 37.7749, lng: -122.4194, name: 'BASE STATION (10.229.134.76)', status: 'visited' },
    { id: 'W2', lat: 37.7758, lng: -122.4180, name: 'SECTOR ALPHA SEARCH', status: 'pending' },
    { id: 'W3', lat: 37.7738, lng: -122.4210, name: 'SECTOR BETA SEARCH', status: 'pending' },
  ];

  // Render HTML5 Interactive Offline Grid Canvas Map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const renderGridMap = () => {
      const width = (canvas.width = canvas.parentElement?.clientWidth || 800);
      const height = (canvas.height = canvas.parentElement?.clientHeight || 600);

      // Background - Dark Tactical Grid
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, width, height);

      // Grid Lines
      const gridSize = 40;
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;

      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Center Base Station Coordinate (San Francisco Field Base: 37.7749, -122.4194)
      const cx = width / 2;
      const cy = height / 2;

      // Base Range Ring
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 140, 0, Math.PI * 2);
      ctx.stroke();

      // Station Base Marker
      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      ctx.arc(cx, cy, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#a5b4fc';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('STATION BASE (10.229.134.76)', cx + 14, cy + 4);

      // Draw Communication Lines
      const robotA = robots.find((r) => r.id === 'ROBOT-A');
      const robotB = robots.find((r) => r.id === 'ROBOT-B');

      const getCoords = (r) => {
        if (!r) return { x: cx, y: cy };
        const rLat = r.location?.latitude ?? r.lat ?? 37.7749;
        const rLng = r.location?.longitude ?? r.lng ?? -122.4194;
        return {
          x: cx + (rLng - (-122.4194)) * 35000,
          y: cy - (rLat - 37.7749) * 35000,
        };
      };

      const posA = getCoords(robotA);
      const posB = getCoords(robotB);

      // Comms Path Styling
      ctx.lineWidth = 2.5;
      if (comms.state === 'CONNECTED_DIRECT') {
        ctx.strokeStyle = '#10b981'; // Direct Green Line Station -> Robot A
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(posA.x, posA.y);
        ctx.stroke();
      } else if (comms.state === 'RELAY_ACTIVE') {
        ctx.strokeStyle = '#f59e0b'; // Relay Orange Line Station -> Robot B -> Robot A
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(posB.x, posB.y);
        ctx.lineTo(posA.x, posA.y);
        ctx.stroke();
      } else if (comms.state === 'RECOVERING') {
        ctx.strokeStyle = '#f59e0b'; // Amber Dashed Line
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(posA.x, posA.y);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (comms.state === 'LOST') {
        ctx.strokeStyle = '#ef4444'; // Red Dashed Line
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(posA.x, posA.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw Search Area Boundary Polygon
      if (waypoints.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(249, 115, 22, 0.7)';
        ctx.fillStyle = 'rgba(249, 115, 22, 0.08)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);

        waypoints.forEach((wpt, idx) => {
          const wLat = wpt.lat ?? wpt.latitude ?? 37.7749;
          const wLng = wpt.lng ?? wpt.longitude ?? -122.4194;
          const wx = cx + (wLng - (-122.4194)) * 35000;
          const wy = cy - (wLat - 37.7749) * 35000;
          if (idx === 0) ctx.moveTo(wx, wy);
          else ctx.lineTo(wx, wy);
        });

        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw Waypoints
      waypoints.forEach((wpt) => {
        const wLat = wpt.lat ?? wpt.latitude ?? 37.7749;
        const wLng = wpt.lng ?? wpt.longitude ?? -122.4194;
        const wx = cx + (wLng - (-122.4194)) * 35000;
        const wy = cy - (wLat - 37.7749) * 35000;

        ctx.fillStyle = wpt.status === 'visited' ? '#10b981' : '#f97316';
        ctx.beginPath();
        ctx.arc(wx, wy, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '10px monospace';
        ctx.fillText(wpt.name || wpt.id, wx + 10, wy + 3);
      });

      // Draw Victim Detection Markers
      victims.forEach((vic) => {
        const vLat = vic.location?.latitude ?? 37.7749;
        const vLng = vic.location?.longitude ?? -122.4194;
        const vx = cx + (vLng - (-122.4194)) * 35000;
        const vy = cy - (vLat - 37.7749) * 35000;

        ctx.fillStyle = vic.status === 'CONFIRMED' ? '#ef4444' : '#f59e0b';
        ctx.beginPath();
        ctx.arc(vx, vy, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#fca5a5';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`▲ ${vic.id}`, vx + 11, vy + 3);
      });

      // Draw Robot Markers
      robots.forEach((robot) => {
        const rLat = robot.location?.latitude ?? robot.lat ?? 37.7749;
        const rLng = robot.location?.longitude ?? robot.lng ?? -122.4194;
        const rx = cx + (rLng - (-122.4194)) * 35000;
        const ry = cy - (rLat - 37.7749) * 35000;
        const isSel = robot.id === (activeRobot.id || selectedRobotId);

        // Pulsing Ring for Selected Robot
        if (isSel) {
          ctx.strokeStyle = '#f97316';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(rx, ry, 18, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Robot Icon Marker Dot
        ctx.fillStyle = isSel ? '#f97316' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(rx, ry, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#0b0f19';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`${robot.id}: ${robot.name}`, rx + 14, ry + 4);
      });

      animationId = requestAnimationFrame(renderGridMap);
    };

    renderGridMap();
    return () => cancelAnimationFrame(animationId);
  }, [robots, activeRobot, selectedRobotId, waypoints, comms, victims]);

  // Click canvas to add new waypoint
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const clickedLng = -122.4194 + (x - cx) / 35000;
    const clickedLat = 37.7749 - (y - cy) / 35000;

    const newWpt = {
      id: `W${waypoints.length + 1}`,
      lat: +clickedLat.toFixed(5),
      lng: +clickedLng.toFixed(5),
      status: 'pending',
      name: `WPT-${waypoints.length + 1}`,
    };

    setMission((prev) => ({
      ...prev,
      waypoints: [...(prev.waypoints || waypoints), newWpt],
    }));
  };

  const activeLat = activeRobot.location?.latitude ?? activeRobot.lat ?? 37.7749;
  const activeLng = activeRobot.location?.longitude ?? activeRobot.lng ?? -122.4194;

  return (
    <div className="relative w-full h-full bg-slate-950 flex flex-col select-none overflow-hidden font-sans text-xs">
      {/* Top Map HUD Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur border border-slate-800 p-3 rounded-xl shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-brand-600/20 text-brand-400 rounded">
            <MapPin className="w-5 h-5 text-[var(--accent)]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">DISASTER FIELD OPERATIONAL TACTICAL MAP</h2>
            <p className="text-xs text-slate-400 font-mono">
              Base Station Host: <strong className="text-[var(--accent)]">10.229.134.76</strong> | Grid: SF-DELTA-4
            </p>
          </div>
        </div>

        {/* Robot Selectors */}
        <div className="flex items-center space-x-2 font-mono">
          {robots.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRobotId(r.id)}
              className={`px-3 py-1 rounded text-xs font-bold border transition-colors ${
                r.id === activeRobot.id
                  ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {r.id} ({r.name})
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas View */}
      <div className="relative w-full h-full flex-1">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-full cursor-crosshair"
        />

        {/* Map Legend Notice Overlay */}
        <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur border border-slate-800 p-3 rounded-lg text-xs space-y-1.5 text-slate-300 font-mono">
          <div className="font-bold text-white flex items-center space-x-1.5">
            <Layers className="w-4 h-4 text-[var(--accent)]" />
            <span>MAP LAYER & LEGEND</span>
          </div>
          <div className="flex items-center space-x-2 text-[11px]">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
            <span>Station Base (10.229.134.76)</span>
          </div>
          <div className="flex items-center space-x-2 text-[11px]">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            <span>Robot A Leader (Feed: 10.229.134.182)</span>
          </div>
          <div className="flex items-center space-x-2 text-[11px]">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block"></span>
            <span>Robot B Mobile Relay</span>
          </div>
          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
            Click anywhere on map to add search waypoints
          </div>
        </div>

        {/* Selected Robot Telemetry Floating HUD */}
        <div className="absolute bottom-4 right-4 z-20 bg-slate-900/90 backdrop-blur border border-slate-800 p-4 rounded-xl shadow-xl w-72 text-xs space-y-2">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="font-bold text-white">{activeRobot.name || 'Robot Unit'} ({activeRobot.id || 'N/A'})</span>
            <span className="text-emerald-400 font-semibold">{activeRobot.status || 'IDLE'}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono">
            <div>Lat: <strong>{activeLat.toFixed(5)}</strong></div>
            <div>Lng: <strong>{activeLng.toFixed(5)}</strong></div>
            <div>Speed: <strong>{activeRobot.speed || 0} m/s</strong></div>
            <div>Battery: <strong className="text-emerald-400">{activeRobot.battery || 0}%</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
};
