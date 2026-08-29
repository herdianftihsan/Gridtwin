'use client';

import React from 'react';
import { ProjectSetupFormData } from './types';

interface StepBudgetProps {
  formData: ProjectSetupFormData;
  updateFormData: (fields: Partial<ProjectSetupFormData>) => void;
  errors: Record<string, string>;
}

export function StepBudget({ formData, updateFormData, errors }: StepBudgetProps) {
  const formatIDR = (val: number): string => {
    return new Intl.NumberFormat('id-ID').format(val);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const num = raw === '' ? 1000000 : parseInt(raw, 10);
    updateFormData({ budget: num });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ budget: Number(e.target.value) });
  };

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Set your investment limit
        </h2>
        <p className="text-sm text-slate-500">
          Define the maximum you&apos;re willing to invest. GridTwin will optimize for the best ROI within this limit.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-6">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Maximum Investment Budget
          </label>
          <div className="relative flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-transparent transition-all">
            <span className="text-lg font-medium text-slate-500 mr-2">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              value={formatIDR(formData.budget)}
              onChange={handleInputChange}
              className="w-full text-2xl font-bold text-slate-900 bg-transparent focus:outline-none tracking-tight"
            />
            <span className="text-xs font-medium text-slate-400 ml-2 uppercase">IDR</span>
          </div>
          {errors['budget'] && (
            <p className="text-xs text-red-500 font-medium">{errors['budget']}</p>
          )}
        </div>

        <div className="space-y-2">
          <input
            type="range"
            min="1000000"
            max="500000000"
            step="1000000"
            value={formData.budget}
            onChange={handleSliderChange}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-medium">
            <span>1M</span>
            <span>500M</span>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-50/60 border border-indigo-100/60 text-xs text-indigo-900 leading-relaxed">
          <div className="p-1 rounded-md bg-indigo-100 text-indigo-600 shrink-0 mt-0.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <span>
            Based on typical setups in your region, starting around Rp 50M provides optimal balance for initial solar capacity.
          </span>
        </div>
      </div>
    </div>
  );
}