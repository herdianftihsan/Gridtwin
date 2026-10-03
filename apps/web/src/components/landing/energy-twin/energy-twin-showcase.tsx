import React from 'react';
import Image from 'next/image';
import { MarketingEnergyTwin } from './marketing-energy-twin';

export function EnergyTwinShowcase() {
  return (
    <section id="energy-twin" className="relative py-20 sm:py-24 bg-slate-950 text-white text-left overflow-hidden">
      {/* Background Environment Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/landing/gridtwin-energy-twin.webp" 
          alt="" 
          fill 
          className="object-cover opacity-30 mix-blend-luminosity"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-slate-950/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
            KECERDASAN SIMULASI
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Energy Twin
          </h2>
          <p className="text-sm sm:text-base text-slate-400 font-normal leading-relaxed">
            Lihat bagaimana energi mengalir melalui bangunan Anda dan seberapa besar ketergantungannya terhadap jaringan listrik.
          </p>
        </div>

        <MarketingEnergyTwin />
      </div>
    </section>
  );
}