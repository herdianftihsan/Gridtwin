'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Project, Scenario, SimulationResult } from '../../types/api';
import { apiClient, ApiClientError } from '../../lib/api/api-client';
import { SimulationConfig, WorkspaceTab } from './types';
import { EnergyCanvas } from './energy-canvas/energy-canvas';
import { FinancialImpactCard } from './metric-panels/financial-impact-card';
import { SimulationControls } from './simulation-controls/simulation-controls';
import { ScenarioTabs } from './scenario-tabs';
import { DecisionSummaryModal } from './decision-summary-modal';

interface WorkspaceContainerProps {
  projectId: string;
}

export function WorkspaceContainer({ projectId }: ProjectIdProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [recommendedScenario, setRecommendedScenario] = useState<Scenario | null>(null);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('recommended');

  const [currentConfig, setCurrentConfig] = useState<SimulationConfig>({
    solar_kwp: 4,
    battery_kwh: 5,
    ac_units: 2,
    is_led_upgraded: true,
  });

  const [currentResult, setCurrentResult] = useState<SimulationResult | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const requestSeqRef = useRef<number>(0);

  // Initial Project Hydration
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
          if (res.data.recommended_scenario) {
            setRecommendedScenario(res.data.recommended_scenario);
            setCurrentResult(res.data.recommended_scenario.simulation_result);
            setCurrentConfig({
              solar_kwp: res.data.recommended_scenario.solar_kwp,
              battery_kwh: res.data.recommended_scenario.battery_kwh,
              ac_units: res.data.recommended_scenario.ac_units,
              is_led_upgraded: res.data.recommended_scenario.is_led_upgraded,
            });
          }
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage((err as Error).message || 'Failed to load project details.');
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

  // Debounced Simulation with Abort Sequence
  const triggerSimulation = useCallback(
    (nextConfig: SimulationConfig) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      setIsSimulating(true);
      setErrorMessage(null);

      debounceTimerRef.current = setTimeout(async () => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;
        const currentSeq = ++requestSeqRef.current;

        try {
          const res = await apiClient.post<{
            scenario_type: string;
            simulation_result: SimulationResult;
          }>(
            `/api/projects/${projectId}/simulate`,
            {
              ...nextConfig,
              persist: false,
            },
            { signal: controller.signal }
          );

          // Stale response barrier
          if (currentSeq === requestSeqRef.current && res.data?.simulation_result) {
            setCurrentResult(res.data.simulation_result);
            setIsSimulating(false);
          }
        } catch (err) {
          if ((err as Error).name === 'AbortError') return;

          if (currentSeq === requestSeqRef.current) {
            if (err instanceof ApiClientError && err.code === 'INFEASIBLE_EFFICIENCY_CONFIGURATION') {
              setErrorMessage('The chosen AC/LED efficiency savings exceed your baseline electricity demand.');
            } else {
              setErrorMessage((err as Error).message || 'Simulation preview failed.');
            }
            setIsSimulating(false);
          }
        }
      }, 300);
    },
    [projectId]
  );

  const handleConfigChange = (partial: Partial<SimulationConfig>) => {
    setActiveTab('custom');
    const updated = { ...currentConfig, ...partial };
    setCurrentConfig(updated);
    triggerSimulation(updated);
  };

  const handleTabSelect = (tab: WorkspaceTab) => {
    setActiveTab(tab);
    if (tab === 'recommended' && recommendedScenario) {
      const recConfig: SimulationConfig = {
        solar_kwp: recommendedScenario.solar_kwp,
        battery_kwh: recommendedScenario.battery_kwh,
        ac_units: recommendedScenario.ac_units,
        is_led_upgraded: recommendedScenario.is_led_upgraded,
      };
      setCurrentConfig(recConfig);
      triggerSimulation(recConfig);
    } else if (tab === 'baseline' && project) {
      const baseConfig: SimulationConfig = {
        solar_kwp: 0,
        battery_kwh: 0,
        ac_units: 0,
        is_led_upgraded: false,
      };
      setCurrentConfig(baseConfig);
      triggerSimulation(baseConfig);
    }
  };

  const handleSaveScenario = async () => {
    if (isSaving) return;
    try {
      setIsSaving(true);
      await apiClient.post(`/api/projects/${projectId}/simulate`, {
        ...currentConfig,
        persist: true,
      });
      setIsSaving(false);
    } catch (err) {
      setErrorMessage((err as Error).message || 'Failed to save scenario.');
      setIsSaving(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
          <span className="w-5 h-5 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
          <span>Hydrating Energy Twin Workspace...</span>
        </div>
      </div>
    );
  }

  if (!project || !currentResult) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-6">
        <h3 className="text-base font-bold text-slate-900">Project Workspace Unavailable</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">{errorMessage || 'Unable to load project telemetry.'}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>{project.building_type}</span>
            <span>•</span>
            <span>{project.location}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Decision Workspace
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'custom' && (
            <button
              type="button"
              onClick={handleSaveScenario}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
            >
              {isSaving ? 'Saving...' : 'Save Scenario'}
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsSummaryOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer"
          >
            Export Decision Summary
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-center justify-between text-left">
          <span>{errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-800 ml-4">✕</button>
        </div>
      )}

      {/* 2-Column Asymmetric Workspace Layout (65% Canvas / 35% Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (65%): Energy Canvas Centerpiece */}
        <div className="lg:col-span-8 space-y-6">
          <EnergyCanvas
            buildingType={project.building_type}
            location={project.location}
            result={currentResult}
            isSimulating={isSimulating}
          />
          <SimulationControls
            config={currentConfig}
            maxRoofPv={project.roof_area ? Math.floor(project.roof_area / 7) : 10}
            onChange={handleConfigChange}
            disabled={isSimulating}
          />
        </div>

        {/* Right Column (35%): Metrics & Scenario Comparison */}
        <div className="lg:col-span-4 space-y-6">
          <FinancialImpactCard
            result={currentResult}
            isSimulating={isSimulating}
          />
          <ScenarioTabs
            activeTab={activeTab}
            onTabSelect={handleTabSelect}
            recommendedScenario={recommendedScenario}
          />
        </div>
      </div>

      {/* Modal Decision Summary */}
      <DecisionSummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        project={project}
        result={currentResult}
      />
    </div>
  );
}

interface ProjectIdProps {
  projectId: string;
}