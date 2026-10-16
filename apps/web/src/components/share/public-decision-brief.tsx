'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient, ApiClientError } from '../../lib/api/api-client';
import type { PublicDecisionShareResponse } from '../../types/api';

interface PublicDecisionBriefProps {
  token: string;
}

type ViewState = 'loading' | 'success' | 'revoked' | 'expired' | 'not_found' | 'error';

export function PublicDecisionBrief({ token }: PublicDecisionBriefProps) {
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [shareData, setShareData] = useState<PublicDecisionShareResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    async function fetchShareSnapshot() {
      try {
        setViewState('loading');
        // token: null ensures no authorization header is transmitted
        const res = await apiClient.get<PublicDecisionShareResponse>(`/api/shares/${token}`, {
          token: null,
        });

        if (isMounted && res.data) {
          setShareData(res.data);
          setViewState('success');
        }
      } catch (err) {
        if (!isMounted) return;

        if (err instanceof ApiClientError) {
          const reason = err.details?.reason;
          if (reason === 'revoked' || err.message.toLowerCase().includes('dicabut')) {
            setViewState('revoked');
          } else if (reason === 'expired' || err.message.toLowerCase().includes('kedaluwarsa')) {
            setViewState('expired');
          } else if (err.statusCode === 404) {
            setViewState('not_found');
          } else {
            setErrorMessage(err.message || 'Gagal memuat ringkasan keputusan.');
            setViewState('error');
          }
        } else {
          setErrorMessage((err as Error).message || 'Terjadi kesalahan jaringan.');
          setViewState('error');
        }
      }
    }

    if (token) {
      fetchShareSnapshot();
    } else {
      setViewState('not_found');
    }

    return () => {
      isMounted = false;
    };
  }, [token]);

  const formatMillions = (val: number): string => {
    return `Rp ${(val / 1_000_000).toFixed(2).replace(/\.00$/, '')}M`;
  };

  const formatDate = (dateStr: string): string => {
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  // 1. Loading State
  if (viewState === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-3 border-slate-200 border-t-slate-900 animate-spin mx-auto" />
          <div>
            <h2 className="text-base font-bold text-slate-900">Memuat Ringkasan Keputusan</h2>
            <p className="text-xs text-slate-500 mt-1">Mengambil snapshot terverifikasi dari GridTwin...</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Revoked State
  if (viewState === 'revoked') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 max-w-lg w-full text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto text-2xl">
            ⊘
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
              Akses Dicabut
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">Tautan Berbagi Telah Dicabut</h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Pemilik proyek telah mencabut akses ke ringkasan keputusan ini. Snapshot publik tidak lagi dapat diakses.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white transition-all shadow-sm"
            >
              Kunjungi GridTwin AI
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Expired State
  if (viewState === 'expired') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 max-w-lg w-full text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center mx-auto text-2xl">
            ⏱
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
              Kedaluwarsa
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">Masa Berlaku Tautan Telah Habis</h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Tautan ringkasan keputusan ini telah melewati batas waktu masa aktif (30 hari). Silakan hubungi pemilik proyek untuk memperbarui tautan berbagi.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white transition-all shadow-sm"
            >
              Kunjungi GridTwin AI
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Not Found / Error State
  if (viewState === 'not_found' || viewState === 'error' || !shareData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 max-w-lg w-full text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto text-2xl">
            ✕
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Ringkasan Tidak Ditemukan</h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              {errorMessage ||
                'Tautan ringkasan keputusan yang Anda tuju tidak valid atau tidak ditemukan. Periksa kembali tautan yang dibagikan kepada Anda.'}
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white transition-all shadow-sm"
            >
              Ke Halaman Utama GridTwin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { snapshot, created_at, expires_at } = shareData;
  const { project, scenario, configuration, baseline, financial, environmental, grid, assumptions, disclaimer } = snapshot;

  return (
    <div className="min-h-screen bg-slate-100/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation & Brand Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              GT
            </div>
            <div>
              <span className="text-xs font-bold tracking-tight text-slate-900">GridTwin AI</span>
              <span className="text-[11px] text-slate-400 font-medium ml-2">Brief Keputusan Investasi</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-full shadow-2xs">
              Read-Only Snapshot
            </span>
            <span className="text-[10px] text-slate-500">
              Diterbitkan: {formatDate(created_at)}
            </span>
          </div>
        </div>

        {/* Main Document Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden text-left">
          {/* Document Title Banner */}
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-gradient-to-b from-white to-slate-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-lg">
                    {scenario.is_recommended ? 'Rekomendasi Optimal' : scenario.name}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    · Berlaku hingga {formatDate(expires_at)}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Ringkasan Keputusan Investasi Energi
                </h1>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {project.building_type} · {project.location}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* 1. Recommended Asset Configuration */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Konfigurasi Aset Energi
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center gap-4">
                {/* Solar PV */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center mb-1.5">
                    <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="text-base font-extrabold text-slate-900">{configuration.pv_kwp} kWp</div>
                  <div className="text-xs text-slate-500 font-medium">Panel Surya</div>
                </div>

                {/* Battery Storage */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center mb-1.5">
                    <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="text-base font-extrabold text-slate-900">{configuration.battery_kwh} kWh</div>
                  <div className="text-xs text-slate-500 font-medium">Penyimpanan Baterai</div>
                </div>

                {/* Building Load */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 border border-slate-300 flex items-center justify-center mb-1.5">
                    <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="text-base font-extrabold text-slate-900">{project.building_type}</div>
                  <div className="text-xs text-slate-500 font-medium">Beban Bangunan</div>
                </div>

                {/* Grid Connection */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center mb-1.5">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>
                  <div className="text-base font-extrabold text-slate-900">Koneksi PLN</div>
                  <div className="text-xs text-slate-500 font-medium">Jaringan Listrik</div>
                </div>
              </div>

              {/* Efficiency Devices Note */}
              {(configuration.ac_units > 0 || configuration.led_upgraded || configuration.refrigerator_units > 0 || configuration.water_pump_upgraded) && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {configuration.ac_units > 0 && (
                    <span className="text-xs font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                      ✦ {configuration.ac_units} AC Inverter
                    </span>
                  )}
                  {configuration.led_upgraded && (
                    <span className="text-xs font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                      ✦ Smart LED Efisien
                    </span>
                  )}
                  {configuration.refrigerator_units > 0 && (
                    <span className="text-xs font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                      ✦ {configuration.refrigerator_units} Kulkas Inverter
                    </span>
                  )}
                  {configuration.water_pump_upgraded && (
                    <span className="text-xs font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                      ✦ Pompa Air Variable-Speed
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* 2. Financial Hero Banner */}
            <div className="p-6 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  ESTIMASI BIAYA LISTRIK BULANAN
                </div>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                    {formatMillions(financial.new_monthly_cost)}
                  </span>
                  <span className="text-sm text-slate-400 font-medium">
                    dari {formatMillions(baseline.monthly_cost)} Baseline
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right space-y-1">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  PENGHEMATAN TAHUNAN
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight">
                  {formatMillions(financial.annual_savings)}
                </div>
              </div>
            </div>

            {/* 3. Financial Metrics KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50">
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  Periode Pengembalian
                </div>
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">
                  {financial.payback_years !== null ? `${financial.payback_years.toFixed(1)} Tahun` : '—'}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-medium">Estimasi balik modal modal awal</div>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50">
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  Total Estimasi CAPEX
                </div>
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">
                  {formatMillions(financial.capex)}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-medium">Investasi sistem & perangkat</div>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50">
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  Estimasi ROI (10 Tahun)
                </div>
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">
                  {financial.estimated_roi_10yr_pct !== null ? `${financial.estimated_roi_10yr_pct}%` : '—'}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-medium">Net return atas modal investasi</div>
              </div>
            </div>

            {/* 4. Environmental & Grid Impact Highlights */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Dampak Lingkungan & Kemandirian Energi
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* CO2 Reduction Card */}
                <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">PENGURANGAN CO₂</div>
                    <div className="text-2xl font-extrabold text-emerald-600 tracking-tight mt-0.5">
                      {environmental.co2_reduction_pct.toFixed(0)}%
                    </div>
                    <div className="text-xs text-emerald-700 font-medium">
                      {(environmental.co2_reduction_kg_yr / 1000).toFixed(1)} ton CO₂e kompensasi per tahun
                    </div>
                  </div>
                </div>

                {/* Grid Independence Card */}
                <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">KEMANDIRIAN JARINGAN</div>
                    <div className="text-2xl font-extrabold text-amber-600 tracking-tight mt-0.5">
                      {grid.independence_pct.toFixed(0)}%
                    </div>
                    <div className="text-xs text-amber-700 font-medium">Rasio konsumsi mandiri terbarukan</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Key Simulation Assumptions */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Parameter & Asumsi Pemodelan
              </span>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <div className="text-slate-400 font-medium">Tarif Listrik PLN</div>
                    <div className="font-bold text-slate-800 mt-0.5">Rp {assumptions.tariff.toLocaleString('id-ID')}/kWh</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium">Penyinaran (PSH)</div>
                    <div className="font-bold text-slate-800 mt-0.5">{assumptions.psh} Jam/hari</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium">Performance Ratio</div>
                    <div className="font-bold text-slate-800 mt-0.5">{Math.round(assumptions.performance_ratio * 100)}%</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium">Versi Model</div>
                    <div className="font-bold text-slate-800 mt-0.5">{assumptions.source_version}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Regulatory Disclaimer */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5 leading-relaxed">
              <div className="font-bold text-slate-800">Catatan Regulasi ESDM No. 2/2024:</div>
              <p className="text-xs text-slate-500">
                {disclaimer}
              </p>
            </div>
          </div>

          {/* Footer Branding & Disclaimer */}
          <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 text-center sm:text-left">
              Dihasilkan secara aman via <span className="font-bold text-slate-800">GridTwin AI</span>.
              <br />
              Dokumen snapshot bersifat read-only dan dilindungi secara kriptografis.
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
            >
              Simulasikan Bangunan Anda Sendiri →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
