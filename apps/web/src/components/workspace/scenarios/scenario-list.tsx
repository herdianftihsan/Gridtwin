'use client';

import React from 'react';
import { Scenario } from '../../../types/api';
import { ScenarioCard } from './scenario-card';

interface ScenarioListProps {
  scenarios: Scenario[];
  selectedScenarioId?: string;
  onSelectScenario: (scenario: Scenario) => void;
  onCompareScenario: (scenario: Scenario) => void;
}

export function ScenarioList({
  scenarios,
  selectedScenarioId,
  onSelectScenario,
  onCompareScenario,
}: ScenarioListProps) {
  // Cap list strictly at 10 recent scenarios per API contract
  const displayScenarios = scenarios.slice(0, 10);

  if (displayScenarios.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-center text-xs text-slate-400">
        No saved scenarios yet. Adjust the sliders and click "Save Scenario".
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          SAVED SCENARIOS ({displayScenarios.length}/10)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
        {displayScenarios.map((sc) => (
          <ScenarioCard
            key={sc.id}
            scenario={sc}
            isSelected={sc.id === selectedScenarioId}
            onSelect={onSelectScenario}
            onCompare={onCompareScenario}
          />
        ))}
      </div>
    </div>
  );
}