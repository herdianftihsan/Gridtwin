import { describe, it, expect } from 'vitest';
import { simulate } from '../simulate.js';
import { SimulationConfig, SimulationContext } from '../types.js';

describe('Phase 4: 660 Candidate Simulation Search Space Benchmark', () => {
  // Configured with 70 m² roof area to support the full 10 kWp search space (70 / 7 = 10 kWp)
  const context: SimulationContext = {
    building_type: 'Ruko',
    location: 'Surabaya',
    roof_area: 70,
    monthly_bill: 4_500_000,
    budget: 200_000_000,
    objective: 'save_money',
  };

  it('executes the full 660 raw candidate search space synchronously under 50ms', () => {
    const solarOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // 11 Solar options (0..10 kWp)
    const batteryOptions = [0, 5, 10, 15, 20]; // 5 Battery options (0..20 kWh)
    const acOptions = [0, 1, 2, 3, 4, 5]; // 6 AC options (0..5 units)
    const ledOptions = [false, true]; // 2 LED options (No, Yes)

    const candidates: SimulationConfig[] = [];
    for (const solar_kwp of solarOptions) {
      for (const battery_kwh of batteryOptions) {
        for (const ac_units of acOptions) {
          for (const is_led_upgraded of ledOptions) {
            candidates.push({
              solar_kwp,
              battery_kwh,
              ac_units,
              is_led_upgraded,
            });
          }
        }
      }
    }

    expect(candidates.length).toBe(660); // 11 * 5 * 6 * 2 = 660 raw configurations

    const startTime = performance.now();
    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i]!;
      simulate(candidate, context);
    }
    const totalTimeMs = performance.now() - startTime;
    const avgLatencyUs = (totalTimeMs / candidates.length) * 1000;

    console.log('\n========================================');
    console.log('PHASE 4 BENCHMARK RESULT');
    console.log('========================================');
    console.log(`Total candidates       : ${candidates.length}`);
    console.log(`Total execution time   : ${totalTimeMs.toFixed(2)} ms`);
    console.log(`Average per simulation : ${avgLatencyUs.toFixed(2)} µs`);
    console.log('========================================\n');

    expect(totalTimeMs).toBeLessThan(50);
    expect(avgLatencyUs).toBeLessThan(100);
  });
});