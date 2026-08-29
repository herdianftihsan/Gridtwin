'use client';

import React from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import {
  leftPanelVariants,
  rightPanelVariants,
  leftItemVariants,
} from './auth-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
  backgroundImage: string;
  imageAlt?: string;
  quote?: string;
  subquote?: string;
  telemetry?: {
    status?: string;
    generation?: string;
    consumption?: string;
    monthlyCost?: string;
    newMonthlyCost?: string;
    payback?: string;
    co2Reduction?: string;
  };
}

export function AuthLayout({
  children,
  backgroundImage,
  imageAlt = 'GridTwin solar building infrastructure',
  quote = 'Make the energy decision before you make the investment.',
  subquote = 'Model configurations, compare trade-offs, and understand the outcome before spending.',
  telemetry,
}: AuthLayoutProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#FFFFFF] overflow-x-hidden">
      <motion.div
        variants={shouldReduceMotion ? undefined : leftPanelVariants}
        initial="initial"
        animate="animate"
        className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden select-none bg-slate-950"
      >
        <motion.div
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={backgroundImage}
            alt={imageAlt}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 0vw"
            className="object-cover object-center"
          />
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/50 pointer-events-none" />
        <div className="absolute inset-0 bg-sky-950/20 mix-blend-multiply pointer-events-none" />

        {/* Header Brand */}
        <motion.div
          variants={shouldReduceMotion ? undefined : leftItemVariants}
          className="relative z-10 flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
            <svg
              className="w-5 h-5 text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <span className="text-xl font-bold text-white tracking-tight drop-shadow-md">
            GridTwin AI
          </span>
        </motion.div>

        {telemetry && (
          <motion.div
            variants={shouldReduceMotion ? undefined : leftItemVariants}
            className="relative z-10 my-auto max-w-md space-y-4"
          >
            <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-slate-900/85 border border-sky-400/30 backdrop-blur-md text-[11px] font-mono text-sky-200 shadow-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>STATUS: {telemetry.status || 'ONLINE'}</span>
              <span className="text-slate-500">|</span>
              <span>GEN: {telemetry.generation || '45.8 kW'}</span>
              <span className="text-slate-500">|</span>
              <span>LOAD: {telemetry.consumption || '21.3 kW'}</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/75 border border-slate-700/60 backdrop-blur-xl shadow-2xl space-y-3">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Monthly Cost Impact</span>
                <span className="text-emerald-400 font-semibold font-mono">-68.4%</span>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {telemetry.monthlyCost || 'Rp 4.500.000'}{' '}
                <span className="text-slate-400 text-sm font-normal">→</span>{' '}
                <span className="text-emerald-400">
                  {telemetry.newMonthlyCost || 'Rp 1.420.000'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-700/50 text-[11px] text-slate-300">
                <div>
                  Payback: <span className="text-white font-medium">{telemetry.payback || '3.8 Years'}</span>
                </div>
                <div>
                  CO₂ Cut: <span className="text-emerald-400 font-medium">{telemetry.co2Reduction || '-42.5%'}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quote Bottom */}
        <motion.div
          variants={shouldReduceMotion ? undefined : leftItemVariants}
          className="relative z-10 max-w-lg space-y-2.5"
        >
          <h1 className="text-3xl font-semibold text-white leading-tight tracking-tight drop-shadow-md">
            {quote}
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed drop-shadow">
            {subquote}
          </p>
        </motion.div>
      </motion.div>

      <motion.div
        variants={shouldReduceMotion ? undefined : rightPanelVariants}
        initial="initial"
        animate="animate"
        className="flex items-center justify-center p-6 sm:p-12 md:p-16"
      >
        <div className="w-full max-w-[420px] space-y-8">
          {children}
        </div>
      </motion.div>
    </main>
  );
}