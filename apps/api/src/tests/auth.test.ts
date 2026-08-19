// src/tests/auth.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { requireAuth } from '../middlewares/auth.js';
import { assertProjectOwnership } from '../services/project-ownership.service.js';
import { errorHandler } from '../middlewares/error-handlers.js';
import { supabaseAdmin } from '../config/supabase.js';

// Setup isolated Express test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());

  // Protected test route for auth testing
  app.get('/api/test-protected', requireAuth, (req: Request, res: Response) => {
    res.status(200).json({ data: { user: req.user } });
  });

  // Protected route simulating project ownership check
  app.get('/api/test-project/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const project = await assertProjectOwnership(req.params['id'] as string, req.user!.id);
      res.status(200).json({ data: { project } });
    } catch (err) {
      next(err);
    }
  });

  app.use(errorHandler);
  return app;
};

describe('Phase 2: Authentication & Project Ownership Boundaries', () => {
  const app = createTestApp();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // Test Case A: Missing Authorization header
  it('A. rejects request with 401 UNAUTHORIZED when Authorization header is missing', async () => {
    const res = await request(app).get('/api/test-protected');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
    expect(res.body.error.message).toContain('Missing Authorization header');
  });

  // Test Case B: Malformed Bearer token
  it('B. rejects request with 401 UNAUTHORIZED when Bearer token is malformed', async () => {
    const res = await request(app)
      .get('/api/test-protected')
      .set('Authorization', 'Basic 123456');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
    expect(res.body.error.message).toContain('Malformed Authorization header');
  });

  // Test Case C: Invalid or expired token
  it('C. rejects request with 401 UNAUTHORIZED when token is invalid or expired', async () => {
    vi.spyOn(supabaseAdmin.auth, 'getUser').mockResolvedValueOnce({
      data: { user: null },
      error: { name: 'AuthApiError', message: 'invalid token', status: 401 },
    } as never);

    const res = await request(app)
      .get('/api/test-protected')
      .set('Authorization', 'Bearer invalid-token');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
    expect(res.body.error.message).toContain('Invalid or expired authentication token');
  });

  // Test Case D: Valid token populates authenticated request context
  it('D. successfully populates req.user when valid token is provided', async () => {
    vi.spyOn(supabaseAdmin.auth, 'getUser').mockResolvedValueOnce({
      data: {
        user: {
          id: 'user-uuid-1234',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        },
      },
      error: null,
    } as never);

    const res = await request(app)
      .get('/api/test-protected')
      .set('Authorization', 'Bearer valid-jwt-token');

    expect(res.status).toBe(200);
    expect(res.body.data.user).toEqual({ id: 'user-uuid-1234' });
  });

  // Test Case E: Project not found
  it('E. rejects with 404 NOT_FOUND when project does not exist', async () => {
    vi.spyOn(supabaseAdmin.auth, 'getUser').mockResolvedValueOnce({
      data: { user: { id: 'user-uuid-1234' } },
      error: null,
    } as never);

    vi.spyOn(supabaseAdmin, 'from').mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValueOnce({ data: null, error: null }),
    } as never);

    const res = await request(app)
      .get('/api/test-project/nonexistent-project-id')
      .set('Authorization', 'Bearer valid-jwt-token');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.message).toBe('Project not found');
  });

  // Test Case F: Project belongs to authenticated user (Success)
  it('F. allows access when project belongs to the authenticated user', async () => {
    const mockProject = {
      id: 'proj-111',
      user_id: 'user-uuid-1234',
      building_type: 'Ruko',
      location: 'Surabaya',
      roof_area: 50,
      monthly_bill: 4500000,
      budget: 50000000,
      objective: 'save_money',
      created_at: '2026-08-19T00:00:00Z',
      updated_at: '2026-08-19T00:00:00Z',
    };

    vi.spyOn(supabaseAdmin.auth, 'getUser').mockResolvedValueOnce({
      data: { user: { id: 'user-uuid-1234' } },
      error: null,
    } as never);

    vi.spyOn(supabaseAdmin, 'from').mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValueOnce({ data: mockProject, error: null }),
    } as never);

    const res = await request(app)
      .get('/api/test-project/proj-111')
      .set('Authorization', 'Bearer valid-jwt-token');

    expect(res.status).toBe(200);
    expect(res.body.data.project.id).toBe('proj-111');
    expect(res.body.data.project.user_id).toBe('user-uuid-1234');
  });

  // Test Case G: Project belongs to another user (403 Forbidden)
  it('G. rejects with 403 FORBIDDEN when project belongs to a different user', async () => {
    const mockProjectOtherUser = {
      id: 'proj-222',
      user_id: 'other-user-9999',
      building_type: 'Ruko',
      location: 'Surabaya',
      roof_area: 50,
      monthly_bill: 4500000,
      budget: 50000000,
      objective: 'save_money',
      created_at: '2026-08-19T00:00:00Z',
      updated_at: '2026-08-19T00:00:00Z',
    };

    vi.spyOn(supabaseAdmin.auth, 'getUser').mockResolvedValueOnce({
      data: { user: { id: 'user-uuid-1234' } },
      error: null,
    } as never);

    vi.spyOn(supabaseAdmin, 'from').mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValueOnce({ data: mockProjectOtherUser, error: null }),
    } as never);

    const res = await request(app)
      .get('/api/test-project/proj-222')
      .set('Authorization', 'Bearer valid-jwt-token');

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
    expect(res.body.error.message).toBe('You do not have permission to access this project');
  });
});