import { DEFAULT_ASSUMPTIONS } from '../simulation/constants.js';
import { SimulationContext, SimulationResult } from '../simulation/types.js';
import { OBJECTIVE_WEIGHTS_MAP } from './constants.js';
import { CandidateScores } from './types.js';

export const calculateCandidateScores = (
  result: SimulationResult,
  context: SimulationContext
): CandidateScores => {
  const weights = OBJECTIVE_WEIGHTS_MAP[context.objective];

  // 1. Cost Score (Lower monthly cost is better)
  const costBaseline = result.baseline.monthly_cost;
  const costScenario = result.financial.new_monthly_cost;
  const rawCostScore =
    costBaseline > 0 ? (costBaseline - costScenario) / costBaseline : 0;
  const costScore = Math.max(0, Math.min(1, rawCostScore));

  // 2. CO2 Score (Lower scenario emissions is better)
  const emissionFactor =
    context.assumptions?.emission_factor ?? DEFAULT_ASSUMPTIONS.EMISSION_FACTOR;
  const co2Baseline = result.baseline.monthly_kwh * emissionFactor;
  const co2Scenario = result.energy.grid_import_monthly * emissionFactor;
  const rawCo2Score =
    co2Baseline > 0 ? (co2Baseline - co2Scenario) / co2Baseline : 0;
  const co2Score = Math.max(0, Math.min(1, rawCo2Score));

  // 3. Grid Independence Score (Higher independence is better)
  const postEffDemand = result.energy.monthly_demand_kwh;
  const rawIndependenceScore =
    postEffDemand > 0 ? 1 - result.energy.grid_import_monthly / postEffDemand : 0;
  const independenceScore = Math.max(0, Math.min(1, rawIndependenceScore));

  // 4. Multi-Objective Weighted Final Score
  const finalScore =
    weights.cost * costScore +
    weights.co2 * co2Score +
    weights.independence * independenceScore;

  return {
    cost_score: costScore,
    co2_score: co2Score,
    independence_score: independenceScore,
    final_score: finalScore,
  };
};