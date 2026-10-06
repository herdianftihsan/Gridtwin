import { Project, SimulationResult } from '../../../types/api';
import { mapSimulationToCanvas } from '../energy-canvas/energy-status';
import { CanvasViewModel, NodeKey, NodeTelemetry } from '../energy-canvas/types';

export type EnergyTwinAssetKind = 'source' | 'building' | 'storage' | 'grid' | 'load';

export interface EnergyTwinAsset {
  id: NodeKey;
  kind: EnergyTwinAssetKind;
  telemetry: NodeTelemetry;
}

export interface EnergyTwinFlow {
  id: string;
  from: NodeKey | 'building';
  to: NodeKey | 'surplus';
  color: string;
  active: boolean;
  animated: boolean;
  valueKwh: number;
  label: string;
}

export interface EnergyTwinViewModel {
  building: {
    type: string;
    location: string;
    footprint: { width: number; depth: number };
    floors: number;
    roofArea: number | null;
  };
  assets: EnergyTwinAsset[];
  flows: EnergyTwinFlow[];
  summary: CanvasViewModel['summary'];
}

const BUILDING_SHELLS: Record<string, { width: number; depth: number; floors: number }> = {
  Ruko: { width: 0.78, depth: 0.58, floors: 3 },
  Residential: { width: 0.7, depth: 0.62, floors: 2 },
  Office: { width: 0.86, depth: 0.62, floors: 4 },
};

function getLocation(project?: Project | null, overrideLocation?: string): string {
  const rawLocation = overrideLocation ?? project?.location ?? 'Surabaya';
  return typeof rawLocation === 'string' ? rawLocation : rawLocation.name;
}

export function mapSimulationToEnergyTwin(
  result: SimulationResult,
  project?: Project | null,
  overrideBuildingType?: string,
  overrideLocation?: string,
): EnergyTwinViewModel {
  const canvasModel = mapSimulationToCanvas(result, project, overrideBuildingType, overrideLocation);
  const buildingType = overrideBuildingType ?? project?.building_type ?? 'Ruko';
  const shell = BUILDING_SHELLS[buildingType] || { width: 0.78, depth: 0.58, floors: 3 };
  const { configuration, energy } = result;

  const assets: EnergyTwinAsset[] = (Object.keys(canvasModel.nodes) as NodeKey[]).map((id) => ({
    id,
    kind: id === 'building' ? 'building' : id === 'solar' ? 'source' : id === 'battery' ? 'storage' : id === 'grid' ? 'grid' : 'load',
    telemetry: canvasModel.nodes[id],
  }));

  const flows: EnergyTwinFlow[] = [
    {
      id: 'solar-building',
      from: 'solar',
      to: 'building',
      color: '#F59E0B',
      active: configuration.pv_kwp > 0 && energy.solar_yield_monthly > 0,
      animated: configuration.pv_kwp > 0 && energy.solar_yield_monthly > 0,
      valueKwh: energy.solar_yield_monthly,
      label: 'Solar ke bangunan',
    },
    {
      id: 'solar-battery',
      from: 'solar',
      to: 'battery',
      color: '#F59E0B',
      active: configuration.pv_kwp > 0 && configuration.battery_kwh > 0 && energy.solar_yield_monthly > 0,
      animated: configuration.pv_kwp > 0 && configuration.battery_kwh > 0 && energy.solar_yield_monthly > 0,
      valueKwh: energy.wasted_surplus_monthly,
      label: 'Surplus solar ke baterai',
    },
    {
      id: 'battery-building',
      from: 'battery',
      to: 'building',
      color: '#14B8A6',
      active: configuration.battery_kwh > 0 && energy.grid_import_monthly < energy.monthly_demand_kwh,
      animated: configuration.battery_kwh > 0 && energy.grid_import_monthly < energy.monthly_demand_kwh,
      valueKwh: Math.max(0, energy.monthly_demand_kwh - energy.grid_import_monthly),
      label: 'Baterai ke bangunan',
    },
    {
      id: 'grid-building',
      from: 'grid',
      to: 'building',
      color: '#6366F1',
      active: energy.grid_import_monthly > 0,
      animated: energy.grid_import_monthly > 0,
      valueKwh: energy.grid_import_monthly,
      label: 'Jaringan PLN ke bangunan',
    },
    {
      id: 'building-surplus',
      from: 'building',
      to: 'surplus',
      color: '#64748B',
      active: energy.wasted_surplus_monthly > 0,
      animated: false,
      valueKwh: energy.wasted_surplus_monthly,
      label: 'Surplus tidak terpakai',
    },
  ];

  return {
    building: {
      type: buildingType,
      location: getLocation(project, overrideLocation),
      footprint: { width: shell.width, depth: shell.depth },
      floors: shell.floors,
      roofArea: project?.roof_area ?? null,
    },
    assets,
    flows,
    summary: canvasModel.summary,
  };
}
