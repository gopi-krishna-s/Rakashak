import React, { useState, useEffect, useCallback } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Square, Lock } from 'lucide-react';
import { robotService } from '../../services/factory';
import { useApp } from '../../context/AppContext';

export const DeadManPad = ({ robotId = 'ROBOT-A', isAutonomous = false, isDisconnected = false }) => {
  const { estopLatched, addToast } = useApp();
  const [activeDir, setActiveDir] = useState(null);
  const [speedLimit, setSpeedLimit] = useState(1.2); // max m/s
  const [isFocused, setIsFocused] = useState(false);

  const disabledReason = estopLatched
    ? 'E-STOP LATCHED'
    : isDisconnected
    ? 'COMMUNICATION DISCONNECTED'
    : isAutonomous
    ? 'AUTONOMOUS MODE ACTIVE'
    : null;

  const handlePulse = useCallback(
    (dir) => {
      if (disabledReason) return;
      setActiveDir(dir);
      robotService.sendMovement(robotId, dir);
    },
    [robotId, disabledReason]
  );

  const handleRelease = useCallback(() => {
    if (activeDir) {
      setActiveDir(null);
      robotService.sendMovement(robotId, 'STOP');
    }
  }, [robotId, activeDir]);

  // Window blur / Tab visibility change safety handler
  useEffect(() => {
    const handleBlur = () => handleRelease();
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleBlur);

    return () => {
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleBlur);
    };
  }, [handleRelease]);

  // Keyboard driving when pad is focused
  useEffect(() => {
    if (!isFocused || disabledReason) return;

    const handleKeyDown = (e) => {
      if (['input', 'textarea', 'select'].includes(document.activeElement?.tagName?.toLowerCase())) return;
      if (e.repeat) return;

      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') handlePulse('FORWARD');
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') handlePulse('BACKWARD');
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') handlePulse('LEFT');
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') handlePulse('RIGHT');
      if (e.key === ' ') handlePulse('STOP');
    };

    const handleKeyUp = () => handleRelease();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isFocused, disabledReason, handlePulse, handleRelease]);

  return (
    <div
      tabIndex={0}
      onFocus={() => setIsFocused(true)}
      onBlur={() => {
        setIsFocused(false);
        handleRelease();
      }}
      className={`p-4 rounded border relative bg-[var(--surface)] transition-all ${
        isFocused ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]' : 'border-[var(--line)]'
      }`}
    >
      <div className="panel-header -mx-4 -mt-4 mb-3">
        <span>Dead-Man Movement Control ({robotId})</span>
        <span className="font-mono text-[10px] text-[var(--ink-3)]">
          {isFocused ? 'KEYBOARD ARMED (WASD/ARROWS)' : 'CLICK TO ARM KEYBOARD'}
        </span>
      </div>

      {/* Disabled Overlay Notice */}
      {disabledReason && (
        <div className="absolute inset-0 bg-[var(--surface)]/90 backdrop-blur-xs z-20 flex flex-col items-center justify-center p-4 text-center rounded">
          <Lock className="w-6 h-6 text-[var(--danger)] mb-1" />
          <span className="font-mono font-bold text-xs text-[var(--danger)]">{disabledReason}</span>
          <span className="text-[11px] text-[var(--ink-2)] mt-1">Manual drive disabled for safety</span>
        </div>
      )}

      {/* Speed Limiter Slider */}
      <div className="flex items-center justify-between text-xs mb-3 font-mono">
        <span className="text-[var(--ink-2)]">Speed Limiter:</span>
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="0.2"
            max="2.5"
            step="0.1"
            value={speedLimit}
            onChange={(e) => setSpeedLimit(parseFloat(e.target.value))}
            className="w-24 accent-[var(--accent)]"
            disabled={Boolean(disabledReason)}
          />
          <span className="font-bold text-[var(--ink)] w-12">{speedLimit.toFixed(1)} m/s</span>
        </div>
      </div>

      {/* D-Pad Buttons */}
      <div className="flex flex-col items-center space-y-2">
        <button
          onMouseDown={() => handlePulse('FORWARD')}
          onMouseUp={handleRelease}
          onMouseLeave={handleRelease}
          onTouchStart={() => handlePulse('FORWARD')}
          onTouchEnd={handleRelease}
          disabled={Boolean(disabledReason)}
          className={`p-3 rounded border font-bold text-xs transition-colors w-16 flex justify-center ${
            activeDir === 'FORWARD'
              ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
              : 'bg-[var(--surface-2)] border-[var(--line-strong)] text-[var(--ink)] hover:bg-[var(--line)]'
          }`}
        >
          <ArrowUp className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2">
          <button
            onMouseDown={() => handlePulse('LEFT')}
            onMouseUp={handleRelease}
            onMouseLeave={handleRelease}
            onTouchStart={() => handlePulse('LEFT')}
            onTouchEnd={handleRelease}
            disabled={Boolean(disabledReason)}
            className={`p-3 rounded border font-bold text-xs transition-colors w-16 flex justify-center ${
              activeDir === 'LEFT'
                ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                : 'bg-[var(--surface-2)] border-[var(--line-strong)] text-[var(--ink)] hover:bg-[var(--line)]'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => robotService.sendMovement(robotId, 'STOP')}
            disabled={Boolean(disabledReason)}
            className="p-3 rounded bg-[var(--danger)] text-white font-bold text-xs w-16 flex justify-center hover:opacity-90"
            title="Immediate Stop"
          >
            <Square className="w-5 h-5 fill-current" />
          </button>

          <button
            onMouseDown={() => handlePulse('RIGHT')}
            onMouseUp={handleRelease}
            onMouseLeave={handleRelease}
            onTouchStart={() => handlePulse('RIGHT')}
            onTouchEnd={handleRelease}
            disabled={Boolean(disabledReason)}
            className={`p-3 rounded border font-bold text-xs transition-colors w-16 flex justify-center ${
              activeDir === 'RIGHT'
                ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                : 'bg-[var(--surface-2)] border-[var(--line-strong)] text-[var(--ink)] hover:bg-[var(--line)]'
            }`}
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onMouseDown={() => handlePulse('BACKWARD')}
          onMouseUp={handleRelease}
          onMouseLeave={handleRelease}
          onTouchStart={() => handlePulse('BACKWARD')}
          onTouchEnd={handleRelease}
          disabled={Boolean(disabledReason)}
          className={`p-3 rounded border font-bold text-xs transition-colors w-16 flex justify-center ${
            activeDir === 'BACKWARD'
              ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
              : 'bg-[var(--surface-2)] border-[var(--line-strong)] text-[var(--ink)] hover:bg-[var(--line)]'
          }`}
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      </div>

      <div className="text-[10px] text-center text-[var(--ink-3)] font-mono mt-3">
        Hold mouse button or touch screen to move. Releasing immediately stops unit.
      </div>
    </div>
  );
};
