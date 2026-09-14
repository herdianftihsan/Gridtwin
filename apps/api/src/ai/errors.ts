import { AppError, ApiErrorCode } from '../utils/errors.js';

export class AiError extends AppError {
  constructor(
    message = 'The AI service failed to process the request.',
    details: Record<string, unknown> = {},
    statusCode = 502,
    code: ApiErrorCode = 'AI_ERROR'
  ) {
    super(statusCode, code, message, details);
  }
}

export class AiProviderAuthError extends AiError {
  constructor(details: Record<string, unknown> = {}) {
    super('AI service is temporarily unavailable due to configuration issues.', details, 500, 'AI_PROVIDER_AUTH_ERROR');
  }
}

export class AiRateLimitedError extends AiError {
  constructor(details: Record<string, unknown> = {}) {
    super('AI service is currently busy. Please try again in a moment.', details, 429, 'AI_RATE_LIMITED');
  }
}

export class AiTimeoutError extends AiError {
  constructor(details: Record<string, unknown> = {}) {
    super('AI request timed out.', details, 504, 'AI_TIMEOUT');
  }
}

export class AiProviderUnavailableError extends AiError {
  constructor(details: Record<string, unknown> = {}) {
    super('AI service is temporarily unavailable.', details, 502, 'AI_PROVIDER_UNAVAILABLE');
  }
}

export class AiProviderInvalidResponseError extends AiError {
  constructor(details: Record<string, unknown> = {}) {
    super('AI service returned an unexpected response format.', details, 502, 'AI_PROVIDER_INVALID_RESPONSE');
  }
}