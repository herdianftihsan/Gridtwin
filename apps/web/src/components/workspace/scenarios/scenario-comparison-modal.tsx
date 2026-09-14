'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scenario } from '../../../types/api';

import { Portal } from '../../ui/portal';

interface ScenarioComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenarios: Scenario[];
}

export function ScenarioComparisonModal({
  isOpen,
  onClose,
  scenarios,
}: ScenarioComparisonModalProps) {
  if (!isOpen || scenarios.length === 0) return null;

  const formatIDR = (n: number) => `Rp ${(n / 1_000_000).toFixed(2).replace(/\.00$/, '')} Jt`;

  // Assume the first selected scenario is the baseline for savings comparison
  const baseline = scenarios[0]!;
  const baseFin = baseline.simulation_result!.financial;

  return (
    <Portal>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="comparison-modal-title"
            className="relative w-full max-w-5xl max-h-[85vh] lg:max-h-[90vh] bg-white rounded-2xl border border-slate-200 shadow-xl flex flex-col overflow-hidden text-left"
          >
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-slate-500 block">
                  MATRIKS PERBANDINGAN SKENARIO
                </span>
                <h2 id="comparison-modal-title" className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                  Membandingkan {scenarios.length} Skenario
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close Comparison Modal"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 overflow-x-auto">
              {/* Top Summary row */}
              <div className={`grid gap-3.5 min-w-[600px] ${scenarios.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {scenarios.map((scenario, index) => {
                  const cfg = scenario.simulation_result!.configuration;
                  const isBaseline = index === 0;
                  return (
                    <div key={scenario.id} className={`p-4 rounded-xl border space-y-1 ${isBaseline ? 'bg-slate-50 border-slate-200' : 'bg-sky-50/70 border-sky-200'}`}>
                      <span className={`text-xs font-semibold uppercase tracking-wider block ${isBaseline ? 'text-slate-500' : 'text-sky-700'}`}>
                        {isBaseline ? 'PROFIL AWAL' : 'SKENARIO USULAN'}
                      </span>
                      <div className="text-sm font-bold text-slate-900 truncate" title={scenario.name || scenario.scenario_type}>
                        {scenario.name || scenario.scenario_type}
                      </div>
                      <div className="text-xs text-slate-600">
                        {cfg.pv_kwp} kWp Surya · {cfg.battery_kwh} kWh Baterai · {cfg.ac_units} Unit AC
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 min-w-[600px]">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  DAMPAK FINANSIAL
                </span>
                
                {/* Monthly Electricity Bill Row */}
                <div className={`grid gap-3.5 ${scenarios.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  {scenarios.map((scenario, index) => {
                    const fin = scenario.simulation_result!.financial;
                    const monthlySavings = baseFin.new_monthly_cost - fin.new_monthly_cost;
                    const savingsPct = baseFin.new_monthly_cost > 0 
                      ? ((monthlySavings / baseFin.new_monthly_cost) * 100).toFixed(1) 
                      : '0.0';
                    const isBaseline = index === 0;

                    return (
                      <div key={`bill-${scenario.id}`} className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">Tagihan Bulanan</span>
                          {!isBaseline && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                              -{savingsPct}% / bln
                            </span>
                          )}
                        </div>
                        <div className="flex items-baseline justify-between pt-1">
                          <div className="text-right">
                            <span className="text-lg font-bold text-slate-900">
                              {formatIDR(fin.new_monthly_cost)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Annual Cost Savings Row */}
                <div className={`grid gap-3.5 ${scenarios.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  {scenarios.map((scenario, index) => {
                    const fin = scenario.simulation_result!.financial;
                    const monthlySavings = baseFin.new_monthly_cost - fin.new_monthly_cost;
                    const isBaseline = index === 0;

                    return (
                      <div key={`savings-${scenario.id}`} className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">Penghematan Tahunan</span>
                          {!isBaseline && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                              +{formatIDR(monthlySavings * 12)}/thn
                            </span>
                          )}
                        </div>
                        <div className="flex items-baseline justify-between pt-1">
                          <div className="text-right">
                            <span className="text-lg font-bold text-emerald-600">
                              {isBaseline ? formatIDR(0) : formatIDR(monthlySavings * 12)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* CAPEX Row */}
                <div className={`grid gap-3.5 ${scenarios.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  {scenarios.map((scenario) => {
                    const fin = scenario.simulation_result!.financial;

                    return (
                      <div key={`capex-${scenario.id}`} className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">Estimasi CAPEX</span>
                        </div>
                        <div className="flex items-baseline justify-between pt-1">
                          <div className="text-right">
                            <span className="text-lg font-bold text-slate-900">
                              {formatIDR(fin.capex)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Payback Period Row */}
                <div className={`grid gap-3.5 ${scenarios.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  {scenarios.map((scenario, index) => {
                    const fin = scenario.simulation_result!.financial;
                    const isBaseline = index === 0;

                    return (
                      <div key={`pbp-${scenario.id}`} className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">Periode Pengembalian Modal</span>
                        </div>
                        <div className="flex items-baseline justify-between pt-1">
                          <div className="text-right">
                            <span className="text-lg font-bold text-slate-900">
                              {isBaseline ? 'Tak Terhingga' : (fin.payback_years !== null ? `${fin.payback_years.toFixed(1)} Tahun` : 'N/A')}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 min-w-[600px]">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  DAMPAK LINGKUNGAN & JARINGAN
                </span>
                <div className={`grid gap-3.5 ${scenarios.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  {scenarios.map((scenario) => {
                    const env = scenario.simulation_result!.environmental;
                    const grid = scenario.simulation_result!.grid;
                    
                    return (
                      <div key={`env-${scenario.id}`} className="space-y-2">
                        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                          <span className="font-semibold text-emerald-900">Pengur. CO₂:</span>
                          <span className="font-bold text-emerald-700">
                            {env.co2_reduction_pct.toFixed(0)}%
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between text-xs">
                          <span className="font-semibold text-indigo-900">Ind. Jaringan:</span>
                          <span className="font-bold text-indigo-700">{grid.independence_pct.toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* 3. Footer (Sticky Bottom) */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-sm font-semibold text-white transition-colors cursor-pointer"
              >
                Selesai Meninjau
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </Portal>
  );
}