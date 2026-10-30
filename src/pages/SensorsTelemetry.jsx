import React, { useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Activity, Flame, Radio, Cpu, ShieldAlert } from 'lucide-react';

export const SensorsTelemetry = () => {
  const { selectedRobot } = useApp();
  const gasCanvasRef = useRef(null);
  const tempCanvasRef = useRef(null);

  // Live Canvas Telemetry Graph Renderer
  useEffect(() => {
    const renderChart = (canvas, color, minVal, maxVal, currentVal) => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const width = (canvas.width = canvas.parentElement.clientWidth);
      const height = (canvas.height = canvas.parentElement.clientHeight);

      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, width, height);

      // Grid Lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw simulated waveform
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      const points = 30;
      const step = width / (points - 1);

      for (let i = 0; i < points; i++) {
        const x = i * step;
        const noise = (Math.sin(i * 0.4 + Date.now() * 0.003) + Math.cos(i * 0.2)) * 15;
        const y = height / 2 + noise;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
    };

    const interval = setInterval(() => {
      renderChart(gasCanvasRef.current, '#f97316', 0, 50, selectedRobot.gasPpm);
      renderChart(tempCanvasRef.current, '#ef4444', 0, 100, selectedRobot.tempC);
    }, 500);

    return () => clearInterval(interval);
  }, [selectedRobot]);

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full select-none">
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-brand-600/20 text-brand-400 rounded">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">ENVIRONMENTAL & PAYLOAD TELEMETRY</h1>
            <p className="text-xs text-slate-400">
              Live sensor feed readings for {selectedRobot.name} ({selectedRobot.id})
            </p>
          </div>
        </div>
      </div>

      {/* Sensor Cards & Live Graphs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gas & CO2 Monitor */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-white">Hazardous Gas / CO₂ Monitor</h2>
            </div>
            <span className="text-sm font-mono font-bold text-amber-400">
              {selectedRobot.gasPpm} PPM
            </span>
          </div>

          <div className="h-44 w-full relative rounded overflow-hidden border border-slate-800">
            <canvas ref={gasCanvasRef} className="w-full h-full" />
          </div>
        </div>

        {/* Thermal Temperature Monitor */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-red-500" />
              <h2 className="text-sm font-bold text-white">Thermal Temperature Sensor</h2>
            </div>
            <span className="text-sm font-mono font-bold text-red-400">
              {selectedRobot.tempC} °C
            </span>
          </div>

          <div className="h-44 w-full relative rounded overflow-hidden border border-slate-800">
            <canvas ref={tempCanvasRef} className="w-full h-full" />
          </div>
        </div>
      </div>

      {/* LiDAR Clearance & Signal Gauge Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="text-xs text-slate-400">LiDAR Obstacle Clearance</div>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            {selectedRobot.lidarStatus} (4.2m)
          </div>
          <p className="text-[11px] text-slate-500">360° point-cloud obstacle detection active</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="text-xs text-slate-400">Wireless RSSI Link</div>
          <div className="text-xl font-bold text-blue-400 font-mono">
            {selectedRobot.signal}% (-62 dBm)
          </div>
          <p className="text-[11px] text-slate-500">Encrypted field mesh link OK</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="text-xs text-slate-400">Battery Cell Voltage</div>
          <div className="text-xl font-bold text-purple-400 font-mono">
            24.8 V ({selectedRobot.battery}%)
          </div>
          <p className="text-[11px] text-slate-500">LiFePO4 battery pack healthy</p>
        </div>
      </div>
    </div>
  );
};
