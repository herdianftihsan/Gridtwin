'use client';

import React from 'react';
import { ConnectionState, NodePosition } from './types';

interface EnergyConnectionProps {
  connection: ConnectionState;
  sourcePos: NodePosition;
  targetPos: NodePosition;
  reducedMotion?: boolean;
}

export function EnergyConnection({
  connection,
  sourcePos,
  targetPos,
  reducedMotion = false,
}: EnergyConnectionProps) {
  const { isActive, color, animated, curveOffset = 0, id } = connection;

  const startX = sourcePos.x + sourcePos.w / 2;
  const startY = sourcePos.y + sourcePos.h / 2;
  const endX = targetPos.x + targetPos.w / 2;
  const endY = targetPos.y + targetPos.h / 2;

  let pathData = `M ${startX} ${startY} L ${endX} ${endY}`;
  let midX = (startX + endX) / 2;
  let midY = (startY + endY) / 2;

  if (curveOffset !== 0) {
    const dx = endX - startX;
    const dy = endY - startY;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const normalX = -dy / len;
    const normalY = dx / len;
    const ctrlX = midX + normalX * curveOffset;
    const ctrlY = midY + normalY * curveOffset;
    pathData = `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`;
    midX = ctrlX * 0.5 + (startX + endX) * 0.25;
    midY = ctrlY * 0.5 + (startY + endY) * 0.25;
  }

  return (
    <g data-testid={`connection-${id}`} className="transition-opacity duration-300">
      {/* Background Track */}
      <path
        d={pathData}
        stroke={isActive ? color : '#E2E8F0'}
        strokeWidth={isActive ? 3.5 : 1.5}
        strokeOpacity={isActive ? 0.25 : 0.6}
        strokeLinecap="round"
        fill="none"
      />

      {/* Animated Stream Path */}
      {isActive && (
        <path
          d={pathData}
          stroke={color}
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeDasharray={reducedMotion ? 'none' : '8 6'}
          className={reducedMotion || !animated ? '' : 'animate-energy-flow'}
          fill="none"
        />
      )}

      {/* Mid-Path Directional Indicator */}
      {isActive && (
        <circle
          cx={midX}
          cy={midY}
          r={4}
          fill={color}
          className={reducedMotion ? '' : 'animate-pulse'}
        />
      )}
    </g>
  );
}