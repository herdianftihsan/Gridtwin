'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ProductPrinciple } from './types';

const PRINCIPLES: ProductPrinciple[] = [
  {
    title: 'Baseline Energi',
    description: 'Profil tagihan listrik rata-rata, luas bangunan, dan jam operasional.',
    iconType: 'math',
  },
  {
    title: 'Potensi Solar',
    description: 'Radiasi matahari lokasi (Global Solar Atlas) dan batas luas atap yang tersedia.',
    iconType: 'shield',
  },
  {
    title: 'Tarif Listrik',
    description: 'Mengacu pada golongan tarif resmi ESDM terbaru tanpa subsidi berlebih.',
    iconType: 'balance',
  },
  {
    title: 'Faktor Efisiensi',
    description: 'Kalkulasi Performance Ratio sistem PV dan batas Depth of Discharge (DoD) baterai.',
    iconType: 'ai',
  },
];

export function PrinciplesSection() {
  return (
    <section id="methodology" className="py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
            METODOLOGI & KEPERCAYAAN
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Bagaimana GridTwin menghitung hasil?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
            Hasil simulasi GridTwin bergantung pada kombinasi parameter teknis dan asumsi pasar yang digunakan.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRINCIPLES.map((p, idx) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -4 }}
                className="p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm hover:border-slate-300 transition-all space-y-4"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700">
                  {p.iconType === 'math' ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  ) : p.iconType === 'shield' ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  ) : p.iconType === 'balance' ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">{p.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">{p.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-sky-50 border border-sky-100"
          >
            <div className="flex items-start sm:items-center gap-3">
              <span className="text-xl">💡</span>
              <p className="text-sm text-slate-700">
                <strong className="text-slate-900">Catatan Penting:</strong> Hasil simulasi merupakan estimasi berdasarkan parameter dan asumsi yang digunakan. Kondisi aktual dapat berbeda.
              </p>
            </div>
            <button className="whitespace-nowrap px-4 py-2 bg-white border border-slate-200 shadow-sm text-sm font-semibold text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
              Lihat detail asumsi →
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}