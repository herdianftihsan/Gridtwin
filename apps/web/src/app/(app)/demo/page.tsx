'use client';

import React, { useState } from 'react';
import { SimulationResult, Project, Scenario } from '../../../types/api';
import { SimulationConfig, WorkspaceTab } from '../../../components/workspace/types';

// Import langsung ke nama file .tsx masing-masing
import { EnergyCanvas } from '../../../components/workspace/energy-canvas/energy-canvas';
import { FinancialImpactCard } from '../../../components/workspace/metric-panels/financial-impact-card';
import { SimulationControls } from '../../../components/workspace/simulation-controls/simulation-controls';
import { ScenarioTabs } from '../../../components/workspace/scenario-tabs';
import { DecisionSummaryModal } from '../../../components/workspace/decision-summary/decision-summary-modal';
import { ScenarioList } from '../../../components/workspace/scenarios/scenario-list';
import { ScenarioComparisonModal } from '../../../components/workspace/scenarios/scenario-comparison-modal';
import { SaveScenarioButton } from '../../../components/workspace/scenarios/save-scenario-button';

const MOCK_PROJECT: Project = {
  id: 'demo-ruko-01',
  building_type: 'Ruko',
  location: 'Surabaya',
  roof_area: 50,
  monthly_bill: 4500000,
  budget: 50000000,
  objective: 'save_money',
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

const BASELINE_RESULT: SimulationResult = {
  configuration: { pv_kwp: 0, battery_kwh: 0, ac_units: 0, led_upgraded: false },
  baseline: { monthly_cost: 4500000, monthly_kwh: 3000 },
  energy: { monthly_demand_kwh: 3000, solar_yield_monthly: 0, grid_import_monthly: 3000, wasted_surplus_monthly: 0 },
  financial: { capex: 0, new_monthly_cost: 4500000, monthly_savings: 0, payback_years: null },
  environmental: { co2_reduction_kg_yr: 0, co2_reduction_pct: 0 },
  grid: { independence_pct: 0 },
  assumptions: INITIAL_RESULT.assumptions,
};

const INITIAL_SCENARIOS: Scenario[] = [
  {
    id: 'demo-rec-01',
    project_id: 'demo-ruko-01',
    scenario_type: 'recommended',
    is_recommended: true,
    solar_kwp: 4,
    battery_kwh: 5,
    ac_units: 2,
    is_led_upgraded: true,
    simulation_result: INITIAL_RESULT,
    created_at: new Date().toISOString(),
  },
];

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('recommended');
  const [currentConfig, setCurrentConfig] = useState<SimulationConfig>({
    solar_kwp: 4,
    battery_kwh: 5,
    ac_units: 2,
    is_led_upgraded: true,
  });
  const [currentResult, setCurrentResult] = useState<SimulationResult>(INITIAL_RESULT);
  const [scenarios, setScenarios] = useState<Scenario[]>(INITIAL_SCENARIOS);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Modal States (Phase 14)
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [compareScenario, setCompareScenario] = useState<Scenario | null>(null);

  // Kalkulasi instan simulasi lokal khusus mode demo
  const computeSimulation = (cfg: SimulationConfig): SimulationResult => {
    const pv = cfg.solar_kwp;
    const bat = cfg.battery_kwh;
    const estCapex =
      pv * 15000000 + bat * 5000000 + cfg.ac_units * 5000000 + (cfg.is_led_upgraded ? 1500000 : 0);
    const newCost = Math.max(300000, 4500000 - pv * 650000 - bat * 120000);
    const savings = 4500000 - newCost;
    const payback = savings > 0 && estCapex > 0 ? estCapex / (savings * 12) : null;
    const solarYield = pv * 101.25;
    const gridImport = Math.max(0, 2796 - solarYield - bat * 30);

    return {
      configuration: {
        pv_kwp: pv,
        battery_kwh: bat,
        ac_units: cfg.ac_units,
        led_upgraded: cfg.is_led_upgraded,
      },
      baseline: { monthly_cost: 4500000, monthly_kwh: 3000 },
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
      environmental: {
        co2_reduction_kg_yr: Number((savings * 0.0055).toFixed(1)),
        co2_reduction_pct: Number(Math.min(85, (savings / 4500000) * 100).toFixed(1)),
      },
      grid: {
        independence_pct: Number(Math.min(95, pv * 12 + bat * 4 + 10).toFixed(1)),
      },
      assumptions: INITIAL_RESULT.assumptions,
    };
  };

  const handleConfigChange = (partial: Partial<SimulationConfig>) => {
    const updated = { ...currentConfig, ...partial };
    setCurrentConfig(updated);
    setActiveTab('custom');
    setIsSaved(false);
    setCurrentResult(computeSimulation(updated));
  };

  const handleTabSelect = (tab: WorkspaceTab) => {
    setActiveTab(tab);
    if (tab === 'recommended') {
      const recCfg = { solar_kwp: 4, battery_kwh: 5, ac_units: 2, is_led_upgraded: true };
      setCurrentConfig(recCfg);
      setCurrentResult(INITIAL_RESULT);
    } else if (tab === 'baseline') {
      const baseCfg = { solar_kwp: 0, battery_kwh: 0, ac_units: 0, is_led_upgraded: false };
      setCurrentConfig(baseCfg);
      setCurrentResult(BASELINE_RESULT);
    }
  };

  // Phase 14: Simpan Skenario Lokal
  const handleSaveScenario = (cfg: SimulationConfig) => {
    if (isSaving) return;
    setIsSaving(true);

    setTimeout(() => {
      const simRes = computeSimulation(cfg);
      const newScenario: Scenario = {
        id: `demo-sc-${Date.now()}`,
        project_id: 'demo-ruko-01',
        scenario_type: 'custom',
        is_recommended: false,
        solar_kwp: cfg.solar_kwp,
        battery_kwh: cfg.battery_kwh,
        ac_units: cfg.ac_units,
        is_led_upgraded: cfg.is_led_upgraded,
        simulation_result: simRes,
        created_at: new Date().toISOString(),
      };

      setScenarios((prev) => [newScenario, ...prev.slice(0, 9)]);
      setIsSaving(false);
      setIsSaved(true);
    }, 450);
  };

  const handleSelectSavedScenario = (sc: Scenario) => {
    if (sc.simulation_result) {
      setCurrentConfig({
        solar_kwp: sc.solar_kwp,
        battery_kwh: sc.battery_kwh,
        ac_units: sc.ac_units,
        is_led_upgraded: sc.is_led_upgraded,
      });
      setCurrentResult(sc.simulation_result);
      setActiveTab(sc.is_recommended ? 'recommended' : 'custom');
      setIsSaved(true);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner Demo Mode */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            <span>Mode Demo Aktif: Menampilkan preview antarmuka Phase 13 & Phase 14 tanpa database.</span>
          </div>
          <span className="font-bold text-sky-700 uppercase tracking-wider text-[10px] bg-sky-100 px-2 py-0.5 rounded">
            Full Feature Preview
          </span>
        </div>

        {/* Header Bar */}
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

          <div className="flex items-center gap-3">
            <SaveScenarioButton
              config={currentConfig}
              onSave={handleSaveScenario}
              isSaving={isSaving}
              isSaved={isSaved}
            />
            <button
              type="button"
              onClick={() => setIsSummaryOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer"
            >
              Export Decision Summary
            </button>
          </div>
        </div>

        {/* 2 Kolom Layout Asimetris (65% Canvas & Controls / 35% Panels & Scenarios) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: Canvas & Slider Controls */}
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

          {/* Kolom Kanan: Financial KPI, Tabs, & Scenario List */}
          <div className="lg:col-span-4 space-y-6">
            <FinancialImpactCard result={currentResult} />
            <ScenarioTabs
              activeTab={activeTab}
              onTabSelect={handleTabSelect}
              recommendedScenario={scenarios[0] ?? null}
            />
            <ScenarioList
              scenarios={scenarios}
              selectedScenarioId={
                activeTab === 'recommended' ? scenarios[0]?.id : undefined
              }
              onSelectScenario={handleSelectSavedScenario}
              onCompareScenario={(sc) => setCompareScenario(sc)}
            />
          </div>
        </div>

        {/* Modal 1: Decision Summary (Phase 14) */}
        <DecisionSummaryModal
          isOpen={isSummaryOpen}
          onClose={() => setIsSummaryOpen(false)}
          project={MOCK_PROJECT}
          result={currentResult}
          onSaveScenario={() => handleSaveScenario(currentConfig)}
          isSaving={isSaving}
        />

        {/* Modal 2: Scenario Comparison Matrix (Phase 14) */}
        {compareScenario && compareScenario.simulation_result && (
          <ScenarioComparisonModal
            isOpen={Boolean(compareScenario)}
            onClose={() => setCompareScenario(null)}
            baselineResult={BASELINE_RESULT}
            targetResult={compareScenario.simulation_result}
            targetScenarioTitle={
              compareScenario.is_recommended ? 'Recommended Scenario' : 'Custom Saved Scenario'
            }
          />
        )}
      </div>
    </main>
  );
}