import React from 'react';
import { EnergyNode } from '../energy-node';
import { NodeTelemetry, NodePosition } from '../types';

export function HvacNode({ telemetry, position, isSelected, onSelect }: {
  telemetry: NodeTelemetry; position: NodePosition; isSelected: boolean; onSelect: (id: string) => void;
}) {
  return (
    <EnergyNode
      telemetry={telemetry}
      position={position}
      isSelected={isSelected}
      onSelect={onSelect}
      accentColorClass="bg-sky-50 border border-sky-200 text-sky-600"
      ringColorClass="ring-sky-400/20"
      icon={
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      }
    />
  );
}