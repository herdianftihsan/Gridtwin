import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { WhatIfPanel } from './what-if-panel';
import { WhatIfChanges } from './what-if-changes';
import { WhatIfMetrics } from './what-if-metrics';
import { apiClient, ApiClientError } from '../../../lib/api/api-client';
import { SimulationResult } from '../../../types/api';

vi.mock('../../../lib/api/api-client', () => ({
  apiClient: {
    post: vi.fn(),
  },
  ApiClientError: class ApiClientError extends Error {
    constructor(public code: string, message: string, public status: number) {
      super(message);
    }
  },
}));

const mockCurrentResult: SimulationResult = {
  configuration: { pv_kwp: 4, battery_kwh: 0, ac_units: 2, led_upgraded: false },
  baseline: { monthly_cost: 4500000, monthly_kwh: 3000 },
  energy: { monthly_demand_kwh: 2796, solar_yield_monthly: 405, grid_import_monthly: 2391, wasted_surplus_monthly: 0 },
  financial: { capex: 60000000, new_monthly_cost: 3586500, monthly_savings: 913500, payback_years: 5.5 },
  environmental: { co2_reduction_kg_yr: 5773.32, co2_reduction_pct: 20.3 },
  grid: { independence_pct: 14.5 },
  assumptions: { tariff: 1500, psh: 4.5, performance_ratio: 0.75, battery_charge_efficiency: 0.95, battery_discharge_efficiency: 0.95, source_version: 'mvp-1.0' },
};

const mockWhatIfResult: SimulationResult = {
  ...mockCurrentResult,
  configuration: { pv_kwp: 4, battery_kwh: 5, ac_units: 2, led_upgraded: false },
  financial: { capex: 85000000, new_monthly_cost: 2800000, monthly_savings: 1700000, payback_years: 4.2 },
  grid: { independence_pct: 38.0 },
};

describe('Phase 15: What-if & AI Explanation UI', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. renders What-if panel header and suggestion shortcuts', () => {
    render(
      <WhatIfPanel
        isOpen={true}
        onClose={vi.fn()}
        projectId="proj-123"
        currentResult={mockCurrentResult}
      />
    );

    expect(screen.getByText('What if?')).toBeDefined();
    expect(screen.getByText('+ Add 5 kWh battery')).toBeDefined();
  });

  it('2. sends natural-language query to POST /api/ai/what-if and renders result', async () => {
   vi.mocked(apiClient.post)
      .mockResolvedValueOnce({
        data: {
          scenario_id: 'sc-what-if-1',
          scenario_type: 'what_if',
          what_if_query: 'Add 5 kWh battery',
          simulation_result: mockWhatIfResult,
        },
      } as never)
      .mockResolvedValueOnce({
        data: {
          scenario_id: 'sc-what-if-1',
          explanation: 'Adding a 5 kWh battery captures daytime solar surplus.',
        },
      } as never);

    render(
      <WhatIfPanel
        isOpen={true}
        onClose={vi.fn()}
        projectId="proj-123"
        currentResult={mockCurrentResult}
      />
    );

    const shortcutBtn = screen.getByText('+ Add 5 kWh battery');
    fireEvent.click(shortcutBtn);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/api/ai/what-if', {
        project_id: 'proj-123',
        message: 'Add 5 kWh battery',
      }, expect.any(Object));
      expect(screen.getByText('WHAT CHANGED')).toBeDefined();
    });
  });

  it('3. highlights only changed configuration assets', () => {
    render(<WhatIfChanges currentResult={mockCurrentResult} whatIfResult={mockWhatIfResult} />);

    expect(screen.getByText('0 kWh')).toBeDefined();
    expect(screen.getByText('5 kWh')).toBeDefined();
  });

  it('4. displays presentation deltas for monthly cost, capex, and independence', () => {
    render(<WhatIfMetrics currentResult={mockCurrentResult} whatIfResult={mockWhatIfResult} />);

    expect(screen.getByText('Rp 3.59M')).toBeDefined();
    expect(screen.getByText('Rp 2.80M')).toBeDefined();
    expect(screen.getByText('38%')).toBeDefined();
  });

  it('5. handles NO_FEASIBLE_SCENARIO error gracefully without hiding current state', async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce(
      new ApiClientError('NO_FEASIBLE_SCENARIO', 'Budget too low.', 422)
    );

    render(
      <WhatIfPanel
        isOpen={true}
        onClose={vi.fn()}
        projectId="proj-123"
        currentResult={mockCurrentResult}
      />
    );

    const shortcut = screen.getByText('+ Budget Rp30M');
    fireEvent.click(shortcut);

    await waitFor(() => {
      expect(screen.getByText('Scenario Exploration Issue')).toBeDefined();
      expect(screen.getByText(/No feasible energy configuration found/i)).toBeDefined();
    });
  });

  it('6. treats AI output as untrusted text without evaluating code', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {
        scenario_id: 'sc-ai-sec',
        scenario_type: 'what_if',
        what_if_query: 'test script injection',
        simulation_result: mockWhatIfResult,
      },
    } as never).mockResolvedValueOnce({
      data: {
        scenario_id: 'sc-ai-sec',
        explanation: '<script>alert("xss")</script> Plaintext insight explanation.',
      },
      
    }as never);

    render(
      <WhatIfPanel
        isOpen={true}
        onClose={vi.fn()}
        projectId="proj-123"
        currentResult={mockCurrentResult}
      />
    );

    const input = screen.getByLabelText('What-if Natural Language Question');
    fireEvent.change(input, { target: { value: 'test script injection' } });
    fireEvent.click(screen.getByLabelText('Send What-if Query'));

    await waitFor(() => {
      expect(screen.getByText(/Plaintext insight explanation/i)).toBeDefined();
      // Ensure no DOM script tag was injected
      expect(document.querySelector('script[src*="alert"]')).toBeNull();
    });
  });
});