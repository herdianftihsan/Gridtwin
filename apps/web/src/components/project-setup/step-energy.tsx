'use client';

import React from 'react';
import { ProjectSetupFormData } from './types';

interface StepEnergyProps {
  formData: ProjectSetupFormData;
  updateFormData: (fields: Partial<ProjectSetupFormData>) => void;
  errors: Record<string, string>;
}

export function StepEnergy({ formData, updateFormData, errors }: StepEnergyProps) {
  const formatIDR = (val: number | null): string => {
    if (val === null || isNaN(val)) return '';
    return new Intl.NumberFormat('id-ID').format(val);
  };

  const handleBillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const num = raw === '' ? null : parseInt(raw, 10);
    updateFormData({ monthly_bill: num });
  };

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Your energy baseline
        </h2>
        <p className="text-sm text-slate-500">
          Tell us about your current electricity baseline.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-4">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Average Monthly Electricity Bill
          </label>
          <div className="relative flex items-center bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-transparent transition-all">
            <span className="text-lg font-medium text-slate-500 mr-2">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              value={formatIDR(formData.monthly_bill)}
              onChange={handleBillChange}
              placeholder="4.500.000"
              className="w-full text-2xl font-bold text-slate-900 bg-transparent focus:outline-none tracking-tight"
            />
          </div>
          {errors['monthly_bill'] && (
            <p className="text-xs text-red-500 font-medium">{errors['monthly_bill']}</p>
          )}
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          This helps GridTwin estimate your current energy cost and compare it with simulated scenarios.
        </p>
      </div>
    </div>
  );
}