'use client';

import React from 'react';

const SUGGESTIONS = [
  '+ Add 5 kWh battery',
  '+ Increase solar to 6 kWp',
  '+ Budget Rp30M',
  '+ Maximize CO2 reduction',
];

interface WhatIfSuggestionsProps {
  onSelect: (text: string) => void;
  disabled?: boolean;
}

export function WhatIfSuggestions({ onSelect, disabled = false }: WhatIfSuggestionsProps) {
  return (
    <div className="flex flex-wrap gap-2 pt-2">
      {SUGGESTIONS.map((s) => (
        <button
          key={s}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(s.replace(/^\+\s*/, ''))}
          className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {s}
        </button>
      ))}
    </div>
  );
}