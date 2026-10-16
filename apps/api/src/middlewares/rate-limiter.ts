import { Request, Response, NextFunction } from 'express';
import { RateLimitError } from '../utils/errors.js';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const ipRequestMap = new Map<string, RateLimitRecord>();

/**
 * Generic in-memory rate limiter factory.
 */
export const createRateLimiter = (
  maxRequests = 10,
  windowMs = 60_000,
  errorMessage = 'Too many requests. Please wait a moment before trying again.'
) => {
  const store = new Map<string, RateLimitRecord>();

  return (req: Request, _res: Response, next: NextFunction): void => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const now = Date.now();

    const record = store.get(clientIp);

    if (!record || now > record.resetTime) {
      store.set(clientIp, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (record.count >= maxRequests) {
      return next(new RateLimitError(errorMessage));
    }

    record.count += 1;
    next();
  };
};

/**
 * Standard in-memory rate limiter (~10 requests/minute/IP) for AI endpoints.
 */
export const aiRateLimiter = (maxRequests = 10, windowMs = 60_000) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const now = Date.now();

    const record = ipRequestMap.get(clientIp);

    if (!record || now > record.resetTime) {
      ipRequestMap.set(clientIp, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (record.count >= maxRequests) {
      return next(new RateLimitError());
    }

    record.count += 1;
    next();
  };
};