'use client';

import React from 'react';
import { SimulationResult } from '../../../types/api';

export function FinancialSummary({ result }: { result: SimulationResult }) {
  const { financial, baseline } = result;

  const formatMillions = (val: number): string =>
    `Rp ${(val / 1_000_000).toFixed(2).replace(/\.00$/, '')}M`;

  return (
    <div className="space-y-3 text-left">
      <div className="p-6 rounded-3xl bg-slate-950 text-white flex items-center justify-between shadow-md">
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            MONTHLY ELECTRICITY COST
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl font-extrabold tracking-tight">
              {formatMillions(financial.new_monthly_cost)}
            </span>
            <span className="text-xs text-slate-400 font-normal">
              {formatMillions(baseline.monthly_cost)} Baseline
            </span>
          </div>
        </div>

        <div className="text-right space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            ANNUAL SAVINGS
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">
            {formatMillions(financial.monthly_savings * 12)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Payback Period</div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            {financial.payback_years !== null ? `${financial.payback_years.toFixed(1)} Years` : 'N/A'}
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Total CAPEX</div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            {formatMillions(financial.capex)}
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">10YR Est. ROI</div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            {financial.capex > 0
              ? `${Math.round(((financial.monthly_savings * 12 * 10 - financial.capex) / financial.capex) * 100)}%`
              : '—'}
          </div>
        </div>
      </div>
    </div>
  );
}