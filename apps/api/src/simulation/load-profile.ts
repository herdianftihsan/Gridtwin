import { DEFAULT_ASSUMPTIONS } from './constants.js';
import { RepresentativeDayLoad } from './types.js';

export const calculateRepresentativeDay = (
  monthlyDemandPostEfficiency: number,
  daysInMonth: number = DEFAULT_ASSUMPTIONS.DAYS_IN_MONTH
): RepresentativeDayLoad => {
  const dailyDemand = monthlyDemandPostEfficiency / daysInMonth;
  const dayLoad = dailyDemand * 0.5;
  const nightLoad = dailyDemand * 0.5;

  return {
    daily_demand: dailyDemand,
    day_load: dayLoad,
    night_load: nightLoad,
  };
};