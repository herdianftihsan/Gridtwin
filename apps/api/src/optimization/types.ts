import { SimulationConfig, SimulationContext, SimulationResult } from '../simulation/types.js';

export interface CandidateScores {
  readonly cost_score: number;
  readonly co2_score: number;
  readonly independence_score: number;
  readonly final_score: number;
}

export interface ScoredCandidate {
  readonly candidate_id: number;
  readonly config: SimulationConfig;
  readonly simulation_result: SimulationResult;
  readonly scores: CandidateScores;
}

export interface OptimizationResult {
  readonly scenario_type: 'recommended';
  readonly is_recommended: true;
  readonly configuration: SimulationConfig;
  readonly simulation_result: SimulationResult;
  readonly scores: CandidateScores;
  readonly metrics_summary: {
    readonly total_candidates_evaluated: number;
    readonly feasible_candidates_count: number;
    readonly excluded_candidates_count: number;
  };
}

export type OptimizationContext = SimulationContext;