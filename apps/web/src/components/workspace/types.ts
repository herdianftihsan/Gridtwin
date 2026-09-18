import { Project, Scenario, SimulationResult } from '../../types/api';

export type WorkspaceTab = 'balanced' | 'fastest_payback' | 'custom';

export interface SimulationConfig {
  solar_kwp: number;
  battery_kwh: number;
  ac_units: number;
  is_led_upgraded: boolean;
  refrigerator_units: number;
  water_pump_upgraded: boolean;
}

export interface WorkspaceState {
  project: Project;
  recommendedScenario: Scenario | null;
  recentScenarios: Scenario[];
  activeTab: WorkspaceTab;
  currentConfig: SimulationConfig;
  currentResult: SimulationResult;
  isSimulating: boolean;
  isSaving: boolean;
  simulationError: string | null;
}