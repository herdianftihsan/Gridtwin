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
  title: 'GridTwin AI — Simulate Before You Invest',
  description: 'AI-driven energy simulation and investment analysis platform for building owners. Model solar PV, battery storage, and energy efficiency upgrades.',
  openGraph: {
    title: 'GridTwin AI — Simulate Before You Invest',
    description: 'Energy decision platform for commercial and residential building owners.',
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