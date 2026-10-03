'use client';

import React from 'react';
import { SimulationResult } from '../../../types/api';

interface FinancialImpactCardProps {
  result: SimulationResult;
  isSimulating?: boolean;
}

export function FinancialImpactCard({ result, isSimulating = false }: FinancialImpactCardProps) {
  const [isAssumptionsOpen, setIsAssumptionsOpen] = React.useState(false);
  const { baseline, financial, grid } = result;

  const formatMillions = (val: number): string => {
    const inMillions = val / 1_000_000;
    return `Rp ${inMillions.toFixed(2).replace(/\.00$/, '')} Jt`;
  };

  return (
    <div className={`p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-6 text-left transition-opacity duration-200 ${isSimulating ? 'opacity-70' : 'opacity-100'}`}>
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          DAMPAK FINANSIAL
        </span>
        <div className="text-xs text-slate-500 font-medium">
          Biaya Listrik Bulanan
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
          <div className="text-xs text-slate-400 font-medium">Masa Pengembalian</div>
          <div className="text-xl font-bold text-slate-900 mt-0.5">
            {financial.payback_years !== null ? `${financial.payback_years.toFixed(1)} Tahun` : 'Tidak Ada Pengembalian'}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-400 font-medium">Investasi CAPEX</div>
          <div className="text-xl font-bold text-slate-900 mt-0.5">
            {formatMillions(financial.capex)}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-400 font-medium">Penghematan Tahunan</div>
          <div className="text-lg font-bold text-emerald-600 mt-0.5">
            {formatMillions(financial.monthly_savings * 12)}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-400 font-medium">Otonomi Jaringan</div>
          <div className="text-lg font-bold text-indigo-600 mt-0.5">
            ↑ {grid.independence_pct.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex justify-between items-center relative">
        <button
          type="button"
          onClick={() => setIsAssumptionsOpen(!isAssumptionsOpen)}
          className="text-[11px] font-semibold text-slate-500 hover:text-sky-600 transition-colors inline-flex items-center gap-1 cursor-pointer"
        >
          Bagaimana GridTwin menghitung ini?
          <svg className={`w-3.5 h-3.5 transition-transform ${isAssumptionsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isAssumptionsOpen && (
          <div className="absolute top-full left-0 mt-2 w-full p-4 bg-slate-800 text-slate-300 rounded-xl shadow-xl z-50 text-[11px] leading-relaxed">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-white">Parameter Asumsi</span>
              <button type="button" onClick={() => setIsAssumptionsOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>
            <ul className="space-y-1.5">
              <li className="flex justify-between border-b border-slate-700 pb-1">
                <span>Tarif Listrik (PLN):</span>
                <span className="font-semibold text-white">Rp {result.assumptions.tariff.toLocaleString('id-ID')} / kWh</span>
              </li>
              <li className="flex justify-between border-b border-slate-700 pb-1">
                <span>Potensi Matahari (PSH):</span>
                <span className="font-semibold text-white">{result.assumptions.psh} jam/hari</span>
              </li>
              <li className="flex justify-between border-b border-slate-700 pb-1">
                <span>Performance Ratio PV:</span>
                <span className="font-semibold text-white">{(result.assumptions.performance_ratio * 100).toFixed(0)}%</span>
              </li>
              <li className="flex justify-between pt-0.5">
                <span>Masa Pengembalian:</span>
                <span className="text-right">CAPEX / (Penghematan Bulanan × 12)</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}