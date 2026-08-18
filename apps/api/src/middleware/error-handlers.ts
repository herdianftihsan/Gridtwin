import type { NextFunction, Request, Response } from "express";

import type { ApiErrorCode } from "@gridtwin/shared";

interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
  };
}

/**
 * JSON 404 for unmatched routes — api-contract.md v1.0.2 error envelope.
 */
export function notFoundHandler(_req: Request, res: Response): void {
  const body: ApiErrorBody = {
    error: { code: "NOT_FOUND", message: "The requested resource was not found." },
  };
  res.status(404).json(body);
}

/**
 * Centralized error handler. Never leaks stack traces, credentials,
 * or internal implementation details to the client.
 */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  console.error("[gridtwin-api] Unhandled error:", err);

  const body: ApiErrorBody = {
    error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred." },
  };
  res.status(500).json(body);
}
