'use client';

import React from 'react';
import { EnergyBalanceSummary } from './types';

interface EnergyBalanceDockProps {
  summary: EnergyBalanceSummary;
}

export function EnergyBalanceDock({ summary }: EnergyBalanceDockProps) {
  const { monthlyDemandKwh, solarYieldKwh, gridImportKwh, independencePct } = summary;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm text-left z-20">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          ENERGY BALANCE
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-medium">Monthly Demand</span>
          <span className="font-bold text-slate-900">{Math.round(monthlyDemandKwh)} kWh</span>
        </div>

        <div className="w-[1px] h-6 bg-slate-200" />

        <div className="flex flex-col">
          <span className="text-[10px] text-amber-600 font-medium">Solar Generation</span>
          <span className="font-bold text-amber-600">
            {solarYieldKwh > 0 ? `${Math.round(solarYieldKwh)} kWh` : '0 kWh'}
          </span>
        </div>

        <div className="w-[1px] h-6 bg-slate-200" />

        <div className="flex flex-col">
          <span className="text-[10px] text-indigo-600 font-medium">PLN Grid Draw</span>
          <span className="font-bold text-indigo-600">{Math.round(gridImportKwh)} kWh</span>
        </div>

        <div className="w-[1px] h-6 bg-slate-200" />

        <div className="flex flex-col">
          <span className="text-[10px] text-emerald-600 font-medium">Grid Autonomy</span>
          <span className="font-bold text-emerald-600">{independencePct.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}