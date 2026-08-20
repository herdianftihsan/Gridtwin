import { ScoredCandidate } from './types.js';

/**
 * Deterministic candidate ranking with 3-tier tie-breaking:
 * 1. FinalScore DESC
 * 2. Simple Payback Period ASC (null payback treated as worse than any positive number)
 * 3. CAPEX ASC
 * 4. Deterministic initial candidate ID preservation
 */
export const rankCandidates = (
  candidates: readonly ScoredCandidate[]
): ScoredCandidate[] => {
  return [...candidates].sort((a, b) => {
    // Tier 1: Final Score DESC
    const scoreDiff = b.scores.final_score - a.scores.final_score;
    if (Math.abs(scoreDiff) > 1e-9) {
      return scoreDiff;
    }

    // Tier 2: Simple Payback Period ASC
    const paybackA = a.simulation_result.financial.payback_years;
    const paybackB = b.simulation_result.financial.payback_years;

    if (paybackA !== null && paybackB !== null) {
      const paybackDiff = paybackA - paybackB;
      if (Math.abs(paybackDiff) > 1e-9) {
        return paybackDiff;
      }
    } else if (paybackA !== null && paybackB === null) {
      return -1; // a is better (has valid payback)
    } else if (paybackA === null && paybackB !== null) {
      return 1; // b is better (has valid payback)
    }

    // Tier 3: CAPEX ASC
    const capexDiff =
      a.simulation_result.financial.capex - b.simulation_result.financial.capex;
    if (Math.abs(capexDiff) > 1e-9) {
      return capexDiff;
    }

    // Tier 4: Stable Candidate ID ASC
    return a.candidate_id - b.candidate_id;
  });
};