'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ProductPrinciple } from './types';

const PRINCIPLES: ProductPrinciple[] = [
  {
    title: 'Deterministic Simulation',
    description: 'Pemodelan matematis murni berdasarkan rumus fisika energi yang terpisah penuh dari generasi teks AI.',
    iconType: 'math',
  },
  {
    title: 'Transparent Assumptions',
    description: 'Mengacu pada tarif resmi ESDM, data radiasi Global Solar Atlas, dan faktor efisiensi baterai realistis.',
    iconType: 'shield',
  },
  {
    title: 'Financial & Energy Trade-offs',
    description: 'Evaluasi jujur terhadap batasan non-ekspor Permen ESDM No. 2/2024 guna memaksimalkan konsumsi mandiri.',
    iconType: 'balance',
  },
  {
    title: 'Explainable Decision AI',
    description: 'Analisis AI kontekstual yang menjabarkan alasan pemilihan konfigurasi tanpa mengubah angka simulasi.',
    iconType: 'ai',
  },
];

export function PrinciplesSection() {
  return (
    <section id="principles" className="py-20 sm:py-24 bg-[#F8FAFC] border-b border-slate-200 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-xl mx-auto space-y-3"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
            ENGINEERING CREDIBILITY
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Engineering-grade intelligence
          </h2>
          <p className="text-sm text-slate-600 font-normal leading-relaxed">
            Dirancang bagi pemilik gedung dan pengambil keputusan yang membutuhkan kalkulasi finansial terverifikasi.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRINCIPLES.map((p, idx) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              whileHover={{ y: -6 }}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all space-y-3 cursor-default"
            >
              <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-lg font-bold">
                {p.iconType === 'math' ? '∑' : p.iconType === 'shield' ? '🛡️' : p.iconType === 'balance' ? '⚖️' : '✦'}
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">{p.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{p.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}