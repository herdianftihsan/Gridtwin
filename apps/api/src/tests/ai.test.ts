import { describe, it, expect, beforeAll, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { supabaseAdmin } from '../config/supabase.js';
import { projectRepository } from '../repositories/project.repository.js';
import { scenarioRepository } from '../repositories/scenario.repository.js';
import { simulationResultRepository } from '../repositories/simulation-result.repository.js';
import { geminiClient } from '../ai/gemini.client.js';
import type { Express } from 'express';

describe('Phase 7: Gemini What-If & AI Explanation Endpoints', () => {
  let app: Express;
  const validToken = 'valid-jwt-token';
  const userId = '11111111-1111-1111-1111-111111111111';
  const otherUserId = '88888888-8888-8888-8888-888888888888';
  const projectId = '33333333-3333-3333-3333-333333333333';
  const scenarioId = '44444444-4444-4444-4444-444444444444';

  const mockProject = {
    id: projectId,
    user_id: userId,
    building_type: 'Ruko' as const,
    location: 'Surabaya',
    roof_area: 50,
    monthly_bill: 4_500_000,
    budget: 50_000_000,
    objective: 'save_money' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockScenarioWithResults = {
    id: scenarioId,
    project_id: projectId,
    scenario_type: 'recommended' as const,
    name: 'Recommended',
    solar_kwp: 4,
    battery_kwh: 5,
    ac_units: 2,
    is_led_upgraded: true,
    is_recommended: true,
    what_if_query: null,
    ai_explanation: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    simulation_results: {
      id: 'res-id',
      scenario_id: scenarioId,
      baseline_monthly_cost: 4500000,
      baseline_monthly_kwh: 3000,
      monthly_demand_kwh: 2796,
      solar_yield_monthly: 405,
      grid_import_monthly: 2391,
      wasted_surplus_monthly: 0,
      capex: 96500000,
      new_monthly_cost: 3586500,
      monthly_savings: 913500,
      payback_years: 8.8,
      co2_reduction_kg_yr: 5773.32,
      co2_reduction_pct: 20.3,
      independence_pct: 14.5,
      assumptions: { tariff: 1500, psh: 4.5 },
      model_version: 'mvp-1.0.7',
      created_at: new Date().toISOString(),
    },
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

  describe('POST /api/ai/what-if', () => {
    it('1. parses budget intent and runs optimization, returning 201 Created', async () => {
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce(mockProject);
      vi.spyOn(geminiClient, 'generateContent').mockResolvedValueOnce(
        JSON.stringify({ action: 'optimize', budget: 30_000_000 })
      );
      vi.spyOn(scenarioRepository, 'create').mockResolvedValueOnce({
        ...mockScenarioWithResults,
        id: 'what-if-scenario-1',
        scenario_type: 'what_if',
      });
      vi.spyOn(simulationResultRepository, 'create').mockResolvedValueOnce(
        mockScenarioWithResults.simulation_results
      );

      const res = await request(app)
        .post('/api/ai/what-if')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          project_id: projectId,
          message: 'Gimana kalau budget saya 30 juta?',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.scenario_type).toBe('what_if');
      expect(res.body.data.what_if_query).toBe('Gimana kalau budget saya 30 juta?');
      expect(res.body.data).toHaveProperty('simulation_result');
    });

    it('2. parses explicit asset configuration and executes simulate()', async () => {
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce(mockProject);
      vi.spyOn(geminiClient, 'generateContent').mockResolvedValueOnce(
        JSON.stringify({
          action: 'simulate',
          solar_kwp: 4,
          battery_kwh: 5,
          ac_units: 1,
          is_led_upgraded: true,
        })
      );
      vi.spyOn(scenarioRepository, 'create').mockResolvedValueOnce({
        ...mockScenarioWithResults,
        id: 'what-if-scenario-2',
        scenario_type: 'what_if',
      });
      vi.spyOn(simulationResultRepository, 'create').mockResolvedValueOnce(
        mockScenarioWithResults.simulation_results
      );

      const res = await request(app)
        .post('/api/ai/what-if')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          project_id: projectId,
          message: 'Bagaimana kalau solar 4 kWp dan baterai 5 kWh?',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.simulation_result.configuration.pv_kwp).toBe(4);
    });

    it('3. rejects unauthorized project access with 403 FORBIDDEN', async () => {
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce({
        ...mockProject,
        user_id: otherUserId,
      });

      const res = await request(app)
        .post('/api/ai/what-if')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          project_id: projectId,
          message: 'Gimana kalau budget 40 juta?',
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('4. returns 502 AI_ERROR when Gemini returns malformed JSON', async () => {
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce(mockProject);
      vi.spyOn(geminiClient, 'generateContent').mockResolvedValueOnce('Invalid non-json output');

      const res = await request(app)
        .post('/api/ai/what-if')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          project_id: projectId,
          message: 'Gimana kalau budget 30 juta?',
        });

      expect(res.status).toBe(502);
      expect(res.body.error.code).toBe('AI_ERROR');
    });
  });

  describe('POST /api/ai/explain', () => {
    it('5. generates explanation from verified data and persists to scenario with 200 OK', async () => {
      vi.spyOn(scenarioRepository, 'findById').mockResolvedValueOnce(mockScenarioWithResults);
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce(mockProject);
      vi.spyOn(geminiClient, 'generateContent').mockResolvedValueOnce(
        'Sistem ini memangkas tagihan listrik hingga 20% dengan mengandalkan 4 kWp solar PV.'
      );
      const updateSpy = vi.spyOn(scenarioRepository, 'updateExplanation').mockResolvedValueOnce();

      const res = await request(app)
        .post('/api/ai/explain')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          scenario_id: scenarioId,
          user_context_question: 'Kenapa baterai 5 kWh dipilih?',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.scenario_id).toBe(scenarioId);
      expect(res.body.data.explanation).toContain('Sistem ini memangkas tagihan listrik');
      expect(updateSpy).toHaveBeenCalledWith(scenarioId, expect.any(String));
    });

    it('6. returns 404 NOT_FOUND when scenario does not exist', async () => {
      vi.spyOn(scenarioRepository, 'findById').mockResolvedValueOnce(null);

      const res = await request(app)
        .post('/api/ai/explain')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ scenario_id: scenarioId });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('7. returns 403 FORBIDDEN when scenario belongs to another user', async () => {
      vi.spyOn(scenarioRepository, 'findById').mockResolvedValueOnce(mockScenarioWithResults);
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce({
        ...mockProject,
        user_id: otherUserId,
      });

      const res = await request(app)
        .post('/api/ai/explain')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ scenario_id: scenarioId });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('8. returns 502 AI_ERROR on upstream failure or timeout', async () => {
      vi.spyOn(scenarioRepository, 'findById').mockResolvedValueOnce(mockScenarioWithResults);
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce(mockProject);
      vi.spyOn(geminiClient, 'generateContent').mockRejectedValueOnce(
        new Error('Upstream timeout')
      );

      const res = await request(app)
        .post('/api/ai/explain')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ scenario_id: scenarioId });

      expect(res.status).toBe(502);
      expect(res.body.error.code).toBe('AI_ERROR');
    });
  });
});