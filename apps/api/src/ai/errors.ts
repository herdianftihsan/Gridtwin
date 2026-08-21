import { AppError } from '../utils/errors.js';

export class AiError extends AppError {
  constructor(
    message = 'The AI service failed to process the request.',
    details: Record<string, unknown> = {}
  ) {
    super(502, 'AI_ERROR', message, details);
  }
}