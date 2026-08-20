import { describe, it, expect } from 'vitest';
import { optimize } from '../optimize.js';
import { generateRawCandidates } from '../generate-candidates.js';
import { filterFeasibleCandidates } from '../feasibility.js';
import { OBJECTIVE_WEIGHTS_MAP, TOTAL_RAW_CANDIDATE_COUNT } from '../constants.js';
import { NoFeasibleScenarioDomainError } from '../errors.js';
import { OptimizationContext } from '../types.js';

describe('Phase 5: Deterministic Optimization Engine', () => {
  const baseContext: OptimizationContext = {
    building_type: 'Ruko',
    location: 'Surabaya',
    roof_area: 50,
    monthly_bill: 4_500_000,
    budget: 50_000_000,
    objective: 'save_money',
  };

  it('1. generates exactly 660 raw candidate combinations', () => {
    const candidates = generateRawCandidates();
    expect(candidates.length).toBe(TOTAL_RAW_CANDIDATE_COUNT);
  });

  it('2. excludes baseline and yields at most 659 proposed candidates', () => {
    const unconstrainedContext: OptimizationContext = {
      ...baseContext,
      roof_area: 100,
      budget: 500_000_000,
    };
    const raw = generateRawCandidates();
    const feasible = filterFeasibleCandidates(raw, unconstrainedContext);

    expect(feasible.length).toBe(659);
    expect(
      feasible.some(
        (c) =>
          c.solar_kwp === 0 &&
          c.battery_kwh === 0 &&
          c.ac_units === 0 &&
          !c.is_led_upgraded
      )
    ).toBe(false);
  });

  it('3. filters candidates by budget constraint', () => {
    const budgetContext: OptimizationContext = {
      ...baseContext,
      budget: 10_000_000, // Only LED (1.5M), AC=1 (5M), AC=2 (10M), PV=0
    };
    const raw = generateRawCandidates();
    const feasible = filterFeasibleCandidates(raw, budgetContext);

    for (const c of feasible) {
      const capex =
        c.solar_kwp * 15_000_000 +
        c.battery_kwh * 5_000_000 +
        c.ac_units * 5_000_000 +
        (c.is_led_upgraded ? 1_500_000 : 0);
      expect(capex).toBeLessThanOrEqual(10_000_000);
    }
  });

  it('4. filters candidates by physical roof constraint', () => {
    const smallRoofContext: OptimizationContext = {
      ...baseContext,
      roof_area: 21, // Max PV = 21 / 7 = 3 kWp
    };
    const raw = generateRawCandidates();
    const feasible = filterFeasibleCandidates(raw, smallRoofContext);

    for (const c of feasible) {
      expect(c.solar_kwp).toBeLessThanOrEqual(3);
    }
  });

  it('5. throws NoFeasibleScenarioDomainError when budget is zero or insufficient', () => {
    const zeroBudgetContext: OptimizationContext = {
      ...baseContext,
      budget: 0,
    };

    expect(() => optimize(zeroBudgetContext)).toThrow(
      NoFeasibleScenarioDomainError
    );

    try {
      optimize(zeroBudgetContext);
    } catch (err) {
      const error = err as NoFeasibleScenarioDomainError;
      expect(error.code).toBe('NO_FEASIBLE_SCENARIO');
      expect(error.details).toHaveProperty('cheapest_feasible_option');
    }
  });

  it('6. validates objective weights sum to 1.0', () => {
    for (const key of Object.keys(OBJECTIVE_WEIGHTS_MAP) as Array<
      keyof typeof OBJECTIVE_WEIGHTS_MAP
    >) {
      const weights = OBJECTIVE_WEIGHTS_MAP[key];
      const sum = weights.cost + weights.co2 + weights.independence;
      expect(Math.round(sum * 10) / 10).toBe(1.0);
    }
  });

  it('7. optimizes for save_money objective', () => {
    const result = optimize({
      ...baseContext,
      objective: 'save_money',
    });

    expect(result.scenario_type).toBe('recommended');
    expect(result.is_recommended).toBe(true);
    expect(result.scores.final_score).toBeGreaterThan(0);
    expect(result.scores.final_score).toBeLessThanOrEqual(1);
    expect(result.simulation_result.financial.capex).toBeLessThanOrEqual(
      baseContext.budget
    );
  });

  it('8. optimizes for independence objective', () => {
    const result = optimize({
      ...baseContext,
      budget: 100_000_000,
      objective: 'independence',
    });

    expect(result.configuration.solar_kwp).toBeGreaterThan(0);
    expect(result.scores.independence_score).toBeGreaterThan(0);
  });

  it('9. maintains deterministic execution across 50 iterations', () => {
    const firstRun = JSON.stringify(optimize(baseContext));

    for (let i = 0; i < 50; i++) {
      const nextRun = JSON.stringify(optimize(baseContext));
      expect(nextRun).toBe(firstRun);
    }
  });

  it('10. verifies input context immutability', () => {
    const frozenContext: OptimizationContext = Object.freeze({
      building_type: 'Ruko',
      location: 'Surabaya',
      roof_area: 50,
      monthly_bill: 4_500_000,
      budget: 50_000_000,
      objective: 'save_money',
    });

    expect(() => optimize(frozenContext)).not.toThrow();
    expect(frozenContext.monthly_bill).toBe(4_500_000);
  });
});