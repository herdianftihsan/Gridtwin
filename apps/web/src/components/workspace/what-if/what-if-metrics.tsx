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
  const formatIDR = (n: number) => `Rp ${(n / 1_000_000).toFixed(2).replace(/\.00$/, '')}M`;

  const curFin = currentResult.financial;
  const nextFin = whatIfResult.financial;
  const curGrid = currentResult.grid.independence_pct;
  const nextGrid = whatIfResult.grid.independence_pct;

  return (
    <div className="space-y-2 text-left">
      {/* Monthly Cost Row */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-700">Monthly Cost</div>
            <div className="text-[10px] text-slate-400">Recurring PLN bill</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-right">
          <span className="text-xs text-slate-400 line-through">{formatIDR(curFin.new_monthly_cost)}</span>
          <span className="text-xs font-bold text-slate-400">→</span>
          <span className="text-sm font-extrabold text-slate-900">{formatIDR(nextFin.new_monthly_cost)}</span>
        </div>
      </div>

      {/* Est. CAPEX Row */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-700">Est. CAPEX</div>
            <div className="text-[10px] text-slate-400">Upfront equipment cost</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-right">
          <span className="text-xs text-slate-400 line-through">{formatIDR(curFin.capex)}</span>
          <span className="text-xs font-bold text-slate-400">→</span>
          <span className="text-sm font-extrabold text-slate-900">{formatIDR(nextFin.capex)}</span>
        </div>
      </div>

      {/* Grid Independence Row */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-700">Grid Independence</div>
            <div className="text-[10px] text-slate-400">Autonomy from grid</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-right">
          <span className="text-xs text-slate-400 line-through">{curGrid.toFixed(0)}%</span>
          <span className="text-xs font-bold text-slate-400">→</span>
          <span className="text-sm font-extrabold text-emerald-600 flex items-center gap-1">
            {nextGrid.toFixed(0)}%
            {nextGrid > curGrid && <span className="text-xs">↑</span>}
          </span>
        </div>
      </div>

      {/* Payback Period Row */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-700">Payback Period</div>
            <div className="text-[10px] text-slate-400">Breakeven timeline</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-right">
          <span className="text-xs text-slate-400 line-through">
            {curFin.payback_years !== null ? `${curFin.payback_years.toFixed(1)} yrs` : '--'}
          </span>
          <span className="text-xs font-bold text-slate-400">→</span>
          <span className="text-sm font-extrabold text-slate-900">
            {nextFin.payback_years !== null ? `${nextFin.payback_years.toFixed(1)} yrs` : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
}