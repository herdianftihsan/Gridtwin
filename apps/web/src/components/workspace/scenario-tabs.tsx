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
  { id: 'baseline', label: 'Baseline' },
  { id: 'recommended', label: 'Fastest Payback' },
  { id: 'custom', label: 'Custom' },
];

export function ScenarioTabs({
  activeTab,
  onTabSelect,
  recommendedScenario,
}: ScenarioTabsProps) {
  return (
    <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4 text-left">
      {/* Segmented Control dengan Animasi Sliding Pill Motion */}
      <div className="relative flex rounded-xl bg-slate-100 p-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabSelect(tab.id)}
              className={`relative flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors z-10 cursor-pointer ${
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

      <p className="text-xs text-slate-500 leading-relaxed min-h-[32px]">
        {activeTab === 'recommended'
          ? 'Scenario prioritizes Payback by optimizing Solar PV size against daytime load curves.'
          : activeTab === 'baseline'
          ? 'Baseline profile reflects current electricity bill with 100% grid dependency.'
          : 'Live custom configuration. Adjust simulator controls to preview outcomes.'}
      </p>

      {/* Snapshot Details Table */}
      {recommendedScenario && activeTab === 'recommended' && (
        <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs font-medium">
          <div className="flex justify-between text-slate-600">
            <span>Solar PV Capacity</span>
            <span className="font-bold text-slate-900">{recommendedScenario.solar_kwp} kWp</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Battery Storage</span>
            <span className="font-bold text-slate-900">{recommendedScenario.battery_kwh} kWh</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>AC Inverter Upgrades</span>
            <span className="font-bold text-slate-900">{recommendedScenario.ac_units} Units</span>
          </div>
        </div>
      )}
    </div>
  );
}