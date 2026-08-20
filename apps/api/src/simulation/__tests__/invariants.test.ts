import { describe, it, expect } from 'vitest';
import { simulate } from '../simulate.js';
import { SimulationConfig, SimulationContext } from '../types.js';

describe('Phase 4: Mathematical Invariant & Property Tests', () => {
  const context: SimulationContext = {
    building_type: 'Ruko',
    location: 'Surabaya',
    roof_area: 50,
    monthly_bill: 4_500_000,
    budget: 100_000_000,
    objective: 'save_money',
  };

  const candidateCombinations: SimulationConfig[] = [
    { solar_kwp: 0, battery_kwh: 0, ac_units: 0, is_led_upgraded: false },
    { solar_kwp: 2, battery_kwh: 0, ac_units: 1, is_led_upgraded: false },
    { solar_kwp: 4, battery_kwh: 5, ac_units: 2, is_led_upgraded: true },
    { solar_kwp: 7, battery_kwh: 10, ac_units: 3, is_led_upgraded: true },
    { solar_kwp: 0, battery_kwh: 20, ac_units: 0, is_led_upgraded: false },
  ];

  it('preserves all physical and economic invariants across diverse candidate mixes', () => {
    for (const config of candidateCombinations) {
      const res = simulate(config, context);

      // Invariant 1: Non-negative energy flows
      expect(res.energy.grid_import_monthly).toBeGreaterThanOrEqual(0);
      expect(res.energy.wasted_surplus_monthly).toBeGreaterThanOrEqual(0);
      expect(res.energy.monthly_demand_kwh).toBeGreaterThanOrEqual(0);
      expect(res.energy.solar_yield_monthly).toBeGreaterThanOrEqual(0);

      // Invariant 2: Financial boundaries
      expect(res.financial.capex).toBeGreaterThanOrEqual(0);
      expect(res.financial.new_monthly_cost).toBeGreaterThanOrEqual(0);
      expect(res.financial.new_monthly_cost).toBeLessThanOrEqual(context.monthly_bill);

      // Invariant 3: Payback period boundary
      if (res.financial.payback_years !== null) {
        expect(res.financial.payback_years).toBeGreaterThan(0);
      }

      // Invariant 4: Percentage range boundaries
      expect(res.grid.independence_pct).toBeGreaterThanOrEqual(0);
      expect(res.grid.independence_pct).toBeLessThanOrEqual(100);
      expect(res.environmental.co2_reduction_pct).toBeGreaterThanOrEqual(0);
      expect(res.environmental.co2_reduction_pct).toBeLessThanOrEqual(100);
    }
  });

  it('verifies input immutability (does not mutate config or context objects)', () => {
    const frozenConfig: SimulationConfig = Object.freeze({
      solar_kwp: 4,
      battery_kwh: 5,
      ac_units: 2,
      is_led_upgraded: true,
    });

    const frozenContext: SimulationContext = Object.freeze({
      building_type: 'Ruko',
      location: 'Surabaya',
      roof_area: 50,
      monthly_bill: 4_500_000,
      budget: 50_000_000,
      objective: 'save_money',
      assumptions: Object.freeze({
        tariff: 1500,
        psh: 4.5,
      }),
    });

    expect(() => simulate(frozenConfig, frozenContext)).not.toThrow();
    expect(frozenConfig.solar_kwp).toBe(4);
    expect(frozenContext.monthly_bill).toBe(4_500_000);
  });
});