'use client';

import React from 'react';
import { motion } from 'motion/react';

export function OutcomeHighlights() {
  return (
    <section id="product" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Kejelasan di setiap langkah keputusan
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            GridTwin menggabungkan data energi, keuangan, dan lingkungan untuk memberikan gambaran utuh tentang potensi bangunan Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          {/* Card 1: Large Visual Data Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="lg:col-span-8 rounded-3xl bg-slate-50 border border-slate-200 overflow-hidden group"
          >
            <div className="p-8 lg:p-10 h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Kejelasan Finansial</h3>
                <p className="mt-2 text-slate-600 text-lg">
                  Ketahui persis berapa CAPEX, penghematan tahunan, dan masa balik modal (payback period) sebelum Anda memutuskan.
                </p>
              </div>
              
              <div className="mt-10 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-end justify-between transition-transform group-hover:scale-[1.02]">
                <div className="space-y-4 w-full">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="text-slate-500 font-medium">Investasi Awal</span>
                    <span className="text-slate-900 font-bold">Rp 85.200.000</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="text-slate-500 font-medium">Penghematan / thn</span>
                    <span className="text-emerald-600 font-bold">+ Rp 20.350.000</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-500 font-medium">Balik Modal</span>
                    <span className="text-slate-900 font-bold">4.2 Tahun</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Environmental Impact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-4 rounded-3xl bg-slate-900 text-white border border-slate-800 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3.172 5.172a4 4 0 015.656 0L12 8.343l3.172-3.171a4 4 0 115.656 5.656L12 19.657l-8.828-8.829a4 4 0 010-5.656z" />
              </svg>
            </div>
            
            <div className="p-8 lg:p-10 h-full flex flex-col relative z-10">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold">Dampak Lingkungan</h3>
              <p className="mt-2 text-slate-400">
                Lacak langsung seberapa besar penurunan jejak karbon (CO₂) dari konfigurasi energi Anda.
              </p>
              
              <div className="mt-auto pt-8">
                <div className="text-4xl font-black text-emerald-400">-42.5%</div>
                <div className="text-sm text-slate-500 mt-1 font-medium uppercase tracking-widest">Reduksi CO₂ Tahunan</div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Energy Flow Visibility */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5 rounded-3xl bg-sky-50 border border-sky-100 overflow-hidden"
          >
            <div className="p-8 lg:p-10 h-full flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-sky-600 flex items-center justify-center mb-6 shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Visibilitas Energi</h3>
              <p className="mt-2 text-slate-600">
                Pahami persis dari mana energi Anda berasal, dan bagaimana energi tersebut dikonsumsi oleh bangunan Anda.
              </p>
            </div>
          </motion.div>

          {/* Card 4: Scenario Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-7 rounded-3xl bg-slate-50 border border-slate-200 overflow-hidden group"
          >
            <div className="p-8 lg:p-10 h-full flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Komparasi Skenario</h3>
                <p className="mt-2 text-slate-600">
                  Bandingkan beberapa konfigurasi secara instan sebelum mengambil komitmen jangka panjang.
                </p>
              </div>
              
              <div className="flex-1 w-full bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col gap-3 transition-transform group-hover:-translate-y-1">
                <div className="flex items-center justify-between p-2 rounded-lg bg-sky-50 border border-sky-100">
                  <div className="text-xs font-bold text-sky-900">Solar + Baterai</div>
                  <div className="text-xs font-bold text-sky-700">Skor: 92</div>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-xs font-medium text-slate-600">Hanya Solar</div>
                  <div className="text-xs font-medium text-slate-500">Skor: 78</div>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-xs font-medium text-slate-600">Baseline</div>
                  <div className="text-xs font-medium text-slate-500">Skor: 45</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
