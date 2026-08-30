'use client';

import React from 'react';

interface WhatIfAiInsightProps {
  explanation: string | null;
  isLoading?: boolean;
}

export function WhatIfAiInsight({ explanation, isLoading = false }: WhatIfAiInsightProps) {
  if (isLoading) {
    return (
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            GENERATING AI INSIGHT...
          </span>
        </div>
        <div className="space-y-1.5">
          <div className="h-3 bg-slate-200 rounded-sm animate-pulse w-full" />
          <div className="h-3 bg-slate-200 rounded-sm animate-pulse w-5/6" />
        </div>
      </div>
    );
  }

  if (!explanation) return null;

  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200/90 text-left space-y-1.5 shadow-2xs">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-md bg-slate-900 text-sky-400 flex items-center justify-center text-[10px]">
          ✦
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          GRIDTWIN INSIGHT
        </span>
      </div>
      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-normal">
        {explanation}
      </p>
    </div>
  );
}