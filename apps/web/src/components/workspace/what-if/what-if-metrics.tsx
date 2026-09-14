'use client';

import React from 'react';
import { SimulationResult } from '../../../types/api';

export function WhatIfMetrics({
  currentResult,
  whatIfResult,
}: {
  currentResult: SimulationResult;
  whatIfResult: SimulationResult;
}) {
  const formatIDR = (n: number) => `Rp ${(n / 1_000_000).toFixed(2).replace(/\.00$/, '')} Jt`;

  const curFin = currentResult.financial;
  const nextFin = whatIfResult.financial;
  const curGrid = currentResult.grid.independence_pct;
  const nextGrid = whatIfResult.grid.independence_pct;
  const curEnv = currentResult.environmental;
  const nextEnv = whatIfResult.environmental;

  return (
    <div className="space-y-2 text-left">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mt-4 mb-1">
        METRIK UTAMA
      </span>

      {/* Biaya Bulanan (Financial - cool accent) */}
      <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-700">Biaya Bulanan</div>
            <div className="text-[10px] text-slate-400">Tagihan PLN</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-right">
          <span className="text-xs text-slate-400 line-through">{formatIDR(curFin.new_monthly_cost)}</span>
          <span className="text-xs font-bold text-slate-400">→</span>
          <span className="text-sm font-extrabold text-slate-900">{formatIDR(nextFin.new_monthly_cost)}</span>
        </div>
      </div>

      {/* Penghematan Bulanan (Financial - cool accent) */}
      <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-700">Penghematan</div>
            <div className="text-[10px] text-slate-400">Per bulan</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-right">
          <span className="text-xs text-slate-400 line-through">{formatIDR(curFin.monthly_savings)}</span>
          <span className="text-xs font-bold text-slate-400">→</span>
          <span className="text-sm font-extrabold text-slate-900">{formatIDR(nextFin.monthly_savings)}</span>
        </div>
      </div>

      {/* Masa Pengembalian (Time/History - cool accent) */}
      <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-700">Payback Period</div>
            <div className="text-[10px] text-slate-400">Balik modal (thn)</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-right">
          <span className="text-xs text-slate-400 line-through">
            {curFin.payback_years !== null ? `${curFin.payback_years.toFixed(1)}` : '--'}
          </span>
          <span className="text-xs font-bold text-slate-400">→</span>
          <span className="text-sm font-extrabold text-slate-900">
            {nextFin.payback_years !== null ? `${nextFin.payback_years.toFixed(1)}` : 'N/A'}
          </span>
        </div>
      </div>

      {/* Kemandirian Jaringan (Grid - cool blue/indigo) */}
      <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-700">Kemandirian Jaringan</div>
            <div className="text-[10px] text-slate-400">Otonomi jaringan</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-right">
          <span className="text-xs text-slate-400 line-through">{curGrid.toFixed(1)}%</span>
          <span className="text-xs font-bold text-slate-400">→</span>
          <span className="text-sm font-extrabold text-indigo-700 flex items-center gap-1">
            {nextGrid.toFixed(1)}%
            {nextGrid > curGrid && <span className="text-xs">↑</span>}
          </span>
        </div>
      </div>

      {/* Pengurangan CO2 (Environmental - emerald green) */}
      <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-700">Reduksi CO₂</div>
            <div className="text-[10px] text-slate-400">kg per tahun</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-right">
          <span className="text-xs text-slate-400 line-through">{curEnv.co2_reduction_kg_yr.toLocaleString('id-ID')}</span>
          <span className="text-xs font-bold text-slate-400">→</span>
          <span className="text-sm font-extrabold text-emerald-700">
            {nextEnv.co2_reduction_kg_yr.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

    </div>
  );
}