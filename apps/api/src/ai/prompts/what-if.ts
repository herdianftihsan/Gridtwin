export const buildWhatIfPrompt = (userMessage: string): string => {
  // Sanitize user message delimiters
  const sanitizedMessage = userMessage.replace(/<intent_query>|<\/intent_query>/gi, '').trim();

  return `You are a strict natural language intent parser for an energy simulation platform.
You are NOT a calculator. You MUST NOT calculate financial, energy, payback, or solar metrics.

Your only task is to parse the user's inquiry into a strict JSON intent structure.

Rules:
1. Extract ONLY values explicitly mentioned in the user message.
2. If the user mentions modifying the overall budget or changing the optimization goal, set "action": "optimize".
3. If the user mentions specific asset sizes (e.g. solar kWp, battery kWh, AC units, LED), set "action": "simulate".
4. If a field is not mentioned by the user, return null for that field.
5. If the intent is ambiguous or asks a generic "what if" question without specific assets, default to "action": "optimize".
6. Never invent numbers, energy metrics, or financial calculations.
7. Return raw JSON matching this schema:
{
  "action": "optimize" | "simulate",
  "budget": number | null,
  "objective": "save_money" | "reduce_co2" | "independence" | null,
  "solar_kwp": number | null,
  "battery_kwh": 0 | 5 | 10 | 15 | 20 | null,
  "ac_units": number | null,
  "is_led_upgraded": boolean | null
}

<intent_query>
${sanitizedMessage}
</intent_query>

Output valid JSON only. Do not wrap in markdown or backticks.`;
};