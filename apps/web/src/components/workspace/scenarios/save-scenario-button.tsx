'use client';

import React from 'react';
import { motion } from 'motion/react';
import { SimulationConfig } from '../types';

interface SaveScenarioButtonProps {
  config: SimulationConfig;
  onSave: (config: SimulationConfig, name?: string) => void;
  isSaving: boolean;
  isSaved?: boolean;
}

export function SaveScenarioButton({
  config,
  onSave,
  isSaving,
  isSaved = false,
}: SaveScenarioButtonProps) {
  const [isPromptOpen, setIsPromptOpen] = React.useState(false);
  const [scenarioName, setScenarioName] = React.useState('');

  const handleSave = () => {
    if (!scenarioName.trim()) return;
    onSave(config, scenarioName.trim());
    setIsPromptOpen(false);
    setScenarioName('');
  };

  return (
    <>
      <motion.button
        type="button"
        whileTap={{ scale: isSaving ? 1 : 0.97 }}
        disabled={isSaving}
        onClick={() => setIsPromptOpen(true)}
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

      {isPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Save Scenario</h3>
            <p className="text-sm text-slate-400 mb-4">
              Give this scenario a name to easily identify it in your history.
            </p>
            
            <input
              type="text"
              autoFocus
              placeholder="e.g., Aggressive Solar"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-colors mb-6"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') setIsPromptOpen(false);
              }}
            />

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsPromptOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!scenarioName.trim()}
                onClick={handleSave}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-primary text-white hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}