'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SimulationResult } from '../../../types/api';
import { apiClient } from '../../../lib/api/api-client';
import { Portal } from '../../ui/portal';

interface RoadmapStage {
  stage: number;
  title: string;
  description: string;
  result: SimulationResult;
}

interface InvestmentRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onApplyStage: (config: SimulationResult['configuration']) => void;
}

export function InvestmentRoadmapModal({ isOpen, onClose, projectId, onApplyStage }: InvestmentRoadmapModalProps) {
  const [stages, setStages] = useState<RoadmapStage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadRoadmap();
    }
  }, [isOpen, projectId]);

  const loadRoadmap = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<RoadmapStage[]>(`/api/projects/${projectId}/roadmap`);
      setStages(res.data || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan.';
      setError(`Gagal memuat peta jalan: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatIDR = (n: number) => `Rp ${(n / 1_000_000).toFixed(1)} Jt`;

  if (!isOpen) return null;

  return (
    <Portal>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col my-8 max-h-[85vh] lg:max-h-[90vh]"
          >
            <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10 rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-white">Peta Jalan Investasi</h2>
                <p className="text-sm text-slate-500 mt-1">Jalur bertahap menuju kemandirian energi.</p>
              </div>
              <button onClick={onClose} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <span className="w-8 h-8 border-2 border-slate-500 border-t-brand-accent rounded-full animate-spin" />
                </div>
              ) : error ? (
                <div className="text-center py-12 text-red-500">
                  <p>{error}</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Connecting Line */}
                  <div className="absolute left-6 top-6 bottom-6 w-px bg-slate-800" />
                  
                  <div className="space-y-8">
                    {stages.map((stage) => {
                      const r = stage.result;
                      const c = r.configuration;
                      return (
                        <div key={stage.stage} className="relative flex gap-6">
                          {/* Circle */}
                          <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full border-2 border-slate-700 bg-slate-900 flex items-center justify-center font-bold text-slate-300">
                            {stage.stage}
                          </div>
                          
                          {/* Card */}
                          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-lg font-semibold text-white">{stage.title}</h3>
                                <p className="text-sm text-slate-500 mt-1">{stage.description}</p>
                              </div>
                              <button
                                onClick={() => {
                                  onApplyStage(c);
                                  onClose();
                                }}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors border border-slate-700 cursor-pointer"
                              >
                                Eksplorasi di Ruang Kerja
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-4 gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-800/50">
                              <div>
                                <p className="text-xs font-medium text-slate-500 mb-1">Konfigurasi</p>
                                <p className="text-sm font-medium text-slate-300">
                                  {c.pv_kwp > 0 ? `${c.pv_kwp}kWp Surya` : 'Tanpa Surya'}
                                  <br />
                                  {c.battery_kwh > 0 ? `${c.battery_kwh}kWh Baterai` : 'Tanpa Baterai'}
                                  <br />
                                  {c.ac_units} AC, LED {c.led_upgraded ? 'Ya' : 'Tidak'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-slate-500 mb-1">Kebutuhan Capex</p>
                                <p className="text-lg font-semibold text-white">{formatIDR(r.financial.capex)}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-slate-500 mb-1">Penghematan Bulanan</p>
                                <p className="text-lg font-semibold text-emerald-400">
                                  {r.financial.monthly_savings > 0 ? formatIDR(r.financial.monthly_savings) : '-'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-slate-500 mb-1">Kemandirian Jaringan</p>
                                <p className="text-lg font-semibold text-white">
                                  {(r.grid.independence_pct * 100).toFixed(0)}%
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </Portal>
  );
}
