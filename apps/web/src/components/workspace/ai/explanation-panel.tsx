'use client';

import React, { useEffect } from 'react';
import { useScenarioExplanation } from '../hooks/use-scenario-explanation';

interface ExplanationPanelProps {
  scenarioId?: string;
  className?: string;
  isDemo?: boolean;
}

export function ExplanationPanel({ scenarioId, className = '', isDemo }: ExplanationPanelProps) {
  const { explanation, isLoading, error, requestExplanation } = useScenarioExplanation(scenarioId, isDemo);

  useEffect(() => {
    if (scenarioId) {
      requestExplanation(scenarioId);
    }
  }, [scenarioId, requestExplanation]);

  return (
    <div className={`p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs text-left space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            MENGAPA GRIDTWIN MEREKOMENDASIKAN INI
          </span>
        </div>
        {scenarioId && (
          <button
            type="button"
            onClick={() => requestExplanation(scenarioId)}
            disabled={isLoading}
            className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Menganalisis...' : 'Segarkan AI'}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-1.5 pt-1">
          <div className="h-3 bg-slate-100 rounded-sm animate-pulse w-full" />
          <div className="h-3 bg-slate-100 rounded-sm animate-pulse w-4/5" />
        </div>
      ) : error ? (
        <p className="text-xs text-slate-400 italic">
          {error}
        </p>
      ) : explanation ? (
        <p className="text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-line">
          {explanation}
        </p>
      ) : (
        <p className="text-xs text-slate-400">
          Pilih atau simulasikan skenario untuk menghasilkan wawasan investasi AI kontekstual.
        </p>
      )}
    </div>
  );
}