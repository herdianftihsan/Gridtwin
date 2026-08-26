import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient, ApiClientError } from './api-client';
import { useAuthStore } from '../../store/auth.store';
import type { Session } from '@supabase/supabase-js';

describe('ApiClient Foundation Test Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useAuthStore.getState().reset();
  });

  it('1. performs GET request and unwraps standard success envelope', async () => {
    const mockData = { id: 'proj-123', location: 'Surabaya' };
    const mockResponse = {
      data: mockData,
      meta: { timestamp: '2026-08-26T00:00:00Z' },
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    } as unknown as Response);

    const result = await apiClient.get<typeof mockData>('/api/projects/proj-123');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/projects/proj-123'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.any(Headers),
      })
    );
    expect(result.data).toEqual(mockData);
    expect(result.meta.timestamp).toBe('2026-08-26T00:00:00Z');
  });

  it('2. performs POST request with JSON payload', async () => {
    const postPayload = { monthly_bill: 5000000, budget: 50000000 };
    const mockCreated = { id: 'proj-new', ...postPayload };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        data: mockCreated,
        meta: { timestamp: '2026-08-26T00:00:00Z' },
      }),
    } as unknown as Response);

    const result = await apiClient.post<typeof mockCreated>('/api/projects', postPayload);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/projects'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(postPayload),
      })
    );
    expect(result.data.id).toBe('proj-new');
  });

  it('3. automatically attaches Bearer token from auth store when available', async () => {
    useAuthStore.getState().setSession({
      access_token: 'valid-test-jwt-token',
    } as unknown as Session);

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: [],
        meta: { timestamp: '2026-08-26T00:00:00Z' },
      }),
    } as unknown as Response);

    await apiClient.get('/api/projects');

    const lastCall = vi.mocked(fetch).mock.calls[0];
    const headers = lastCall?.[1]?.headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer valid-test-jwt-token');
  });

  it('4. throws ApiClientError with standard error envelope details on 4xx/5xx', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      json: async () => ({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this project',
          details: { projectId: 'proj-999' },
        },
      }),
    } as unknown as Response);

    let thrownError: ApiClientError | null = null;
    try {
      await apiClient.get('/api/projects/proj-999');
    } catch (err) {
      thrownError = err as ApiClientError;
    }

    expect(thrownError).toBeInstanceOf(ApiClientError);
    expect(thrownError?.code).toBe('FORBIDDEN');
    expect(thrownError?.statusCode).toBe(403);
    expect(thrownError?.message).toBe('You do not have permission to access this project');
    expect(thrownError?.details).toEqual({ projectId: 'proj-999' });
  });

  it('5. handles 204 No Content responses gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 204,
    } as unknown as Response);

    const result = await apiClient.delete('/api/projects/proj-123');

    expect(result.data).toBeUndefined();
    expect(result.meta.timestamp).toBeDefined();
  });

  it('6. throws INTERNAL_ERROR when response is not valid JSON', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      json: async () => {
        throw new Error('Unexpected token < in JSON');
      },
    } as unknown as Response);

    await expect(apiClient.get('/api/broken-endpoint')).rejects.toThrow(
      'Failed to parse server response as JSON.'
    );
  });
});