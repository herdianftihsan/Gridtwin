'use client';

import React from 'react';
import { motion } from 'motion/react';
import { WorkspaceTab } from './types';
import { Scenario } from '../../types/api';

interface ScenarioTabsProps {
  activeTab: WorkspaceTab;
  onTabSelect: (tab: WorkspaceTab) => void;
  recommendedScenario: Scenario | null;
}

const TABS: { id: WorkspaceTab; label: string }[] = [
  { id: 'balanced', label: 'Seimbang' },
  { id: 'fastest_payback', label: 'Balik Modal Tercepat' },
  { id: 'custom', label: 'Kustom' },
];

export function ScenarioTabs({
  activeTab,
  onTabSelect,
  recommendedScenario,
}: ScenarioTabsProps) {
  return (
    <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4 text-left">
      <div className="mb-2">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Strategi Optimisasi</h3>
        <p className="text-xs text-slate-500">Strategi menentukan cara GridTwin memilih rekomendasi terbaik.</p>
      </div>
      {/* Segmented Control dengan Animasi Sliding Pill Motion */}
      <div className="relative flex rounded-xl bg-slate-100 p-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabSelect(tab.id)}
              className={`relative flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-colors z-10 cursor-pointer ${
                isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeScenarioTabPill"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10"
                />
              )}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-1 min-h-[48px]">
        <p className="text-xs text-slate-700 leading-relaxed font-medium">
          {activeTab === 'fastest_payback'
            ? 'Memprioritaskan skenario dengan waktu balik modal paling singkat agar investasi lebih cepat kembali.'
            : activeTab === 'balanced'
            ? 'Mempertimbangkan biaya investasi, penghematan energi, dan dampak lingkungan secara seimbang.'
            : 'Tentukan sendiri prioritas investasi, penghematan, dan energi sesuai kebutuhan bisnis Anda.'}
        </p>
        <p className="text-[10px] text-slate-500">
          {activeTab === 'fastest_payback'
            ? 'Fokus utama: waktu balik modal'
            : activeTab === 'balanced'
            ? 'Fokus: biaya, penghematan, dan dampak lingkungan'
            : 'Fokus: prioritas yang Anda tentukan'}
        </p>
      </div>

      {/* Snapshot Details Table */}
      {recommendedScenario && (activeTab === 'balanced' || activeTab === 'fastest_payback') && (
        <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs font-medium">
          <div className="flex justify-between text-slate-600">
            <span>Kapasitas Panel Surya</span>
            <span className="font-bold text-slate-900">{recommendedScenario.solar_kwp} kWp</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Penyimpanan Baterai</span>
            <span className="font-bold text-slate-900">{recommendedScenario.battery_kwh} kWh</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Peningkatan Inverter AC</span>
            <span className="font-bold text-slate-900">{recommendedScenario.ac_units} Unit</span>
          </div>
        </div>
      )}
    </div>
  );
}