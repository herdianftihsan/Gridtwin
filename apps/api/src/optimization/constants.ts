import { DEFAULT_ASSUMPTIONS } from '../simulation/constants.js';

export const SEARCH_SPACE_STEPS = {
  SOLAR_KWP_OPTIONS: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const, // 11 options
  BATTERY_KWH_OPTIONS: [0, 5, 10, 15, 20] as const, // 5 options
  AC_UNITS_OPTIONS: [0, 1, 2, 3, 4, 5] as const, // 6 options
  LED_OPTIONS: [false, true] as const, // 2 options
} as const;

export const TOTAL_RAW_CANDIDATE_COUNT = 660; // 11 * 5 * 6 * 2
export const MAX_PROPOSED_CANDIDATE_COUNT = 659; // 660 - 1 (Baseline excluded)

export interface ObjectiveWeights {
  readonly cost: number;
  readonly co2: number;
  readonly independence: number;
}

export const OBJECTIVE_WEIGHTS_MAP: Readonly<
  Record<'save_money' | 'reduce_co2' | 'independence', ObjectiveWeights>
> = Object.freeze({
  save_money: {
    cost: 0.7,
    co2: 0.15,
    independence: 0.15,
  },
  reduce_co2: {
    cost: 0.2,
    co2: 0.7,
    independence: 0.1,
  },
  independence: {
    cost: 0.2,
    co2: 0.1,
    independence: 0.7,
  },
});

export const CHEAPEST_FEASIBLE_ASSET = {
  assets: [{ type: 'led', level: 1 }],
  capex: DEFAULT_ASSUMPTIONS.LED_CAPEX_PER_LOT, // Rp 1.500.000
} as const;