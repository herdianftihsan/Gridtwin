'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { apiClient, ApiClientError } from '../../../lib/api/api-client';
import { SimulationResult } from '../../../types/api';
import { SimulationConfig } from '../types';

interface UseSimulationPreviewOptions {
  projectId: string;
  initialResult: SimulationResult;
  debounceMs?: number;
}

export function useSimulationPreview({
  projectId,
  initialResult,
  debounceMs = 300,
}: UseSimulationPreviewOptions) {
  const [currentResult, setCurrentResult] = useState<SimulationResult>(initialResult);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationError, setSimulationError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const requestSeqRef = useRef<number>(0);

  const requestSimulation = useCallback(
    (config: SimulationConfig) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      setIsSimulating(true);
      setSimulationError(null);

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
              solar_kwp: config.solar_kwp,
              battery_kwh: config.battery_kwh,
              ac_units: config.ac_units,
              is_led_upgraded: config.is_led_upgraded,
              persist: false,
            },
            { signal: controller.signal }
          );

          if (currentSeq === requestSeqRef.current && res.data?.simulation_result) {
            setCurrentResult(res.data.simulation_result);
            setIsSimulating(false);
          }
        } catch (err) {
          if ((err as Error).name === 'AbortError') return;

          if (currentSeq === requestSeqRef.current) {
            if (err instanceof ApiClientError && err.code === 'INFEASIBLE_EFFICIENCY_CONFIGURATION') {
              setSimulationError('Selected AC/LED efficiency configuration exceeds baseline demand.');
            } else {
              setSimulationError((err as Error).message || 'Simulation preview failed.');
            }
            setIsSimulating(false);
          }
        }
      }, debounceMs);
    },
    [projectId, debounceMs]
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  return {
    currentResult,
    isSimulating,
    simulationError,
    requestSimulation,
    setResultDirectly: setCurrentResult,
  };
}