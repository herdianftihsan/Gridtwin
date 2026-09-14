'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scenario } from '../../../types/api';
import { apiClient } from '../../../lib/api/api-client';
import { Portal } from '../../ui/portal';

interface ScenarioHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onCompare: (scenarios: Scenario[]) => void;
}

export function ScenarioHistoryModal({ isOpen, onClose, projectId, onCompare }: ScenarioHistoryModalProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      loadHistory();
      setSelectedIds(new Set());
    }
  }, [isOpen, projectId]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<Scenario[]>(`/api/projects/${projectId}/scenarios`);
      setScenarios(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/api/scenarios/${id}`);
      setScenarios(prev => prev.filter(s => s.id !== id));
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRename = async (id: string, currentName: string) => {
    const newName = window.prompt('Masukkan nama skenario baru:', currentName || '');
    if (!newName || !newName.trim() || newName === currentName) return;

    try {
      await apiClient.patch(`/api/scenarios/${id}`, { name: newName.trim() });
      setScenarios(prev => prev.map(s => s.id === id ? { ...s, name: newName.trim() } : s));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= 3) {
          alert('Anda hanya dapat membandingkan hingga 3 skenario sekaligus.');
          return prev;
        }
        next.add(id);
      }
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] lg:max-h-[90vh]"
          >
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Riwayat Skenario</h2>
                <p className="text-sm text-slate-500 mt-1">Kelola dan bandingkan skenario investasi Anda yang tersimpan.</p>
              </div>
              <button onClick={onClose} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <span className="w-8 h-8 border-2 border-slate-500 border-t-sky-500 rounded-full animate-spin" />
                </div>
              ) : scenarios.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p>Belum ada skenario yang disimpan.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {scenarios.map((scenario) => {
                    const isSelected = selectedIds.has(scenario.id);
                    const result = scenario.simulation_result;
                    if (!result) return null;

                    return (
                      <div 
                        key={scenario.id} 
                        className={`p-4 rounded-xl border transition-all ${isSelected ? 'border-sky-500 bg-slate-800/50' : 'border-slate-800 bg-slate-900'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => toggleSelect(scenario.id)}
                              className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${isSelected ? 'bg-sky-500 border-sky-500 text-slate-900' : 'border-slate-600 hover:border-slate-400'}`}
                            >
                              {isSelected && (
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-white">{scenario.name || 'Skenario Tanpa Nama'}</h3>
                                <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-xs font-medium text-slate-300">
                                  {scenario.scenario_type}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                {new Date(scenario.created_at || '').toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button onClick={() => handleRename(scenario.id, scenario.name || '')} className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer" title="Ganti Nama">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button onClick={() => handleDelete(scenario.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors cursor-pointer" title="Hapus">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mt-4 pl-8">
                          <div>
                            <p className="text-xs text-slate-500">CAPEX</p>
                            <p className="text-sm font-medium text-white">
                              Rp {(result.financial.capex / 1_000_000).toFixed(1)} Jt
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Pengembalian</p>
                            <p className="text-sm font-medium text-white">
                              {result.financial.payback_years ? `${result.financial.payback_years.toFixed(1)} Thn` : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Penghematan/Bln</p>
                            <p className="text-sm font-medium text-emerald-400">
                              Rp {(result.financial.monthly_savings / 1_000_000).toFixed(1)} Jt
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Konfigurasi</p>
                            <p className="text-sm font-medium text-slate-300">
                              {scenario.solar_kwp}kWp / {scenario.battery_kwh}kWh / {scenario.ac_units}AC
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-800 flex justify-between items-center bg-slate-900/50 rounded-b-2xl">
              <p className="text-sm text-slate-500">
                {selectedIds.size} dari 3 skenario dipilih untuk perbandingan
              </p>
              <button
                onClick={() => {
                  const selected = scenarios.filter(s => selectedIds.has(s.id));
                  onCompare(selected);
                }}
                disabled={selectedIds.size < 2}
                className="px-6 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-xl hover:bg-slate-800 border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Bandingkan yang Dipilih
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </Portal>
  );
}
