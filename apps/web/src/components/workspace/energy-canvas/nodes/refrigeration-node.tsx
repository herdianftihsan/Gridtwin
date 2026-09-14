import React from 'react';
import { EnergyNode } from '../energy-node';
import { NodeTelemetry, NodePosition } from '../types';

export function RefrigerationNode({ telemetry, position, isSelected, onSelect }: {
  telemetry: NodeTelemetry; position: NodePosition; isSelected: boolean; onSelect: (id: string) => void;
}) {
  return (
    <EnergyNode
      telemetry={telemetry}
      position={position}
      isSelected={isSelected}
      onSelect={onSelect}
      accentColorClass="bg-emerald-50 border border-emerald-200 text-emerald-600"
      ringColorClass="ring-emerald-400/20"
      icon={
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9M12 4h9M12 4v16m-8-2h6a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2zm1-8h2m-2-4h2" />
        </svg>
      }
    />
  );
}
