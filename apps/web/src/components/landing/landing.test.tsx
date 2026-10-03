// apps/web/src/components/landing/landing.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Navbar } from './navbar';
import { HeroSection } from './hero-section';
import { HowItWorks } from './how-it-works';
import { ConsequenceSection } from './consequence-section';
import { MarketingEnergyTwin } from './energy-twin/marketing-energy-twin';
import { WhatIfShowcase } from './what-if-showcase';
import { FinalCTA } from './final-cta';

describe('Phase 16: SCR-01 Landing Page Unit Suite', () => {
  it('1. renders Navbar with logo and navigation links', () => {
    render(<Navbar />);
    expect(screen.getByText('GridTwin')).toBeDefined();
    expect(screen.getByText('Contoh Hasil')).toBeDefined();
    expect(screen.getByText('Masuk')).toBeDefined();
  });

  it('2. renders Hero value proposition and valid CTA route destinations', () => {
    render(<HeroSection />);
    expect(screen.getByText(/Simulasikan sebelum Anda berinvestasi/i)).toBeDefined();

    const startProjectLink = screen.getByRole('link', { name: /Mulai Simulasi/i });
    const exploreDemoLink = screen.getByRole('link', { name: /Lihat Contoh Hasil/i });

    expect(startProjectLink.getAttribute('href')).toBe('/login?next=/setup');
    expect(exploreDemoLink.getAttribute('href')).toBe('/demo');
  });

  it('3. renders How It Works 3-step decision workflow', () => {
    render(<HowItWorks />);
    expect(screen.getByText('01')).toBeDefined();
    expect(screen.getByText('Jelaskan')).toBeDefined();
    expect(screen.getByText('02')).toBeDefined();
    expect(screen.getByText('Simulasikan')).toBeDefined();
    expect(screen.getByText('03')).toBeDefined();
    expect(screen.getByText('Putuskan')).toBeDefined();
  });

  it('4. displays consequence comparison metrics between baseline and recommended', () => {
    render(<ConsequenceSection />);
    expect(screen.getByText('Rp 4.500.000')).toBeDefined();
    expect(screen.getByText('Rp 1.420.000')).toBeDefined();
    expect(screen.getByText('3,8 Tahun')).toBeDefined();
  });

  it('5. focuses node and renders role description on Energy Twin hover', () => {
    render(<MarketingEnergyTwin />);
    expect(screen.getByText('4 kWp')).toBeDefined();

    const solarNode = screen.getByText('☀️ SOLAR PV');
    fireEvent.mouseEnter(solarNode);

    // Dicocokkan dengan teks yang dirender komponen
    expect(screen.getByText(/Menyuplai beban bangunan siang hari secara langsung/i)).toBeDefined();

    fireEvent.mouseLeave(solarNode);
    expect(screen.getByText('Beban Bulanan')).toBeDefined();
  });

  it('6. allows selecting What-if scenario queries and updates trade-off preview', () => {
    render(<WhatIfShowcase />);
    expect(screen.getByText('Bagaimana jika saya menambah baterai 5 kWh?')).toBeDefined();

    const budgetQueryBtn = screen.getByText('Bagaimana jika budget saya Rp 30 Juta?');
    fireEvent.click(budgetQueryBtn);

    expect(screen.getByText(/berada di bawah budget Rp 30 Juta/i)).toBeDefined();
  });

  it('7. renders Final CTA banner with accessible action links', () => {
    render(<FinalCTA />);
    expect(screen.getByText('Ketahui hasilnya sebelum Anda berinvestasi.')).toBeDefined();
  });
});
