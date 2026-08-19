import { DEFAULT_ASSUMPTIONS } from './constants.js';
import { GridBalanceResult } from './types.js';

export const calculateGridBalance = (
  dayLoad: number,
  selfConsumptionDaily: number,
  nightLoad: number,
  batteryDischargedDaily: number,
  wastedSurplusDaily: number,
  daysInMonth: number = DEFAULT_ASSUMPTIONS.DAYS_IN_MONTH
): GridBalanceResult => {
  const dayImport = Math.max(0, dayLoad - selfConsumptionDaily);
  const nightImport = Math.max(0, nightLoad - batteryDischargedDaily);

  const gridImportDaily = dayImport + nightImport;
  const gridImportMonthly = gridImportDaily * daysInMonth;
  const wastedSurplusMonthly = wastedSurplusDaily * daysInMonth;

  return {
    grid_import_daily: gridImportDaily,
    grid_import_monthly: gridImportMonthly,
    wasted_surplus_monthly: wastedSurplusMonthly,
  };
};