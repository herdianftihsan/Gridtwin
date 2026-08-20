import { simulate } from '../simulation/simulate.js';
import { CHEAPEST_FEASIBLE_ASSET, TOTAL_RAW_CANDIDATE_COUNT } from './constants.js';
import { NoFeasibleScenarioDomainError } from './errors.js';
import { filterFeasibleCandidates } from './feasibility.js';
import { generateRawCandidates } from './generate-candidates.js';
import { rankCandidates } from './ranking.js';
import { calculateCandidateScores } from './scoring.js';
import { OptimizationContext, OptimizationResult, ScoredCandidate } from './types.js';

export const optimize = (context: OptimizationContext): OptimizationResult => {
  // 1. Generate the 660 raw candidate configurations
  const rawCandidates = generateRawCandidates();

  // 2. Filter feasible candidates
  const feasibleCandidates = filterFeasibleCandidates(rawCandidates, context);

  // 3. Handle zero feasible scenarios
  if (feasibleCandidates.length === 0) {
    throw new NoFeasibleScenarioDomainError(
      'Budget terlalu rendah untuk konfigurasi sistem yang tersedia.',
      {
        cheapest_feasible_option: CHEAPEST_FEASIBLE_ASSET,
      }
    );
  }

  // 4. Run deterministic simulation & calculate scores for each feasible candidate
  const scoredCandidates: ScoredCandidate[] = [];
  for (let i = 0; i < feasibleCandidates.length; i++) {
    const candidate = feasibleCandidates[i]!;
    const simulationResult = simulate(candidate, context);
    const scores = calculateCandidateScores(simulationResult, context);

    scoredCandidates.push({
      candidate_id: i,
      config: candidate,
      simulation_result: simulationResult,
      scores,
    });
  }

  // 5. Rank candidates deterministically
  const rankedCandidates = rankCandidates(scoredCandidates);
  const bestCandidate = rankedCandidates[0]!;

  return {
    scenario_type: 'recommended',
    is_recommended: true,
    configuration: bestCandidate.config,
    simulation_result: bestCandidate.simulation_result,
    scores: bestCandidate.scores,
    metrics_summary: {
      total_candidates_evaluated: TOTAL_RAW_CANDIDATE_COUNT,
      feasible_candidates_count: feasibleCandidates.length,
      excluded_candidates_count: TOTAL_RAW_CANDIDATE_COUNT - feasibleCandidates.length,
    },
  };
};