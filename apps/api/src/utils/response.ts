import type { Response } from 'express';

export interface ApiResponseMeta {
  timestamp: string;
  [key: string]: unknown;
}

export interface ApiSuccessResponse<T> {
  data: T;
  meta: ApiResponseMeta;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  additionalMeta: Record<string, unknown> = {}
): Response<ApiSuccessResponse<T>> => {
  return res.status(statusCode).json({
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...additionalMeta,
    },
  });
};