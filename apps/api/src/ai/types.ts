import { SimulationConfig, SimulationResult } from '../simulation/types.js';

export interface WhatIfIntent {
  readonly action: 'optimize' | 'simulate';
  readonly budget?: number | null;
  readonly objective?: 'save_money' | 'reduce_co2' | 'independence' | null;
  readonly solar_kwp?: number | null;
  readonly battery_kwh?: number | null;
  readonly ac_units?: number | null;
  readonly is_led_upgraded?: boolean | null;
}

export interface AiExplainInputPayload {
  readonly configuration: SimulationConfig;
  readonly baseline: SimulationResult['baseline'];
  readonly energy: SimulationResult['energy'];
  readonly financial: SimulationResult['financial'];
  readonly environmental: SimulationResult['environmental'];
  readonly grid: SimulationResult['grid'];
  readonly assumptions: SimulationResult['assumptions'];
  readonly user_context_question?: string | undefined;
}

export interface WhatIfResultPayload {
  readonly scenario_id: string;
  readonly scenario_type: 'what_if';
  readonly what_if_query: string;
  readonly simulation_result: SimulationResult;
}

export interface ExplainResultPayload {
  readonly scenario_id: string;
  readonly explanation: string;
}