import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { WorkspaceContainer } from './workspace-container';
import { apiClient } from '../../lib/api/api-client';

const mockSimulationResult = {
  configuration: { pv_kwp: 4, battery_kwh: 5, ac_units: 2, led_upgraded: true },
  baseline: { monthly_cost: 4500000, monthly_kwh: 3000 },
  energy: { monthly_demand_kwh: 2796, solar_yield_monthly: 405, grid_import_monthly: 2391, wasted_surplus_monthly: 0 },
  financial: { capex: 96500000, new_monthly_cost: 3586500, monthly_savings: 913500, payback_years: 8.8 },
  environmental: { co2_reduction_kg_yr: 5773.32, co2_reduction_pct: 20.3 },
  grid: { independence_pct: 14.5 },
  assumptions: { tariff: 1500, psh: 4.5, performance_ratio: 0.75, battery_charge_efficiency: 0.95, battery_discharge_efficiency: 0.95, source_version: 'mvp-1.0' },
};

const mockProjectPayload = {
  project: {
    id: 'proj-123',
    building_type: 'Ruko',
    location: 'Surabaya',
    roof_area: 50,
    monthly_bill: 4500000,
    budget: 50000000,
    objective: 'save_money',
  },
  recommended_scenario: {
    id: 'scen-rec-1',
    scenario_type: 'recommended',
    is_recommended: true,
    solar_kwp: 4,
    battery_kwh: 5,
    ac_units: 2,
    is_led_upgraded: true,
    simulation_result: mockSimulationResult,
  },
  recent_scenarios: [],
};

describe('Phase 12: Decision Workspace Integration Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. hydrates workspace and renders Energy Canvas with Recommended Scenario', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: mockProjectPayload as never,
      meta: { timestamp: '2026-08-29T00:00:00Z' },
    });

    render(<WorkspaceContainer projectId="proj-123" />);

    await waitFor(() => {
      expect(screen.getByText('Decision Workspace')).toBeDefined();
      expect(screen.getByText('Energy Canvas')).toBeDefined();
      expect(screen.getByText('4 kWp')).toBeDefined();
      expect(screen.getByText('5 kWh')).toBeDefined();
    });
  });

  it('2. triggers debounced POST /simulate when changing solar PV capacity', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: mockProjectPayload as never,
      meta: { timestamp: '2026-08-29T00:00:00Z' },
    });

    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: { scenario_type: 'custom', simulation_result: mockSimulationResult } as never,
      meta: { timestamp: '2026-08-29T00:00:00Z' },
    });

    render(<WorkspaceContainer projectId="proj-123" />);

    await waitFor(() => expect(screen.getByText('Decision Workspace')).toBeDefined());

    const solarInput = screen.getByLabelText('Solar PV Capacity in kWp');
    fireEvent.change(solarInput, { target: { value: '6' } });

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/projects/proj-123/simulate',
        expect.objectContaining({ solar_kwp: 6, persist: false }),
        expect.anything()
      );
    });
  });

  it('3. opens and displays Decision Summary Modal on export click', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: mockProjectPayload as never,
      meta: { timestamp: '2026-08-29T00:00:00Z' },
    });

    render(<WorkspaceContainer projectId="proj-123" />);

    await waitFor(() => expect(screen.getByText('Export Decision Summary')).toBeDefined());

    fireEvent.click(screen.getByText('Export Decision Summary'));

    expect(screen.getByText('GRIDTWIN AI · INVESTMENT ANALYSIS')).toBeDefined();
  });
});