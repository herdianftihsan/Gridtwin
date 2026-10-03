'use client';

import React from 'react';
import { motion } from 'motion/react';

export function ConsequenceSection() {
  return (
    <section id="consequences" className="py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-sky-600">
            SEBELUM VS SESUDAH
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Transparansi hasil akhir
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
            Lihat persis apa yang Anda dapatkan. Bandingkan kondisi saat ini dengan proyeksi simulasi sebelum membuat komitmen investasi.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Before vs After Transform */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="lg:col-span-7 flex flex-col justify-between"
          >
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col h-full shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1/2 h-1 bg-slate-300" />
              <div className="absolute top-0 right-0 w-1/2 h-1 bg-emerald-500" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10 flex-1">
                {/* CURRENT */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Saat Ini (Baseline)</h3>
                    <div className="text-3xl font-black text-slate-400">Rp 4.500.000</div>
                    <div className="text-xs font-medium text-slate-500 mt-1">Tagihan per bulan</div>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      100% Ketergantungan Grid PLN
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      Tanpa Sistem Solar PV
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      Tanpa Cadangan Baterai
                    </li>
                  </ul>
                </div>

                {/* ARROW ON DESKTOP */}
                <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full border border-slate-200 items-center justify-center shadow-sm z-20">
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>

                {/* WITH GRIDTWIN */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-1">Skenario Optimal</h3>
                    <div className="text-3xl font-black text-emerald-600">Rp 1.420.000</div>
                    <div className="text-xs font-medium text-emerald-700 mt-1">Estimasi tagihan per bulan</div>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-sm font-medium text-slate-900">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                      Kemandirian Energi 68,4%
                    </li>
                    <li className="flex items-center gap-2 text-sm font-medium text-slate-900">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                      12 kWp Solar PV Terpasang
                    </li>
                    <li className="flex items-center gap-2 text-sm font-medium text-slate-900">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                      5 kWh Smart Battery
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Decision Recommendation Box */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Rekomendasi AI</h3>
                  <div className="text-lg font-bold text-white">Konfigurasi Seimbang</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-sm text-slate-300 leading-relaxed italic">
                    "GridTwin merekomendasikan konfigurasi ini karena memberikan keseimbangan terbaik antara capital expenditure (CAPEX) dan penghematan bulanan berdasarkan parameter simulasi bangunan Anda."
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase">CAPEX</span>
                    <div className="text-lg font-bold text-white">Rp 101,5 Jt</div>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase">Payback</span>
                    <div className="text-lg font-bold text-white">3,8 Tahun</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-800">
              <div className="text-xs text-slate-500 leading-relaxed">
                💡 <strong className="text-slate-300">Catatan ESDM No. 2/2024:</strong> Penghematan dihitung murni dari konsumsi mandiri dan baterai tanpa asumsi kredit ekspor kWh PLN.
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}