'use client';

import React from 'react';

interface WhatIfAiInsightProps {
  explanation: string | null;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function WhatIfAiInsight({ explanation, isLoading = false, isError = false, onRetry }: WhatIfAiInsightProps) {
  if (isLoading) {
    return (
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-3 mt-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Menyiapkan Wawasan AI...
          </span>
        </div>
        <div className="space-y-1.5">
          <div className="h-2.5 bg-slate-200 rounded-sm animate-pulse w-full" />
          <div className="h-2.5 bg-slate-200 rounded-sm animate-pulse w-5/6" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-left space-y-1.5 shadow-2xs mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center text-[10px]">
              ⚠️
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700">
              WAWASAN GRIDTWIN
            </span>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-[10px] font-bold uppercase tracking-wider text-sky-600 hover:text-sky-700 underline cursor-pointer"
            >
              Coba Lagi
            </button>
          )}
        </div>
        <p className="text-xs text-orange-800">
          Penjelasan AI sementara tidak tersedia.
        </p>
      </div>
    );
  }

  if (!explanation) return null;

  let tradeOff = '';
  let insight = '';
  
  try {
    // Attempt to parse JSON response from backend
    const parsed = JSON.parse(explanation);
    tradeOff = parsed.trade_off || '';
    insight = parsed.insight || '';
  } catch {
    // Fallback: just strip raw markdown if it's not valid JSON
    insight = explanation.replace(/\*\*/g, '').replace(/✦/g, '').replace(/\*/g, '•').trim();
  }

  return (
    <div className="space-y-2 mt-4">
      {tradeOff && (
        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-left shadow-2xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-md bg-amber-100 text-amber-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
              KOMPROMI UTAMA
            </span>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            {tradeOff}
          </p>
        </div>
      )}

      {insight && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs text-left">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-md bg-slate-900 text-brand-accent flex items-center justify-center text-[10px]">
              ✦
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              WAWASAN GRIDTWIN
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {insight}
          </p>
        </div>
      )}
    </div>
  );
}