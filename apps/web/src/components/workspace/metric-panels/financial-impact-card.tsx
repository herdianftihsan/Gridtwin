'use client';

import React from 'react';
import { SimulationResult } from '../../../types/api';

interface FinancialImpactCardProps {
  result: SimulationResult;
  isSimulating?: boolean;
}

export function FinancialImpactCard({ result, isSimulating = false }: FinancialImpactCardProps) {
  const { baseline, financial, grid } = result;

  const formatMillions = (val: number): string => {
    const inMillions = val / 1_000_000;
    return `Rp ${inMillions.toFixed(2).replace(/\.00$/, '')}M`;
  };

  const formatIDR = (val: number): string => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className={`p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-6 text-left transition-opacity duration-200 ${isSimulating ? 'opacity-70' : 'opacity-100'}`}>
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          FINANCIAL IMPACT
        </span>
        <div className="text-xs text-slate-500 font-medium">
          Monthly Electricity Cost
        </div>
        <div className="flex items-baseline gap-3 pt-1">
          <span className="text-2xl font-semibold text-slate-400 line-through tracking-tight">
            {formatMillions(baseline.monthly_cost)}
          </span>
          <span className="text-slate-400 font-light text-lg">→</span>
          <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">
            {formatMillions(financial.new_monthly_cost)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
        <div>
          <div className="text-xs text-slate-400 font-medium">Payback Period</div>
          <div className="text-xl font-bold text-slate-900 mt-0.5">
            {financial.payback_years !== null ? `${financial.payback_years.toFixed(1)} Years` : 'No Payback'}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-400 font-medium">CAPEX Investment</div>
          <div className="text-xl font-bold text-slate-900 mt-0.5">
            {formatMillions(financial.capex)}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-400 font-medium">Annual Savings</div>
          <div className="text-lg font-bold text-emerald-600 mt-0.5">
            {formatMillions(financial.monthly_savings * 12)}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-400 font-medium">Grid Autonomy</div>
          <div className="text-lg font-bold text-indigo-600 mt-0.5">
            ↑ {grid.independence_pct.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}