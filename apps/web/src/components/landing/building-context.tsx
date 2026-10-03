'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';

export function BuildingContext() {
  return (
    <section id="context" className="py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="relative h-[300px] sm:h-[400px] lg:h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-200"
          >
            <Image 
              src="/images/landing/gridtwin-building.webp"
              alt="Commercial building with rooftop solar installation in an urban environment"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-slate-900/10 rounded-3xl pointer-events-none" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6 lg:pl-4"
          >
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-sky-600 block">
                KONTEKS NYATA
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Mulai dari kondisi nyata bangunan Anda.
              </h2>
            </div>
            
            <p className="text-lg text-slate-600 leading-relaxed">
              Solusi energi tidak ada yang one-size-fits-all. GridTwin menyesuaikan setiap simulasi dengan struktur bangunan unik Anda, data penyinaran lokal, dan pola operasional harian.
            </p>

            <ul className="space-y-4 pt-4">
              <li className="flex items-start gap-3">
                <div className="mt-1 w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Spesifikasi Atap Terukur</h4>
                  <p className="text-sm text-slate-600 mt-0.5">Analisis kapasitas tampung optimal untuk panel surya.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Radiasi Matahari Lokal</h4>
                  <p className="text-sm text-slate-600 mt-0.5">Berbasis data cuaca spesifik di koordinat lokasi Anda.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Profil Beban Eksisting</h4>
                  <p className="text-sm text-slate-600 mt-0.5">Menyelaraskan produksi dengan tagihan bulanan nyata.</p>
                </div>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
