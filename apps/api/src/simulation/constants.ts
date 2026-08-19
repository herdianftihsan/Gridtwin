export const DEFAULT_ASSUMPTIONS = {
  GRID_TARIFF: 1500, // Rp/kWh (B2/R1 assumption)
  EMISSION_FACTOR: 0.79, // kg CO2/kWh (ESDM Jawa-Bali 2024)
  DEFAULT_PSH: 4.5, // Peak Sun Hours fallback
  PERFORMANCE_RATIO: 0.75, // System losses (temp, inverter, dust)
  DAYS_IN_MONTH: 30, // Representative monthly scaling
  ROOF_M2_PER_KWP: 7, // 7 m² per kWp physical space
  DEFAULT_ROOF_AREA: 50, // Default 50 m² fallback
  MAX_SEARCH_PV_KWP: 10, // Max search space constraint
  BATTERY_CHARGE_EFFICIENCY: 0.95,
  BATTERY_DISCHARGE_EFFICIENCY: 0.95,
  AC_STANDARD_CONSUMPTION: 0.8, // kWh/h (1 PK standard)
  AC_OPERATING_HOURS: 10, // h/day
  AC_REDUCTION_FACTOR: 0.30, // 30% reduction with Inverter
  BASELINE_LIGHTING_MONTHLY: 100, // kWh/month
  LED_REDUCTION_FACTOR: 0.60, // 60% reduction with Smart LED
  SOLAR_CAPEX_PER_KWP: 15_000_000, // Rp/kWp
  BATTERY_CAPEX_PER_KWH: 5_000_000, // Rp/kWh
  AC_CAPEX_PER_UNIT: 5_000_000, // Rp/unit
  LED_CAPEX_PER_LOT: 1_500_000, // Rp/lot
  SOURCE_VERSION: 'mvp-1.0',
} as const;

/**
 * Static PSH lookup table for Indonesian cities.
 * Pure in-memory lookup with fallback; no GIS/geospatial API call.
 */
export const STATIC_PSH_MAP: Readonly<Record<string, number>> = Object.freeze({
  surabaya: 4.5,
  jakarta: 4.3,
  bandung: 4.1,
  semarang: 4.4,
  yogyakarta: 4.4,
  denpasar: 4.8,
  bali: 4.8,
  medan: 4.0,
  makassar: 4.6,
});

export const lookupPsh = (location: string): number => {
  const normalized = location.trim().toLowerCase();
  const matched = STATIC_PSH_MAP[normalized];
  return matched !== undefined ? matched : DEFAULT_ASSUMPTIONS.DEFAULT_PSH;
};