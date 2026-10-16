'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { SimulationResult, Project, CreateDecisionShareResponse } from '../../types/api';
import { apiClient, ApiClientError } from '../../lib/api/api-client';

import { Portal } from '../ui/portal';
import { useDialogFocus } from '../ui/use-dialog-focus';

interface DecisionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  result: SimulationResult;
  scenarioId?: string;
  isDemo?: boolean;
}

type ShareState =
  | 'idle'
  | 'demo_notice'
  | 'confirm_create'
  | 'creating'
  | 'ready'
  | 'confirm_revoke'
  | 'revoking'
  | 'revoked'
  | 'error';

export function DecisionSummaryModal({
  isOpen,
  onClose,
  project,
  result,
  scenarioId,
  isDemo = false,
}: DecisionSummaryModalProps) {
  const dialogRef = useDialogFocus(isOpen, onClose);

  const [shareState, setShareState] = useState<ShareState>('idle');
  const [shareUrl, setShareUrl] = useState<string>('');
  const [activeShareId, setActiveShareId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check for any existing active share link when opening for real projects
  useEffect(() => {
    let isMounted = true;
    if (isOpen && !isDemo && project.id) {
      apiClient
        .get<{ id: string; expires_at: string; created_at: string; is_active: boolean } | null>(
          `/api/projects/${project.id}/shares/active`
        )
        .then((res) => {
          if (isMounted && res.data?.id) {
            setActiveShareId(res.data.id);
          }
        })
        .catch(() => {
          // Graceful ignore if no active share or offline
        });
    }

    if (!isOpen) {
      // Reset share state on modal close
      setShareState('idle');
      setIsCopied(false);
      setCopyError(null);
      setErrorMessage(null);
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, isDemo, project.id]);

  if (!isOpen) return null;

  const { configuration, baseline, financial, environmental, grid } = result;

  const formatMillions = (val: number): string => {
    return `Rp ${(val / 1_000_000).toFixed(2).replace(/\.00$/, '')}M`;
  };

  const handleShareClick = () => {
    if (isDemo) {
      setShareState('demo_notice');
      return;
    }
    setErrorMessage(null);
    setShareState('confirm_create');
  };

  const handleCreateShare = async () => {
    try {
      setShareState('creating');
      setErrorMessage(null);

      const res = await apiClient.post<CreateDecisionShareResponse>(
        `/api/projects/${project.id}/shares`,
        {
          ...(scenarioId ? { scenario_id: scenarioId } : {}),
        }
      );

      if (res.data) {
        setShareUrl(res.data.share_url);
        setActiveShareId(res.data.id);
        setShareState('ready');
      } else {
        throw new Error('Gagal mendapatkan tautan berbagi.');
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message || 'Gagal membuat tautan berbagi.');
      } else {
        setErrorMessage((err as Error).message || 'Terjadi kesalahan sistem.');
      }
      setShareState('error');
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    setCopyError(null);
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      } else {
        // Secure-context fallback: select the readonly input so user can Ctrl+C
        const input = document.getElementById('share-url-input') as HTMLInputElement;
        if (input) {
          input.select();
          // execCommand is deprecated but remains a last resort for non-secure contexts
          const succeeded = document.execCommand('copy');
          if (succeeded) {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2500);
          } else {
            setCopyError('Salin otomatis tidak didukung. Silakan sorot URL di atas dan salin secara manual.');
          }
        } else {
          setCopyError('Tidak dapat menyalin otomatis. Silakan sorot URL di atas dan salin secara manual.');
        }
      }
    } catch {
      // Clipboard API rejected (e.g. permissions denied in non-secure context)
      setCopyError('Izin clipboard ditolak. Silakan sorot URL di atas dan salin secara manual (Ctrl+C / Cmd+C).');
      setIsCopied(false);
    }
  };

  const handleRevokeShare = async () => {
    if (!activeShareId) return;
    try {
      setShareState('revoking');
      setErrorMessage(null);

      await apiClient.delete(`/api/projects/${project.id}/shares/${activeShareId}`);
      setShareState('revoked');
      setActiveShareId(null);
      setShareUrl('');
    } catch (err) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message || 'Gagal mencabut tautan berbagi.');
      } else {
        setErrorMessage((err as Error).message || 'Terjadi kesalahan saat mencabut tautan.');
      }
      setShareState('error');
    }
  };

  return (
    <Portal>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="decision-summary-title"
            ref={dialogRef}
            tabIndex={-1}
            className="relative w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden text-left flex flex-col max-h-[88vh] lg:max-h-[92vh]"
          >
            {/* Modal Header */}
            <div className="shrink-0 flex items-center justify-between px-6 sm:px-8 pt-7 pb-5 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
                  GRIDTWIN AI · ANALISIS INVESTASI
                </span>
                <h2 id="decision-summary-title" className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                  Ringkasan Keputusan
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup Ringkasan Keputusan"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 sm:py-6 space-y-6">
              {/* Section 1: Recommended Configuration Cards with Badges */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    KONFIGURASI YANG DISARANKAN
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                    DISARANKAN
                  </span>
                </div>

                {/* Asset Cards Strip */}
                <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 text-center gap-4 sm:gap-2">
                  {/* Solar PV */}
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center mb-1.5">
                      <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div className="text-sm font-bold text-slate-900">{configuration.pv_kwp} kWp</div>
                    <div className="text-xs text-slate-500 font-medium">Panel Surya</div>
                  </div>

                  <div className="w-4 h-[1px] bg-slate-200 hidden sm:block" />

                  {/* Battery Storage */}
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-lg bg-teal-100 border border-teal-200 flex items-center justify-center mb-1.5">
                      <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="text-sm font-bold text-slate-900">{configuration.battery_kwh} kWh</div>
                    <div className="text-xs text-slate-500 font-medium">Penyimpanan Baterai</div>
                  </div>

                  <div className="w-4 h-[1px] bg-slate-200 hidden sm:block" />

                  {/* Building Load */}
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-lg bg-slate-200 border border-slate-300 flex items-center justify-center mb-1.5">
                      <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="text-sm font-bold text-slate-900 truncate max-w-[90px]">Bangunan</div>
                    <div className="text-xs text-slate-500 font-medium truncate max-w-[100px]">{project.building_type}</div>
                  </div>

                  <div className="w-4 h-[1px] bg-slate-200 hidden sm:block" />

                  {/* PLN Grid Connection */}
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center mb-1.5">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </div>
                    <div className="text-sm font-bold text-slate-900">Jaringan Listrik</div>
                    <div className="text-xs text-slate-500 font-medium">Koneksi PLN</div>
                  </div>
                </div>
              </div>

              {/* Section 2: Financial Hero Dark Banner */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                    BIAYA LISTRIK BULANAN
                  </div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      {formatMillions(financial.new_monthly_cost)}
                    </span>
                    <span className="text-sm text-slate-400 font-medium">
                      {formatMillions(baseline.monthly_cost)} Baseline
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right space-y-1">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                    PENGHEMATAN TAHUNAN
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight">
                    {formatMillions(financial.monthly_savings * 12)}
                  </div>
                </div>
              </div>

              {/* Section 3: Financial Detail KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="text-xs text-slate-500 font-medium">Periode Pengembalian</div>
                  <div className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                    {financial.payback_years !== null ? `${financial.payback_years.toFixed(1)} Tahun` : 'N/A'}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="text-xs text-slate-500 font-medium">Total CAPEX</div>
                  <div className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                    {formatMillions(financial.capex)}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="text-xs text-slate-500 font-medium">ROI (Estimasi 10 Tahun)</div>
                  <div className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                    {financial.capex > 0
                      ? `${Math.round(((financial.monthly_savings * 12 * 10 - financial.capex) / financial.capex) * 100)}%`
                      : '—'}
                  </div>
                </div>
              </div>

              {/* Section 4: Environmental & Grid Impact Highlights */}
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  DAMPAK LINGKUNGAN & JARINGAN
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* CO2 Reduction Card */}
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">PENGURANGAN CO₂</div>
                      <div className="text-2xl font-bold text-emerald-600 tracking-tight">
                        {environmental.co2_reduction_pct.toFixed(0)}%
                      </div>
                      <div className="text-xs text-emerald-700">Kompensasi karbon tahunan</div>
                    </div>
                  </div>

                  {/* Grid Independence Card */}
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider">KEMANDIRIAN JARINGAN</div>
                      <div className="text-2xl font-bold text-amber-600 tracking-tight">
                        {grid.independence_pct.toFixed(0)}%
                      </div>
                      <div className="text-xs text-amber-700">Rasio swasembada</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 5: Regulatory & Trade-off Disclaimer */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-1">
                <div className="font-semibold text-slate-900">Asumsi Regulasi Utama (ESDM No. 2/2024):</div>
                <p className="text-xs text-slate-500">
                  Daya surplus surya tidak diekspor untuk kredit pengurangan tagihan. Penghematan finansial mewakili 100% konsumsi mandiri dan pemindahan beban puncak baterai.
                </p>
              </div>
            </div>

            {/* Share Panel — between header and scroll area so always visible after creation */}
            {shareState !== 'idle' && (
              <div className="shrink-0 border-b border-slate-100 px-4 sm:px-8 py-4 bg-white">
                {/* Demo Notice */}
                {shareState === 'demo_notice' && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">💡</span>
                      <div>
                        <h4 className="text-sm font-bold text-amber-900">Fitur Berbagi Memerlukan Akun</h4>
                        <p className="text-xs text-amber-800/90 leading-relaxed mt-1">
                          Sesi demo ini tidak terhubung ke database permanen. Silakan masuk atau daftar untuk menyimpan dan membagikan ringkasan keputusan proyek nyata Anda.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShareState('idle')}
                        className="px-3 py-1.5 rounded-lg border border-amber-300 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer"
                      >
                        Tutup
                      </button>
                      <Link
                        href="/login"
                        className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-xs font-semibold text-white transition-colors"
                      >
                        Masuk ke Akun
                      </Link>
                    </div>
                  </div>
                )}

                {/* Confirmation State */}
                {shareState === 'confirm_create' && (
                  <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400 shrink-0 font-bold text-sm">
                        ↗
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Bagikan Ringkasan Keputusan?</h4>
                        <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                          Tautan unik read-only akan dibuat. Siapa pun dengan tautan tersebut dapat melihat snapshot hasil analisis ini tanpa perlu login. Data sensitif seperti email pemilik tidak akan dibagikan.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setShareState('idle')}
                        className="px-3.5 py-1.5 rounded-lg border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateShare}
                        className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-xs font-bold text-white transition-colors cursor-pointer shadow-sm"
                      >
                        Buat Tautan Berbagi
                      </button>
                    </div>
                  </div>
                )}

                {/* Creating / Loading State */}
                {shareState === 'creating' && (
                  <div className="py-3 flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-slate-900 animate-spin shrink-0" />
                    <p className="text-xs font-semibold text-slate-700">Menyimpan snapshot dan membuat tautan publik...</p>
                  </div>
                )}

                {/* Ready State */}
                {shareState === 'ready' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                          Tautan Berbagi Aktif
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-700 font-medium">Masa aktif 30 hari</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        id="share-url-input"
                        type="text"
                        readOnly
                        value={shareUrl}
                        onFocus={(e) => e.target.select()}
                        className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-mono text-slate-900 selection:bg-emerald-200 outline-none truncate"
                        title={shareUrl}
                      />
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5 ${
                          isCopied
                            ? 'bg-emerald-700 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {isCopied ? '✓ Tersalin' : 'Salin Link'}
                      </button>
                    </div>

                    {/* Clipboard error: show manual-copy prompt */}
                    {copyError && (
                      <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 leading-relaxed">
                        {copyError}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-0.5 border-t border-emerald-200/60">
                      <span className="text-[11px] text-emerald-800">
                        Siapa saja dengan tautan ini dapat melihat ringkasan.
                      </span>
                      <button
                        type="button"
                        onClick={() => { setCopyError(null); setShareState('confirm_revoke'); }}
                        className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline cursor-pointer"
                      >
                        Cabut Akses Tautan
                      </button>
                    </div>
                  </div>
                )}

                {/* Confirm Revoke State */}
                {shareState === 'confirm_revoke' && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-2">
                    <div>
                      <h4 className="text-sm font-bold text-red-900">Cabut Akses Tautan Berbagi?</h4>
                      <p className="text-xs text-red-700 leading-relaxed mt-0.5">
                        Setelah dicabut, tautan ini akan langsung berhenti berfungsi dan tidak dapat diakses lagi.
                      </p>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-red-200">
                      <button
                        type="button"
                        onClick={() => setShareState('ready')}
                        className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleRevokeShare}
                        className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition-colors cursor-pointer shadow-sm"
                      >
                        Ya, Cabut Tautan Sekarang
                      </button>
                    </div>
                  </div>
                )}

                {/* Revoking Loading State */}
                {shareState === 'revoking' && (
                  <div className="py-3 flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-red-600 animate-spin shrink-0" />
                    <p className="text-xs font-semibold text-slate-700">Mencabut akses tautan...</p>
                  </div>
                )}

                {/* Revoked Notice */}
                {shareState === 'revoked' && (
                  <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-slate-900">✓ Tautan Berhasil Dicabut</span>
                      <p className="text-xs text-slate-500 mt-0.5">Tautan publik sebelumnya telah dihentikan.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCreateShare}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white transition-colors cursor-pointer shrink-0"
                    >
                      Buat Tautan Baru
                    </button>
                  </div>
                )}

                {/* Error State */}
                {shareState === 'error' && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between gap-2">
                    <span className="leading-relaxed">{errorMessage || 'Gagal memproses tautan berbagi.'}</span>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setShareState('idle')}
                        className="underline hover:text-red-900 cursor-pointer"
                      >
                        Tutup
                      </button>
                      <button
                        type="button"
                        onClick={() => { setErrorMessage(null); setShareState('confirm_create'); }}
                        className="font-bold underline hover:text-red-900 cursor-pointer"
                      >
                        Coba Lagi
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Modal Footer */}
            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-6 sm:px-8 py-5 border-t border-slate-100 bg-slate-50">
              <span className="text-xs text-slate-500 font-medium">Temukan Pemasang — Segera Hadir</span>
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleShareClick}
                  className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Bagikan Ringkasan
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </Portal>
  );
}
