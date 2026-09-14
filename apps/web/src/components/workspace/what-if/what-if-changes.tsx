'use client';

import React from 'react';
import { SimulationResult } from '../../../types/api';
import { ConfigChangeItem } from './types';

export function WhatIfChanges({
  currentResult,
  whatIfResult,
}: {
  currentResult: SimulationResult;
  whatIfResult: SimulationResult;
}) {
  const cur = currentResult.configuration;
  const next = whatIfResult.configuration;

  const items: ConfigChangeItem[] = [
    {
      assetLabel: 'Panel Surya',
      currentDisplay: `${cur.pv_kwp} kWp`,
      whatIfDisplay: `${next.pv_kwp} kWp`,
      hasChanged: cur.pv_kwp !== next.pv_kwp,
    },
    {
      assetLabel: 'Penyimpanan Baterai',
      currentDisplay: `${cur.battery_kwh} kWh`,
      whatIfDisplay: `${next.battery_kwh} kWh`,
      hasChanged: cur.battery_kwh !== next.battery_kwh,
    },
    {
      assetLabel: 'Pendingin Ruangan (AC)',
      currentDisplay: `${cur.ac_units} Unit`,
      whatIfDisplay: `${next.ac_units} Unit`,
      hasChanged: cur.ac_units !== next.ac_units,
    },
    {
      assetLabel: 'LED Pintar',
      currentDisplay: cur.led_upgraded ? 'Ditingkatkan' : 'Standar',
      whatIfDisplay: next.led_upgraded ? 'Ditingkatkan' : 'Standar',
      hasChanged: cur.led_upgraded !== next.led_upgraded,
    },
    {
      assetLabel: 'Kulkas Hemat',
      currentDisplay: `${cur.refrigerator_units || 0} Unit`,
      whatIfDisplay: `${next.refrigerator_units || 0} Unit`,
      hasChanged: cur.refrigerator_units !== next.refrigerator_units,
    },
    {
      assetLabel: 'Pompa Air Pintar',
      currentDisplay: cur.water_pump_upgraded ? 'Ya' : 'Tidak',
      whatIfDisplay: next.water_pump_upgraded ? 'Ya' : 'Tidak',
      hasChanged: cur.water_pump_upgraded !== next.water_pump_upgraded,
    },
  ];

  return (
    <div className="space-y-2 text-left">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
        APA YANG BERUBAH
      </span>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <div
            key={item.assetLabel}
            className={`p-2.5 rounded-xl border text-xs transition-all ${
              item.hasChanged
                ? 'bg-sky-50/70 border-sky-300 ring-1 ring-sky-400/30'
                : 'bg-white border-slate-100 opacity-65'
            }`}
          >
            <div className="text-[10px] text-slate-400 font-medium">{item.assetLabel}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-slate-500 ${item.hasChanged ? 'line-through text-[11px]' : 'font-semibold'}`}>
                {item.currentDisplay}
              </span>
              {item.hasChanged && (
                <>
                  <span className="text-slate-400">→</span>
                  <span className="font-extrabold text-slate-900">{item.whatIfDisplay}</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}