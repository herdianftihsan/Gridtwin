'use client';

import { useState, useRef, useCallback } from 'react';
import { apiClient, ApiClientError } from '../../../lib/api/api-client';
import { Scenario, SimulationResult } from '../../../types/api';
import { SimulationConfig } from '../types';

interface UseSaveScenarioOptions {
  projectId: string;
  onSuccess?: (savedScenario: Scenario) => void;
}

export function useSaveScenario({ projectId, onSuccess }: UseSaveScenarioOptions) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);
  const isSubmittingRef = useRef(false);

  const saveScenario = useCallback(
    async (config: SimulationConfig) => {
      // Guard against rapid duplicate clicks
      if (isSubmittingRef.current || isSaving) return;

      isSubmittingRef.current = true;
      setIsSaving(true);
      setSaveError(null);

      try {
        const res = await apiClient.post<{
          scenario_id: string;
          scenario_type: string;
          simulation_result: SimulationResult;
        }>(`/api/projects/${projectId}/simulate`, {
          solar_kwp: config.solar_kwp,
          battery_kwh: config.battery_kwh,
          ac_units: config.ac_units,
          is_led_upgraded: config.is_led_upgraded,
          persist: true,
        });

        if (res.data) {
          const newScenario: Scenario = {
            id: res.data.scenario_id,
            project_id: projectId,
            scenario_type: res.data.scenario_type as 'recommended' | 'custom' | 'what_if',
            is_recommended: false,
            solar_kwp: config.solar_kwp,
            battery_kwh: config.battery_kwh,
            ac_units: config.ac_units,
            is_led_upgraded: config.is_led_upgraded,
            simulation_result: res.data.simulation_result,
            created_at: new Date().toISOString(),
          };

          setLastSavedId(res.data.scenario_id);
          onSuccess?.(newScenario);
        }
      } catch (err) {
        if (err instanceof ApiClientError) {
          if (err.statusCode === 409) {
            setSaveError('An identical scenario configuration already exists.');
          } else if (err.statusCode === 401 || err.statusCode === 403) {
            setSaveError('Session expired. Please sign in again to save.');
          } else {
            setSaveError(err.message || 'Failed to save scenario.');
          }
        } else {
          setSaveError((err as Error).message || 'A network error occurred.');
        }
      } finally {
        setIsSaving(false);
        isSubmittingRef.current = false;
      }
    },
    [projectId, isSaving, onSuccess]
  );

  return {
    saveScenario,
    isSaving,
    saveError,
    lastSavedId,
    clearError: () => setSaveError(null),
  };
}