'use client';

import React, { useState } from 'react';

interface WhatIfInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function WhatIfInput({ onSubmit, isLoading, disabled = false }: WhatIfInputProps) {
  const [inputVal, setInputVal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isLoading || disabled) return;
    onSubmit(inputVal.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputVal.trim() && !isLoading && !disabled) {
        onSubmit(inputVal.trim());
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative rounded-2xl border border-slate-200 bg-white p-3 shadow-xs focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all">
        <textarea
          rows={3}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading || disabled}
          placeholder="e.g. Add 5 kWh battery or What if budget is Rp30M?"
          aria-label="What-if Natural Language Question"
          className="w-full resize-none border-0 bg-transparent p-0 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-0 leading-relaxed pr-10"
        />
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={!inputVal.trim() || isLoading || disabled}
            aria-label="Send What-if Query"
            className="w-8 h-8 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-200 text-white flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed shadow-xs"
          >
            {isLoading ? (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}