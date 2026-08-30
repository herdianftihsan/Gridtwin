'use client';

import React from 'react';
import { SimulationResult } from '../../../types/api';

export function AssumptionsSummary({ result }: { result: SimulationResult }) {
  const { assumptions } = result;

  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-left space-y-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        VERIFIED SIMULATION PARAMETERS
      </span>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 block font-medium">Tariff Rate</span>
          <span className="font-bold text-slate-800">Rp {assumptions.tariff}/kWh</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block font-medium">Peak Sun Hours</span>
          <span className="font-bold text-slate-800">{assumptions.psh} hrs/day</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block font-medium">Performance Ratio</span>
          <span className="font-bold text-slate-800">{(assumptions.performance_ratio * 100).toFixed(0)}%</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block font-medium">Battery Round-Trip</span>
          <span className="font-bold text-slate-800">
            {((assumptions.battery_charge_efficiency * assumptions.battery_discharge_efficiency) * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}