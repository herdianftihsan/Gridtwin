import { describe, it, expect } from 'vitest';
import { simulate } from '../simulate.js';
import {
  InfeasibleEfficiencyConfigurationError,
  InvalidSimulationInputError,
  PvConstraintExceededError,
} from '../errors.js';
import { SimulationConfig, SimulationContext } from '../types.js';

describe('Phase 3: Deterministic Simulation Engine', () => {
  const baseContext: SimulationContext = {
    building_type: 'Ruko',
    location: 'Surabaya',
    roof_area: 50,
    monthly_bill: 4_500_000,
    budget: 50_000_000,
    objective: 'save_money',
  };

  // Section 30: Sample Calculation Verification
  describe('Specification Sample Calculations', () => {
    it('matches EXAMPLE A: Baseline Only', () => {
      const config: SimulationConfig = {
        solar_kwp: 0,
        battery_kwh: 0,
        ac_units: 0,
        is_led_upgraded: false,
      };

      const result = simulate(config, baseContext);

      expect(result.baseline.monthly_kwh).toBe(3000);
      expect(result.baseline.monthly_cost).toBe(4_500_000);
      expect(result.financial.capex).toBe(0);
      expect(result.financial.new_monthly_cost).toBe(4_500_000);
      expect(result.financial.monthly_savings).toBe(0);
      expect(result.financial.payback_years).toBeNull();
      expect(result.grid.independence_pct).toBe(0);
      expect(result.energy.wasted_surplus_monthly).toBe(0);
    });

    it('matches EXAMPLE B: Solar (5 kWp) + Battery (5 kWh)', () => {
      const config: SimulationConfig = {
        solar_kwp: 5,
        battery_kwh: 5,
        ac_units: 0,
        is_led_upgraded: false,
      };

      const result = simulate(config, baseContext);

      expect(result.energy.solar_yield_monthly).toBe(506.25);
      expect(result.energy.grid_import_monthly).toBe(2493.75);
      expect(result.financial.capex).toBe(100_000_000);
      expect(result.financial.new_monthly_cost).toBe(3_740_625);
      expect(result.financial.monthly_savings).toBe(759_375);
      expect(result.financial.payback_years).toBe(11.0);
      expect(result.energy.wasted_surplus_monthly).toBe(0);
    });

    it('matches EXAMPLE C: Solar (7 kWp) + Battery (5 kWh) + AC (2 units) + LED (1)', () => {
      const contextC: SimulationContext = {
        ...baseContext,
        monthly_bill: 1_500_000,
      };

      const config: SimulationConfig = {
        solar_kwp: 7,
        battery_kwh: 5,
        ac_units: 2,
        is_led_upgraded: true,
      };

      const result = simulate(config, contextC);

      expect(result.baseline.monthly_kwh).toBe(1000);
      expect(result.energy.monthly_demand_kwh).toBe(796);
      expect(result.energy.solar_yield_monthly).toBe(708.75);
      expect(result.energy.grid_import_monthly).toBe(255.5);
      expect(result.energy.wasted_surplus_monthly).toBe(152.86);
      expect(result.financial.capex).toBe(141_500_000);
      expect(result.financial.new_monthly_cost).toBe(383_250);
      expect(result.financial.monthly_savings).toBe(1_116_750);
      expect(result.financial.payback_years).toBe(10.6);
      expect(result.environmental.co2_reduction_kg_yr).toBe(7057.86);
      expect(result.environmental.co2_reduction_pct).toBe(74.5);
      expect(result.grid.independence_pct).toBe(67.9);
    });
  });

  // Section 31: Unit Test Cases
  describe('Mandatory Unit Test Cases', () => {
    it('Case 3: Roof Area Constraint Limit (roof: 35m² -> max PV 5 kWp)', () => {
      const context35m2: SimulationContext = {
        ...baseContext,
        roof_area: 35,
      };

      const invalidConfig: SimulationConfig = {
        solar_kwp: 6,
        battery_kwh: 0,
        ac_units: 0,
        is_led_upgraded: false,
      };

      expect(() => simulate(invalidConfig, context35m2)).toThrow(
        PvConstraintExceededError
      );

      const validConfig: SimulationConfig = {
        solar_kwp: 5,
        battery_kwh: 0,
        ac_units: 0,
        is_led_upgraded: false,
      };

      expect(() => simulate(validConfig, context35m2)).not.toThrow();
    });

    it('Case 4: Zero PV Generation with Battery (Battery cannot charge)', () => {
      const config: SimulationConfig = {
        solar_kwp: 0,
        battery_kwh: 5,
        ac_units: 0,
        is_led_upgraded: false,
      };

      const result = simulate(config, baseContext);

      expect(result.energy.solar_yield_monthly).toBe(0);
      expect(result.financial.capex).toBe(25_000_000);
      expect(result.financial.monthly_savings).toBe(0);
      expect(result.financial.payback_years).toBeNull();
      expect(result.grid.independence_pct).toBe(0);
    });

    it('Case 5: Excess Battery Capacity (night load capping)', () => {
      const smallBillContext: SimulationContext = {
        ...baseContext,
        monthly_bill: 1_500_000, // 1000 kWh -> night load = 16.66 kWh/d
      };

      const config: SimulationConfig = {
        solar_kwp: 5,
        battery_kwh: 20, // 20 kWh battery
        ac_units: 0,
        is_led_upgraded: false,
      };

      const result = simulate(config, smallBillContext);
      expect(result.financial.capex).toBe(175_000_000);
      expect(result.financial.payback_years).toBeGreaterThan(10);
    });

    it('Case 6: AC and LED only (pure energy reduction without renewables)', () => {
      const config: SimulationConfig = {
        solar_kwp: 0,
        battery_kwh: 0,
        ac_units: 2,
        is_led_upgraded: true,
      };

      const result = simulate(config, baseContext);

      // Baseline: 3000 kWh, AC saving: 144 kWh, LED saving: 60 kWh -> post-efficiency: 2796 kWh
      expect(result.energy.monthly_demand_kwh).toBe(2796);
      expect(result.energy.grid_import_monthly).toBe(2796);
      expect(result.financial.monthly_savings).toBe(306_000);
      expect(result.grid.independence_pct).toBe(0);
    });

    it('Case 7: Missing Roof Area (fallback to 50m² -> max PV 7 kWp)', () => {
      const nullRoofContext: SimulationContext = {
        ...baseContext,
        roof_area: null,
      };

      const valid7Kwp: SimulationConfig = {
        solar_kwp: 7,
        battery_kwh: 0,
        ac_units: 0,
        is_led_upgraded: false,
      };

      expect(() => simulate(valid7Kwp, nullRoofContext)).not.toThrow();

      const invalid8Kwp: SimulationConfig = {
        solar_kwp: 8,
        battery_kwh: 0,
        ac_units: 0,
        is_led_upgraded: false,
      };

      expect(() => simulate(invalid8Kwp, nullRoofContext)).toThrow(
        PvConstraintExceededError
      );
    });

    it('Case 10: Invalid Negative Bill rejects with InvalidSimulationInputError', () => {
      const invalidContext: SimulationContext = {
        ...baseContext,
        monthly_bill: -500_000,
      };

      const config: SimulationConfig = {
        solar_kwp: 0,
        battery_kwh: 0,
        ac_units: 0,
        is_led_upgraded: false,
      };

      expect(() => simulate(config, invalidContext)).toThrow(
        InvalidSimulationInputError
      );
    });

    it('Case 11: Wasted Surplus Check (high PV, zero battery)', () => {
      const config: SimulationConfig = {
        solar_kwp: 7,
        battery_kwh: 0,
        ac_units: 0,
        is_led_upgraded: false,
      };

      const result = simulate(config, {
        ...baseContext,
        monthly_bill: 1_500_000,
      });

      expect(result.energy.wasted_surplus_monthly).toBeGreaterThan(0);
    });

    it('Case 13: 100% Grid Independence Boundary', () => {
      const lowBillContext: SimulationContext = {
        ...baseContext,
        monthly_bill: 300_000, // 200 kWh/mo -> 3.33 kWh day/night load
      };

      const config: SimulationConfig = {
        solar_kwp: 5, // ~16.8 kWh/d
        battery_kwh: 5, // satisfies night load easily
        ac_units: 0,
        is_led_upgraded: false,
      };

      const result = simulate(config, lowBillContext);

      expect(result.energy.grid_import_monthly).toBe(0);
      expect(result.grid.independence_pct).toBe(100.0);
    });

    it('Case 15: Calculation Determinism (identical output across 100 runs)', () => {
      const config: SimulationConfig = {
        solar_kwp: 4,
        battery_kwh: 5,
        ac_units: 2,
        is_led_upgraded: true,
      };

      const firstRun = JSON.stringify(simulate(config, baseContext));

      for (let i = 0; i < 100; i++) {
        const nextRun = JSON.stringify(simulate(config, baseContext));
        expect(nextRun).toBe(firstRun);
      }
    });

    it('Case 16: Efficiency Savings Exceed Baseline Demand throws INFEASIBLE_EFFICIENCY_CONFIGURATION', () => {
      const tinyBillContext: SimulationContext = {
        ...baseContext,
        monthly_bill: 50_000, // 50,000 / 1500 = 33.33 kWh
      };

      const config: SimulationConfig = {
        solar_kwp: 0,
        battery_kwh: 0,
        ac_units: 5, // 5 * 240 * 0.30 = 360 kWh savings (> 33.33 kWh)
        is_led_upgraded: false,
      };

      expect(() => simulate(config, tinyBillContext)).toThrow(
        InfeasibleEfficiencyConfigurationError
      );
    });
  });

  // Invariant & Mathematical Integrity
  describe('Mathematical Invariants', () => {
    it('guarantees physical and financial boundaries across randomized configurations', () => {
      const configs: SimulationConfig[] = [
        { solar_kwp: 0, battery_kwh: 0, ac_units: 0, is_led_upgraded: false },
        { solar_kwp: 3, battery_kwh: 5, ac_units: 1, is_led_upgraded: true },
        { solar_kwp: 7, battery_kwh: 20, ac_units: 3, is_led_upgraded: false },
      ];

      for (const config of configs) {
        const result = simulate(config, baseContext);

        expect(result.energy.grid_import_monthly).toBeGreaterThanOrEqual(0);
        expect(result.energy.wasted_surplus_monthly).toBeGreaterThanOrEqual(0);
        expect(result.energy.monthly_demand_kwh).toBeGreaterThanOrEqual(0);
        expect(result.financial.capex).toBeGreaterThanOrEqual(0);
        expect(result.financial.new_monthly_cost).toBeGreaterThanOrEqual(0);
        expect(result.grid.independence_pct).toBeGreaterThanOrEqual(0);
        expect(result.grid.independence_pct).toBeLessThanOrEqual(100);

        if (result.financial.payback_years !== null) {
          expect(result.financial.payback_years).toBeGreaterThan(0);
        }
      }
    });
  });
});