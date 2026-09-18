'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Project, Scenario, SimulationResult } from '../../types/api';
import { formatLocation } from '../../lib/utils/location';
import { apiClient, ApiClientError } from '../../lib/api/api-client';
import { SimulationConfig, WorkspaceTab } from './types';
import { EnergyCanvas } from './energy-canvas/energy-canvas';
import { FinancialImpactCard } from './metric-panels/financial-impact-card';
import { SimulationControls } from './simulation-controls/simulation-controls';
import { ScenarioTabs } from './scenario-tabs';
import { ScenarioComparisonModal } from './scenarios/scenario-comparison-modal';
import { ScenarioHistoryModal } from './scenarios/scenario-history-modal';
import { InvestmentRoadmapModal } from './scenarios/investment-roadmap-modal';
import { DecisionSummaryModal } from './decision-summary-modal';
import { WhatIfPanel } from './what-if/what-if-panel';

export interface WorkspaceContainerProps {
  projectId: string;
}

export function WorkspaceContainer({ projectId }: WorkspaceContainerProps) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [recommendedScenario, setRecommendedScenario] = useState<Scenario | null>(null);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('balanced');

  const [currentConfig, setCurrentConfig] = useState<SimulationConfig>({
    solar_kwp: 4,
    battery_kwh: 5,
    ac_units: 2,
    is_led_upgraded: true,
    refrigerator_units: 1,
    water_pump_upgraded: false,
  });

  const [currentResult, setCurrentResult] = useState<SimulationResult | null>(null);
  
  // Caching states to prevent redundant API calls
  const [cachedResults, setCachedResults] = useState<{
    balanced: SimulationResult | null;
    fastest_payback: SimulationResult | null;
    custom: SimulationResult | null;
  }>({ balanced: null, fastest_payback: null, custom: null });
  const [cachedCustomConfig, setCachedCustomConfig] = useState<SimulationConfig | null>(null);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = React.useState(false);
  const [isWhatIfOpen, setIsWhatIfOpen] = React.useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);
  const [isRoadmapOpen, setIsRoadmapOpen] = React.useState(false);
  const [isCompareOpen, setIsCompareOpen] = React.useState(false);
  const [compareScenarios, setCompareScenarios] = React.useState<Scenario[]>([]);

  // 1. Simulation Executor Hydration
  useEffect(() => {
    let isMounted = true;

    async function loadWorkspaceData() {
      try {
        setIsInitialLoading(true);
        const res = await apiClient.get<{
          project: Project;
          recommended_scenario: Scenario & { simulation_result: SimulationResult };
          recent_scenarios: Array<Scenario & { simulation_result: SimulationResult }>;
        }>(`/api/projects/${projectId}`);

        if (isMounted && res.data) {
          setProject(res.data.project);
          // By default, the recommended scenario loaded from DB is mapped to 'balanced'
          if (res.data.recommended_scenario) {
            setRecommendedScenario(res.data.recommended_scenario);
            setCurrentResult(res.data.recommended_scenario.simulation_result);
            setCurrentConfig({
              solar_kwp: res.data.recommended_scenario.solar_kwp,
              battery_kwh: res.data.recommended_scenario.battery_kwh,
              ac_units: res.data.recommended_scenario.ac_units,
              is_led_upgraded: res.data.recommended_scenario.is_led_upgraded,
              refrigerator_units: res.data.recommended_scenario.refrigerator_units ?? 0,
              water_pump_upgraded: res.data.recommended_scenario.water_pump_upgraded ?? false,
            });
            setCachedResults(prev => ({
              ...prev,
              balanced: res.data.recommended_scenario.simulation_result
            }));
          }
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage((err as Error).message || 'Gagal memuat detail proyek.');
        }
      } finally {
        if (isMounted) setIsInitialLoading(false);
      }
    }

    loadWorkspaceData();
    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const handleRunSimulation = async (configOverride?: SimulationConfig, persist: boolean = false, targetTab?: WorkspaceTab) => {
    if (isSimulating || isSaving) return;
    const configToRun = configOverride || currentConfig;
    const tabToUpdate = targetTab || activeTab;
    
    try {
      if (persist) {
        setIsSaving(true);
      } else {
        setIsSimulating(true);
      }
      setErrorMessage(null);
      
      const res = await apiClient.post<{
        scenario_type: string;
        simulation_result: SimulationResult;
      }>(`/api/projects/${projectId}/simulate`, {
        ...configToRun,
        persist,
      });

      if (res.data?.simulation_result) {
        setCurrentResult(res.data.simulation_result);
        
        // Update cache
        setCachedResults(prev => ({
          ...prev,
          [tabToUpdate]: res.data.simulation_result
        }));

        if (tabToUpdate === 'custom') {
          setCachedCustomConfig(configToRun);
        }
      }
    } catch (err) {
      if (err instanceof ApiClientError && err.code === 'INFEASIBLE_EFFICIENCY_CONFIGURATION') {
        setErrorMessage('Penghematan efisiensi AC/LED yang dipilih melebihi permintaan listrik baseline Anda.');
      } else {
        setErrorMessage((err as Error).message || 'Simulasi gagal.');
      }
    } finally {
      setIsSimulating(false);
      setIsSaving(false);
    }
  };

  const handleRunOptimization = async (strategy: 'balanced' | 'fastest_payback') => {
    if (isSimulating) return;
    
    try {
      setIsSimulating(true);
      setErrorMessage(null);
      
      const res = await apiClient.post<{
        scenario_type: string;
        simulation_result: SimulationResult;
        configuration: SimulationConfig;
      }>(`/api/projects/${projectId}/optimize`, {
        objective: strategy,
      });

      if (res.data?.simulation_result) {
        setCurrentResult(res.data.simulation_result);
        const config = {
          solar_kwp: res.data.simulation_result.configuration.pv_kwp,
          battery_kwh: res.data.simulation_result.configuration.battery_kwh,
          ac_units: res.data.simulation_result.configuration.ac_units,
          is_led_upgraded: res.data.simulation_result.configuration.led_upgraded,
          refrigerator_units: res.data.simulation_result.configuration.refrigerator_units ?? 0,
          water_pump_upgraded: res.data.simulation_result.configuration.water_pump_upgraded ?? false,
        };
        setCurrentConfig(config);
        
        setCachedResults(prev => ({
          ...prev,
          [strategy]: res.data.simulation_result
        }));

        setRecommendedScenario({
          ...res.data.simulation_result.configuration,
          id: 'temp-' + Date.now(),
          project_id: projectId,
          scenario_type: 'recommended',
          is_recommended: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          solar_kwp: res.data.simulation_result.configuration.pv_kwp,
          led_upgraded: res.data.simulation_result.configuration.led_upgraded,
        } as unknown as Scenario);
      }
    } catch (err) {
      setErrorMessage((err as Error).message || 'Optimisasi gagal.');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleConfigChange = (partial: Partial<SimulationConfig>) => {
    setActiveTab('custom');
    setCurrentConfig((prev) => ({ ...prev, ...partial }));
  };

  const handleTabSelect = (tab: WorkspaceTab) => {
    if (activeTab === 'custom') {
      setCachedCustomConfig(currentConfig);
      setCachedResults(prev => ({ ...prev, custom: currentResult }));
    }
    
    setActiveTab(tab);

    if (tab === 'balanced' || tab === 'fastest_payback') {
      if (cachedResults[tab]) {
        setCurrentResult(cachedResults[tab]);
        const res = cachedResults[tab]!;
        setCurrentConfig({
          solar_kwp: res.configuration.pv_kwp,
          battery_kwh: res.configuration.battery_kwh,
          ac_units: res.configuration.ac_units,
          is_led_upgraded: res.configuration.led_upgraded,
          refrigerator_units: res.configuration.refrigerator_units ?? 0,
          water_pump_upgraded: res.configuration.water_pump_upgraded ?? false,
        });
      } else {
        handleRunOptimization(tab);
      }
    } else if (tab === 'custom') {
      if (cachedCustomConfig) {
        setCurrentConfig(cachedCustomConfig);
      }
      if (cachedResults.custom) {
        setCurrentResult(cachedResults.custom);
      }
    }
  };

  // Determine if the custom configuration has unsaved/unsimulated changes
  const isStale = activeTab === 'custom' && currentResult && (
    currentConfig.solar_kwp !== currentResult.configuration.pv_kwp ||
    currentConfig.battery_kwh !== currentResult.configuration.battery_kwh ||
    currentConfig.ac_units !== currentResult.configuration.ac_units ||
    currentConfig.is_led_upgraded !== currentResult.configuration.led_upgraded ||
    currentConfig.refrigerator_units !== currentResult.configuration.refrigerator_units ||
    currentConfig.water_pump_upgraded !== currentResult.configuration.water_pump_upgraded
  );

  const canExportOrSave = currentResult && !isStale;

  if (isInitialLoading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
          <span className="w-5 h-5 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
          <span>Mempersiapkan Workspace Energy Twin...</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-6">
        <h3 className="text-base font-bold text-slate-900">Workspace Proyek Tidak Tersedia</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">{errorMessage || 'Tidak dapat memuat detail proyek.'}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <button 
            type="button"
            onClick={() => router.push('/dashboard')} 
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 mb-3 inline-flex items-center gap-1 transition-colors cursor-pointer"
          >
            ← Kembali ke Proyek
          </button>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>{project.building_type}</span>
            <span>•</span>
            <span>{formatLocation(project.location)}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Workspace Keputusan
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setIsRoadmapOpen(true)}
            className="px-3 sm:px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-sm transition-all cursor-pointer"
          >
            Peta Jalan
          </button>
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="px-3 sm:px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-sm transition-all cursor-pointer"
          >
            Riwayat
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
            onClick={() => handleRunSimulation(currentConfig, false, activeTab)}
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
            onClick={() => handleRunSimulation(currentConfig, true, activeTab)}
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

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-center justify-between text-left">
          <span>{errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-800 ml-4 cursor-pointer">✕</button>
        </div>
      )}

      {/* 2-Column Asymmetric Workspace Layout (65% Canvas / 35% Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (65%): Energy Canvas Centerpiece */}
        <div className="lg:col-span-8 space-y-6">
          {currentResult ? (
            <div className={`transition-opacity duration-300 ${isStale ? 'opacity-60' : 'opacity-100'}`}>
              <EnergyCanvas
                buildingType={project.building_type}
                location={formatLocation(project.location)}
                result={currentResult}
                isSimulating={isSimulating}
              />
            </div>
          ) : (
            <div className="w-full h-[580px] sm:h-[640px] bg-white border border-slate-200 border-dashed rounded-3xl flex flex-col items-center justify-center p-6 text-center shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Siap untuk Simulasi</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-md mb-6">
                Sesuaikan konfigurasi di bawah ini dan jalankan simulasi pertama Anda untuk membuat energy twin proyek ini.
              </p>
              <button
                type="button"
                onClick={() => handleRunSimulation(currentConfig, false, activeTab)}
                disabled={isSimulating}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold shadow-sm hover:bg-slate-800 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSimulating ? 'Menyimulasikan...' : 'Jalankan Simulasi'}
              </button>
            </div>
          )}
          <SimulationControls
            config={currentConfig}
            maxRoofPv={project.roof_area ? Math.floor(project.roof_area / 7) : 10}
            onChange={handleConfigChange}
            disabled={isSimulating || isSaving}
          />
        </div>

        {/* Right Column (35%): Metrics & Scenario Comparison */}
        <div className="lg:col-span-4 space-y-6">
          {currentResult ? (
            <div className={`transition-opacity duration-300 ${isStale ? 'opacity-60' : 'opacity-100'}`}>
              <FinancialImpactCard
                result={currentResult}
                isSimulating={isSimulating}
              />
            </div>
          ) : (
            <div className="w-full h-[320px] bg-white border border-slate-200 rounded-3xl flex flex-col items-center justify-center p-6 text-center shadow-sm">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100 shadow-sm">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-slate-500 text-sm font-medium">Metrik keuangan akan muncul di sini setelah simulasi</span>
            </div>
          )}
          <ScenarioTabs
            activeTab={activeTab}
            onTabSelect={handleTabSelect}
            recommendedScenario={recommendedScenario}
          />
        </div>
      </div>


      {/* What-if Panel */}
      {currentResult && (
        <WhatIfPanel
          isOpen={isWhatIfOpen}
          onClose={() => setIsWhatIfOpen(false)}
          projectId={projectId}
          currentResult={currentResult}
          onScenarioSaved={(scenario) => {
            // Apply saved scenario directly
            if (scenario.simulation_result) {
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
              setCachedResults(prev => ({
                ...prev,
                custom: scenario.simulation_result!
              }));
            }
            setIsWhatIfOpen(false);
          }}
        />
      )}

      {isHistoryOpen && (
        <ScenarioHistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          projectId={projectId}
          onCompare={(scenarios) => {
            setCompareScenarios(scenarios);
            setIsHistoryOpen(false);
            setIsCompareOpen(true);
          }}
        />
      )}

      {isRoadmapOpen && (
        <InvestmentRoadmapModal
          isOpen={isRoadmapOpen}
          onClose={() => setIsRoadmapOpen(false)}
          projectId={projectId}
          onApplyStage={(config) => {
            handleConfigChange(config);
            setIsRoadmapOpen(false);
          }}
        />
      )}

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
          project={project}
          result={currentResult}
        />
      )}
    </div>
  );
}