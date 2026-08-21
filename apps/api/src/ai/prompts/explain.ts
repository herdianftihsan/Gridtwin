import { AiExplainInputPayload } from '../types.js';

export const buildExplainPrompt = (payload: AiExplainInputPayload): string => {
  const sanitizedQuestion = payload.user_context_question
    ? payload.user_context_question.replace(/<user_question>|<\/user_question>/gi, '').trim()
    : null;

  return `You are an energy decision analyst for GridTwin AI.
Explain the following simulation result to the building owner in clear, concise, and professional Indonesian.

Rules:
1. Use ONLY the exact numbers provided in the DATA block below.
2. NEVER invent, recalculate, or alter any numbers, tariffs, or payback periods.
3. Solar surplus does NOT generate revenue (no export credit).
4. Highlight key trade-offs: CAPEX vs Monthly Savings, Payback Period, and Grid Independence.
5. Keep the explanation under 150 words. Avoid markdown tables. Use bolding sparingly for key metrics.

DATA:
${JSON.stringify(payload, null, 2)}

${
  sanitizedQuestion
    ? `<user_question>\n${sanitizedQuestion}\n</user_question>\nAddress the user's question directly using the provided DATA.`
    : ''
}

Output the explanation text directly.`;
};