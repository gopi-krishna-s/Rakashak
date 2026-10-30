import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Video, Camera, Maximize2, Circle } from 'lucide-react';
import { desktop } from '../utils/desktop';

export const VideoMatrix = () => {
  const { robots } = useApp();
  const [recordingStreams, setRecordingStreams] = useState({});

  const toggleRecording = (robotId) => {
    setRecordingStreams((prev) => ({
      ...prev,
      [robotId]: !prev[robotId],
    }));
  };

  const handleCaptureSnapshot = async (robot) => {
    // Generate a simple SVG canvas snapshot data string
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, 640, 360);

    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`RESCUEBOT SNAPSHOT: ${robot.name} (${robot.id})`, 30, 50);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '14px monospace';
    ctx.fillText(`Timestamp: ${new Date().toISOString()}`, 30, 90);
    ctx.fillText(`GPS: ${robot.lat.toFixed(5)}, ${robot.lng.toFixed(5)}`, 30, 120);

    const base64Data = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');

    await desktop.saveFile({
      defaultName: `snapshot-${robot.id}-${Date.now()}.png`,
      filters: [{ name: 'PNG Images', extensions: ['png'] }],
      data: base64Data,
      isBinary: true,
    });
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full select-none">
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-brand-600/20 text-brand-400 rounded">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">4-CAMERA VIDEO STREAM MATRIX</h1>
            <p className="text-xs text-slate-400">Multi-unit real-time video surveillance grid</p>
          </div>
        </div>
      </div>

      {/* 2x2 Grid of Video Cameras */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {robots.map((robot) => {
          const isRec = recordingStreams[robot.id];
          return (
            <div
              key={robot.id}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between h-72 relative group"
            >
              {/* Simulated Feed Viewport */}
              <div className="absolute inset-0 bg-slate-950 flex items-center justify-center">
                <div className="w-full h-full bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 flex flex-col items-center justify-center space-y-2">
                  <Video className="w-10 h-10 text-slate-700 animate-pulse" />
                  <span className="text-xs font-mono text-slate-500">
                    STREAM FEED: {robot.name} ({robot.payload})
                  </span>
                </div>
              </div>

              {/* Header Bar */}
              <div className="relative z-10 p-3 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-slate-100 font-bold">{robot.id}: {robot.name}</span>
                </div>

                {isRec && (
                  <span className="flex items-center space-x-1 text-red-400 font-mono font-bold animate-pulse">
                    <Circle className="w-2.5 h-2.5 fill-current" />
                    <span>REC</span>
                  </span>
                )}
              </div>

              {/* Footer Controls Bar */}
              <div className="relative z-10 p-3 bg-slate-900/80 backdrop-blur border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs font-mono text-slate-400">1080p | 30fps</span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleRecording(robot.id)}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                      isRec ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {isRec ? 'Stop Rec' : 'Record'}
                  </button>

                  <button
                    onClick={() => handleCaptureSnapshot(robot)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors"
                    title="Capture Native Snapshot"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
