'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SimulationResult, Scenario } from '../../../types/api';
import { useWhatIf } from '../hooks/use-what-if';
import { WhatIfInput } from './what-if-input';
import { WhatIfSuggestions } from './what-if-suggestions';
import { WhatIfChanges } from './what-if-changes';
import { WhatIfMetrics } from './what-if-metrics';
import { WhatIfAiInsight } from './what-if-ai-insight';

interface WhatIfPanelProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  currentResult: SimulationResult;
  onScenarioSaved?: (scenario: Scenario) => void;
  isDemo?: boolean;
}

export function WhatIfPanel({
  isOpen,
  onClose,
  projectId,
  currentResult,
  onScenarioSaved,
  isDemo,
}: WhatIfPanelProps) {
  const {
    status,
    result,
    aiExplanation,
    explanationStatus,
    error,
    executeWhatIf,
    retryExplanation,
    resetWhatIf,
    markAsSaved,
  } = useWhatIf({ projectId, onScenarioSaved, isDemo });

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
          aria-labelledby="whatif-panel-title"
          className="relative w-full max-w-md bg-slate-50 h-full border-l border-slate-200 shadow-2xl flex flex-col justify-between overflow-hidden text-left"
        >

          <div className="px-6 pt-6 pb-4 bg-white border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-600 font-bold text-sm">
                ✦
              </div>
              <div>
                <h2 id="whatif-panel-title" className="text-base font-extrabold text-slate-900 tracking-tight">
                  Bagaimana jika?
                </h2>
                <p className="text-xs text-slate-400">
                  Eksplorasi bagaimana keputusan yang berbeda mengubah hasil.
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

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">

            <div className="space-y-2">
              <WhatIfInput onSubmit={(msg) => executeWhatIf(msg, currentResult)} isLoading={status === 'loading'} />
              <WhatIfSuggestions onSelect={(msg) => executeWhatIf(msg, currentResult)} disabled={status === 'loading'} />
            </div>


            {status === 'loading' && (
              <div className="p-8 rounded-2xl bg-white border border-slate-200/80 text-center space-y-4 shadow-2xs">
                <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="text-xs font-semibold text-slate-800">
                  Mengeksplorasi Skenario
                </div>
                <div className="text-[11px] text-slate-500 space-y-1">
                  <p className="animate-pulse">→ Menginterpretasi pertanyaan Anda</p>
                  <p className="animate-pulse delay-100">→ Menjalankan simulasi energi</p>
                  <p className="animate-pulse delay-200">→ Menyiapkan wawasan keputusan</p>
                </div>
              </div>
            )}


            {status === 'error' && error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-left space-y-2 shadow-2xs">
                <div className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                  <span>⚠️</span>
                  <span>Masalah Eksplorasi Skenario</span>
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">{error}</p>
                <button
                  type="button"
                  onClick={resetWhatIf}
                  className="text-xs font-semibold text-rose-800 underline hover:no-underline pt-1 cursor-pointer"
                >
                  Coba pertanyaan skenario lain
                </button>
              </div>
            )}


            {(status === 'result' || status === 'saved') && result && (
              <div className="space-y-4">
                <WhatIfChanges currentResult={currentResult} whatIfResult={result} />
                <WhatIfMetrics currentResult={currentResult} whatIfResult={result} />
                <WhatIfAiInsight 
                  explanation={aiExplanation}
                  isLoading={explanationStatus === 'loading'}
                  isError={explanationStatus === 'error'}
                  onRetry={retryExplanation}
                />
                
                {/* Assumptions */}
                <div className="pt-4 border-t border-slate-200/70">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    ASUMSI SISTEM
                  </div>
                  <ul className="text-[10px] text-slate-500 space-y-1.5 list-disc pl-3">
                    <li>Kelebihan daya surya tidak dikreditkan sebagai pendapatan ekspor (Permen ESDM No. 2/2024).</li>
                    <li>Menggunakan model estimasi deterministik bulanan GridTwin.</li>
                    <li>Harga tarif dan efisiensi komponen diasumsikan konstan.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>


          <div className="p-5 bg-white border-t border-slate-200 space-y-2">
            {(status === 'result' || status === 'saved') ? (
              <>
                {status !== 'saved' ? (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const name = formData.get('scenarioName') as string;
                      if (name.trim()) markAsSaved(name.trim());
                    }}
                    className="space-y-2 mb-2"
                  >
                    <input
                      type="text"
                      name="scenarioName"
                      placeholder="Beri nama skenario ini..."
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-colors"
                    />
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-white transition-all shadow-xs cursor-pointer"
                    >
                      Simpan Skenario
                    </button>
                  </form>
                ) : (
                  <div className="w-full py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white flex items-center justify-center cursor-default shadow-xs mb-2">
                    ✓ Tersimpan ke Proyek
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    resetWhatIf();
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  Kembali ke Skenario Saat Ini
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}