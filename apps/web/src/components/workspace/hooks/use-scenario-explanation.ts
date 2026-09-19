'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { apiClient } from '../../../lib/api/api-client';

export function useScenarioExplanation(scenarioId?: string, isDemo?: boolean) {
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
        if (isDemo) {
          // Simulate AI delay for demo
          await new Promise((resolve) => setTimeout(resolve, 1500));
          if (controller.signal.aborted) return;
          setExplanation('Berdasarkan data demo, konfigurasi ini memberikan kompromi terbaik antara penghematan energi dan biaya investasi. Panel surya dan baterai menekan impor daya pada siang hari, sedangkan efisiensi dari lampu LED dan AC yang diperbarui menjaga konsumsi dasar tetap rendah. ROI akan tercapai lebih cepat.');
          return;
        }

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
    [scenarioId, isDemo]
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