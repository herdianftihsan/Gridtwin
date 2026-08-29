'use client';

import React from 'react';
import { SimulationConfig } from '../types';

interface SimulationControlsProps {
  config: SimulationConfig;
  maxRoofPv?: number;
  onChange: (updated: Partial<SimulationConfig>) => void;
  disabled?: boolean;
}

export function SimulationControls({
  config,
  maxRoofPv = 10,
  onChange,
  disabled = false,
}: SimulationControlsProps) {
  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-5 text-left">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-900">Custom Simulator Controls</h3>
        <span className="text-[11px] font-semibold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full">
          Live Preview
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <label htmlFor="solar-pv-range" className="font-semibold text-slate-700">Solar PV Capacity</label>
          <span className="font-bold font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
            {config.solar_kwp} kWp
          </span>
        </div>
        <input
          id="solar-pv-range"
          type="range"
          min="0"
          max={Math.min(10, maxRoofPv)}
          step="1"
          value={config.solar_kwp}
          disabled={disabled}
          onChange={(e) => onChange({ solar_kwp: Number(e.target.value) })}
          aria-label="Solar PV Capacity in kWp"
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-50"
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>0 kWp</span>
          <span>Max {Math.min(10, maxRoofPv)} kWp (Roof Limit)</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <label htmlFor="battery-storage-range" className="font-semibold text-slate-700">Battery Storage</label>
          <span className="font-bold font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
            {config.battery_kwh} kWh
          </span>
        </div>
        <input
          id="battery-storage-range"
          type="range"
          min="0"
          max="20"
          step="5"
          value={config.battery_kwh}
          disabled={disabled}
          onChange={(e) => onChange({ battery_kwh: Number(e.target.value) })}
          aria-label="Battery Storage in kWh"
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500 disabled:opacity-50"
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>0 kWh</span>
          <span>20 kWh</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="space-y-1.5">
          <label htmlFor="ac-units-select" className="block text-xs font-semibold text-slate-700">AC Inverter Units</label>
          <select
            id="ac-units-select"
            value={config.ac_units}
            disabled={disabled}
            onChange={(e) => onChange({ ac_units: Number(e.target.value) })}
            aria-label="AC Inverter Units"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {[0, 1, 2, 3, 4, 5].map((u) => (
              <option key={u} value={u}>
                {u} {u === 1 ? 'Unit' : 'Units'}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5 flex flex-col justify-between">
          <label htmlFor="led-upgrade-checkbox" className="block text-xs font-semibold text-slate-700">Smart LED Upgrade</label>
          <label className="flex items-center gap-2 cursor-pointer pt-1 select-none">
            <input
              id="led-upgrade-checkbox"
              type="checkbox"
              checked={config.is_led_upgraded}
              disabled={disabled}
              onChange={(e) => onChange({ is_led_upgraded: e.target.checked })}
              className="w-4 h-4 rounded text-slate-900 focus:ring-sky-500"
            />
            <span className="text-xs text-slate-700 font-medium">Upgraded</span>
          </label>
        </div>
      </div>
    </div>
  );
}