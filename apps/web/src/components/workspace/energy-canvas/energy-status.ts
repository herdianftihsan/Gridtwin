import { SimulationResult, Project } from '../../../types/api';
import { CanvasViewModel, NodeKey, NodeTelemetry, ConnectionState } from './types';

export function mapSimulationToCanvas(
  result: SimulationResult,
  project?: Project | null,
  overrideBuildingType?: string,
  overrideLocation?: string
): CanvasViewModel {
  const { configuration, energy, financial, grid } = result;

  const hasSolar = configuration.pv_kwp > 0;
  const hasBattery = configuration.battery_kwh > 0;
  const hasAc = configuration.ac_units > 0;
  const isLed = configuration.led_upgraded;
  const hasGridImport = energy.grid_import_monthly > 0;

  const buildingLabel = overrideBuildingType ?? project?.building_type ?? 'Commercial Ruko';
  const locationLabel = overrideLocation ?? project?.location ?? 'Surabaya';

  const nodes: Record<NodeKey, NodeTelemetry> = {
    solar: {
      id: 'solar',
      label: 'SOLAR PV',
      sublabel: hasSolar ? 'Proposed Asset' : 'Inactive Slot',
      valueDisplay: `${configuration.pv_kwp} kWp`,
      isActive: hasSolar,
      statusBadge: hasSolar ? 'Active Generation' : 'Not Configured',
      details: [
        { label: 'Installed Capacity', value: `${configuration.pv_kwp} kWp` },
        { label: 'Monthly Generation', value: `${Math.round(energy.solar_yield_monthly)} kWh/mo` },
        { label: 'Wasted Surplus', value: `${Math.round(energy.wasted_surplus_monthly)} kWh/mo` },
      ],
    },
    building: {
      id: 'building',
      label: 'BUILDING LOAD',
      sublabel: buildingLabel,
      valueDisplay: `${Math.round(energy.monthly_demand_kwh)} kWh/mo`,
      isActive: true,
      statusBadge: 'Baseline Demand',
      details: [
        { label: 'Location', value: locationLabel },
        { label: 'Post-Efficiency Demand', value: `${Math.round(energy.monthly_demand_kwh)} kWh/mo` },
        { label: 'Grid Autonomy', value: `${grid.independence_pct.toFixed(1)}%` },
      ],
    },
    battery: {
      id: 'battery',
      label: 'BATTERY STORAGE',
      sublabel: hasBattery ? 'Proposed Asset' : 'Inactive Slot',
      valueDisplay: `${configuration.battery_kwh} kWh`,
      isActive: hasBattery,
      statusBadge: hasBattery ? 'Peak Shifting' : 'Not Configured',
      details: [
        { label: 'Usable Capacity', value: `${configuration.battery_kwh} kWh` },
        { label: 'Round-Trip Efficiency', value: '90.2% (Combined)' },
        { label: 'Storage Role', value: 'Nighttime Peak Load Support' },
      ],
    },
    grid: {
      id: 'grid',
      label: 'PLN GRID',
      sublabel: 'Utility Connection',
      valueDisplay: `${Math.round(energy.grid_import_monthly)} kWh/mo`,
      isActive: hasGridImport,
      statusBadge: hasGridImport ? 'Active Import' : 'Zero Import',
      details: [
        { label: 'Monthly Grid Draw', value: `${Math.round(energy.grid_import_monthly)} kWh/mo` },
        { label: 'Electricity Cost', value: `Rp ${(financial.new_monthly_cost / 1_000_000).toFixed(2)}M/mo` },
        { label: 'Net-Metering Policy', value: 'Non-Export Credit (2024)' },
      ],
    },
    ac: {
      id: 'ac',
      label: 'AIR CONDITIONER',
      sublabel: 'Efficiency Upgrade',
      valueDisplay: `${configuration.ac_units} Units Inverter`,
      isActive: hasAc,
      statusBadge: hasAc ? 'Inverter Active' : 'Standard Baseline',
      details: [
        { label: 'Upgraded Units', value: `${configuration.ac_units} Inverter Units` },
        { label: 'Efficiency Impact', value: '30% Thermal Load Reduction' },
      ],
    },
    led: {
      id: 'led',
      label: 'SMART LED',
      sublabel: 'Lighting System',
      valueDisplay: isLed ? 'Upgraded' : 'Standard',
      isActive: isLed,
      statusBadge: isLed ? 'High-Efficiency' : 'Standard Baseline',
      details: [
        { label: 'Lighting Status', value: isLed ? 'Smart Solid-State LED' : 'Standard Luminaires' },
        { label: 'Efficiency Impact', value: '60% Lighting Load Reduction' },
      ],
    },
  };

  const connections: ConnectionState[] = [
    {
      id: 'solar-building',
      from: 'solar',
      to: 'building',
      isActive: hasSolar,
      color: '#F59E0B',
      flowDirection: 'forward',
      animated: hasSolar,
      label: 'Solar Self-Consumption',
    },
    {
      id: 'solar-battery',
      from: 'solar',
      to: 'battery',
      isActive: hasSolar && hasBattery,
      color: '#F59E0B',
      flowDirection: 'forward',
      animated: hasSolar && hasBattery,
      curveOffset: 45,
      label: 'Battery Charging',
    },
    {
      id: 'battery-building',
      from: 'battery',
      to: 'building',
      isActive: hasBattery,
      color: '#14B8A6',
      flowDirection: 'forward',
      animated: hasBattery,
      label: 'Nighttime Discharge',
    },
    {
      id: 'grid-building',
      from: 'grid',
      to: 'building',
      isActive: hasGridImport,
      color: '#6366F1',
      flowDirection: 'forward',
      animated: hasGridImport,
      label: 'PLN Grid Import',
    },
    {
      id: 'ac-building',
      from: 'ac',
      to: 'building',
      isActive: hasAc,
      color: '#94A3B8',
      flowDirection: 'forward',
      animated: false,
      curveOffset: -20,
    },
    {
      id: 'led-building',
      from: 'led',
      to: 'building',
      isActive: isLed,
      color: '#94A3B8',
      flowDirection: 'forward',
      animated: false,
      curveOffset: 20,
    },
  ];

  return {
    nodes,
    connections,
    summary: {
      monthlyDemandKwh: energy.monthly_demand_kwh,
      solarYieldKwh: energy.solar_yield_monthly,
      gridImportKwh: energy.grid_import_monthly,
      wastedSurplusKwh: energy.wasted_surplus_monthly,
      independencePct: grid.independence_pct,
      hasSolar,
      hasBattery,
      hasGridImport,
    },
  };
}