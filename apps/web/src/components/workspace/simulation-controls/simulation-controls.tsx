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
        <h3 className="text-sm font-bold text-slate-900">Kontrol Simulator Kustom</h3>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <label htmlFor="solar-pv-range" className="font-semibold text-slate-700">Kapasitas Panel Surya</label>
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
          <span>Maks {Math.min(10, maxRoofPv)} kWp (Batas Atap)</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <label htmlFor="battery-storage-range" className="font-semibold text-slate-700">Penyimpanan Baterai</label>
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

      <div className="border-t border-slate-100 pt-4 mt-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800">Peluang Efisiensi</h4>
          <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            Estimasi
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="ac-units-select" className="block text-xs font-semibold text-slate-700">Unit Inverter AC</label>
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
                  {u} Unit
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="fridge-units-select" className="block text-xs font-semibold text-slate-700">Pendinginan</label>
            <select
              id="fridge-units-select"
              value={config.refrigerator_units}
              disabled={disabled}
              onChange={(e) => onChange({ refrigerator_units: Number(e.target.value) })}
              aria-label="Refrigeration Units"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {[0, 1, 2].map((u) => (
                <option key={u} value={u}>
                  {u} Unit
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5 flex flex-col justify-between">
            <label htmlFor="led-upgrade-checkbox" className="block text-xs font-semibold text-slate-700">Peningkatan LED Pintar</label>
            <label className="flex items-center gap-2 cursor-pointer pt-1 select-none">
              <input
                id="led-upgrade-checkbox"
                type="checkbox"
                checked={config.is_led_upgraded}
                disabled={disabled}
                onChange={(e) => onChange({ is_led_upgraded: e.target.checked } as Partial<SimulationConfig>)}
                className="w-4 h-4 rounded text-slate-900 focus:ring-sky-500"
              />
              <span className="text-xs text-slate-700 font-medium">Ditingkatkan</span>
            </label>
          </div>

          <div className="space-y-1.5 flex flex-col justify-between">
            <label htmlFor="pump-upgrade-checkbox" className="block text-xs font-semibold text-slate-700">Pompa Air (VSD)</label>
            <label className="flex items-center gap-2 cursor-pointer pt-1 select-none">
              <input
                id="pump-upgrade-checkbox"
                type="checkbox"
                checked={config.water_pump_upgraded}
                disabled={disabled}
                onChange={(e) => onChange({ water_pump_upgraded: e.target.checked })}
                className="w-4 h-4 rounded text-slate-900 focus:ring-sky-500"
              />
              <span className="text-xs text-slate-700 font-medium">Ditingkatkan</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}