'use client';

import React from 'react';
import { SimulationResult } from '../../../types/api';

export function WhatIfTradeoff({
  currentResult,
  whatIfResult,
}: {
  currentResult: SimulationResult;
  whatIfResult: SimulationResult;
}) {
  const curBat = currentResult.configuration.battery_kwh;
  const nextBat = whatIfResult.configuration.battery_kwh;
  const curPv = currentResult.configuration.pv_kwp;
  const nextPv = whatIfResult.configuration.pv_kwp;

  // Construct grounded trade-off narrative derived purely from verified backend changes
  let narrative = 'Mengeksplorasi konfigurasi sistem alternatif menyeimbangkan investasi awal terhadap penghematan energi jangka panjang.';
  if (nextBat > curBat) {
    narrative = `Menambahkan penyimpanan baterai sebesar ${nextBat - curBat} kWh meningkatkan otonomi jaringan dan pergeseran beban puncak, tetapi meningkatkan CAPEX awal dan memperpanjang masa pengembalian.`;
  } else if (nextPv > curPv) {
    narrative = `Meningkatkan Panel Surya menjadi ${nextPv} kWp memaksimalkan produksi listrik di siang hari, tetapi kelebihan daya tidak akan mendapat kredit di bawah regulasi ESDM No. 2/2024 tanpa penyimpanan yang cukup.`;
  } else if (whatIfResult.financial.capex < currentResult.financial.capex) {
    narrative = 'Menurunkan CAPEX awal mengurangi komitmen modal awal, tetapi menghasilkan penghematan tagihan listrik bulanan yang lebih rendah.';
  }

  return (
    <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80 text-left space-y-1.5 shadow-2xs">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-sky-950 uppercase tracking-wider flex items-center gap-1.5">
          <span>⚖️</span>
          <span>KOMPROMI UTAMA</span>
        </span>
      </div>
      <p className="text-xs text-sky-900 leading-relaxed">
        {narrative}
      </p>
    </div>
  );
}