import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';
import type { Express } from 'express';

describe('Backend Foundation Endpoints & Envelopes', () => {
  let app: Express;

  beforeAll(() => {
    process.env.SUPABASE_URL = 'https://mock.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'mock-anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-key';
    process.env.GEMINI_API_KEY = 'mock-gemini-key';
    app = createApp();
  });

  it('GET /api/health returns 200 with standard success envelope', async () => {
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