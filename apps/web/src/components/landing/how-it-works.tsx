'use client';

import React from 'react';
import { motion } from 'motion/react';
export function HowItWorks() {
  return (
    <section id="workflow" className="py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-600 mb-4 block">
            ALUR KERJA
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Bagaimana GridTwin bekerja
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Kalkulasi deterministik dan model AI membantu Anda menemukan solusi energi terbaik untuk bangunan Anda dalam tiga langkah sederhana.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* STEP 1 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group"
          >
            <div className="p-8 pb-0">
              <span className="text-4xl font-black text-slate-200 block mb-4">01</span>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">Jelaskan</h3>
              <p className="text-slate-600">Berikan informasi dasar tentang bangunan, lokasi, dan konsumsi energi Anda saat ini.</p>
            </div>
            <div className="mt-8 p-6 bg-slate-100 flex-1 relative overflow-hidden flex items-end justify-center">
              <div className="w-full max-w-[240px] bg-white rounded-xl shadow-md border border-slate-200 p-4 transform translate-y-4 group-hover:translate-y-2 transition-transform">
                <div className="h-2 w-16 bg-slate-200 rounded-full mb-3" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <div className="h-2 w-24 bg-slate-300 rounded-full" />
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    <div className="h-2 w-20 bg-slate-300 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* STEP 2 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col bg-slate-900 rounded-3xl border border-slate-800 shadow-md overflow-hidden group text-white"
          >
            <div className="p-8 pb-0">
              <span className="text-4xl font-black text-slate-700 block mb-4">02</span>
              <h3 className="text-xl font-bold tracking-tight mb-2">Simulasikan</h3>
              <p className="text-slate-400">GridTwin secara otomatis mengevaluasi ribuan kemungkinan konfigurasi sistem energi.</p>
            </div>
            <div className="mt-8 p-6 bg-slate-950 flex-1 relative overflow-hidden flex items-center justify-center">
              <div className="w-full max-w-[240px] relative">
                {/* Simulated processing visual */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-sky-500/20 blur-2xl rounded-full" />
                <div className="relative bg-slate-900 rounded-xl shadow-xl border border-slate-800 p-4 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full border-2 border-sky-500 border-t-transparent animate-spin mb-4" />
                  <div className="text-xs font-mono text-sky-400">Optimizing sizing...</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">Calculating hourly yields</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* STEP 3 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group"
          >
            <div className="p-8 pb-0">
              <span className="text-4xl font-black text-slate-200 block mb-4">03</span>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">Putuskan</h3>
              <p className="text-slate-600">Bandingkan biaya, penghematan, payback period, dan dampak lingkungan secara transparan.</p>
            </div>
            <div className="mt-8 p-6 bg-slate-100 flex-1 relative overflow-hidden flex items-end justify-center">
              <div className="w-full max-w-[240px] bg-white rounded-xl shadow-md border border-slate-200 p-4 transform translate-y-4 group-hover:translate-y-2 transition-transform">
                <div className="flex justify-between items-end mb-3">
                  <div className="h-10 w-8 bg-sky-100 rounded-t-sm" />
                  <div className="h-16 w-8 bg-sky-200 rounded-t-sm" />
                  <div className="h-24 w-8 bg-sky-400 rounded-t-sm" />
                  <div className="h-20 w-8 bg-emerald-400 rounded-t-sm relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full border-2 border-emerald-500" />
                  </div>
                </div>
                <div className="h-px w-full bg-slate-200 mt-1 mb-2" />
                <div className="flex justify-between">
                  <div className="h-2 w-6 bg-slate-200 rounded" />
                  <div className="h-2 w-6 bg-slate-200 rounded" />
                  <div className="h-2 w-6 bg-slate-200 rounded" />
                  <div className="h-2 w-6 bg-slate-200 rounded" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}