'use client';

import React from 'react';
import { motion } from 'motion/react';
import { SimulationConfig } from '../types';

interface SaveScenarioButtonProps {
  config: SimulationConfig;
  onSave: (config: SimulationConfig) => void;
  isSaving: boolean;
  isSaved?: boolean;
}

export function SaveScenarioButton({
  config,
  onSave,
  isSaving,
  isSaved = false,
}: SaveScenarioButtonProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: isSaving ? 1 : 0.97 }}
      disabled={isSaving}
      onClick={() => onSave(config)}
      className={`relative inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed ${
        isSaved
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
          : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400'
      }`}
      aria-label="Save Current Configuration as Scenario"
    >
      {isSaving ? (
        <>
          <span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin" />
          <span>Saving...</span>
        </>
      ) : isSaved ? (
        <>
          <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span>Saved to Project</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          <span>Save Scenario</span>
        </>
      )}
    </motion.button>
  );
}