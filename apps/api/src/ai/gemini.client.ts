import { GoogleGenAI, GenerateContentConfig } from '@google/genai';
import { config } from '../config/env.js';
import {
  AiProviderAuthError,
  AiRateLimitedError,
  AiTimeoutError,
  AiProviderUnavailableError,
  AiProviderInvalidResponseError,
  AiError,
} from './errors.js';
import { logger } from '../utils/logger.js';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface AIProvider {
  generateText(request: ChatCompletionRequest): Promise<string>;
  generateStructured(request: ChatCompletionRequest): Promise<string>;
}

export class OfficialGeminiClient implements AIProvider {
  private ai: GoogleGenAI | null = null;
  private readonly model: string;
  private readonly maxOutputTokens: number;

  constructor() {
    this.model = config.GEMINI_MODEL || 'gemini-3.5-flash-lite';
    this.maxOutputTokens = config.GEMINI_MAX_OUTPUT_TOKENS;

    if (config.GEMINI_API_KEY) {
      this.ai = new GoogleGenAI({
        apiKey: config.GEMINI_API_KEY,
      });
    }
  }

  async generateText(request: ChatCompletionRequest): Promise<string> {
    return this.executeRequest(request, false);
  }

  async generateStructured(request: ChatCompletionRequest): Promise<string> {
    return this.executeRequest(request, true);
  }

  private async executeRequest(
    request: ChatCompletionRequest,
    isStructured: boolean
  ): Promise<string> {
    if (!this.ai) {
      throw new AiProviderUnavailableError();
    }

    try {
      const systemInstructions = request.messages
        .filter((m) => m.role === 'system')
        .map((m) => m.content)
        .join('\n\n');

      const userMessages = request.messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

      // Fallback if no user messages are provided but there are system messages
      // Some simple prompts might be just one user message that was passed as system
      // But typically we enforce standard structure.
      const contents = userMessages.length > 0 ? userMessages : [{ role: 'user', parts: [{ text: ' ' }] }];

      const reqConfig: GenerateContentConfig = {
        temperature: request.temperature ?? 0,
        maxOutputTokens: request.maxTokens ?? this.maxOutputTokens,
        responseMimeType: isStructured ? 'application/json' : 'text/plain',
      };

      if (systemInstructions) {
        reqConfig.systemInstruction = systemInstructions;
      }

      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: contents,
        config: reqConfig,
      });

      const candidateText = response.text;

      if (typeof candidateText !== 'string' || candidateText.trim().length === 0) {
        throw new AiProviderInvalidResponseError();
      }

      return candidateText.trim();
    } catch (err: unknown) {
      if (
        err instanceof AiError ||
        err instanceof AiProviderAuthError ||
        err instanceof AiRateLimitedError ||
        err instanceof AiTimeoutError ||
        err instanceof AiProviderUnavailableError ||
        err instanceof AiProviderInvalidResponseError
      ) {
        throw err;
      }

      const error = err as Error;

      // Handle specific Gemini API errors if possible based on error message/status
      if (error.message.includes('API key not valid') || error.message.includes('403')) {
        throw new AiProviderAuthError();
      }
      if (error.message.includes('429')) {
        throw new AiRateLimitedError();
      }
      if (error.message.includes('timeout') || error.message.includes('abort') || error.name === 'AbortError' || error.name === 'TimeoutError') {
        throw new AiTimeoutError();
      }

      logger.error('Gemini SDK invocation error', error);
      throw new AiProviderUnavailableError();
    }
  }
}

export const geminiClient = new OfficialGeminiClient();
