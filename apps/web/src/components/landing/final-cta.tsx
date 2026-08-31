'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';

export function FinalCTA() {
  return (
    <section className="py-24 bg-slate-950 text-white text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_120%,rgba(14,165,233,0.15),transparent)] pointer-events-none" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Know the outcome before you commit.
        </h2>
        <p className="text-base sm:text-lg text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed">
          Simulate solar PV, battery storage, and efficiency upgrades for your building in minutes.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/setup"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-slate-950 font-bold text-sm hover:bg-slate-100 transition-all shadow-lg cursor-pointer"
            >
              <span>Start Project</span>
              <span className="text-slate-400">→</span>
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/demo"
              className="inline-flex items-center px-8 py-3.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-all cursor-pointer"
            >
              Explore Demo Project
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}