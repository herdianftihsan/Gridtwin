import { describe, it, expect, vi} from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ScenarioCard } from './scenario-card';
import { ScenarioList } from './scenario-list';
import { SaveScenarioButton } from './save-scenario-button';
import { ComparisonMetric } from './comparison-metric';
import { Scenario } from '../../../types/api';

const mockScenario: Scenario = {
  id: 'sc-01',
  project_id: 'p-01',
  scenario_type: 'recommended',
  is_recommended: true,
  solar_kwp: 4,
  battery_kwh: 5,
  ac_units: 2,
  is_led_upgraded: true,
  created_at: '2026-03-01T10:00:00Z',
  simulation_result: {
    configuration: { pv_kwp: 4, battery_kwh: 5, ac_units: 2, led_upgraded: true },
    baseline: { monthly_cost: 4500000, monthly_kwh: 3000 },
    energy: { monthly_demand_kwh: 2796, solar_yield_monthly: 405, grid_import_monthly: 946, wasted_surplus_monthly: 0 },
    financial: { capex: 101500000, new_monthly_cost: 1420000, monthly_savings: 3080000, payback_years: 3.8 },
    environmental: { co2_reduction_kg_yr: 19472.5, co2_reduction_pct: 68.4 },
    grid: { independence_pct: 66.2 },
    assumptions: { tariff: 1500, psh: 4.5, performance_ratio: 0.75, battery_charge_efficiency: 0.95, battery_discharge_efficiency: 0.95, source_version: 'mvp-1.0' },
  },
};

describe('Phase 14: Scenario Management & Comparison', () => {
  it('1. correctly distinguishes and renders Recommended Scenario badge', () => {
    render(<ScenarioCard scenario={mockScenario} isSelected={false} onSelect={vi.fn()} />);
    expect(screen.getByText('Recommended')).toBeDefined();
    expect(screen.getByText('4 kWp / 5 kWh')).toBeDefined();
  });

  it('2. caps recent scenarios tray at maximum 10 items', () => {
    const list = Array.from({ length: 15 }, (_, i) => ({
      ...mockScenario,
      id: `sc-${i}`,
    }));

    render(
      <ScenarioList
        scenarios={list}
        onSelectScenario={vi.fn()}
        onCompareScenario={vi.fn()}
      />
    );

    expect(screen.getByText('SAVED SCENARIOS (10/10)')).toBeDefined();
  });

  it('3. triggers comparison modal callback on demand', () => {
    const onCompare = vi.fn();
    render(<ScenarioCard scenario={mockScenario} isSelected={false} onSelect={vi.fn()} onCompare={onCompare} />);

    const compareBtn = screen.getByText('Compare with Baseline');
    fireEvent.click(compareBtn);
    expect(onCompare).toHaveBeenCalledWith(mockScenario);
  });

  it('4. renders delta values and positive savings indicator', () => {
    render(
      <ComparisonMetric
        label="Monthly Bill"
        baseValue="Rp 4.50M"
        targetValue="Rp 1.42M"
        deltaText="-68.4% / mo"
        deltaType="positive"
      />
    );

    expect(screen.getByText('-68.4% / mo')).toBeDefined();
    expect(screen.getByText('Rp 1.42M')).toBeDefined();
  });

  it('5. guards against duplicate submissions on save button', () => {
    const onSave = vi.fn();
    render(
      <SaveScenarioButton
        config={{ solar_kwp: 4, battery_kwh: 5, ac_units: 2, is_led_upgraded: true }}
        onSave={onSave}
        isSaving={true}
      />
    );

    const btn = screen.getByRole('button');
    expect(btn.hasAttribute('disabled')).toBe(true);
    fireEvent.click(btn);
    expect(onSave).not.toHaveBeenCalled();
  });
});