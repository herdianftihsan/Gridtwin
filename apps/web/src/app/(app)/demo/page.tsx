'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Project, Scenario, SimulationResult } from '../../../types/api';
import { EnergyCanvas } from '../../../components/workspace/energy-canvas/energy-canvas';
import { FinancialImpactCard } from '../../../components/workspace/metric-panels/financial-impact-card';
import { SimulationControls } from '../../../components/workspace/simulation-controls/simulation-controls';
import { ScenarioTabs } from '../../../components/workspace/scenario-tabs';
import { DecisionSummaryModal } from '../../../components/workspace/decision-summary-modal';
import {
  ScenarioComparisonModal,
} from '../../../components/workspace/scenarios';
import { WhatIfPanel } from '../../../components/workspace/what-if/what-if-panel';
import { ExplanationPanel } from '../../../components/workspace/ai/explanation-panel';
import { SimulationConfig, WorkspaceTab } from '../../../components/workspace/types';
import { formatLocation } from '../../../lib/utils/location';

const MOCK_PROJECT: Project = {
  id: 'demo-ruko-01',
  building_type: 'Ruko',
  location: 'Bekasi, Jawa Barat',
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
    refrigerator_units: 1,
    water_pump_upgraded: false,
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

const FASTEST_PAYBACK_RESULT: SimulationResult = {
  ...INITIAL_RESULT,
  configuration: {
    pv_kwp: 2,
    battery_kwh: 0,
    ac_units: 1,
    led_upgraded: true,
    refrigerator_units: 0,
    water_pump_upgraded: false,
  },
  financial: {
    capex: 36500000,
    new_monthly_cost: 2900000,
    monthly_savings: 1600000,
    payback_years: 2.2,
  },
  grid: {
    independence_pct: 35.0,
  },
};

const BASELINE_RESULT: SimulationResult = {
  configuration: { pv_kwp: 0, battery_kwh: 0, ac_units: 0, led_upgraded: false, refrigerator_units: 0, water_pump_upgraded: false },
  baseline: { monthly_cost: 4500000, monthly_kwh: 3000 },
  energy: {
    monthly_demand_kwh: 3000,
    solar_yield_monthly: 0,
    grid_import_monthly: 3000,
    wasted_surplus_monthly: 0,
  },
  financial: { capex: 0, new_monthly_cost: 4500000, monthly_savings: 0, payback_years: null },
  environmental: { co2_reduction_kg_yr: 0, co2_reduction_pct: 0 },
  grid: { independence_pct: 0 },
  assumptions: INITIAL_RESULT.assumptions,
};

const RECOMMENDED_SCENARIO: Scenario = {
  id: 'demo-rec-01',
  project_id: 'demo-ruko-01',
  scenario_type: 'recommended',
  name: 'Seimbang (Rekomendasi)',
  is_recommended: true,
  solar_kwp: 4,
  battery_kwh: 5,
  ac_units: 2,
  is_led_upgraded: true,
  refrigerator_units: 1,
  water_pump_upgraded: false,
  simulation_result: INITIAL_RESULT,
  created_at: new Date().toISOString(),
};

export default function DemoPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('balanced');
  const [currentConfig, setCurrentConfig] = useState<SimulationConfig>({
    solar_kwp: 4,
    battery_kwh: 5,
    ac_units: 2,
    is_led_upgraded: true,
    refrigerator_units: 1,
    water_pump_upgraded: false,
  });
  const [currentResult, setCurrentResult] = useState<SimulationResult>(INITIAL_RESULT);
  
  // Local state for demo storage
  const [scenarios, setScenarios] = useState<Scenario[]>([RECOMMENDED_SCENARIO]);
  const [cachedCustomConfig, setCachedCustomConfig] = useState<SimulationConfig | null>(null);
  const [cachedCustomResult, setCachedCustomResult] = useState<SimulationResult | null>(null);

  const [isSimulating, setIsSimulating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isWhatIfOpen, setIsWhatIfOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareScenarios, setCompareScenarios] = useState<Scenario[]>([]);

  // Simple local simulation calculator for demo Custom configurations
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
        refrigerator_units: cfg.refrigerator_units ?? 0,
        water_pump_upgraded: cfg.water_pump_upgraded ?? false,
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

  const handleRunSimulation = (persist: boolean = false) => {
    if (isSimulating || isSaving) return;
    
    if (persist) {
      setIsSaving(true);
      setTimeout(() => {
        const simRes = computeSimulation(currentConfig);
        const newScenario: Scenario = {
          id: `demo-sc-${Date.now()}`,
          project_id: MOCK_PROJECT.id,
          scenario_type: 'custom',
          name: 'Skenario Kustom ' + (scenarios.length + 1),
          is_recommended: false,
          solar_kwp: currentConfig.solar_kwp,
          battery_kwh: currentConfig.battery_kwh,
          ac_units: currentConfig.ac_units,
          is_led_upgraded: currentConfig.is_led_upgraded,
          refrigerator_units: currentConfig.refrigerator_units ?? 0,
          water_pump_upgraded: currentConfig.water_pump_upgraded ?? false,
          simulation_result: simRes,
          created_at: new Date().toISOString(),
        };

        setScenarios((prev) => [newScenario, ...prev]);
        setCachedCustomResult(simRes);
        setCachedCustomConfig(currentConfig);
        setCurrentResult(simRes);
        setIsSaving(false);
        alert("Skenario berhasil disimpan di sesi demo. Silakan Login untuk membuat proyek nyata Anda.");
      }, 500);
    } else {
      setIsSimulating(true);
      setTimeout(() => {
        const res = computeSimulation(currentConfig);
        setCurrentResult(res);
        setCachedCustomResult(res);
        setCachedCustomConfig(currentConfig);
        setIsSimulating(false);
      }, 500);
    }
  };

  const handleConfigChange = (partial: Partial<SimulationConfig>) => {
    setActiveTab('custom');
    setCurrentConfig((prev) => ({ ...prev, ...partial }));
  };

  const handleTabSelect = (tab: WorkspaceTab) => {
    if (activeTab === 'custom') {
      setCachedCustomConfig(currentConfig);
      setCachedCustomResult(currentResult);
    }
    
    setActiveTab(tab);

    if (tab === 'balanced') {
      setCurrentConfig({
        solar_kwp: INITIAL_RESULT.configuration.pv_kwp,
        battery_kwh: INITIAL_RESULT.configuration.battery_kwh,
        ac_units: INITIAL_RESULT.configuration.ac_units,
        is_led_upgraded: INITIAL_RESULT.configuration.led_upgraded,
        refrigerator_units: INITIAL_RESULT.configuration.refrigerator_units ?? 0,
        water_pump_upgraded: INITIAL_RESULT.configuration.water_pump_upgraded ?? false,
      });
      setCurrentResult(INITIAL_RESULT);
    } else if (tab === 'fastest_payback') {
      setCurrentConfig({
        solar_kwp: FASTEST_PAYBACK_RESULT.configuration.pv_kwp,
        battery_kwh: FASTEST_PAYBACK_RESULT.configuration.battery_kwh,
        ac_units: FASTEST_PAYBACK_RESULT.configuration.ac_units,
        is_led_upgraded: FASTEST_PAYBACK_RESULT.configuration.led_upgraded,
        refrigerator_units: FASTEST_PAYBACK_RESULT.configuration.refrigerator_units ?? 0,
        water_pump_upgraded: FASTEST_PAYBACK_RESULT.configuration.water_pump_upgraded ?? false,
      });
      setCurrentResult(FASTEST_PAYBACK_RESULT);
    } else if (tab === 'custom') {
      if (cachedCustomConfig && cachedCustomResult) {
        setCurrentConfig(cachedCustomConfig);
        setCurrentResult(cachedCustomResult);
      }
    }
  };

  const isStale = activeTab === 'custom' && currentResult && (
    currentConfig.solar_kwp !== currentResult.configuration.pv_kwp ||
    currentConfig.battery_kwh !== currentResult.configuration.battery_kwh ||
    currentConfig.ac_units !== currentResult.configuration.ac_units ||
    currentConfig.is_led_upgraded !== currentResult.configuration.led_upgraded ||
    currentConfig.refrigerator_units !== currentResult.configuration.refrigerator_units ||
    currentConfig.water_pump_upgraded !== currentResult.configuration.water_pump_upgraded
  );

  const canExportOrSave = currentResult && !isStale;

  const handleCompare = () => {
    // Generate comparison array
    const baselineScenario: Scenario = {
      id: 'baseline-demo',
      project_id: MOCK_PROJECT.id,
      name: 'Baseline',
      scenario_type: 'custom',
      solar_kwp: 0,
      battery_kwh: 0,
      ac_units: 0,
      is_led_upgraded: false,
      refrigerator_units: 0,
      water_pump_upgraded: false,
      simulation_result: BASELINE_RESULT,
      is_recommended: false,
      created_at: new Date().toISOString()
    };
    
    // Pick the recommended and the latest custom (if any)
    const toCompare = [baselineScenario];
    toCompare.push(RECOMMENDED_SCENARIO);
    
    const customScenarios = scenarios.filter(s => s.scenario_type === 'custom' || s.scenario_type === 'what_if');
    if (customScenarios.length > 0 && customScenarios[0]) {
      toCompare.push(customScenarios[0]);
    }
    
    setCompareScenarios(toCompare);
    setIsCompareOpen(true);
  };

  const handleWhatIfSaved = (scenario: Scenario) => {
    if (scenario.simulation_result) {
      setScenarios((prev) => [scenario, ...prev]);
      setCurrentResult(scenario.simulation_result);
      setActiveTab('custom');
      setCurrentConfig({
        solar_kwp: scenario.solar_kwp,
        battery_kwh: scenario.battery_kwh,
        ac_units: scenario.ac_units,
        is_led_upgraded: scenario.is_led_upgraded,
        refrigerator_units: scenario.refrigerator_units ?? 0,
        water_pump_upgraded: scenario.water_pump_upgraded ?? false,
      });
      setCachedCustomConfig({
        solar_kwp: scenario.solar_kwp,
        battery_kwh: scenario.battery_kwh,
        ac_units: scenario.ac_units,
        is_led_upgraded: scenario.is_led_upgraded,
        refrigerator_units: scenario.refrigerator_units ?? 0,
        water_pump_upgraded: scenario.water_pump_upgraded ?? false,
      });
      setCachedCustomResult(scenario.simulation_result);
      alert("Skenario What-if berhasil disimpan sementara di sesi demo.");
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Context Indicator */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 font-medium">
          <div className="mt-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse block" /></div>
          <div>
            <div className="font-bold text-sky-800 mb-1 text-sm">DEMO MODE</div>
            <p className="text-sky-700/90 leading-relaxed text-[13px]">
              Anda sedang mencoba demo GridTwin. Contoh berikut menunjukkan bagaimana GridTwin membantu pemilik bisnis membandingkan pilihan investasi energi berdasarkan kondisi bangunan, budget, dan tujuan mereka. Data pada demo ini adalah data contoh, bukan data bangunan Anda.
            </p>
          </div>
        </div>

        {/* Workspace Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <button 
              type="button"
              onClick={() => router.push('/')} 
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 mb-3 inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              ← Kembali ke Landing
            </button>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <span>{MOCK_PROJECT.building_type}</span>
              <span>•</span>
              <span>{formatLocation(MOCK_PROJECT.location)}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              Workspace Keputusan
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleCompare}
              className="px-3 sm:px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-sm transition-all cursor-pointer"
            >
              Bandingkan Skenario
            </button>

            <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />

            <button
              type="button"
              onClick={() => setIsWhatIfOpen(true)}
              className="px-3 sm:px-4 py-2 rounded-xl bg-sky-50 text-sky-700 text-xs font-bold hover:bg-sky-100 border border-sky-200 shadow-sm transition-all cursor-pointer"
            >
              ✦ Bagaimana-jika?
            </button>

            <button
              type="button"
              onClick={() => handleRunSimulation(false)}
              disabled={isSimulating || !isStale}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all ${
                isStale 
                  ? 'bg-amber-500 text-white hover:bg-amber-600 cursor-pointer animate-pulse'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isSimulating ? 'Menyimulasikan...' : isStale ? 'Jalankan Simulasi' : 'Disimulasikan'}
            </button>
            
            <button
              type="button"
              onClick={() => handleRunSimulation(true)}
              disabled={!canExportOrSave || isSaving}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all ${
                canExportOrSave
                  ? 'bg-slate-900 text-white hover:bg-slate-800 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Skenario'}
            </button>

            <button
              type="button"
              disabled={!canExportOrSave}
              onClick={() => setIsSummaryOpen(true)}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all ${
                canExportOrSave
                  ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Ekspor Ringkasan Keputusan
            </button>
          </div>
        </div>

        {/* 2-Column Asymmetric Workspace Layout (65% Canvas / 35% Panel) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (65%): Energy Canvas Centerpiece */}
          <div className="lg:col-span-8 space-y-6">
            <div className={`transition-opacity duration-300 ${isStale ? 'opacity-60' : 'opacity-100'}`}>
              <EnergyCanvas
                buildingType={MOCK_PROJECT.building_type}
                location={formatLocation(MOCK_PROJECT.location)}
                result={currentResult}
                isSimulating={isSimulating}
              />
            </div>
            <SimulationControls
              config={currentConfig}
              maxRoofPv={MOCK_PROJECT.roof_area ? Math.floor(MOCK_PROJECT.roof_area / 7) : 10}
              onChange={handleConfigChange}
              disabled={isSimulating || isSaving}
            />
          </div>

          {/* Right Column (35%): Metrics & Scenario Comparison */}
          <div className="lg:col-span-4 space-y-6">
            <div className={`transition-opacity duration-300 ${isStale ? 'opacity-60' : 'opacity-100'}`}>
              <FinancialImpactCard
                result={currentResult}
                isSimulating={isSimulating}
              />
            </div>

            <ExplanationPanel scenarioId={RECOMMENDED_SCENARIO.id} isDemo={true} />

            <ScenarioTabs
              activeTab={activeTab}
              onTabSelect={handleTabSelect}
              recommendedScenario={RECOMMENDED_SCENARIO}
            />
          </div>
        </div>

        <WhatIfPanel
          isOpen={isWhatIfOpen}
          onClose={() => setIsWhatIfOpen(false)}
          projectId={MOCK_PROJECT.id}
          currentResult={currentResult}
          onScenarioSaved={handleWhatIfSaved}
          isDemo={true}
        />

        {isCompareOpen && compareScenarios.length > 0 && (
          <ScenarioComparisonModal
            isOpen={isCompareOpen}
            onClose={() => setIsCompareOpen(false)}
            scenarios={compareScenarios}
          />
        )}

        {isSummaryOpen && currentResult && (
          <DecisionSummaryModal
            isOpen={isSummaryOpen}
            onClose={() => setIsSummaryOpen(false)}
            project={MOCK_PROJECT}
            result={currentResult}
          />
        )}
      </div>
    </main>
  );
}
