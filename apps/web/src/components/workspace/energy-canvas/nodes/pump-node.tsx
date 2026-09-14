import React from 'react';
import { EnergyNode } from '../energy-node';
import { NodeTelemetry, NodePosition } from '../types';

export function PumpNode({ telemetry, position, isSelected, onSelect }: {
  telemetry: NodeTelemetry; position: NodePosition; isSelected: boolean; onSelect: (id: string) => void;
}) {
  return (
    <EnergyNode
      telemetry={telemetry}
      position={position}
      isSelected={isSelected}
      onSelect={onSelect}
      accentColorClass="bg-blue-50 border border-blue-200 text-blue-600"
      ringColorClass="ring-blue-400/20"
      icon={
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      }
    />
  );
}
