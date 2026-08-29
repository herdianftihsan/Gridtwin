'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SimulationResult, Project } from '../../types/api';

interface DecisionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  result: SimulationResult;
}

export function DecisionSummaryModal({
  isOpen,
  onClose,
  project,
  result,
}: DecisionSummaryModalProps) {
  if (!isOpen) return null;

  const { configuration, baseline, financial, environmental, grid } = result;

  const formatMillions = (val: number): string => {
    return `Rp ${(val / 1_000_000).toFixed(2).replace(/\.00$/, '')}M`;
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden text-left"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                GRIDTWIN AI · INVESTMENT ANALYSIS
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                Decision Summary
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Decision Summary"
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="px-8 py-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Section 1: Recommended Configuration Cards with Badges */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  RECOMMENDED CONFIGURATION
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  RECOMMENDED
                </span>
              </div>

              {/* Asset Cards Strip */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-between text-center gap-2">
                {/* Solar PV */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center mb-1.5 shadow-xs">
                    <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="text-sm font-bold text-slate-900">{configuration.pv_kwp} kWp</div>
                  <div className="text-[10px] text-slate-400 font-medium">Solar PV</div>
                </div>

                <div className="w-4 h-[1px] bg-slate-200" />

                {/* Battery Storage */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-teal-100 border border-teal-200 flex items-center justify-center mb-1.5 shadow-xs">
                    <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="text-sm font-bold text-slate-900">{configuration.battery_kwh} kWh</div>
                  <div className="text-[10px] text-slate-400 font-medium">Battery Storage</div>
                </div>

                <div className="w-4 h-[1px] bg-slate-200" />

                {/* Building Load */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-200/80 border border-slate-300 flex items-center justify-center mb-1.5 shadow-xs">
                    <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="text-sm font-bold text-slate-900 truncate max-w-[90px]">Building</div>
                  <div className="text-[10px] text-slate-400 font-medium truncate max-w-[100px]">{project.building_type}</div>
                </div>

                <div className="w-4 h-[1px] bg-slate-200" />

                {/* PLN Grid Connection */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center mb-1.5 shadow-xs">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>
                  <div className="text-sm font-bold text-slate-900">Grid</div>
                  <div className="text-[10px] text-slate-400 font-medium">PLN Connection</div>
                </div>
              </div>
            </div>

            {/* Section 2: Financial Hero Dark Banner */}
            <div className="p-6 rounded-3xl bg-slate-950 text-white flex items-center justify-between shadow-md">
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  MONTHLY ELECTRICITY COST
                </div>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl font-extrabold tracking-tight">
                    {formatMillions(financial.new_monthly_cost)}
                  </span>
                  <span className="text-xs text-slate-400 font-normal">
                    {formatMillions(baseline.monthly_cost)} Baseline
                  </span>
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  ANNUAL SAVINGS
                </div>
                <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">
                  {formatMillions(financial.monthly_savings * 12)}
                </div>
              </div>
            </div>

            {/* Section 3: Financial Detail KPI Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
                <div className="text-xs text-slate-500 font-medium">Payback Period</div>
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
                  {financial.payback_years !== null ? `${financial.payback_years.toFixed(1)} Years` : 'N/A'}
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
                <div className="text-xs text-slate-500 font-medium">Total CAPEX</div>
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
                  {formatMillions(financial.capex)}
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
                <div className="text-xs text-slate-500 font-medium">ROI (10YR Estimate)</div>
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
                  {financial.capex > 0
                    ? `${Math.round(((financial.monthly_savings * 12 * 10 - financial.capex) / financial.capex) * 100)}%`
                    : '—'}
                </div>
              </div>
            </div>

            {/* Section 4: Environmental & Grid Impact Highlights */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                ENVIRONMENTAL & GRID IMPACT
              </span>
              <div className="grid grid-cols-2 gap-3">
                {/* CO2 Reduction Card */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">CO₂ REDUCTION</div>
                    <div className="text-2xl font-black text-emerald-600 tracking-tight">
                      {environmental.co2_reduction_pct.toFixed(0)}%
                    </div>
                    <div className="text-[10px] text-emerald-700">Annual carbon offset</div>
                  </div>
                </div>

                {/* Grid Independence Card */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">GRID INDEPENDENCE</div>
                    <div className="text-2xl font-black text-amber-600 tracking-tight">
                      {grid.independence_pct.toFixed(0)}%
                    </div>
                    <div className="text-[10px] text-amber-700">Self-sufficiency ratio</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Regulatory & Trade-off Disclaimer */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 leading-relaxed space-y-1">
              <div className="font-semibold text-slate-900">Key Regulatory Assumption (ESDM No. 2/2024):</div>
              <p className="text-[11px] text-slate-500">
                Solar surplus power is not exported for bill reduction credit. Financial savings represent 100% self-consumption and battery peak shifting.
              </p>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between px-8 py-5 border-t border-slate-100 bg-slate-50/70">
            <span className="text-xs text-slate-400 font-medium">Find an Installer — Coming Soon</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleExportPDF}
                className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer"
              >
                ↓ Export Decision Summary
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}