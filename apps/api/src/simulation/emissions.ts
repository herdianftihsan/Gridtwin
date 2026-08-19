import { DEFAULT_ASSUMPTIONS } from './constants.js';
import { EnvironmentalResult, GridIndependenceResult } from './types.js';

export const calculateEmissions = (
  baselineMonthlyKwh: number,
  gridImportMonthly: number,
  emissionFactor: number = DEFAULT_ASSUMPTIONS.EMISSION_FACTOR
): EnvironmentalResult => {
  const baselineCo2Monthly = baselineMonthlyKwh * emissionFactor;
  const scenarioCo2Monthly = gridImportMonthly * emissionFactor;

  const co2ReductionKgYr = (baselineCo2Monthly - scenarioCo2Monthly) * 12;
  const co2ReductionPct =
    baselineCo2Monthly > 0
      ? ((baselineCo2Monthly - scenarioCo2Monthly) / baselineCo2Monthly) * 100
      : 0;

  return {
    co2_reduction_kg_yr: co2ReductionKgYr,
    co2_reduction_pct: co2ReductionPct,
  };
};

export const calculateGridIndependence = (
  gridImportMonthly: number,
  monthlyDemandPostEfficiency: number
): GridIndependenceResult => {
  if (monthlyDemandPostEfficiency <= 0) {
    return { independence_pct: 0 };
  }

  const rawFraction = 1 - gridImportMonthly / monthlyDemandPostEfficiency;
  const clampedFraction = Math.max(0, Math.min(1, rawFraction));

  return {
    independence_pct: clampedFraction * 100,
  };
};