import { DEFAULT_ASSUMPTIONS } from './constants.js';
import { SolarGenerationResult } from './types.js';

export const calculatePvConstraints = (
  roofArea: number | null
): { maxPvPhysical: number; maxPvAllowed: number } => {
  const effectiveRoofArea =
    roofArea !== null && roofArea > 0
      ? roofArea
      : DEFAULT_ASSUMPTIONS.DEFAULT_ROOF_AREA;

  const maxPvPhysical = effectiveRoofArea / DEFAULT_ASSUMPTIONS.ROOF_M2_PER_KWP;
  const maxPvAllowed = Math.min(
    DEFAULT_ASSUMPTIONS.MAX_SEARCH_PV_KWP,
    maxPvPhysical
  );

  return {
    maxPvPhysical,
    maxPvAllowed,
  };
};

export const calculateSolarGeneration = (
  solarKwp: number,
  pshDaily: number,
  performanceRatio: number = DEFAULT_ASSUMPTIONS.PERFORMANCE_RATIO,
  daysInMonth: number = DEFAULT_ASSUMPTIONS.DAYS_IN_MONTH
): SolarGenerationResult => {
  const yieldMonthly = solarKwp * pshDaily * performanceRatio * daysInMonth;
  const solarDaily = yieldMonthly / daysInMonth;

  return {
    yield_monthly: yieldMonthly,
    solar_daily: solarDaily,
  };
};