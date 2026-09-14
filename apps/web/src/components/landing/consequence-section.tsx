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
            TRANSFORMASI FINANSIAL
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Lihat dampaknya sebelum Anda berinvestasi
          </h2>
          <p className="text-sm text-slate-600 font-normal leading-relaxed">
            Perbandingan penghematan nyata untuk profil Ruko komersial di Surabaya dengan tagihan awal Rp 4,5 Jt/bulan.
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
                  PERBANDINGAN SKENARIO
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300">
                  PENGURANGAN TAGIHAN -68,4%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tagihan Awal</span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-400 line-through">Rp 4,5 Jt</div>
                  <div className="text-xs text-slate-500 pt-1 font-medium">100% Suplai Jaringan PLN</div>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-300 space-y-1">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Rekomendasi</span>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-600">Rp 1,42 Jt</div>
                  <div className="text-xs text-emerald-700 pt-1 font-medium">Solar PV + Baterai Hybrid</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Penghematan Tahunan</span>
                <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">Rp 36,96 Jt</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Estimasi CAPEX</span>
                <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">Rp 101,5 Jt</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Periode Balik Modal</span>
                <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">3,8 Tahun</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Kemandirian dari Grid</span>
                <span className="text-sm font-extrabold text-emerald-600 mt-0.5 block">66,2%</span>
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
                PERUBAHAN BIAYA BULANAN
              </span>
              <h3 className="text-xl font-bold tracking-tight text-white">Horizon Reinvestasi Modal</h3>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-semibold">
                  <span>Kondisi Awal</span>
                  <span className="text-white font-bold">100% (Rp 4,5 Jt)</span>
                </div>
                <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-600 rounded-full w-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-semibold">
                  <span>Tagihan Bulanan Optimal</span>
                  <span className="text-emerald-400 font-bold">31,6% (Rp 1,42 Jt)</span>
                </div>
                <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[31.6%]" />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              💡 <span className="text-white font-bold">Catatan ESDM No. 2/2024:</span> Penghematan dihitung murni dari konsumsi mandiri dan baterai tanpa asumsi kredit ekspor kWh PLN.
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}