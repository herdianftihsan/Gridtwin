'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { WhatIfScenarioExample } from './types';

const EXAMPLES: WhatIfScenarioExample[] = [
  {
    id: 'battery-5kwh',
    query: 'What if I add 5 kWh battery?',
    solarKwp: 4,
    batteryKwh: 5,
    monthlyBill: 'Rp 1.42M',
    paybackYears: '3.8 yrs',
    gridIndependence: '66.2%',
    independenceDelta: '+51.7%',
    tradeoffText: 'Penambahan baterai 5 kWh meningkatkan kemandirian listrik malam hari, namun meningkatkan CAPEX awal dan memperpanjang masa payback modal.',
  },
  {
    id: 'budget-30m',
    query: 'What if budget is Rp30M?',
    solarKwp: 2,
    batteryKwh: 0,
    monthlyBill: 'Rp 3.10M',
    paybackYears: '2.9 yrs',
    gridIndependence: '28.0%',
    independenceDelta: '+28.0%',
    tradeoffText: 'Sistem mengutamakan payback modal cepat dengan kapasitas solar PV lebih kecil tanpa baterai agar pengeluaran berada di bawah budget Rp 30 Juta.',
  },
  {
    id: 'solar-6kwp',
    query: 'What if increase solar to 6 kWp?',
    solarKwp: 6,
    batteryKwh: 0,
    monthlyBill: 'Rp 2.65M',
    paybackYears: '4.8 yrs',
    gridIndependence: '42.5%',
    independenceDelta: '+42.5%',
    tradeoffText: 'Produksi siang hari meningkat, namun surplus listrik tengah hari tidak menghasilkan kompensasi tagihan jika tidak diserap beban pendingin gedung.',
  },
];

const FALLBACK_EXAMPLE: WhatIfScenarioExample = EXAMPLES[0]!;

export function WhatIfShowcase() {
  const [selectedId, setSelectedId] = useState<string>('battery-5kwh');
  const activeExample: WhatIfScenarioExample =
    EXAMPLES.find((e) => e.id === selectedId) ?? FALLBACK_EXAMPLE;

  return (
    <section id="scenarios" className="py-20 sm:py-24 bg-white border-b border-slate-200 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.4 }}
          className="max-w-xl space-y-3"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-sky-600">
            SCENARIO EXPLORATION
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Interactive scenarios & What-if exploration
          </h2>
          <p className="text-sm text-slate-600 font-normal leading-relaxed">
            Eksplorasi keputusan alternatif secara fleksibel tanpa kehilangan konteks data awal.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              SAMPLE SCENARIO QUERIES
            </span>
            {EXAMPLES.map((ex) => (
              <motion.button
                key={ex.id}
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedId(ex.id)}
                className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  ex.id === selectedId
                    ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-500/20 shadow-md'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="text-sm font-bold text-slate-900">{ex.query}</div>
                <div className="text-xs text-slate-500 mt-1 font-medium">
                  {ex.solarKwp} kWp Solar · {ex.batteryKwh} kWh Battery
                </div>
              </motion.button>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            whileHover={{ y: -4 }}
            className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-md space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  SIMULATED OUTCOME
                </span>
                <div className="text-base font-extrabold text-slate-900 mt-0.5">
                  &quot;{activeExample.query}&quot;
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-950 text-white">
                Verified Scenario
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-xs text-slate-400 font-semibold block">Monthly Bill</span>
                <span className="text-base font-extrabold text-slate-900 mt-0.5 block">{activeExample.monthlyBill}</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-xs text-slate-400 font-semibold block">Payback</span>
                <span className="text-base font-extrabold text-slate-900 mt-0.5 block">{activeExample.paybackYears}</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-xs text-slate-400 font-semibold block">Autonomy</span>
                <span className="text-base font-extrabold text-emerald-600 mt-0.5 block">{activeExample.gridIndependence}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-sky-950 flex items-center gap-1.5">
                <span>⚖️</span>
                <span>KEY TRADE-OFF</span>
              </div>
              <p className="text-xs text-sky-900 leading-relaxed font-normal">
                {activeExample.tradeoffText}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}