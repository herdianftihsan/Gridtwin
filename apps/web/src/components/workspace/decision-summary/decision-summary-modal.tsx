'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Project, SimulationResult } from '../../../types/api';

interface DecisionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  result: SimulationResult;
  onSaveScenario?: () => void;
  isSaving?: boolean;
}

export function DecisionSummaryModal({
  isOpen,
  onClose,
  project,
  result,
  onSaveScenario,
  isSaving = false,
}: DecisionSummaryModalProps) {
  if (!isOpen) return null;

  const cfg = result.configuration;
  const fin = result.financial;
  const env = result.environmental;
  const grid = result.grid;

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="summary-title"
          className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden text-left"
        >

          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 block">
                GRIDTWIN AI · INVESTMENT ANALYSIS
              </span>
              <h2 id="summary-title" className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                Decision Summary
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Summary Modal"
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>


          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  RECOMMENDED CONFIGURATION
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  RECOMMENDED
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                  <div className="text-xs font-black text-slate-900">{cfg.pv_kwp} kWp</div>
                  <div className="text-[11px] text-slate-500 font-medium">Solar PV</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                  <div className="text-xs font-black text-slate-900">{cfg.battery_kwh} kWh</div>
                  <div className="text-[11px] text-slate-500 font-medium">Battery Storage</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                  <div className="text-xs font-black text-slate-900">{project.building_type}</div>
                  <div className="text-[11px] text-slate-500 font-medium">{project.location}</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                  <div className="text-xs font-black text-slate-900">PLN Grid</div>
                  <div className="text-[11px] text-slate-500 font-medium">Hybrid Utility</div>
                </div>
              </div>
            </div>


            <div className="p-6 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    MONTHLY ELECTRICITY COST
                  </span>
                  <div className="text-3xl font-black text-white mt-1">
                    {formatIDR(fin.new_monthly_cost)}
                  </div>
                  <span className="text-xs text-slate-400 line-through">
                    Baseline: {formatIDR(project.monthly_bill)}
                  </span>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                    ANNUAL SAVINGS
                  </span>
                  <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                    {formatIDR(fin.monthly_savings * 12)}
                  </div>
                  <span className="text-xs text-slate-400">
                    Net monthly: {formatIDR(fin.monthly_savings)}
                  </span>
                </div>
              </div>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-left">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Payback Period</span>
                <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                  {fin.payback_years !== null ? `${fin.payback_years.toFixed(1)} Years` : 'N/A'}
                </span>
                <span className="text-[11px] text-slate-500">Breakeven timeline</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-left">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total CAPEX</span>
                <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                  {formatIDR(fin.capex)}
                </span>
                <span className="text-[11px] text-slate-500">Equipment + Install</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-left">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">10-Yr Estimated ROI</span>
                <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                  {fin.capex > 0 ? `${(((fin.monthly_savings * 120) - fin.capex) / fin.capex * 100).toFixed(0)}%` : '0%'}
                </span>
                <span className="text-[11px] text-slate-500">Cumulative yield</span>
              </div>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-left flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 text-base font-bold shrink-0">
                  🌱
                </div>
                <div>
                  <span className="text-[10px] text-emerald-800 uppercase font-bold block">CO₂ REDUCTION</span>
                  <span className="text-base font-extrabold text-emerald-950">
                    {env.co2_reduction_pct.toFixed(0)}% ({env.co2_reduction_kg_yr.toLocaleString('id-ID')} kg/yr)
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-left flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 text-base font-bold shrink-0">
                  ⚡
                </div>
                <div>
                  <span className="text-[10px] text-indigo-800 uppercase font-bold block">GRID INDEPENDENCE</span>
                  <span className="text-base font-extrabold text-indigo-950">
                    {grid.independence_pct.toFixed(1)}% Self-Sufficiency
                  </span>
                </div>
              </div>
            </div>


            <div className="p-3.5 rounded-2xl bg-slate-100/80 border border-slate-200 text-[11px] text-slate-500 leading-relaxed text-left">
              ⚖️ <span className="font-semibold text-slate-700">Permen ESDM No. 2/2024:</span> Surplus solar generation is utilized via battery storage and load shifting without uncredited export tariffs.
            </div>
          </div>


          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 sticky bottom-0 z-10">
            <span className="text-xs text-slate-400 font-medium">
              Find an Installer — Coming Soon
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Close
              </button>
              {onSaveScenario && (
                <button
                  type="button"
                  onClick={onSaveScenario}
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-semibold text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'Saving...' : 'Save Scenario'}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}