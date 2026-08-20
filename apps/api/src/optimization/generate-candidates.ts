import { SimulationConfig } from '../simulation/types.js';
import { SEARCH_SPACE_STEPS } from './constants.js';

/**
 * Pure generator producing the deterministic 660 raw candidate space.
 */
export const generateRawCandidates = (): SimulationConfig[] => {
  const candidates: SimulationConfig[] = [];

  for (const solar_kwp of SEARCH_SPACE_STEPS.SOLAR_KWP_OPTIONS) {
    for (const battery_kwh of SEARCH_SPACE_STEPS.BATTERY_KWH_OPTIONS) {
      for (const ac_units of SEARCH_SPACE_STEPS.AC_UNITS_OPTIONS) {
        for (const is_led_upgraded of SEARCH_SPACE_STEPS.LED_OPTIONS) {
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

  return candidates;
};