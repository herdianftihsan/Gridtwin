'use client';

import React from 'react';
import { motion } from 'motion/react';
import { WorkflowStep } from './types';

const STEPS: WorkflowStep[] = [
  {
    number: '01',
    title: 'Describe',
    description: 'Masukkan profil bangunan, lokasi, tagihan bulanan, dan batas anggaran investasi dalam empat langkah mudah.',
    iconName: 'describe',
  },
  {
    number: '02',
    title: 'Simulate',
    description: 'Engine matematis mengevaluasi kombinasi perangkat terhadap radiasi matahari lokal dan aturan ESDM No. 2/2024.',
    iconName: 'simulate',
  },
  {
    number: '03',
    title: 'Decide',
    description: 'Bandingkan kalkulasi finansial, estimasi payback, dan trade-off untuk mengambil keputusan investasi energi terbaik.',
    iconName: 'decide',
  },
];

export function HowItWorks() {
  return (
    <section id="workflow" className="py-20 sm:py-24 bg-white border-b border-slate-200 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-xl mx-auto space-y-3"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-sky-600">
            THE DECISION WORKFLOW
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            From context to decision in three steps
          </h2>
          <p className="text-sm text-slate-600 font-normal leading-relaxed">
            Kalkulasi deterministik dan AI domain energi menyajikan kejelasan hasil investasi secara transparan.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              whileHover={{ y: -6 }}
              className="p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all text-left space-y-4 group cursor-default"
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-slate-300 font-mono group-hover:text-sky-600 transition-colors">
                  {step.number}
                </span>
                <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 shadow-2xs font-bold text-sm">
                  {step.iconName === 'describe' ? '📝' : step.iconName === 'simulate' ? '⚙️' : '📊'}
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">{step.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}