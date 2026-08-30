'use client';

import React from 'react';
import { Scenario } from '../../../types/api';

interface ScenarioCardProps {
  scenario: Scenario;
  isSelected: boolean;
  onSelect: (scenario: Scenario) => void;
  onCompare?: (scenario: Scenario) => void;
}

export function ScenarioCard({
  scenario,
  isSelected,
  onSelect,
  onCompare,
}: ScenarioCardProps) {
  const { scenario_type, is_recommended, solar_kwp, battery_kwh, simulation_result, created_at } = scenario;

  const typeBadge = is_recommended
    ? { label: 'Recommended', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    : scenario_type === 'what_if'
    ? { label: 'What-If AI', class: 'bg-purple-50 text-purple-700 border-purple-200' }
    : { label: 'Custom Saved', class: 'bg-slate-100 text-slate-700 border-slate-200' };

  const formattedDate = created_at
    ? new Date(created_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })
    : 'Recent';

  const monthlyCost = simulation_result?.financial.new_monthly_cost;
  const payback = simulation_result?.financial.payback_years;

  return (
    <div
      onClick={() => onSelect(scenario)}
      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer select-none space-y-3 ${
        isSelected
          ? 'bg-sky-50/60 border-sky-500 ring-2 ring-sky-500/20 shadow-xs'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${typeBadge.class}`}>
          {typeBadge.label}
        </span>
        <span className="text-[11px] text-slate-400 font-medium">{formattedDate}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 block font-medium">Solar / Battery</span>
          <span className="font-bold text-slate-900">{solar_kwp} kWp / {battery_kwh} kWh</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block font-medium">Payback</span>
          <span className="font-bold text-slate-900">{payback !== null && payback !== undefined ? `${payback.toFixed(1)} Yrs` : 'N/A'}</span>
        </div>
      </div>

      {monthlyCost !== undefined && (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Monthly Bill</span>
          <span className="font-extrabold text-slate-900">
            Rp {(monthlyCost / 1_000_000).toFixed(2)}M
          </span>
        </div>
      )}

      {onCompare && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCompare(scenario);
          }}
          className="w-full mt-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition-colors"
        >
          Compare with Baseline
        </button>
      )}
    </div>
  );
}