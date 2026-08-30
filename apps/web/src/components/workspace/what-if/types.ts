import { SimulationResult} from '../../../types/api';

export type WhatIfStatus = 'idle' | 'input' | 'loading' | 'result' | 'error' | 'saved';

export interface WhatIfResponsePayload {
  scenario_id: string;
  scenario_type: 'what_if';
  what_if_query: string;
  simulation_result: SimulationResult;
}

export interface MetricDelta {
  label: string;
  baseFormatted: string;
  targetFormatted: string;
  deltaText?: string;
  deltaType: 'positive' | 'negative' | 'neutral';
  iconType: 'cost' | 'capex' | 'grid' | 'payback' | 'co2';
}

export interface ConfigChangeItem {
  assetLabel: string;
  currentDisplay: string;
  whatIfDisplay: string;
  hasChanged: boolean;
}

export interface WhatIfState {
  status: WhatIfStatus;
  query: string;
  scenarioId: string | null;
  result: SimulationResult | null;
  aiExplanation: string | null;
  error: string | null;
}