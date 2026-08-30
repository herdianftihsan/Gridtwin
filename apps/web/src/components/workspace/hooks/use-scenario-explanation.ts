'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { apiClient } from '../../../lib/api/api-client';

export function useScenarioExplanation(scenarioId?: string) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const requestExplanation = useCallback(
    async (targetId?: string, userPrompt?: string) => {
      const activeId = targetId || scenarioId;
      if (!activeId) return;

      if (abortControllerRef.current) abortControllerRef.current.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      setError(null);

      try {
        const res = await apiClient.post<{ scenario_id: string; explanation: string }>(
          '/api/ai/explain',
          { scenario_id: activeId, user_context_question: userPrompt },
          { signal: controller.signal }
        );

        if (res.data?.explanation) {
          setExplanation(res.data.explanation);
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setError('AI explanation is temporarily unavailable. Simulation calculations remain unaffected.');
      } finally {
        setIsLoading(false);
      }
    },
    [scenarioId]
  );

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  return {
    explanation,
    isLoading,
    error,
    requestExplanation,
  };
}