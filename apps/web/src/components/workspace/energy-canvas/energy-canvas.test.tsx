import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { EnergyCanvas } from './energy-canvas';
import { mapSimulationToCanvas } from './energy-status';
import { SimulationResult } from '../../../types/api';

const mockBaseResult: SimulationResult = {
  configuration: { pv_kwp: 4, battery_kwh: 5, ac_units: 2, led_upgraded: true },
  baseline: { monthly_cost: 4500000, monthly_kwh: 3000 },
  energy: { monthly_demand_kwh: 2796, solar_yield_monthly: 405, grid_import_monthly: 2391, wasted_surplus_monthly: 0 },
  financial: { capex: 96500000, new_monthly_cost: 3586500, monthly_savings: 913500, payback_years: 8.8 },
  environmental: { co2_reduction_kg_yr: 5773.32, co2_reduction_pct: 20.3 },
  grid: { independence_pct: 14.5 },
  assumptions: { tariff: 1500, psh: 4.5, performance_ratio: 0.75, battery_charge_efficiency: 0.95, battery_discharge_efficiency: 0.95, source_version: 'mvp-1.0' },
};

describe('Phase 13: Energy Canvas & Telemetry Mapping', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. maps solar active and inactive states correctly', () => {
    const activeModel = mapSimulationToCanvas(mockBaseResult);
    expect(activeModel.nodes.solar.isActive).toBe(true);
    expect(activeModel.nodes.solar.valueDisplay).toBe('4 kWp');

    const inactiveResult = {
      ...mockBaseResult,
      configuration: { ...mockBaseResult.configuration, pv_kwp: 0 },
    };
    const inactiveModel = mapSimulationToCanvas(inactiveResult);
    expect(inactiveModel.nodes.solar.isActive).toBe(false);
  });

  it('2. maps battery charging and discharge connection states', () => {
    const model = mapSimulationToCanvas(mockBaseResult);
    const solarBattery = model.connections.find((c) => c.id === 'solar-battery');
    const batteryBuilding = model.connections.find((c) => c.id === 'battery-building');

    expect(solarBattery?.isActive).toBe(true);
    expect(batteryBuilding?.isActive).toBe(true);
  });

  it('3. maps grid import connection state when import > 0', () => {
    const model = mapSimulationToCanvas(mockBaseResult);
    const gridConn = model.connections.find((c) => c.id === 'grid-building');
    expect(gridConn?.isActive).toBe(true);
  });

  it('4. renders all 6 required node elements on the canvas', () => {
    render(<EnergyCanvas result={mockBaseResult} />);

    expect(screen.getByText('SOLAR PV')).toBeDefined();
    expect(screen.getByText('BUILDING LOAD')).toBeDefined();
    expect(screen.getByText('BATTERY STORAGE')).toBeDefined();
    expect(screen.getByText('PLN GRID')).toBeDefined();
    expect(screen.getByText('AIR CONDITIONER')).toBeDefined();
    expect(screen.getByText('SMART LED')).toBeDefined();
  });

  it('5. opens telemetry inspector when a node is clicked', async () => {
    render(<EnergyCanvas result={mockBaseResult} />);

    const solarNode = screen.getByText('SOLAR PV');
    fireEvent.click(solarNode);

    await waitFor(() => {
      expect(screen.getByText('SOLAR PV TELEMETRY')).toBeDefined();
      expect(screen.getByText('Installed Capacity')).toBeDefined();
    });
  });

  it('6. provides accessible aria labels for keyboard navigation', () => {
    render(<EnergyCanvas result={mockBaseResult} />);
    const solarButton = screen.getByLabelText(/SOLAR PV: 4 kWp/i);
    expect(solarButton).toBeDefined();
    expect(solarButton.getAttribute('tabindex')).toBe('0');
  });
});