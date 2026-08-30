'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SimulationResult, Scenario } from '../../../types/api';
import { ComparisonMetric } from './comparison-metric';

interface ScenarioComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  baselineResult: SimulationResult;
  targetResult: SimulationResult;
  targetScenarioTitle?: string;
}

export function ScenarioComparisonModal({
  isOpen,
  onClose,
  baselineResult,
  targetResult,
  targetScenarioTitle = 'Proposed Scenario',
}: ScenarioComparisonModalProps) {
  if (!isOpen) return null;

  const formatIDR = (num: number) => `Rp ${(num / 1_000_000).toFixed(2)}M`;

  const monthlySavings = baselineResult.baseline.monthly_cost - targetResult.financial.new_monthly_cost;
  const billReductionPct = baselineResult.baseline.monthly_cost > 0
    ? ((monthlySavings / baselineResult.baseline.monthly_cost) * 100).toFixed(1)
    : '0';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-3xl bg-slate-50 rounded-3xl border border-slate-200 shadow-2xl overflow-hidden text-left"
        >
          <div className="flex items-center justify-between px-6 sm:px-8 pt-7 pb-5 bg-white border-b border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                SCENARIO COMPARISON MATRIX
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                Baseline vs {targetScenarioTitle}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6 max-h-[72vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Baseline Profile</span>
                <div className="text-sm font-bold text-slate-800">100% PLN Grid Dependency</div>
                <div className="text-xs text-slate-500">0 kWp Solar · 0 kWh Battery</div>
              </div>
              <div className="space-y-1 border-l border-slate-100 pl-4">
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Proposed Upgrade</span>
                <div className="text-sm font-bold text-slate-900">Solar + Storage Hybrid</div>
                <div className="text-xs text-slate-600">
                  {targetResult.configuration.pv_kwp} kWp Solar · {targetResult.configuration.battery_kwh} kWh Battery · {targetResult.configuration.ac_units} ACs
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                FINANCIAL IMPACT
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ComparisonMetric
                  label="Monthly Electricity Bill"
                  baseValue={formatIDR(baselineResult.baseline.monthly_cost)}
                  targetValue={formatIDR(targetResult.financial.new_monthly_cost)}
                  deltaText={`-${billReductionPct}% / mo`}
                  deltaType="positive"
                  helperText="Direct reduction on recurring PLN electricity expenditures."
                />
                <ComparisonMetric
                  label="Annual Cost Savings"
                  baseValue="Rp 0.00M"
                  targetValue={formatIDR(targetResult.financial.monthly_savings * 12)}
                  deltaText={`+${formatIDR(targetResult.financial.monthly_savings * 12)}/yr`}
                  deltaType="positive"
                  helperText="Estimated cumulative savings retained per 12-month operating cycle."
                />
                <ComparisonMetric
                  label="Estimated CAPEX"
                  baseValue="Rp 0.00M"
                  targetValue={formatIDR(targetResult.financial.capex)}
                  deltaText="Initial Investment"
                  deltaType="neutral"
                  helperText="Turnkey equipment, inverter, battery pack, and certified installation cost."
                />
                <ComparisonMetric
                  label="Payback Period (PBP)"
                  baseValue="Infinite"
                  targetValue={targetResult.financial.payback_years !== null ? `${targetResult.financial.payback_years.toFixed(1)} Years` : 'N/A'}
                  deltaText="Fast Return"
                  deltaType="positive"
                  helperText="Breakeven horizon based on active baseline tariff and daily peak shifting."
                />
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                ENERGY & ENVIRONMENTAL BALANCE
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ComparisonMetric
                  label="Monthly Grid Draw"
                  baseValue={`${Math.round(baselineResult.baseline.monthly_kwh)} kWh`}
                  targetValue={`${Math.round(targetResult.energy.grid_import_monthly)} kWh`}
                  deltaText={`-${(100 - targetResult.grid.independence_pct).toFixed(0)}% Draw`}
                  deltaType="positive"
                  helperText="Total energy imported from utility infrastructure."
                />
                <ComparisonMetric
                  label="CO₂ Carbon Offset"
                  baseValue="0.0% Offset"
                  targetValue={`${targetResult.environmental.co2_reduction_pct.toFixed(1)}%`}
                  deltaText={`-${(targetResult.environmental.co2_reduction_kg_yr / 1000).toFixed(1)} Tons/yr`}
                  deltaType="positive"
                  helperText="Avoided operational emissions compared to default grid emission factor."
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end px-6 sm:px-8 py-4 bg-white border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white shadow-xs cursor-pointer"
            >
              Done Reviewing
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}