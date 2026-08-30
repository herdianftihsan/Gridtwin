// apps/web/src/app/demo/page.tsx
'use client';

import React, { useState } from 'react';
import { SimulationResult, Project, Scenario } from '../../../types/api';
import { EnergyCanvas } from '../../../components/workspace/energy-canvas';
import { FinancialImpactCard } from '../../../components/workspace/metric-panels/financial-impact-card';
import { SimulationControls } from '../../../components/workspace/simulation-controls/simulation-controls';
import { ScenarioTabs } from '../../../components/workspace/scenario-tabs';
import { DecisionSummaryModal } from '../../../components/workspace/decision-summary-modal';
import { SimulationConfig, WorkspaceTab } from '../../../components/workspace/types';

const MOCK_PROJECT: Project = {
  id: 'demo-ruko-01',
  building_type: 'Ruko',
  location: 'Surabaya',
  roof_area: 50,
  monthly_bill: 4500000,
  budget: 50000000,
  objective: 'save_money',
};

const MOCK_RECOMMENDED_SCENARIO: Scenario = {
  id: 'demo-rec-01',
  scenario_type: 'recommended',
  is_recommended: true,
  solar_kwp: 4,
  battery_kwh: 5,
  ac_units: 2,
  is_led_upgraded: true,
};

const INITIAL_RESULT: SimulationResult = {
  configuration: {
    pv_kwp: 4,
    battery_kwh: 5,
    ac_units: 2,
    led_upgraded: true,
  },
  baseline: {
    monthly_cost: 4500000,
    monthly_kwh: 3000,
  },
  energy: {
    monthly_demand_kwh: 2796,
    solar_yield_monthly: 405,
    grid_import_monthly: 946,
    wasted_surplus_monthly: 0,
  },
  financial: {
    capex: 101500000,
    new_monthly_cost: 1420000,
    monthly_savings: 3080000,
    payback_years: 3.8,
  },
  environmental: {
    co2_reduction_kg_yr: 19472.5,
    co2_reduction_pct: 68.4,
  },
  grid: {
    independence_pct: 66.2,
  },
  assumptions: {
    tariff: 1500,
    psh: 4.5,
    performance_ratio: 0.75,
    battery_charge_efficiency: 0.95,
    battery_discharge_efficiency: 0.95,
    source_version: 'mvp-1.0',
  },
};

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('recommended');
  const [currentConfig, setCurrentConfig] = useState<SimulationConfig>({
    solar_kwp: 4,
    battery_kwh: 5,
    ac_units: 2,
    is_led_upgraded: true,
  });
  const [currentResult, setCurrentResult] = useState<SimulationResult>(INITIAL_RESULT);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  // Kalkulasi instan lokal khusus lingkungan demo preview
  const applySimulation = (updated: SimulationConfig, targetTab?: WorkspaceTab) => {
    if (targetTab) {
      setActiveTab(targetTab);
    }
    setCurrentConfig(updated);

    const pv = updated.solar_kwp;
    const bat = updated.battery_kwh;
    const estCapex =
      pv * 15000000 + bat * 5000000 + updated.ac_units * 5000000 + (updated.is_led_upgraded ? 1500000 : 0);
    const newCost = Math.max(300000, 4500000 - pv * 650000 - bat * 120000);
    const savings = 4500000 - newCost;
    const payback = savings > 0 && estCapex > 0 ? estCapex / (savings * 12) : null;
    const solarYield = pv * 101.25;
    const gridImport = Math.max(0, 2796 - solarYield - bat * 30);

    setCurrentResult({
      ...currentResult,
      configuration: {
        pv_kwp: pv,
        battery_kwh: bat,
        ac_units: updated.ac_units,
        led_upgraded: updated.is_led_upgraded,
      },
      energy: {
        monthly_demand_kwh: 2796,
        solar_yield_monthly: solarYield,
        grid_import_monthly: gridImport,
        wasted_surplus_monthly: 0,
      },
      financial: {
        capex: estCapex,
        new_monthly_cost: newCost,
        monthly_savings: savings,
        payback_years: payback ? Number(payback.toFixed(1)) : null,
      },
      grid: {
        independence_pct: Math.min(95, pv * 12 + bat * 4 + 10),
      },
    });
  };

  const handleConfigChange = (partial: Partial<SimulationConfig>) => {
    applySimulation({ ...currentConfig, ...partial }, 'custom');
  };

  const handleTabSelect = (tab: WorkspaceTab) => {
    if (tab === 'recommended') {
      applySimulation({ solar_kwp: 4, battery_kwh: 5, ac_units: 2, is_led_upgraded: true }, 'recommended');
    } else if (tab === 'baseline') {
      applySimulation({ solar_kwp: 0, battery_kwh: 0, ac_units: 0, is_led_upgraded: false }, 'baseline');
    } else {
      setActiveTab('custom');
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner Demo Mode */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            <span>Mode Demo Aktif: Menampilkan preview antarmuka tanpa autentikasi / database.</span>
          </div>
          <span className="font-bold text-sky-700 uppercase tracking-wider text-[10px] bg-sky-100 px-2 py-0.5 rounded">
            Standalone Preview
          </span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <span>{MOCK_PROJECT.building_type}</span>
              <span>•</span>
              <span>{MOCK_PROJECT.location}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              Decision Workspace
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setIsSummaryOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer"
          >
            Export Decision Summary
          </button>
        </div>

        {/* 2 Kolom Layout Asimetris (65% Canvas / 35% Metrics Panel) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6">
            <EnergyCanvas
              result={currentResult}
              project={MOCK_PROJECT}
            />
            <SimulationControls
              config={currentConfig}
              maxRoofPv={7}
              onChange={handleConfigChange}
            />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <FinancialImpactCard result={currentResult} />
            <ScenarioTabs
              activeTab={activeTab}
              onTabSelect={handleTabSelect}
              recommendedScenario={MOCK_RECOMMENDED_SCENARIO}
            />
          </div>
        </div>

        {/* Modal Decision Summary */}
        <DecisionSummaryModal
          isOpen={isSummaryOpen}
          onClose={() => setIsSummaryOpen(false)}
          project={MOCK_PROJECT}
          result={currentResult}
        />
      </div>
    </main>
  );
}