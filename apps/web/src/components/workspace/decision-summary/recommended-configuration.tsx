'use client';

import React from 'react';
import { SimulationResult, Project } from '../../../types/api';

export function RecommendedConfiguration({
  result,
  project,
}: {
  result: SimulationResult;
  project: Project;
}) {
  const { configuration } = result;

  return (
    <div className="space-y-2 text-left">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          RECOMMENDED CONFIGURATION
        </span>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          RECOMMENDED
        </span>
      </div>

      <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-between text-center gap-2">
        {/* Solar PV */}
        <div className="flex-1 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center mb-1.5 shadow-2xs">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div className="text-sm font-bold text-slate-900">{configuration.pv_kwp} kWp</div>
          <div className="text-[10px] text-slate-400 font-medium">Solar PV</div>
        </div>

        <div className="w-4 h-[1px] bg-slate-200" />

        {/* Battery Storage */}
        <div className="flex-1 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-teal-100 border border-teal-200 flex items-center justify-center mb-1.5 shadow-2xs">
            <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="text-sm font-bold text-slate-900">{configuration.battery_kwh} kWh</div>
          <div className="text-[10px] text-slate-400 font-medium">Battery Storage</div>
        </div>

        <div className="w-4 h-[1px] bg-slate-200" />

        {/* Building */}
        <div className="flex-1 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-slate-200/80 border border-slate-300 flex items-center justify-center mb-1.5 shadow-2xs">
            <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="text-sm font-bold text-slate-900 truncate max-w-[90px]">Building</div>
          <div className="text-[10px] text-slate-400 font-medium truncate max-w-[100px]">{project.building_type}</div>
        </div>

        <div className="w-4 h-[1px] bg-slate-200" />

        {/* PLN Grid */}
        <div className="flex-1 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center mb-1.5 shadow-2xs">
            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <div className="text-sm font-bold text-slate-900">Grid</div>
          <div className="text-[10px] text-slate-400 font-medium">PLN Utility</div>
        </div>
      </div>
    </div>
  );
}