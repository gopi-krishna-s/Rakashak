import React from 'react';

/**
 * Compact SVG Communication Path Diagram
 * Dynamic topology diagram adapting to DIRECT, RELAY_ACTIVE, RECOVERING, and LOST states.
 */
export const CommsDiagram = ({ state = 'CONNECTED_DIRECT', activePath = 'DIRECT' }) => {
  const isDirect = state === 'CONNECTED_DIRECT';
  const isRelay = state === 'RELAY_ACTIVE';
  const isRecovering = state === 'RECOVERING';
  const isLost = state === 'LOST';

  return (
    <div className="bg-[var(--surface-2)] p-3 rounded border border-[var(--line)] font-mono text-xs space-y-2">
      <div className="panel-header -mx-3 -mt-3 mb-2">
        <span>Topology State: {state}</span>
        <span className="text-[10px] text-[var(--ink-2)]">ROUTE: {activePath}</span>
      </div>

      <div className="flex justify-center items-center py-2">
        <svg width="340" height="90" className="overflow-visible">
          {/* Station Node */}
          <g transform="translate(40, 45)">
            <rect x="-24" y="-18" width="48" height="36" rx="4" fill="var(--surface)" stroke="var(--ink-2)" strokeWidth="1.5" />
            <text x="0" y="4" textAnchor="middle" fill="var(--ink)" fontSize="10" fontWeight="bold" fontFamily="var(--font-mono)">
              STATION
            </text>
          </g>

          {/* Robot B Node (Relay) */}
          <g transform="translate(170, 20)">
            <rect
              x="-24"
              y="-16"
              width="48"
              height="32"
              rx="4"
              fill={isRelay ? 'var(--relay)' : 'var(--surface)'}
              stroke={isRelay ? 'var(--relay)' : 'var(--line-strong)'}
              strokeWidth="1.5"
            />
            <text x="0" y="4" textAnchor="middle" fill={isRelay ? '#ffffff' : 'var(--ink)'} fontSize="10" fontWeight="bold" fontFamily="var(--font-mono)">
              ROBOT B
            </text>
          </g>

          {/* Robot A Node (Leader) */}
          <g transform="translate(300, 45)">
            <rect x="-24" y="-18" width="48" height="36" rx="4" fill="var(--surface)" stroke="var(--ink-2)" strokeWidth="1.5" />
            <text x="0" y="4" textAnchor="middle" fill="var(--ink)" fontSize="10" fontWeight="bold" fontFamily="var(--font-mono)">
              ROBOT A
            </text>
          </g>

          {/* Direct Link Line (Station <-> A) */}
          <path
            d="M 64 45 L 276 45"
            stroke={isDirect ? 'var(--ok)' : isLost ? 'var(--danger)' : 'var(--line)'}
            strokeWidth={isDirect ? '2.5' : '1.5'}
            strokeDasharray={isLost ? '5,5' : 'none'}
            fill="none"
          />

          {/* Relay Path Lines (Station <-> B <-> A) */}
          <path
            d="M 64 40 Q 115 20 146 20"
            stroke={isRelay ? 'var(--relay)' : isRecovering ? 'var(--warn)' : 'var(--line)'}
            strokeWidth={isRelay || isRecovering ? '2.5' : '1'}
            strokeDasharray={isRecovering ? '4,4' : 'none'}
            fill="none"
          />
          <path
            d="M 194 20 Q 225 20 276 40"
            stroke={isRelay ? 'var(--relay)' : isRecovering ? 'var(--warn)' : 'var(--line)'}
            strokeWidth={isRelay || isRecovering ? '2.5' : '1'}
            strokeDasharray={isRecovering ? '4,4' : 'none'}
            fill="none"
          />

          {/* Status Label in Diagram */}
          <text x="170" y="78" textAnchor="middle" fill="var(--ink-2)" fontSize="10" fontFamily="var(--font-mono)">
            {isDirect
              ? "DIRECT LINK OK"
              : isRelay
              ? "RELAY ENGAGED (B -> A)"
              : isRecovering
              ? "RELAY REPOSITIONING..."
              : "LINK SEVERED"}
          </text>
        </svg>
      </div>
    </div>
  );
};
