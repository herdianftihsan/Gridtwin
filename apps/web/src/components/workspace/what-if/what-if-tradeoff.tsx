'use client';

import React from 'react';
import { SimulationResult } from '../../../types/api';

export function WhatIfTradeoff({
  currentResult,
  whatIfResult,
}: {
  currentResult: SimulationResult;
  whatIfResult: SimulationResult;
}) {
  const curBat = currentResult.configuration.battery_kwh;
  const nextBat = whatIfResult.configuration.battery_kwh;
  const curPv = currentResult.configuration.pv_kwp;
  const nextPv = whatIfResult.configuration.pv_kwp;

  // Construct grounded trade-off narrative derived purely from verified backend changes
  let narrative = 'Exploring alternative system configuration balances upfront investment against long-term energy savings.';
  if (nextBat > curBat) {
    narrative = `Adding ${nextBat - curBat} kWh of battery storage increases grid autonomy and peak shifting, but raises initial CAPEX and extends the payback period.`;
  } else if (nextPv > curPv) {
    narrative = `Increasing Solar PV to ${nextPv} kWp maximizes daytime generation, but surplus power is uncredited under ESDM No. 2/2024 regulations without sufficient storage.`;
  } else if (whatIfResult.financial.capex < currentResult.financial.capex) {
    narrative = 'Lowering upfront CAPEX reduces initial capital commitment, but yields lower monthly electricity bill savings.';
  }

  return (
    <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80 text-left space-y-1.5 shadow-2xs">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-sky-950 uppercase tracking-wider flex items-center gap-1.5">
          <span>⚖️</span>
          <span>KEY TRADE-OFF</span>
        </span>
      </div>
      <p className="text-xs text-sky-900 leading-relaxed">
        {narrative}
      </p>
    </div>
  );
}