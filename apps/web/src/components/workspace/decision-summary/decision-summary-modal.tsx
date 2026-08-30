'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SimulationResult, Project } from '../../../types/api';
import { RecommendedConfiguration } from './recommended-configuration';
import { FinancialSummary } from './financial-summary';
import { AssumptionsSummary } from './assumptions-summary';

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
          {/* Header */}
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
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="px-8 py-6 space-y-6 max-h-[75vh] overflow-y-auto">
            <RecommendedConfiguration result={result} project={project} />
            <FinancialSummary result={result} />

            {/* Environmental & Autonomy Section */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                ENVIRONMENTAL & GRID IMPACT
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">CO₂ REDUCTION</div>
                    <div className="text-2xl font-black text-emerald-600 tracking-tight">
                      {result.environmental.co2_reduction_pct.toFixed(0)}%
                    </div>
                    <div className="text-[10px] text-emerald-700">Annual carbon offset</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">GRID INDEPENDENCE</div>
                    <div className="text-2xl font-black text-amber-600 tracking-tight">
                      {result.grid.independence_pct.toFixed(0)}%
                    </div>
                    <div className="text-[10px] text-amber-700">Self-sufficiency ratio</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trade-off Disclaimer */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 leading-relaxed space-y-1">
              <div className="font-semibold text-slate-900">Key Regulatory Assumption (ESDM No. 2/2024):</div>
              <p className="text-[11px] text-slate-500">
                Surplus solar power is not exported for bill credit. Financial savings reflect 100% self-consumption and battery peak shifting.
              </p>
            </div>

            <AssumptionsSummary result={result} />
          </div>

          {/* Footer Actions */}
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
              {onSaveScenario && (
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={onSaveScenario}
                  className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer disabled:opacity-60"
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