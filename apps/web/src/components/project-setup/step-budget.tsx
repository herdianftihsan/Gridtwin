'use client';

import React from 'react';
import { ProjectSetupFormData } from './types';

interface StepBudgetProps {
  formData: ProjectSetupFormData;
  updateFormData: (fields: Partial<ProjectSetupFormData>) => void;
  errors: Record<string, string>;
}

export function StepBudget({ formData, updateFormData, errors }: StepBudgetProps) {
  const formatIDR = (value: number | null): string => {
    if (value === null || Number.isNaN(value)) return '';
    return new Intl.NumberFormat('id-ID').format(value);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value.replace(/\D/g, '');
    updateFormData({ budget: raw === '' ? 0 : parseInt(raw, 10) });
  };

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ budget: Number(event.target.value) });
  };

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Tentukan batas investasi Anda
        </h2>
        <p className="text-sm text-slate-500">
          Masukkan jumlah maksimum yang bersedia Anda investasikan. Batas ini digunakan GridTwin untuk mencari konfigurasi yang sesuai dan membuat Energy Twin.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-6">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Masukkan batas investasi maksimum Anda
          </label>
          <div className="relative flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-transparent transition-all">
            <span className="text-lg font-medium text-slate-500 mr-2">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              value={formatIDR(formData.budget)}
              onChange={handleInputChange}
              placeholder="100.000.000"
              className="w-full text-2xl font-bold text-slate-900 bg-transparent focus:outline-none tracking-tight placeholder-slate-300"
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
            value={formData.budget === null ? 50000000 : formData.budget}
            onChange={handleSliderChange}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-medium">
            <span>1 Jt</span>
            <span>500 Jt</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Belum yakin dengan angkanya? Gunakan perkiraan maksimum yang masih nyaman bagi Anda.
        </p>
      </div>
    </div>
  );
}
