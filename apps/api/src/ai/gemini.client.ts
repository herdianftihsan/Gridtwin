import { config } from '../config/env.js';
import { AiError } from './errors.js';
import { logger } from '../utils/logger.js';

export interface GeminiResponseCandidate {
  content?: {
    parts?: Array<{ text?: string }>;
  };
}

export interface GeminiApiResponse {
  candidates?: GeminiResponseCandidate[];
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

export class GeminiClient {
  private readonly apiKey: string;
  private readonly endpoint: string;
  private readonly timeoutMs: number;

  constructor(apiKey = config.GEMINI_API_KEY, timeoutMs = 15_000) {
    this.apiKey = apiKey;
    this.timeoutMs = timeoutMs;
    this.endpoint =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  }

  async generateContent(prompt: string): Promise<string> {
    const url = `${this.endpoint}?key=${this.apiKey}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 500,
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`Gemini upstream error [HTTP ${response.status}]: ${errorText}`);
        throw new AiError('Gemini upstream API returned an error response.');
      }

      const json = (await response.json()) as GeminiApiResponse;
      const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!candidateText || candidateText.trim().length === 0) {
        throw new AiError('Gemini API returned an empty text response.');
      }

      return candidateText.trim();
    } catch (err: unknown) {
      if (err instanceof AiError) {
        throw err;
      }

      const error = err as Error;
      if (error.name === 'AbortError') {
        logger.error(`Gemini request timed out after ${this.timeoutMs}ms`);
        throw new AiError('AI request timed out after 15 seconds.');
      }

      logger.error('Gemini invocation error', error);
      throw new AiError('Failed to communicate with AI service.');
    } finally {
      clearTimeout(timer);
    }
  }
}

export const geminiClient = new GeminiClient();