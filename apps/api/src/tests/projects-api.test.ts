// apps/api/src/tests/projects-api.test.ts
import { describe, it, expect, beforeAll, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { supabaseAdmin } from '../config/supabase.js';
import type { Express } from 'express';

describe('Phase 6: Project, Simulation & Optimization API Endpoints', () => {
  let app: Express;
  const validToken = 'valid-jwt-token';
  const userId = '11111111-1111-1111-1111-111111111111';
  const otherUserId = '22222222-2222-2222-2222-222222222222';
  const projectId = '33333333-3333-3333-3333-333333333333';

  const mockProject = {
    id: projectId,
    user_id: userId,
    building_type: 'Ruko',
    location: 'Surabaya',
    roof_area: 50,
    monthly_bill: 4_500_000,
    budget: 50_000_000,
    objective: 'save_money',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(supabaseAdmin.auth, 'getUser').mockResolvedValue({
      data: { user: { id: userId, email: 'test@gridtwin.ai' } as never },
      error: null,
    });
  });

  describe('Project CRUD Endpoints', () => {
    it('1. POST /api/projects creates a project with 201 Created', async () => {
      vi.spyOn(supabaseAdmin, 'from').mockReturnValueOnce({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValueOnce({ data: mockProject, error: null }),
      } as never);

      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          building_type: 'Ruko',
          location: 'Surabaya',
          roof_area: 50,
          monthly_bill: 4_500_000,
          budget: 50_000_000,
          objective: 'save_money',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.id).toBe(projectId);
      expect(res.body.meta).toHaveProperty('timestamp');
    });

    it('2. POST /api/projects rejects invalid input with 400 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          building_type: 'InvalidType',
          budget: 500, // < 1,000,000
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('3. GET /api/projects lists only authenticated user projects', async () => {
      vi.spyOn(supabaseAdmin, 'from').mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValueOnce({
          data: [mockProject],
          error: null,
          count: 1,
        }),
      } as never);

      const res = await request(app)
        .get('/api/projects?page=1&limit=10')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBe(1);
    });

    it('4. GET /api/projects/:id returns full workspace detail', async () => {
      // Mock findById
      vi.spyOn(supabaseAdmin, 'from')
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValueOnce({ data: mockProject, error: null }),
        } as never)
        // Mock recommended scenario query
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValueOnce({ data: null, error: null }),
        } as never)
        // Mock recent scenarios query
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValueOnce({ data: [], error: null }),
        } as never);

      const res = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('project');
      expect(res.body.data).toHaveProperty('recommended_scenario');
      expect(res.body.data).toHaveProperty('recent_scenarios');
    });

    it('5. GET /api/projects/:id rejects unauthorized project access with 403 FORBIDDEN', async () => {
      vi.spyOn(supabaseAdmin, 'from').mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValueOnce({
          data: { ...mockProject, user_id: otherUserId },
          error: null,
        }),
      } as never);

      const res = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('6. DELETE /api/projects/:id returns 204 No Content', async () => {
      vi.spyOn(supabaseAdmin, 'from')
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValueOnce({ data: mockProject, error: null }),
        } as never)
        .mockReturnValueOnce({
          delete: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValueOnce({ error: null }),
        } as never);

      const res = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(204);
    });
  });

  describe('Simulation & Optimization Endpoints', () => {
    it('7. POST /api/projects/:id/simulate returns preview without persistence when persist=false', async () => {
      vi.spyOn(supabaseAdmin, 'from').mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValueOnce({ data: mockProject, error: null }),
      } as never);

      const res = await request(app)
        .post(`/api/projects/${projectId}/simulate`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          solar_kwp: 4,
          battery_kwh: 5,
          ac_units: 2,
          is_led_upgraded: true,
          persist: false,
        });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('simulation_result');
      expect(res.body.data).not.toHaveProperty('scenario_id');
    });

    it('8. POST /api/projects/:id/simulate returns 400 INFEASIBLE_EFFICIENCY_CONFIGURATION when savings exceed bill', async () => {
      vi.spyOn(supabaseAdmin, 'from').mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValueOnce({
          data: { ...mockProject, monthly_bill: 50_000 },
          error: null,
        }),
      } as never);

      const res = await request(app)
        .post(`/api/projects/${projectId}/simulate`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          solar_kwp: 0,
          battery_kwh: 0,
          ac_units: 5,
          is_led_upgraded: true,
          persist: false,
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INFEASIBLE_EFFICIENCY_CONFIGURATION');
    });

    it('9. POST /api/projects/:id/optimize executes optimization and persists recommendation with 200 OK', async () => {
      vi.spyOn(supabaseAdmin, 'from')
        // Mock findById
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValueOnce({ data: mockProject, error: null }),
        } as never)
        // Mock deactivate recommended
        .mockReturnValueOnce({
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
        } as never)
        // Mock create scenario
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValueOnce({
            data: { id: 'scenario-rec-uuid', ...mockProject },
            error: null,
          }),
        } as never)
        // Mock insert simulation_results
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValueOnce({ data: { id: 'res-uuid' }, error: null }),
        } as never);

      const res = await request(app)
        .post(`/api/projects/${projectId}/optimize`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ objective: 'reduce_co2' });

      expect(res.status).toBe(200);
      expect(res.body.data.scenario_type).toBe('recommended');
      expect(res.body.data).toHaveProperty('scenario_id');
      expect(res.body.data).toHaveProperty('simulation_result');
    });

    it('10. POST /api/projects/:id/optimize returns 422 NO_FEASIBLE_SCENARIO when budget is zero', async () => {
      vi.spyOn(supabaseAdmin, 'from').mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValueOnce({
          data: { ...mockProject, budget: 0 },
          error: null,
        }),
      } as never);

      const res = await request(app)
        .post(`/api/projects/${projectId}/optimize`)
        .set('Authorization', `Bearer ${validToken}`)
        .send();

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('NO_FEASIBLE_SCENARIO');
      expect(res.body.error.details).toHaveProperty('cheapest_feasible_option');
    });
  });
});