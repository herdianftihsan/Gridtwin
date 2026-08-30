'use client';

import React from 'react';

interface ComparisonMetricProps {
  label: string;
  baseValue: string;
  targetValue: string;
  deltaText?: string;
  deltaType?: 'positive' | 'negative' | 'neutral';
  helperText?: string;
}

export function ComparisonMetric({
  label,
  baseValue,
  targetValue,
  deltaText,
  deltaType = 'neutral',
  helperText,
}: ComparisonMetricProps) {
  const deltaColorClass =
    deltaType === 'positive'
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : deltaType === 'negative'
      ? 'text-rose-700 bg-rose-50 border-rose-200'
      : 'text-slate-600 bg-slate-100 border-slate-200';

  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2 text-left">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600">{label}</span>
        {deltaText && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${deltaColorClass}`}>
            {deltaText}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 items-baseline pt-1">
        <div>
          <span className="text-[10px] text-slate-400 block font-medium">Baseline</span>
          <span className="text-base font-bold text-slate-500">{baseValue}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block font-medium">Proposed Scenario</span>
          <span className="text-lg font-black text-slate-900">{targetValue}</span>
        </div>
      </div>

      {helperText && (
        <p className="text-[11px] text-slate-400 font-medium pt-1 border-t border-slate-100">
          {helperText}
        </p>
      )}
    </div>
  );
}