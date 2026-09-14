import { ChatMessage } from '../gemini.client.js';
import { AiExplainInputPayload } from '../types.js';

export const buildExplainPrompt = (payload: AiExplainInputPayload): ChatMessage[] => {
  const sanitizedQuestion = payload.user_context_question
    ? payload.user_context_question.replace(/<user_question>|<\/user_question>/gi, '').trim()
    : null;

  const summary = {
    configuration: payload.configuration,
    metrics: {
      baseline_cost: payload.baseline.monthly_cost,
      new_cost: payload.financial.new_monthly_cost,
      monthly_savings: payload.financial.monthly_savings,
      payback_years: payload.financial.payback_years,
      co2_reduction_kg_yr: payload.environmental.co2_reduction_kg_yr,
      co2_reduction_pct: payload.environmental.co2_reduction_pct,
      independence_pct: payload.grid.independence_pct,
    }
  };

  const systemContent = `You are an energy decision analyst for GridTwin AI.
Explain the following simulation result to the building owner in clear, concise, and professional Indonesian.

Rules:
1. Use ONLY the exact numbers provided in the DATA block below.
2. NEVER invent, recalculate, or alter any numbers, tariffs, or payback periods.
3. Solar surplus does NOT generate revenue (no export credit).
4. Extract the key trade-off (e.g. CAPEX vs Monthly Savings, Payback Period, and Grid Independence).
5. Extract the main insight about why this configuration performs this way.
6. Keep the explanations under 50 words each.
7. You MUST return ONLY a valid JSON object with exactly two keys: "trade_off" and "insight". Do not wrap in markdown blocks.

Example Output:
{
  "trade_off": "Mengurangi CAPEX awal menurunkan komitmen modal, namun juga menghasilkan penghematan bulanan yang lebih rendah.",
  "insight": "Konfigurasi ini memprioritaskan biaya awal yang rendah dengan tetap menjaga tingkat kemandirian jaringan yang moderat."
}

DATA:
${JSON.stringify(summary, null, 2)}`;

  const userContent = sanitizedQuestion
    ? `<user_question>\n${sanitizedQuestion}\n</user_question>\nAddress the user's question directly using the provided DATA. Return ONLY JSON.`
    : `Please explain this simulation result to me. Return ONLY JSON.`;

  return [
    { role: 'system', content: systemContent },
    { role: 'user', content: userContent }
  ];
};