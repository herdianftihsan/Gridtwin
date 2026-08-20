import { describe, it, expect } from 'vitest';
import { simulate } from '../simulate.js';
import {
  InfeasibleEfficiencyConfigurationError,
  InvalidSimulationInputError,
  PvConstraintExceededError,
} from '../errors.js';
import { SimulationConfig, SimulationContext } from '../types.js';

describe('Phase 4: Simulation Engine Edge Cases & Rejection Boundaries', () => {
  const validContext: SimulationContext = {
    building_type: 'Ruko',
    location: 'Surabaya',
    roof_area: 50,
    monthly_bill: 4_500_000,
    budget: 50_000_000,
    objective: 'save_money',
  };

  const validConfig: SimulationConfig = {
    solar_kwp: 4,
    battery_kwh: 5,
    ac_units: 1,
    is_led_upgraded: true,
  };

  it('rejects explicit zero roof area when solar capacity is requested', () => {
    const zeroRoofContext: SimulationContext = {
      ...validContext,
      roof_area: 0,
    };

    const configWithSolar: SimulationConfig = {
      ...validConfig,
      solar_kwp: 1,
    };

    expect(() => simulate(configWithSolar, zeroRoofContext)).toThrow(
      PvConstraintExceededError
    );

    const configWithoutSolar: SimulationConfig = {
      ...validConfig,
      solar_kwp: 0,
    };

    expect(() => simulate(configWithoutSolar, zeroRoofContext)).not.toThrow();
  });

  it('rejects NaN and Infinity inputs gracefully', () => {
    expect(() =>
      simulate(validConfig, { ...validContext, monthly_bill: NaN })
    ).toThrow(InvalidSimulationInputError);

    expect(() =>
      simulate(validConfig, { ...validContext, monthly_bill: Infinity })
    ).toThrow(InvalidSimulationInputError);

    expect(() =>
      simulate({ ...validConfig, solar_kwp: NaN }, validContext)
    ).toThrow(InvalidSimulationInputError);

    expect(() =>
      simulate({ ...validConfig, battery_kwh: Infinity }, validContext)
    ).toThrow(InvalidSimulationInputError);
  });

  it('handles exact efficiency equals baseline consumption without division by zero', () => {
    // 300,000 / 1500 = 200 kWh baseline. AC=2 (144 kWh) + LED=1 (56 kWh? LED is 60 -> total 204 > 200)
    // For exact match: Bill = 306,000 / 1500 = 204 kWh. AC=2 (144) + LED=1 (60) = 204 kWh.
    const exactBillContext: SimulationContext = {
      ...validContext,
      monthly_bill: 306_000, // Exactly 204 kWh baseline
    };

    const configExact: SimulationConfig = {
      solar_kwp: 0,
      battery_kwh: 0,
      ac_units: 2,
      is_led_upgraded: true,
    };

    const res = simulate(configExact, exactBillContext);

    expect(res.energy.monthly_demand_kwh).toBe(0);
    expect(res.energy.grid_import_monthly).toBe(0);
    expect(res.grid.independence_pct).toBe(0); // Protected division by zero
    expect(res.financial.monthly_savings).toBe(306_000);
  });

  it('throws INFEASIBLE_EFFICIENCY_CONFIGURATION when savings exceed baseline by 1 Wh', () => {
    const underBaselineContext: SimulationContext = {
      ...validContext,
      monthly_bill: 305_900, // 203.93 kWh (< 204 kWh savings)
    };

    const config: SimulationConfig = {
      solar_kwp: 0,
      battery_kwh: 0,
      ac_units: 2,
      is_led_upgraded: true,
    };

    expect(() => simulate(config, underBaselineContext)).toThrow(
      InfeasibleEfficiencyConfigurationError
    );
  });
});