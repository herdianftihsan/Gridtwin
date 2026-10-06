import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { EnergyCanvas } from '../energy-canvas/energy-canvas';
import { mapSimulationToEnergyTwin } from './energy-twin-view-model';
import { Project, SimulationResult } from '../../../types/api';

const result: SimulationResult = {
  configuration: { pv_kwp: 6, battery_kwh: 8, ac_units: 2, led_upgraded: true, refrigerator_units: 1, water_pump_upgraded: false },
  baseline: { monthly_cost: 4500000, monthly_kwh: 3000 },
  energy: { monthly_demand_kwh: 2700, solar_yield_monthly: 600, grid_import_monthly: 2100, wasted_surplus_monthly: 25 },
  financial: { capex: 100000000, new_monthly_cost: 3150000, monthly_savings: 1350000, payback_years: 6.2 },
  environmental: { co2_reduction_kg_yr: 8000, co2_reduction_pct: 25 },
  grid: { independence_pct: 22.2 },
  assumptions: { tariff: 1500, psh: 4.5, performance_ratio: 0.75, battery_charge_efficiency: 0.95, battery_discharge_efficiency: 0.95, source_version: 'mvp-1.0' },
};

describe('Energy Twin 2.5D', () => {
  it('maps existing result fields into building, assets, and supported flows', () => {
    const project: Project = { id: 'project-1', building_type: 'Office', location: 'Surabaya', roof_area: 120, monthly_bill: 4500000, budget: 100000000, objective: 'independence' };
    const model = mapSimulationToEnergyTwin(result, project);

    expect(model.building.floors).toBe(4);
    expect(model.building.roofArea).toBe(120);
    expect(model.assets.find((asset) => asset.id === 'solar')?.telemetry.valueDisplay).toBe('600 kWh/bln');
    expect(model.assets.find((asset) => asset.id === 'battery')?.telemetry.valueDisplay).toBe('8 kWh');
    expect(model.flows.find((flow) => flow.id === 'grid-building')?.active).toBe(true);
    expect(model.flows.find((flow) => flow.id === 'building-surplus')?.active).toBe(true);
  });

  it('quietly disables unsupported solar and grid flows', () => {
    const noSolar = { ...result, configuration: { ...result.configuration, pv_kwp: 0, battery_kwh: 0 }, energy: { ...result.energy, solar_yield_monthly: 0, grid_import_monthly: 0, wasted_surplus_monthly: 0 } };
    const model = mapSimulationToEnergyTwin(noSolar);

    expect(model.flows.find((flow) => flow.id === 'solar-building')?.active).toBe(false);
    expect(model.flows.find((flow) => flow.id === 'solar-battery')?.active).toBe(false);
    expect(model.flows.find((flow) => flow.id === 'grid-building')?.active).toBe(false);
    expect(model.flows.find((flow) => flow.id === 'building-surplus')?.active).toBe(false);
  });

  it('switches from Classic to 2.5D without removing the classic mode control', () => {
    render(<EnergyCanvas result={result} />);

    fireEvent.click(screen.getByRole('button', { name: '2.5D' }));

    expect(screen.getByRole('region', { name: 'Energy Twin 2.5D' })).toBeDefined();
    expect(screen.getByText('Energy Twin · Commercial Ruko')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Classic' }).getAttribute('aria-pressed')).toBe('false');
  });
});
