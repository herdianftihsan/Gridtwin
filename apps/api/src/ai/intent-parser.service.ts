import { geminiClient, GeminiClient } from './gemini.client.js';
import { buildWhatIfPrompt } from './prompts/what-if.js';
import { whatIfIntentSchema, WhatIfIntentOutput } from './schemas.js';
import { AiError } from './errors.js';
import { logger } from '../utils/logger.js';

export class IntentParserService {
  constructor(private readonly client: GeminiClient = geminiClient) {}

  async parseWhatIfIntent(userMessage: string): Promise<WhatIfIntentOutput> {
    const prompt = buildWhatIfPrompt(userMessage);
    let rawResponse: string;

    try {
      rawResponse = await this.client.generateContent(prompt);
    } catch (err) {
      if (err instanceof AiError) {
        throw err;
      }
      throw new AiError('Failed to communicate with AI service.', {
        reason: err instanceof Error ? err.message : String(err),
      });
    }

    // Strip markdown formatting if returned
    const cleanJsonString = rawResponse
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    try {
      const parsedJson = JSON.parse(cleanJsonString);
      const validated = whatIfIntentSchema.safeParse(parsedJson);

      if (!validated.success) {
        logger.warn('Gemini intent schema validation failed', {
          issues: validated.error.issues,
          rawResponse,
        });
        throw new AiError('Invalid intent structure returned by AI model.');
      }

      return validated.data;
    } catch (err) {
      if (err instanceof AiError) throw err;
      logger.warn('Failed to parse Gemini intent JSON', { rawResponse, error: err });
      throw new AiError('AI model failed to generate a valid structured JSON intent.');
    }
  }
}

export const intentParserService = new IntentParserService();