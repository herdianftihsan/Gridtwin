import type { Metadata } from 'next';
import { Navbar } from '../components/landing/navbar';
import { HeroSection } from '../components/landing/hero-section';
import { HowItWorks } from '../components/landing/how-it-works';
import { ConsequenceSection } from '../components/landing/consequence-section';
import { EnergyTwinShowcase } from '../components/landing/energy-twin/energy-twin-showcase';
import { WhatIfShowcase } from '../components/landing/what-if-showcase';
import { PrinciplesSection } from '../components/landing/principles-section';
import { FinalCTA } from '../components/landing/final-cta';
import { Footer } from '../components/landing/footer';

export const metadata: Metadata = {
  title: 'GridTwin AI — Simulasikan Sebelum Investasi',
  description: 'Platform simulasi energi dan analisis investasi berbasis AI untuk pemilik bangunan. Modelkan Solar PV, penyimpanan baterai, dan peningkatan efisiensi energi.',
  openGraph: {
    title: 'GridTwin AI — Simulasikan Sebelum Investasi',
    description: 'Platform keputusan energi untuk pemilik bangunan komersial dan residensial.',
    url: 'https://gridtwin.ai',
    siteName: 'GridTwin AI',
    type: 'website',
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <HowItWorks />
        <ConsequenceSection />
        <EnergyTwinShowcase />
        <WhatIfShowcase />
        <PrinciplesSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}