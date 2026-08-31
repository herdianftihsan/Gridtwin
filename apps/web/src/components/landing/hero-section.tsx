'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white pt-20 pb-24 lg:pt-28 lg:pb-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(14,165,233,0.18),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b25_1px,transparent_1px),linear-gradient(to_bottom,#1e293b25_1px,transparent_1px)] bg-[size:32px_32px] opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6"
          >

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Simulate the decision before you make the investment.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-xl">
              Model rooftop solar, battery storage, and efficiency upgrades. Compare trade-offs, verify payback timelines, and eliminate decision paralysis before committing capital.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <motion.div
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Link
                  href="/setup"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-950 font-bold text-sm hover:bg-slate-100 transition-all shadow-md cursor-pointer"
                >
                  <span>Start Project</span>
                  <span className="text-slate-400 font-bold">→</span>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Link
                  href="/demo"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 hover:border-slate-600 transition-all cursor-pointer shadow-xs"
                >
                  <span>Explore Demo Project</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -5 }}
            className="lg:col-span-5 p-6 sm:p-7 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-md space-y-6 transition-all"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  COMMERCIAL RUKO · SURABAYA
                </span>
                <div className="text-base font-bold text-white mt-1">Optimum Microgrid Scenario</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-400 uppercase">Monthly Bill</div>
                <div className="text-lg font-black text-emerald-400">Rp 1.42M</div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-950 border border-slate-800/90 p-5">
              <div className="flex items-start justify-between">
                {/* Node 1: PV */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-amber-500/60 flex items-center justify-center text-amber-400 font-extrabold text-xs shadow-md">
                    PV
                  </div>
                  <span className="text-xs font-bold text-slate-200">4 kWp</span>
                </div>

                <div className="flex-1 h-12 flex items-center px-2">
                  <div className="w-full border-t-2 border-dashed border-amber-500/80 relative flex items-center justify-center">
                    <span className="absolute -right-1 text-amber-400 text-[10px] leading-none">▶</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border-2 border-slate-500 flex items-center justify-center text-white font-extrabold text-xs shadow-xl">
                    LOAD
                  </div>
                  <span className="text-xs font-bold text-slate-100">2,796 kWh</span>
                </div>

                <div className="flex-1 h-12 flex items-center px-2">
                  <div className="w-full border-t-2 border-dashed border-teal-500/80 relative flex items-center justify-center">
                    <span className="absolute -right-1 text-teal-400 text-[10px] leading-none">▶</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-teal-500/60 flex items-center justify-center text-teal-400 font-extrabold text-xs shadow-md">
                    BAT
                  </div>
                  <span className="text-xs font-bold text-slate-200">5 kWh</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-1 text-center">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 uppercase font-semibold block">Payback</span>
                <span className="text-sm font-extrabold text-white mt-0.5 block">3.8 Yrs</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 uppercase font-semibold block">CAPEX</span>
                <span className="text-sm font-extrabold text-white mt-0.5 block">Rp 101.5M</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 uppercase font-semibold block">CO₂ Cut</span>
                <span className="text-sm font-extrabold text-emerald-400 mt-0.5 block">-68.4%</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}