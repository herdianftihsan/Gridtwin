// apps/web/src/lib/api/api-client.ts
import { env } from '../env/env';
import { ApiErrorResponse, ApiSuccessResponse, ApiErrorCode } from '../../types/api';
import { useAuthStore } from '../../store/auth.store';

export class ApiClientError extends Error {
  public readonly code: ApiErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(code: ApiErrorCode, message: string, statusCode: number, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, ApiClientError.prototype);
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  token?: string | null;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private getAuthToken(): string | null {
    try {
      return useAuthStore.getState().session?.access_token || null;
    } catch {
      return null;
    }
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiSuccessResponse<T>> {
    const { body, token, headers: customHeaders, ...restOptions } = options;
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers = new Headers(customHeaders);
    headers.set('Accept', 'application/json');

    if (body !== undefined) {
      headers.set('Content-Type', 'application/json');
    }

    const authToken = token !== undefined ? token : this.getAuthToken();
    if (authToken) {
      headers.set('Authorization', `Bearer ${authToken}`);
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...restOptions,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (networkError) {
      throw new ApiClientError(
        'INTERNAL_ERROR',
        `Network connection failed: ${(networkError as Error).message}`,
        500
      );
    }

    if (response.status === 204) {
      return { data: undefined as unknown as T, meta: { timestamp: new Date().toISOString() } };
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new ApiClientError(
        'INTERNAL_ERROR',
        'Failed to parse server response as JSON.',
        response.status
      );
    }

    if (!response.ok) {
      const errorPayload = payload as ApiErrorResponse;
      const code = errorPayload?.error?.code || 'INTERNAL_ERROR';
      const message = errorPayload?.error?.message || response.statusText || 'An unexpected error occurred.';
      const details = errorPayload?.error?.details;

      throw new ApiClientError(code, message, response.status, details);
    }

    return payload as ApiSuccessResponse<T>;
  }

  public get<T>(endpoint: string, options?: RequestOptions): Promise<ApiSuccessResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiSuccessResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  public patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiSuccessResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  public delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiSuccessResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(env.NEXT_PUBLIC_API_URL);