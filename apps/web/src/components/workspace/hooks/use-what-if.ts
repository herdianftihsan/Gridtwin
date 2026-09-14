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
  const [explanationStatus, setExplanationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
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
              setError('Tidak ditemukan konfigurasi energi yang layak dalam batasan ini. Cobalah melonggarkan anggaran atau luas atap.');
            } else if (err.statusCode === 401 || err.statusCode === 403) {
              setError('Sesi Anda telah kedaluwarsa. Silakan masuk kembali untuk menjalankan analisis Bagaimana-jika.');
            } else if (err.statusCode === 502 || err.code === 'AI_ERROR') {
              setError('Layanan AI sedang tidak tersedia. Silakan sesuaikan kontrol konfigurasi secara manual.');
            } else {
              setError(err.message || 'Eksplorasi skenario tidak dapat diselesaikan.');
            }
          } else {
            setError((err as Error).message || 'Terjadi kesalahan jaringan saat mengeksplorasi skenario.');
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
    setExplanationStatus('loading');
    setAiExplanation(null);
    try {
      const explainRes = await apiClient.post<{ scenario_id: string; explanation: string; explanationUnavailable: boolean }>(
        '/api/ai/explain',
        {
          scenario_id: targetScenarioId,
          user_context_question: contextQuestion,
        },
        { signal }
      );

      if (seq === requestSeqRef.current) {
        if (explainRes.data?.explanation) {
          setAiExplanation(explainRes.data.explanation);
        }
        if (explainRes.data?.explanationUnavailable) {
          setExplanationStatus('error');
        } else {
          setExplanationStatus('success');
        }
      }
    } catch {
      if (seq === requestSeqRef.current) {
        setAiExplanation('Penjelasan AI sedang tidak tersedia. Simulasi numerik telah terverifikasi dan selesai.');
        setExplanationStatus('error');
      }
    }
  };

  const retryExplanation = useCallback(() => {
    if (!scenarioId || !query || explanationStatus === 'loading') return;
    
    // We do NOT abort the main abort controller here because it might be tracking a simulation.
    // Instead we just fire a detached request.
    const controller = new AbortController();
    fetchExplanation(scenarioId, query, controller.signal, requestSeqRef.current);
  }, [scenarioId, query, explanationStatus]);

  const resetWhatIf = useCallback(() => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    isSubmittingRef.current = false;
    setStatus('idle');
    setQuery('');
    setScenarioId(null);
    setResult(null);
    setAiExplanation(null);
    setExplanationStatus('idle');
    setError(null);
  }, []);

  const markAsSaved = useCallback(async (name: string) => {
    if (!result || !scenarioId) return;
    setStatus('saved');

    try {
      await apiClient.patch(`/api/scenarios/${scenarioId}`, { name });

      const savedScenario: Scenario = {
        id: scenarioId,
        project_id: projectId,
        name,
        scenario_type: 'what_if',
        is_recommended: false,
        solar_kwp: result.configuration.pv_kwp,
        battery_kwh: result.configuration.battery_kwh,
        ac_units: result.configuration.ac_units,
        is_led_upgraded: result.configuration.led_upgraded,
        refrigerator_units: result.configuration.refrigerator_units,
        water_pump_upgraded: result.configuration.water_pump_upgraded,
        simulation_result: result,
        created_at: new Date().toISOString(),
      };

      onScenarioSaved?.(savedScenario);
    } catch (err) {
      setError((err as Error).message || 'Gagal menyimpan skenario.');
      setStatus('error');
    }
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
    explanationStatus,
    error,
    executeWhatIf,
    retryExplanation,
    resetWhatIf,
    markAsSaved,
    isSubmitting: isSubmittingRef.current,
  };
}