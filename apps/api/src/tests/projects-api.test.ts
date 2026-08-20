import { describe, it, expect, beforeAll, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { supabaseAdmin } from '../config/supabase.js';
import { projectRepository } from '../repositories/project.repository.js';
import { scenarioRepository } from '../repositories/scenario.repository.js';
import { simulationResultRepository } from '../repositories/simulation-result.repository.js';
import type { Express } from 'express';

describe('Phase 6: Project, Simulation & Optimization API Test Suite', () => {
  let app: Express;
  const validToken = 'valid-jwt-token';
  const userId = '11111111-1111-1111-1111-111111111111';
  const otherUserId = '99999999-9999-9999-9999-999999999999';
  const projectId = '33333333-3333-3333-3333-333333333333';

  const mockProject = {
    id: projectId,
    user_id: userId,
    building_type: 'Ruko' as const,
    location: 'Surabaya',
    roof_area: 50,
    monthly_bill: 4_500_000,
    budget: 50_000_000,
    objective: 'save_money' as const,
    created_at: '2026-08-18T10:00:00.000Z',
    updated_at: '2026-08-18T10:00:00.000Z',
  };

  const mockSimulationResultRow = {
    id: 'res-1111',
    scenario_id: 'scenario-1111',
    baseline_monthly_cost: 4500000,
    baseline_monthly_kwh: 3000,
    monthly_demand_kwh: 2796,
    solar_yield_monthly: 506.25,
    grid_import_monthly: 2493.75,
    wasted_surplus_monthly: 0,
    capex: 60000000,
    new_monthly_cost: 3740625,
    monthly_savings: 759375,
    payback_years: 6.6,
    co2_reduction_kg_yr: 4801.38,
    co2_reduction_pct: 16.9,
    independence_pct: 10.8,
    assumptions: {
      tariff: 1500,
      psh: 4.5,
      performance_ratio: 0.75,
      battery_charge_efficiency: 0.95,
      battery_discharge_efficiency: 0.95,
      source_version: 'mvp-1.0',
    },
    model_version: 'mvp-1.0.7',
    created_at: '2026-08-18T10:00:00.000Z',
  };

  const mockScenarioRow = {
    id: 'scenario-1111',
    project_id: projectId,
    scenario_type: 'recommended' as const,
    name: 'Recommended 1',
    solar_kwp: 4,
    battery_kwh: 5,
    ac_units: 2,
    is_led_upgraded: true,
    is_recommended: true,
    what_if_query: null,
    ai_explanation: null,
    created_at: '2026-08-18T10:00:00.000Z',
    updated_at: '2026-08-18T10:00:00.000Z',
    simulation_results: mockSimulationResultRow,
  };

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(supabaseAdmin.auth, 'getUser').mockResolvedValue({
      data: { user: { id: userId, email: 'user@gridtwin.ai' } as never },
      error: null,
    });
  });

  // 1. Authentication & Ownership Verification Across All Endpoints
  describe('Authentication & Ownership Guards', () => {
    it('rejects requests missing Bearer token with 401 UNAUTHORIZED', async () => {
      const res = await request(app).get('/api/projects');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects GET /api/projects/:id for project owned by another user with 403 FORBIDDEN', async () => {
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce({
        ...mockProject,
        user_id: otherUserId,
      });

      const res = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('rejects PATCH /api/projects/:id for unauthorized project with 403 FORBIDDEN', async () => {
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce({
        ...mockProject,
        user_id: otherUserId,
      });

      const res = await request(app)
        .patch(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ location: 'Jakarta' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('rejects DELETE /api/projects/:id for unauthorized project with 403 FORBIDDEN', async () => {
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce({
        ...mockProject,
        user_id: otherUserId,
      });

      const res = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('rejects POST /api/projects/:id/simulate for unauthorized project with 403 FORBIDDEN', async () => {
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce({
        ...mockProject,
        user_id: otherUserId,
      });

      const res = await request(app)
        .post(`/api/projects/${projectId}/simulate`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          solar_kwp: 4,
          battery_kwh: 5,
          ac_units: 1,
          is_led_upgraded: true,
          persist: false,
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('rejects POST /api/projects/:id/optimize for unauthorized project with 403 FORBIDDEN', async () => {
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce({
        ...mockProject,
        user_id: otherUserId,
      });

      const res = await request(app)
        .post(`/api/projects/${projectId}/optimize`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ objective: 'save_money' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('returns 404 NOT_FOUND when accessing a non-existent project', async () => {
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce(null);

      const res = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  // 2. Project CRUD Operations
  describe('Project CRUD Endpoints', () => {
    it('POST /api/projects creates a project with standard 201 envelope', async () => {
      vi.spyOn(projectRepository, 'create').mockResolvedValueOnce(mockProject);

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
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.id).toBe(projectId);
      expect(res.body.meta).toHaveProperty('timestamp');
    });

    it('POST /api/projects rejects invalid schema with 400 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          building_type: 'UnknownType',
          budget: 500_000, // < 1,000,000
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error).toHaveProperty('details');
    });

    it('GET /api/projects returns paginated projects belonging to user', async () => {
      vi.spyOn(projectRepository, 'findByUserId').mockResolvedValueOnce({
        data: [mockProject],
        total: 1,
      });

      const res = await request(app)
        .get('/api/projects?page=1&limit=10')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        timestamp: expect.any(String),
      });
    });

    it('GET /api/projects/:id returns full workspace payload with max 10 recent scenarios', async () => {
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce(mockProject);
      vi.spyOn(scenarioRepository, 'findRecommended').mockResolvedValueOnce(mockScenarioRow);

      const recentItems = Array.from({ length: 12 }, (_, i) => ({
        ...mockScenarioRow,
        id: `scenario-${i}`,
        scenario_type: 'custom' as const,
        is_recommended: false,
      }));

      // Service calls findRecent with limit 10
      vi.spyOn(scenarioRepository, 'findRecent').mockResolvedValueOnce(recentItems.slice(0, 10));

      const res = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.project.roof_area).toBe(50);
      expect(res.body.data.recommended_scenario).not.toBeNull();
      expect(res.body.data.recommended_scenario.is_recommended).toBe(true);
      expect(res.body.data.recent_scenarios.length).toBeLessThanOrEqual(10);
    });

    it('PATCH /api/projects/:id successfully updates project baseline', async () => {
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce(mockProject);
      const deactivateSpy = vi.spyOn(scenarioRepository, 'deactivateRecommended').mockResolvedValueOnce();
      vi.spyOn(projectRepository, 'update').mockResolvedValueOnce({
        ...mockProject,
        budget: 60_000_000,
      });

      const res = await request(app)
        .patch(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ budget: 60_000_000 });

      expect(res.status).toBe(200);
      expect(res.body.data.budget).toBe(60_000_000);
      expect(deactivateSpy).toHaveBeenCalledWith(projectId);
    });

    it('PATCH /api/projects/:id rejects invalid update fields with 400 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .patch(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ monthly_bill: -100_000 });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('DELETE /api/projects/:id returns 204 No Content', async () => {
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce(mockProject);
      const deleteSpy = vi.spyOn(projectRepository, 'delete').mockResolvedValueOnce();

      const res = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(204);
      expect(res.body).toEqual({});
      expect(deleteSpy).toHaveBeenCalledWith(projectId);
    });
  });

  // 3. Simulation Endpoint Tests (persist=false vs persist=true)
  describe('Simulation Endpoint', () => {
    it('POST /api/projects/:id/simulate returns preview without DB writes when persist=false', async () => {
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce(mockProject);
      const scenarioCreateSpy = vi.spyOn(scenarioRepository, 'create');
      const resultCreateSpy = vi.spyOn(simulationResultRepository, 'create');

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
      expect(res.body.data.scenario_type).toBe('custom');
      expect(res.body.data).toHaveProperty('simulation_result');
      expect(res.body.data).not.toHaveProperty('scenario_id');
      expect(scenarioCreateSpy).not.toHaveBeenCalled();
      expect(resultCreateSpy).not.toHaveBeenCalled();
    });

    it('POST /api/projects/:id/simulate creates scenario and result with 201 Created when persist=true', async () => {
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce(mockProject);
      vi.spyOn(scenarioRepository, 'create').mockResolvedValueOnce({
        ...mockScenarioRow,
        id: 'scenario-persisted-1',
        scenario_type: 'custom',
        is_recommended: false,
      });
      vi.spyOn(simulationResultRepository, 'create').mockResolvedValueOnce(mockSimulationResultRow);

      const res = await request(app)
        .post(`/api/projects/${projectId}/simulate`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          solar_kwp: 4,
          battery_kwh: 5,
          ac_units: 2,
          is_led_upgraded: true,
          persist: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.scenario_id).toBe('scenario-persisted-1');
      expect(res.body.data.scenario_type).toBe('custom');
      expect(res.body.data).toHaveProperty('simulation_result');
    });

    it('POST /api/projects/:id/simulate triggers rollback if simulation_result persistence fails', async () => {
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce(mockProject);
      vi.spyOn(scenarioRepository, 'create').mockResolvedValueOnce({
        ...mockScenarioRow,
        id: 'orphan-scenario-id',
      });
      vi.spyOn(simulationResultRepository, 'create').mockRejectedValueOnce(
        new Error('Database write error')
      );
      const rollbackSpy = vi.spyOn(scenarioRepository, 'deleteById').mockResolvedValueOnce();

      const res = await request(app)
        .post(`/api/projects/${projectId}/simulate`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          solar_kwp: 4,
          battery_kwh: 5,
          ac_units: 2,
          is_led_upgraded: true,
          persist: true,
        });

      expect(res.status).toBe(500);
      expect(rollbackSpy).toHaveBeenCalledWith('orphan-scenario-id');
    });

    it('POST /api/projects/:id/simulate returns 400 INFEASIBLE_EFFICIENCY_CONFIGURATION when savings exceed baseline', async () => {
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce({
        ...mockProject,
        monthly_bill: 50_000, // Small baseline (33.33 kWh)
      });

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
  });

  // 4. Optimization Endpoint Tests
  describe('Optimization Endpoint', () => {
    it('POST /api/projects/:id/optimize overrides objective transiently without modifying project.objective', async () => {
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce(mockProject);
      const deactivateSpy = vi.spyOn(scenarioRepository, 'deactivateRecommended').mockResolvedValueOnce();
      vi.spyOn(scenarioRepository, 'create').mockResolvedValueOnce({
        ...mockScenarioRow,
        id: 'new-rec-scenario-id',
      });
      vi.spyOn(simulationResultRepository, 'create').mockResolvedValueOnce(mockSimulationResultRow);
      const projectUpdateSpy = vi.spyOn(projectRepository, 'update');

      const res = await request(app)
        .post(`/api/projects/${projectId}/optimize`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ objective: 'reduce_co2' });

      expect(res.status).toBe(200);
      expect(res.body.data.scenario_type).toBe('recommended');
      expect(res.body.data.scenario_id).toBe('new-rec-scenario-id');
      expect(deactivateSpy).toHaveBeenCalledWith(projectId);
      expect(projectUpdateSpy).not.toHaveBeenCalled();
    });

    it('POST /api/projects/:id/optimize falls back to project.objective when body is empty', async () => {
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce(mockProject);
      vi.spyOn(scenarioRepository, 'deactivateRecommended').mockResolvedValueOnce();
      vi.spyOn(scenarioRepository, 'create').mockResolvedValueOnce({
        ...mockScenarioRow,
        id: 'fallback-rec-id',
      });
      vi.spyOn(simulationResultRepository, 'create').mockResolvedValueOnce(mockSimulationResultRow);

      const res = await request(app)
        .post(`/api/projects/${projectId}/optimize`)
        .set('Authorization', `Bearer ${validToken}`)
        .send();

      expect(res.status).toBe(200);
      expect(res.body.data.scenario_id).toBe('fallback-rec-id');
    });

    it('POST /api/projects/:id/optimize triggers rollback on simulation_result insert failure', async () => {
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce(mockProject);
      vi.spyOn(scenarioRepository, 'deactivateRecommended').mockResolvedValueOnce();
      vi.spyOn(scenarioRepository, 'create').mockResolvedValueOnce({
        ...mockScenarioRow,
        id: 'failed-rec-id',
      });
      vi.spyOn(simulationResultRepository, 'create').mockRejectedValueOnce(
        new Error('DB failure during sim_result insert')
      );
      const rollbackSpy = vi.spyOn(scenarioRepository, 'deleteById').mockResolvedValueOnce();

      const res = await request(app)
        .post(`/api/projects/${projectId}/optimize`)
        .set('Authorization', `Bearer ${validToken}`)
        .send();

      expect(res.status).toBe(500);
      expect(rollbackSpy).toHaveBeenCalledWith('failed-rec-id');
    });

    it('POST /api/projects/:id/optimize returns 422 NO_FEASIBLE_SCENARIO when budget is zero', async () => {
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce({
        ...mockProject,
        budget: 0,
      });

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