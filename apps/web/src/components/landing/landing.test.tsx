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
    expect(screen.getByText('Explore Demo')).toBeDefined();
    expect(screen.getByText('Start Project')).toBeDefined();
  });

  it('2. renders Hero value proposition and valid CTA route destinations', () => {
    render(<HeroSection />);
    expect(screen.getByText(/Simulate the decision before you make the investment/i)).toBeDefined();

    const startProjectLink = screen.getByRole('link', { name: /Start Project/i });
    const exploreDemoLink = screen.getByRole('link', { name: /Explore Demo Project/i });

    expect(startProjectLink.getAttribute('href')).toBe('/setup');
    expect(exploreDemoLink.getAttribute('href')).toBe('/demo');
  });

  it('3. renders How It Works 3-step decision workflow', () => {
    render(<HowItWorks />);
    expect(screen.getByText('01')).toBeDefined();
    expect(screen.getByText('Describe')).toBeDefined();
    expect(screen.getByText('02')).toBeDefined();
    expect(screen.getByText('Simulate')).toBeDefined();
    expect(screen.getByText('03')).toBeDefined();
    expect(screen.getByText('Decide')).toBeDefined();
  });

  it('4. displays consequence comparison metrics between baseline and recommended', () => {
    render(<ConsequenceSection />);
    expect(screen.getByText('Rp 4.50M')).toBeDefined();
    expect(screen.getByText('Rp 1.42M')).toBeDefined();
    expect(screen.getByText('3.8 Years')).toBeDefined();
  });

  it('5. focuses node and renders role description on Energy Twin hover', () => {
    render(<MarketingEnergyTwin />);
    expect(screen.getByText('4 kWp')).toBeDefined();

    const solarNode = screen.getByText('☀️ SOLAR PV');
    fireEvent.mouseEnter(solarNode);

    // Dicocokkan dengan teks yang dirender komponen
    expect(screen.getByText(/Supplies daytime building loads directly/i)).toBeDefined();

    fireEvent.mouseLeave(solarNode);
    expect(screen.getByText('Monthly Demand')).toBeDefined();
  });

  it('6. allows selecting What-if scenario queries and updates trade-off preview', () => {
    render(<WhatIfShowcase />);
    expect(screen.getByText('What if I add 5 kWh battery?')).toBeDefined();

    const budgetQueryBtn = screen.getByText('What if budget is Rp30M?');
    fireEvent.click(budgetQueryBtn);

    expect(screen.getByText(/berada di bawah budget Rp 30 Juta/i)).toBeDefined();
  });

  it('7. renders Final CTA banner with accessible action links', () => {
    render(<FinalCTA />);
    expect(screen.getByText('Know the outcome before you commit.')).toBeDefined();
  });
});