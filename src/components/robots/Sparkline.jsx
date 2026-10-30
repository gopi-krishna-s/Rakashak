import React from 'react';

/**
 * Hand-drawn SVG Sparkline Component for 60s Telemetry History
 * Renders SVG polyline path without external charting libraries.
 */
export const Sparkline = ({ data = [], color = 'var(--accent)', height = 24, width = 120, label = '' }) => {
  if (!data || data.length < 2) {
    return (
      <div className="flex items-center text-[10px] text-[var(--ink-3)] font-mono italic" style={{ height }}>
        [NO SPARKLINE DATA]
      </div>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const currentVal = data[data.length - 1];

  return (
    <div className="flex items-center space-x-2">
      <svg width={width} height={height} className="overflow-visible">
        {/* Baseline */}
        <line x1="0" y1={height - 1} x2={width} y2={height - 1} stroke="var(--line)" strokeWidth="1" strokeDasharray="2,2" />
        {/* Sparkline polyline */}
        <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
        {/* End dot */}
        {data.length > 0 && (
          <circle
            cx={width}
            cy={height - ((currentVal - min) / range) * (height - 4) - 2}
            r="2.5"
            fill={color}
          />
        )}
      </svg>
      {label && <span className="text-[10px] font-mono text-[var(--ink-2)]">{label}</span>}
    </div>
  );
};
