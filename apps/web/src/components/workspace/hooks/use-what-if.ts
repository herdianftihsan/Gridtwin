'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { apiClient, ApiClientError } from '../../../lib/api/api-client';
import { SimulationResult, Scenario } from '../../../types/api';
import { WhatIfResponsePayload, WhatIfStatus } from '../what-if/types';

interface UseWhatIfOptions {
  projectId: string;
  onScenarioSaved?: (scenario: Scenario) => void;
}

export function useWhatIf({ projectId, onScenarioSaved }: UseWhatIfOptions) {
  const [status, setStatus] = useState<WhatIfStatus>('idle');
  const [query, setQuery] = useState('');
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const requestSeqRef = useRef<number>(0);
  const isSubmittingRef = useRef<boolean>(false);

  const executeWhatIf = useCallback(
    async (messageText: string) => {
      const trimmed = messageText.trim();
      if (!trimmed || isSubmittingRef.current) return;

      // Abort previous in-flight request if user submits again
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;
      const currentSeq = ++requestSeqRef.current;

      isSubmittingRef.current = true;
      setStatus('loading');
      setQuery(trimmed);
      setError(null);

      try {
        const res = await apiClient.post<WhatIfResponsePayload>(
          '/api/ai/what-if',
          {
            project_id: projectId,
            message: trimmed,
          },
          { signal: controller.signal }
        );

        if (currentSeq === requestSeqRef.current && res.data) {
          setScenarioId(res.data.scenario_id);
          setResult(res.data.simulation_result);
          setStatus('result');

          // Fetch contextual explanation independently so simulation result is not blocked
          fetchExplanation(res.data.scenario_id, trimmed, controller.signal, currentSeq);
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;

        if (currentSeq === requestSeqRef.current) {
          setStatus('error');
          if (err instanceof ApiClientError) {
            if (err.statusCode === 422 || err.code === 'NO_FEASIBLE_SCENARIO') {
              setError('No feasible energy configuration found within these constraints. Try relaxing the budget or roof area.');
            } else if (err.statusCode === 401 || err.statusCode === 403) {
              setError('Your session has expired. Please log in again to run What-if analysis.');
            } else if (err.statusCode === 502 || err.code === 'AI_ERROR') {
              setError('The AI service is temporarily unavailable. Please adjust configuration controls manually.');
            } else {
              setError(err.message || 'What-if exploration could not be completed.');
            }
          } else {
            setError((err as Error).message || 'A network error occurred while exploring scenario.');
          }
        }
      } finally {
        if (currentSeq === requestSeqRef.current) {
          isSubmittingRef.current = false;
        }
      }
    },
    [projectId]
  );

  const fetchExplanation = async (
    targetScenarioId: string,
    contextQuestion: string,
    signal: AbortSignal,
    seq: number
  ) => {
    try {
      const explainRes = await apiClient.post<{ scenario_id: string; explanation: string }>(
        '/api/ai/explain',
        {
          scenario_id: targetScenarioId,
          user_context_question: contextQuestion,
        },
        { signal }
      );

      if (seq === requestSeqRef.current && explainRes.data?.explanation) {
        setAiExplanation(explainRes.data.explanation);
      }
    } catch {
      if (seq === requestSeqRef.current) {
        setAiExplanation('Contextual AI explanation is temporarily unavailable. Numerical simulation is verified and complete.');
      }
    }
  };

  const resetWhatIf = useCallback(() => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    isSubmittingRef.current = false;
    setStatus('idle');
    setQuery('');
    setScenarioId(null);
    setResult(null);
    setAiExplanation(null);
    setError(null);
  }, []);

  const markAsSaved = useCallback(() => {
    if (!result || !scenarioId) return;
    setStatus('saved');

    const savedScenario: Scenario = {
      id: scenarioId,
      project_id: projectId,
      scenario_type: 'what_if',
      is_recommended: false,
      solar_kwp: result.configuration.pv_kwp,
      battery_kwh: result.configuration.battery_kwh,
      ac_units: result.configuration.ac_units,
      is_led_upgraded: result.configuration.led_upgraded,
      simulation_result: result,
      created_at: new Date().toISOString(),
    };

    onScenarioSaved?.(savedScenario);
  }, [result, scenarioId, projectId, onScenarioSaved]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  return {
    status,
    query,
    scenarioId,
    result,
    aiExplanation,
    error,
    executeWhatIf,
    resetWhatIf,
    markAsSaved,
    isSubmitting: isSubmittingRef.current,
  };
}