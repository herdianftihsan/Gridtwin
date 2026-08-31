'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SimulationResult } from '../../../types/api';

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
  targetScenarioTitle = 'Recommended Scenario',
}: ScenarioComparisonModalProps) {
  if (!isOpen) return null;

  const baseFin = baselineResult.financial;
  const targetFin = targetResult.financial;
  const baseCfg = baselineResult.configuration;
  const targetCfg = targetResult.configuration;
  const targetEnv = targetResult.environmental;
  const targetGrid = targetResult.grid;

  const formatIDR = (n: number) => `Rp ${(n / 1_000_000).toFixed(2).replace(/\.00$/, '')}M`;

  const monthlySavings = baseFin.new_monthly_cost - targetFin.new_monthly_cost;
  const savingsPct =
    baseFin.new_monthly_cost > 0
      ? ((monthlySavings / baseFin.new_monthly_cost) * 100).toFixed(1)
      : '0.0';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="comparison-modal-title"
          className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden text-left"
        >
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 block">
                SCENARIO COMPARISON MATRIX
              </span>
              <h2 id="comparison-modal-title" className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                Baseline vs {targetScenarioTitle}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Comparison Modal"
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  BASELINE PROFILE
                </span>
                <div className="text-sm font-bold text-slate-900">100% PLN Grid Dependency</div>
                <div className="text-xs text-slate-500">
                  {baseCfg.pv_kwp} kWp Solar · {baseCfg.battery_kwh} kWh Battery
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-1">
                <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">
                  PROPOSED UPGRADE
                </span>
                <div className="text-sm font-bold text-slate-900">Solar + Storage Hybrid</div>
                <div className="text-xs text-slate-600">
                  {targetCfg.pv_kwp} kWp Solar · {targetCfg.battery_kwh} kWh Battery · {targetCfg.ac_units} AC Units
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                FINANCIAL IMPACT
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Monthly Electricity Bill</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      -{savingsPct}% / mo
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Baseline</span>
                      <span className="text-sm font-extrabold text-slate-400 line-through">
                        {formatIDR(baseFin.new_monthly_cost)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Proposed Scenario</span>
                      <span className="text-lg font-black text-slate-900">
                        {formatIDR(targetFin.new_monthly_cost)}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 pt-2">
                    Direct reduction on recurring PLN electricity expenditures[cite: 5, 8].
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Annual Cost Savings</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      +{formatIDR(monthlySavings * 12)}/yr
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Baseline</span>
                      <span className="text-sm font-extrabold text-slate-400">Rp 0.00M</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Proposed Scenario</span>
                      <span className="text-lg font-black text-emerald-600">
                        {formatIDR(monthlySavings * 12)}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 pt-2">
                    Estimated cumulative savings retained per 12-month operating cycle[cite: 5, 8].
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Estimated CAPEX</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      Initial Investment
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Baseline</span>
                      <span className="text-sm font-extrabold text-slate-400">Rp 0.00M</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Proposed Scenario</span>
                      <span className="text-lg font-black text-slate-900">
                        {formatIDR(targetFin.capex)}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 pt-2">
                    Turnkey equipment, inverter, battery pack, and certified installation cost[cite: 5, 8].
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Payback Period (PBP)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                      ROI Target
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Baseline</span>
                      <span className="text-sm font-extrabold text-slate-400">Infinite</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Proposed Scenario</span>
                      <span className="text-lg font-black text-slate-900">
                        {targetFin.payback_years !== null ? `${targetFin.payback_years.toFixed(1)} Years` : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 pt-2">
                    Breakeven horizon based on active baseline tariff and daily peak shifting[cite: 5, 8].
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-900">CO₂ Reduction:</span>
                <span className="font-black text-emerald-700">
                  {targetEnv.co2_reduction_pct.toFixed(0)}% ({targetEnv.co2_reduction_kg_yr.toLocaleString('id-ID')} kg/yr)
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-indigo-900">Grid Independence:</span>
                <span className="font-black text-indigo-700">{targetGrid.independence_pct.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* 3. Footer (Sticky Bottom) */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
            >
              Done Reviewing
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}