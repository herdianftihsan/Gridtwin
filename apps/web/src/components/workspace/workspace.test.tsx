// apps/web/src/components/workspace/workspace.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { WorkspaceContainer } from './workspace-container';
import { apiClient } from '../../lib/api/api-client';

vi.mock('../../lib/api/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
  ApiClientError: class ApiClientError extends Error {
    constructor(public code: string, message: string, public status: number) {
      super(message);
    }
  },
}));

const mockProjectDetail = {
  project: {
    id: 'proj-123',
    building_type: 'Ruko',
    location: 'Surabaya',
    roof_area: 50,
    monthly_bill: 4500000,
    budget: 50000000,
    objective: 'save_money',
  },
  baseline: {
    monthly_kwh: 3000,
    monthly_bill: 4500000,
    tariff_rate: 1500,
    daily_kwh: 100,
  },
  recommended_scenario: {
    id: 'sc-rec-1',
    scenario_type: 'recommended',
    is_recommended: true,
    solar_kwp: 4,
    battery_kwh: 5,
    ac_units: 2,
    is_led_upgraded: true,
    simulation_result: {
      configuration: { pv_kwp: 4, battery_kwh: 5, ac_units: 2, led_upgraded: true },
      baseline: { monthly_cost: 4500000, monthly_kwh: 3000 },
      energy: { monthly_demand_kwh: 2796, solar_yield_monthly: 405, grid_import_monthly: 946, wasted_surplus_monthly: 0 },
      financial: { capex: 101500000, new_monthly_cost: 1420000, monthly_savings: 3080000, payback_years: 3.8 },
      environmental: { co2_reduction_kg_yr: 19472.5, co2_reduction_pct: 68.4 },
      grid: { independence_pct: 66.2 },
      assumptions: { tariff: 1500, psh: 4.5, performance_ratio: 0.75, battery_charge_efficiency: 0.95, battery_discharge_efficiency: 0.95, source_version: 'mvp-1.0' },
    },
  },
  recent_scenarios: [],
};

describe('Phase 12: Decision Workspace Integration Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(apiClient.get).mockResolvedValue({
      data: mockProjectDetail,
      error: null,
    });
  });

  it('1. hydrates workspace and renders Energy Canvas with Recommended Scenario', async () => {
    render(<WorkspaceContainer projectId="proj-123" />);

    await waitFor(() => {
      expect(screen.getByText('Decision Workspace')).toBeDefined();
      expect(screen.getByText('Energy Canvas')).toBeDefined();
    });

    // Gunakan getAllByText karena nilai 4 kWp tampil pada Canvas, Slider, & Tab detail
    const solarMatches = screen.getAllByText(/4\s*kWp/i);
    expect(solarMatches.length).toBeGreaterThan(0);
  });

  it('2. triggers debounced POST /simulate when changing solar PV capacity', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        scenario_type: 'custom',
        simulation_result: {
          ...mockProjectDetail.recommended_scenario.simulation_result,
          configuration: { pv_kwp: 6, battery_kwh: 5, ac_units: 2, led_upgraded: true },
        },
      },
      error: null,
    });

    render(<WorkspaceContainer projectId="proj-123" />);

    await waitFor(() => expect(screen.getByText('Decision Workspace')).toBeDefined());

    const solarInput = screen.getByLabelText('Solar PV Capacity in kWp');
    fireEvent.change(solarInput, { target: { value: '6' } });

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/projects/proj-123/simulate',
        expect.objectContaining({
          solar_kwp: 6,
          persist: false,
        }),
        expect.any(Object)
      );
    });
  });

  it('3. opens and displays Decision Summary Modal on export click', async () => {
    render(<WorkspaceContainer projectId="proj-123" />);

    await waitFor(() => expect(screen.getByText('Export Decision Summary')).toBeDefined());

    fireEvent.click(screen.getByText('Export Decision Summary'));

    await waitFor(() => {
      expect(screen.getByText('GRIDTWIN AI · INVESTMENT ANALYSIS')).toBeDefined();
    });
  });
});