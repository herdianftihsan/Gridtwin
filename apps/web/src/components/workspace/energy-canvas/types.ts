import { SimulationResult, Project } from '../../../types/api';

export type NodeKey = 'solar' | 'building' | 'battery' | 'grid' | 'ac' | 'led';

export interface NodePosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface NodeTelemetry {
  id: NodeKey;
  label: string;
  sublabel: string;
  valueDisplay: string;
  isActive: boolean;
  statusBadge?: string;
  details: { label: string; value: string }[];
}

export interface ConnectionState {
  id: string;
  from: NodeKey;
  to: NodeKey;
  isActive: boolean;
  color: string;
  flowDirection: 'forward' | 'reverse';
  animated: boolean;
  curveOffset?: number;
  label?: string;
}

export interface EnergyBalanceSummary {
  monthlyDemandKwh: number;
  solarYieldKwh: number;
  gridImportKwh: number;
  wastedSurplusKwh: number;
  independencePct: number;
  hasSolar: boolean;
  hasBattery: boolean;
  hasGridImport: boolean;
}

export interface CanvasViewModel {
  nodes: Record<NodeKey, NodeTelemetry>;
  connections: ConnectionState[];
  summary: EnergyBalanceSummary;
}

export interface EnergyCanvasProps {
  result: SimulationResult;
  project?: Project | null;
  buildingType?: string;
  location?: string;
  isSimulating?: boolean;
}