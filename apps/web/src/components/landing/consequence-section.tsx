'use client';

import React from 'react';
import { motion } from 'motion/react';

export function ConsequenceSection() {
  return (
    <section id="consequences" className="py-20 sm:py-24 bg-[#F8FAFC] border-b border-slate-200 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.4 }}
          className="max-w-xl space-y-3"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            FINANCIAL TRANSFORMATION
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            See the consequences before you invest
          </h2>
          <p className="text-sm text-slate-600 font-normal leading-relaxed">
            Perbandingan penghematan nyata untuk profil Ruko komersial di Surabaya dengan tagihan awal Rp 4.5M/bulan.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.45 }}
            className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  SCENARIO COMPARISON
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300">
                  -68.4% BILL REDUCTION
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Baseline Monthly</span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-400 line-through">Rp 4.50M</div>
                  <div className="text-xs text-slate-500 pt-1 font-medium">100% Suplai Jaringan PLN</div>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-300 space-y-1">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Recommended</span>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-600">Rp 1.42M</div>
                  <div className="text-xs text-emerald-700 pt-1 font-medium">Solar PV + Baterai Hybrid</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Annual Savings</span>
                <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">Rp 36.96M</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Estimated CAPEX</span>
                <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">Rp 101.5M</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Payback Period</span>
                <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">3.8 Years</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Grid Autonomy</span>
                <span className="text-sm font-extrabold text-emerald-600 mt-0.5 block">66.2%</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-xl flex flex-col justify-between space-y-6"
          >
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                MONTHLY EXPENSE SHIFT
              </span>
              <h3 className="text-xl font-bold tracking-tight text-white">Capital Reinvestment Horizon</h3>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-semibold">
                  <span>Current Baseline</span>
                  <span className="text-white font-bold">100% (Rp 4.50M)</span>
                </div>
                <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-600 rounded-full w-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-semibold">
                  <span>Optimized Monthly Bill</span>
                  <span className="text-emerald-400 font-bold">31.6% (Rp 1.42M)</span>
                </div>
                <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[31.6%]" />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              💡 <span className="text-white font-bold">ESDM No. 2/2024 Notice:</span> Penghematan dihitung murni dari konsumsi mandiri dan baterai tanpa asumsi kredit ekspor kWh PLN.
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}