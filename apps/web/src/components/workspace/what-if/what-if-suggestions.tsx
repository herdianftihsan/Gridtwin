'use client';

import React from 'react';

const SUGGESTIONS = [
  '+ Tambah baterai 5 kWh',
  '+ Tingkatkan surya ke 6 kWp',
  '+ Anggaran Rp30 Jt',
  '+ Maksimalkan pengurangan CO2',
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