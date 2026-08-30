import React from 'react';
import { EnergyNode } from '../energy-node';
import { NodeTelemetry, NodePosition } from '../types';

export function GridNode({ telemetry, position, isSelected, onSelect }: {
  telemetry: NodeTelemetry; position: NodePosition; isSelected: boolean; onSelect: (id: string) => void;
}) {
  return (
    <EnergyNode
      telemetry={telemetry}
      position={position}
      isSelected={isSelected}
      onSelect={onSelect}
      accentColorClass="bg-indigo-100 border border-indigo-200 text-indigo-600"
      ringColorClass="ring-indigo-400/20"
      icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      }
    />
  );
}