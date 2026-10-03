'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { useAuthStore } from '../../store/auth.store';

export function HeroSection() {
  const { session } = useAuthStore();
  const demoHref = '/demo';
  const setupHref = session ? '/dashboard' : '/login?next=/setup';

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white min-h-[75vh] lg:min-h-[85vh] flex flex-col justify-center pt-24 pb-20 lg:pt-32 lg:pb-28">
      {/* Full-bleed Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/landing/gridtwin-hero.webp"
          alt=""
          fill
          priority
          className="object-cover object-[70%_center] lg:object-[85%_center]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-slate-950/60 lg:bg-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/80 lg:bg-gradient-to-r lg:from-slate-950 lg:via-slate-950/80 lg:to-slate-950/10" />
      </div>

      {/* Cinematic technical background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_0%,rgba(14,165,233,0.15),transparent)] pointer-events-none z-0 lg:z-10 mix-blend-screen" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:64px_64px] opacity-20 pointer-events-none z-0 lg:z-10" />
      
      {/* Decorative Blueprint Lines */}
      <div className="hidden lg:block absolute left-[10%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-sky-500/20 to-transparent z-10" />
      <div className="hidden lg:block absolute right-[10%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-sky-500/20 to-transparent z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center text-left">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-8"
          >
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-sky-400 text-[11px] font-bold tracking-widest uppercase shadow-sm">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                Inteligensi Keputusan Energi
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05]">
                Simulasikan sebelum Anda berinvestasi.
              </h1>
            </div>

            <p className="text-lg sm:text-xl text-slate-400 font-medium leading-relaxed max-w-xl">
              Platform pendukung keputusan yang membantu pemilik bangunan memahami dan membandingkan skenario investasi energi. Modelkan Solar PV, baterai, dan efisiensi dalam hitungan detik.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto"
              >
                <Link
                  href={setupHref}
                  className="inline-flex items-center justify-center gap-3 w-full px-8 py-4 rounded-xl bg-white text-slate-950 font-bold text-sm hover:bg-slate-50 transition-all shadow-xl"
                >
                  <span>Mulai Simulasi</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto"
              >
                <Link
                  href={demoHref}
                  className="inline-flex items-center justify-center w-full px-8 py-4 rounded-xl border border-slate-800 bg-slate-900/50 text-white font-semibold text-sm hover:bg-slate-800 hover:border-slate-700 transition-all backdrop-blur-sm"
                >
                  Lihat Contoh Hasil
                </Link>
              </motion.div>
            </div>
            
            <div className="pt-4 flex items-center gap-6 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                Hitung CAPEX & Payback
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                Estimasi Emisi CO₂
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative"
          >
            {/* The Product Result Preview Window */}
            <div className="relative rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl">
              {/* Header Bar */}
              <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Rekomendasi GridTwin
                </div>
              </div>
              
              <div className="p-6 sm:p-8 space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Skenario Optimasi Terpadu</h3>
                    <p className="text-sm text-slate-400 mt-1">Gedung Komersial • 1.200 m²</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Investasi (CAPEX)</div>
                    <div className="text-2xl font-black text-white">Rp 85,2 Jt</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Balik Modal</div>
                    <div className="text-2xl font-black text-white">4.2 Tahun</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Penghematan / thn</div>
                    <div className="text-2xl font-black text-emerald-400">Rp 20,3 Jt</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Reduksi CO₂</div>
                    <div className="text-2xl font-black text-emerald-400">42.5%</div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-800">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold">12 kWp Solar PV</span>
                    <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold">5 kWh Baterai</span>
                    <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold">Efisiensi HVAC</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements behind the window */}
            <div className="absolute -z-10 -bottom-8 -right-8 w-64 h-64 bg-sky-600/20 blur-3xl rounded-full" />
            <div className="absolute -z-10 -top-8 -left-8 w-48 h-48 bg-emerald-600/10 blur-3xl rounded-full" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}