import { geminiClient, GeminiClient } from './gemini.client.js';
import { buildExplainPrompt } from './prompts/explain.js';
import { AiExplainInputPayload } from './types.js';
import { AiError } from './errors.js';

export class ExplanationService {
  constructor(private readonly client: GeminiClient = geminiClient) {}

  async generateExplanation(payload: AiExplainInputPayload): Promise<string> {
    const prompt = buildExplainPrompt(payload);
    let explanation: string;

    try {
      explanation = await this.client.generateContent(prompt);
    } catch (err) {
      if (err instanceof AiError) {
        throw err;
      }
      throw new AiError('Failed to communicate with AI service.', {
        reason: err instanceof Error ? err.message : String(err),
      });
    }

    if (!explanation || explanation.trim().length === 0) {
      throw new AiError('Failed to generate a valid textual explanation.');
    }

    return explanation;
  }
}

export const explanationService = new ExplanationService();