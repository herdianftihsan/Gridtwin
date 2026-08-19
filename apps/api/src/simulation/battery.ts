import { BatteryDispatchResult } from './types.js';

export const calculateBatteryDispatch = (
  solarDaily: number,
  dayLoad: number,
  nightLoad: number,
  batteryKwh: number,
  chargeEfficiency: number,
  dischargeEfficiency: number
): BatteryDispatchResult => {
  const selfConsumptionDaily = Math.min(solarDaily, dayLoad);
  const solarSurplusAvailable = solarDaily - selfConsumptionDaily;

  if (batteryKwh <= 0) {
    return {
      self_consumption_daily: selfConsumptionDaily,
      solar_surplus_available: solarSurplusAvailable,
      battery_energy_sent: 0,
      battery_energy_stored: 0,
      battery_energy_discharged: 0,
      wasted_surplus_daily: solarSurplusAvailable,
      remaining_grid_import_night: nightLoad,
    };
  }

  // Energy sent from surplus to battery
  const batteryEnergySent = Math.min(
    solarSurplusAvailable,
    batteryKwh / chargeEfficiency
  );

  // Stored after charge losses
  const batteryEnergyStored = batteryEnergySent * chargeEfficiency;

  // Wasted surplus represents solar power that could not be stored or consumed
  const wastedSurplusDaily = Math.max(0, solarSurplusAvailable - batteryEnergySent);

  // Discharged to satisfy night load
  const batteryEnergyDischarged = Math.min(
    batteryEnergyStored * dischargeEfficiency,
    nightLoad
  );

  const remainingGridImportNight = Math.max(
    0,
    nightLoad - batteryEnergyDischarged
  );

  return {
    self_consumption_daily: selfConsumptionDaily,
    solar_surplus_available: solarSurplusAvailable,
    battery_energy_sent: batteryEnergySent,
    battery_energy_stored: batteryEnergyStored,
    battery_energy_discharged: batteryEnergyDischarged,
    wasted_surplus_daily: wastedSurplusDaily,
    remaining_grid_import_night: remainingGridImportNight,
  };
};