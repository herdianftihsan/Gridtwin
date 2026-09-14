import React from 'react';
import { MarketingEnergyTwin } from './marketing-energy-twin';

export function EnergyTwinShowcase() {
  return (
    <section id="energy-twin" className="py-20 sm:py-24 bg-slate-950 text-white text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
            TOPOLOGI SIMULASI
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Simulasi Energy Twin
          </h2>
          <p className="text-sm text-slate-400 font-normal">
            Representasi matematis dari aliran energi bangunan Anda yang terhubung dengan proyeksi arus kas real-time.
          </p>
        </div>

        <MarketingEnergyTwin />
      </div>
    </section>
  );
}