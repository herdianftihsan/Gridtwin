import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';
import { supabaseAdmin } from './config/supabase.js';
import type { Express } from 'express';

describe('Backend Foundation Endpoints & Envelopes', () => {
  let app: Express;

  beforeAll(() => {
    app = createApp();
  });

  it('GET /api/health returns 200 with standard success envelope', async () => {
    vi.spyOn(supabaseAdmin, 'from').mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValueOnce({ data: [], error: null }),
    } as never);

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
    expect(res.body.data.status).toBe('healthy');
    expect(res.body.meta).toHaveProperty('timestamp');
  });

  it('GET /api/nonexistent returns 404 with standard error envelope', async () => {
    const res = await request(app).get('/api/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error).toHaveProperty('message');
    expect(res.body.error).toHaveProperty('details');
  });
});