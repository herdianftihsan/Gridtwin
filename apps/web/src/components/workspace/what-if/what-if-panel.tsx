'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SimulationResult, Scenario } from '../../../types/api';
import { useWhatIf } from '../hooks/use-what-if';
import { WhatIfInput } from './what-if-input';
import { WhatIfSuggestions } from './what-if-suggestions';
import { WhatIfChanges } from './what-if-changes';
import { WhatIfMetrics } from './what-if-metrics';
import { WhatIfTradeoff } from './what-if-tradeoff';
import { WhatIfAiInsight } from './what-if-ai-insight';

interface WhatIfPanelProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  currentResult: SimulationResult;
  onScenarioSaved?: (scenario: Scenario) => void;
}

export function WhatIfPanel({
  isOpen,
  onClose,
  projectId,
  currentResult,
  onScenarioSaved,
}: WhatIfPanelProps) {
  const {
    status,
    query,
    result,
    aiExplanation,
    error,
    executeWhatIf,
    resetWhatIf,
    markAsSaved,
  } = useWhatIf({ projectId, onScenarioSaved });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs">
        <motion.div
          initial={{ x: '100%', opacity: 0.5 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0.5 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-modal="true"
          aria-label="What-if Decision Exploration"
          className="relative w-full max-w-md bg-slate-50 h-full border-l border-slate-200 shadow-2xl flex flex-col justify-between overflow-hidden text-left"
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 bg-white border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  What if?
                </h2>
                <p className="text-[11px] text-slate-400">
                  Explore how a different decision changes the outcome.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close What-if Panel"
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="space-y-2">
              <WhatIfInput onSubmit={executeWhatIf} isLoading={status === 'loading'} />
              <WhatIfSuggestions onSelect={executeWhatIf} disabled={status === 'loading'} />
            </div>

            {status === 'loading' && (
              <div className="p-8 rounded-2xl bg-white border border-slate-200/80 text-center space-y-3 shadow-2xs">
                <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="text-xs font-semibold text-slate-800">
                  Exploring scenario for &quot;{query}&quot;...
                </div>
                <p className="text-[11px] text-slate-400">
                  Simulating deterministic energy balance and cost impacts.
                </p>
              </div>
            )}

            {status === 'error' && error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-left space-y-2 shadow-2xs">
                <div className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                  <span>⚠️</span>
                  <span>Scenario Exploration Issue</span>
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">{error}</p>
                <button
                  type="button"
                  onClick={resetWhatIf}
                  className="text-xs font-semibold text-rose-800 underline hover:no-underline pt-1 cursor-pointer"
                >
                  Try another scenario question
                </button>
              </div>
            )}

            {(status === 'result' || status === 'saved') && result && (
              <div className="space-y-4">
                <WhatIfChanges currentResult={currentResult} whatIfResult={result} />
                <WhatIfMetrics currentResult={currentResult} whatIfResult={result} />
                <WhatIfTradeoff currentResult={currentResult} whatIfResult={result} />
                <WhatIfAiInsight explanation={aiExplanation} />
              </div>
            )}
          </div>

          <div className="p-5 bg-white border-t border-slate-200 space-y-2">
            {(status === 'result' || status === 'saved') ? (
              <>
                <button
                  type="button"
                  onClick={markAsSaved}
                  disabled={status === 'saved'}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer ${
                    status === 'saved'
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-slate-950 hover:bg-slate-800 text-white'
                  }`}
                >
                  {status === 'saved' ? '✓ Saved to Project' : 'Save Scenario'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetWhatIf();
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  Back to Current Scenario
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}