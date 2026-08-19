import { BaselineModelResult } from './types.js';

export const calculateBaseline = (
  monthlyBill: number,
  tariff: number,
  emissionFactor: number
): BaselineModelResult => {
  const monthlyKwh = monthlyBill / tariff;
  const annualCost = monthlyBill * 12;
  const baselineCo2Kg = monthlyKwh * emissionFactor;

  return {
    monthly_cost: monthlyBill,
    monthly_kwh: monthlyKwh,
    annual_cost: annualCost,
    baseline_co2_kg: baselineCo2Kg,
  };
};