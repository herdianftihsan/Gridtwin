'use client';

import React from 'react';
import { EnergyBalanceSummary } from './types';

interface EnergyBalanceDockProps {
  summary: EnergyBalanceSummary;
}

export function EnergyBalanceDock({ summary }: EnergyBalanceDockProps) {
  const { monthlyDemandKwh, solarYieldKwh, gridImportKwh, independencePct } = summary;

  const solarShare = monthlyDemandKwh > 0 ? (solarYieldKwh / monthlyDemandKwh) * 100 : 0;
  const gridShare = monthlyDemandKwh > 0 ? (gridImportKwh / monthlyDemandKwh) * 100 : 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm text-left z-20">
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs w-full justify-between">
        
        {/* Metric 1 */}
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 font-medium">Kebutuhan Energi</span>
          <span className="font-bold text-slate-900">{Math.round(monthlyDemandKwh)} kWh/bln</span>
        </div>

        <div className="hidden sm:block w-[1px] h-8 bg-slate-200" />

        {/* Metric 2 */}
        <div className="flex flex-col">
          <span className="text-[10px] text-amber-600 font-medium">Dari Solar</span>
          <span className="font-bold text-amber-600">
            {solarYieldKwh > 0 ? `${Math.round(solarYieldKwh)} kWh/bln` : '0 kWh/bln'}
          </span>
          <span className="text-[10px] text-amber-600/70">{solarShare.toFixed(1)}% kebutuhan</span>
        </div>

        <div className="hidden sm:block w-[1px] h-8 bg-slate-200" />

        {/* Metric 3 */}
        <div className="flex flex-col">
          <span className="text-[10px] text-indigo-600 font-medium">Dari PLN</span>
          <span className="font-bold text-indigo-600">{Math.round(gridImportKwh)} kWh/bln</span>
          <span className="text-[10px] text-indigo-600/70">{gridShare.toFixed(1)}% kebutuhan</span>
        </div>

        <div className="hidden sm:block w-[1px] h-8 bg-slate-200" />

        {/* Metric 4 */}
        <div 
          className="flex flex-col cursor-help"
          title="Persentase kebutuhan energi yang dalam simulasi dapat dipenuhi oleh sistem lokal seperti solar dan baterai."
        >
          <span className="text-[10px] text-emerald-600 font-medium border-b border-dashed border-emerald-600/30 w-max pb-0.5">Pengurangan Ketergantungan PLN</span>
          <span className="font-bold text-emerald-600 mt-0.5">{independencePct.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}