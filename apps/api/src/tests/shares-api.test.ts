import { describe, it, expect, beforeAll, vi, beforeEach } from 'vitest';
import request from 'supertest';
import crypto from 'crypto';
import type { Express } from 'express';
import { createApp } from '../app.js';
import { supabaseAdmin } from '../config/supabase.js';
import { projectRepository } from '../repositories/project.repository.js';
import { scenarioRepository } from '../repositories/scenario.repository.js';
import { shareRepository } from '../repositories/share.repository.js';
import type { DecisionBriefSnapshot } from '@gridtwin/shared';

describe('Shareable Decision Brief API Test Suite', () => {
  let app: Express;
  const validAuthToken = 'valid-jwt-token';
  const ownerUserId = '11111111-1111-1111-1111-111111111111';
  const otherUserId = '99999999-9999-9999-9999-999999999999';
  const projectId = '33333333-3333-3333-3333-333333333333';
  const scenarioId = 'scenario-1111';

  const mockProject = {
    id: projectId,
    user_id: ownerUserId,
    building_type: 'Ruko' as const,
    location: 'Surabaya, Jawa Timur',
    roof_area: 50,
    monthly_bill: 4_500_000,
    budget: 50_000_000,
    objective: 'save_money' as const,
    created_at: '2026-08-18T10:00:00.000Z',
    updated_at: '2026-08-18T10:00:00.000Z',
  };

  const mockSimulationResultRow = {
    id: 'res-1111',
    scenario_id: scenarioId,
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
    id: scenarioId,
    project_id: projectId,
    scenario_type: 'recommended' as const,
    name: 'Rekomendasi Utama',
    solar_kwp: 4,
    battery_kwh: 5,
    ac_units: 2,
    is_led_upgraded: true,
    refrigerator_units: 1,
    water_pump_upgraded: false,
    is_recommended: true,
    what_if_query: null,
    ai_explanation: null,
    created_at: '2026-08-18T10:00:00.000Z',
    updated_at: '2026-08-18T10:00:00.000Z',
    simulation_results: mockSimulationResultRow,
  };

  const mockSnapshot: DecisionBriefSnapshot = {
    project: {
      building_type: 'Ruko',
      location: 'Surabaya, Jawa Timur',
    },
    scenario: {
      name: 'Rekomendasi Utama',
      is_recommended: true,
      scenario_type: 'recommended',
    },
    configuration: {
      pv_kwp: 4,
      battery_kwh: 5,
      ac_units: 2,
      led_upgraded: true,
      refrigerator_units: 1,
      water_pump_upgraded: false,
    },
    baseline: {
      monthly_cost: 4500000,
      monthly_kwh: 3000,
    },
    financial: {
      capex: 60000000,
      new_monthly_cost: 3740625,
      monthly_savings: 759375,
      annual_savings: 9112500,
      payback_years: 6.6,
      estimated_roi_10yr_pct: 52,
    },
    environmental: {
      co2_reduction_kg_yr: 4801.38,
      co2_reduction_pct: 16.9,
    },
    grid: {
      independence_pct: 10.8,
    },
    assumptions: {
      tariff: 1500,
      psh: 4.5,
      performance_ratio: 0.75,
      battery_charge_efficiency: 0.95,
      battery_discharge_efficiency: 0.95,
      source_version: 'mvp-1.0',
    },
    disclaimer: 'Estimasi pemodelan deterministik ESDM No. 2/2024.',
    generated_at: '2026-08-18T10:00:00.000Z',
  };

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(supabaseAdmin.auth, 'getUser').mockResolvedValue({
      data: { user: { id: ownerUserId, email: 'owner@gridtwin.ai' } as never },
      error: null,
    });
  });

  describe('Share Creation & Project Authorization', () => {
    it('creates a share link with raw token and hashes token at rest', async () => {
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce(mockProject);
      vi.spyOn(scenarioRepository, 'findById').mockResolvedValueOnce(mockScenarioRow);

      let capturedPayload: Parameters<typeof shareRepository.create>[0] | null = null;
      vi.spyOn(shareRepository, 'create').mockImplementation(async (payload) => {
        capturedPayload = payload;
        return {
          id: 'share-abc-123',
          project_id: payload.project_id,
          scenario_id: payload.scenario_id ?? null,
          token_hash: payload.token_hash,
          snapshot: payload.snapshot,
          created_by: payload.created_by,
          created_at: '2026-08-18T10:00:00.000Z',
          expires_at: payload.expires_at,
          revoked_at: null,
        };
      });

      const res = await request(app)
        .post(`/api/projects/${projectId}/shares`)
        .set('Authorization', `Bearer ${validAuthToken}`)
        .send({ scenario_id: scenarioId });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('id', 'share-abc-123');
      expect(res.body.data).toHaveProperty('share_token');
      expect(res.body.data).toHaveProperty('share_url');
      expect(res.body.data.share_url).toContain('/share/');
      expect(res.body.data).toHaveProperty('expires_at');

      const rawToken = res.body.data.share_token;
      expect(typeof rawToken).toBe('string');
      expect(rawToken.length).toBeGreaterThanOrEqual(32);

      // Verify token hashing at rest
      expect(capturedPayload).not.toBeNull();
      const expectedHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      expect(capturedPayload!.token_hash).toBe(expectedHash);
      // Ensure raw token is NEVER stored in database payload
      expect(JSON.stringify(capturedPayload)).not.toContain(rawToken);
    });

    it('rejects unauthenticated share creation with 401 UNAUTHORIZED', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/shares`)
        .send({ scenario_id: scenarioId });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects share creation on project owned by another user with 403 FORBIDDEN', async () => {
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce({
        ...mockProject,
        user_id: otherUserId,
      });

      const res = await request(app)
        .post(`/api/projects/${projectId}/shares`)
        .set('Authorization', `Bearer ${validAuthToken}`)
        .send({ scenario_id: scenarioId });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('falls back to recommended scenario if scenario_id is not specified in body', async () => {
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce(mockProject);
      vi.spyOn(scenarioRepository, 'findRecommended').mockResolvedValueOnce(mockScenarioRow);
      vi.spyOn(shareRepository, 'create').mockResolvedValueOnce({
        id: 'share-rec-1',
        project_id: projectId,
        scenario_id: mockScenarioRow.id,
        token_hash: 'mock-hash',
        snapshot: mockSnapshot,
        created_by: ownerUserId,
        created_at: '2026-08-18T10:00:00.000Z',
        expires_at: '2026-09-17T10:00:00.000Z',
        revoked_at: null,
      });

      const res = await request(app)
        .post(`/api/projects/${projectId}/shares`)
        .set('Authorization', `Bearer ${validAuthToken}`)
        .send({});

      expect(res.status).toBe(201);
      expect(res.body.data.id).toBe('share-rec-1');
    });

    it('returns 400 VALIDATION_ERROR when no scenario is available to share', async () => {
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce(mockProject);
      vi.spyOn(scenarioRepository, 'findRecommended').mockResolvedValueOnce(null);

      const res = await request(app)
        .post(`/api/projects/${projectId}/shares`)
        .set('Authorization', `Bearer ${validAuthToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 500 INTERNAL_ERROR with user-friendly message when repository insert fails', async () => {
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce(mockProject);
      vi.spyOn(scenarioRepository, 'findById').mockResolvedValueOnce(mockScenarioRow);
      // Simulate a Supabase write failure (e.g. table not migrated or connection error)
      vi.spyOn(shareRepository, 'create').mockRejectedValueOnce(
        Object.assign(new Error('Gagal menyimpan tautan berbagi. Silakan coba lagi.'), {
          statusCode: 500,
          code: 'INTERNAL_ERROR',
          details: {},
        })
      );

      const res = await request(app)
        .post(`/api/projects/${projectId}/shares`)
        .set('Authorization', `Bearer ${validAuthToken}`)
        .send({ scenario_id: scenarioId });

      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
      // Must NOT expose internal stack traces, raw SQL errors, or secret keys
      expect(res.body.error.message).not.toContain('stack');
      expect(res.body.error.message).not.toContain('token_hash');
    });

    it('generates share_url using the first configured FRONTEND_URL when origin header is absent', async () => {
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce(mockProject);
      vi.spyOn(scenarioRepository, 'findById').mockResolvedValueOnce(mockScenarioRow);
      vi.spyOn(shareRepository, 'create').mockImplementation(async (payload) => ({
        id: 'share-url-test',
        project_id: payload.project_id,
        scenario_id: payload.scenario_id ?? null,
        token_hash: payload.token_hash,
        snapshot: payload.snapshot,
        created_by: payload.created_by,
        created_at: '2026-08-18T10:00:00.000Z',
        expires_at: payload.expires_at,
        revoked_at: null,
      }));

      // Send request WITHOUT an Origin header
      const res = await request(app)
        .post(`/api/projects/${projectId}/shares`)
        .set('Authorization', `Bearer ${validAuthToken}`)
        .send({ scenario_id: scenarioId });

      expect(res.status).toBe(201);
      const { share_url, share_token } = res.body.data;
      // URL must include the raw token and point to the /share/ route
      expect(share_url).toContain('/share/');
      expect(share_url).toContain(share_token);
      // URL must be absolute (starts with http)
      expect(share_url).toMatch(/^https?:\/\//i);
      // Raw token must appear in the URL (for the viewer to pass to the backend)
      expect(share_url.endsWith(share_token)).toBe(true);
    });

    it('returns the standard GridTwin API response envelope with data and meta fields', async () => {
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce(mockProject);
      vi.spyOn(scenarioRepository, 'findById').mockResolvedValueOnce(mockScenarioRow);
      vi.spyOn(shareRepository, 'create').mockResolvedValueOnce({
        id: 'share-env-1',
        project_id: projectId,
        scenario_id: scenarioId,
        token_hash: 'token-hash-1',
        snapshot: mockSnapshot,
        created_by: ownerUserId,
        created_at: '2026-08-18T10:00:00.000Z',
        expires_at: '2026-09-17T10:00:00.000Z',
        revoked_at: null,
      });

      const res = await request(app)
        .post(`/api/projects/${projectId}/shares`)
        .set('Authorization', `Bearer ${validAuthToken}`)
        .send({ scenario_id: scenarioId });

      expect(res.status).toBe(201);
      // Verify response envelope adheres to API contracts
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(res.body.data).toHaveProperty('id', 'share-env-1');
      expect(res.body.data).toHaveProperty('share_token');
      expect(res.body.data).toHaveProperty('share_url');
      expect(res.body.data).toHaveProperty('expires_at');
      expect(res.body.meta).toHaveProperty('timestamp');
      expect(new Date(res.body.meta.timestamp).toISOString()).toBe(res.body.meta.timestamp);
    });

    it('handles projects with null or undefined location gracefully without throwing a TypeError', async () => {
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce({
        ...mockProject,
        location: null as unknown as string,
      });
      vi.spyOn(scenarioRepository, 'findById').mockResolvedValueOnce(mockScenarioRow);

      let capturedPayload: Parameters<typeof shareRepository.create>[0] | null = null;
      vi.spyOn(shareRepository, 'create').mockImplementationOnce(async (payload) => {
        capturedPayload = payload;
        return {
          id: 'share-null-loc-1',
          project_id: payload.project_id,
          scenario_id: payload.scenario_id ?? null,
          token_hash: payload.token_hash,
          snapshot: payload.snapshot,
          created_by: payload.created_by,
          created_at: '2026-08-18T10:00:00.000Z',
          expires_at: payload.expires_at,
          revoked_at: null,
        };
      });

      const res = await request(app)
        .post(`/api/projects/${projectId}/shares`)
        .set('Authorization', `Bearer ${validAuthToken}`)
        .send({ scenario_id: scenarioId });

      expect(res.status).toBe(201);
      expect(res.body.data.id).toBe('share-null-loc-1');
      expect(capturedPayload).not.toBeNull();
      expect(capturedPayload!.snapshot.project.location).toBe('Indonesia');
    });

    it('returns 500 with exact user-friendly message when PostgREST returns schema cache error PGRST205', async () => {
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce(mockProject);
      vi.spyOn(scenarioRepository, 'findById').mockResolvedValueOnce(mockScenarioRow);

      // Simulate real-world PostgREST table-not-found schema cache failure
      const postgrestError = {
        code: 'PGRST205',
        message: "Could not find the table 'public.decision_shares' in the schema cache",
        details: null,
        hint: "Perhaps you meant the table 'public.locations'",
      };

      const mockSingle = vi.fn().mockResolvedValueOnce({ data: null, error: postgrestError });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      vi.spyOn(supabaseAdmin, 'from').mockReturnValueOnce({ insert: mockInsert } as never);

      const res = await request(app)
        .post(`/api/projects/${projectId}/shares`)
        .set('Authorization', `Bearer ${validAuthToken}`)
        .send({ scenario_id: scenarioId });

      expect(res.status).toBe(500);
      expect(res.body.error).toEqual({
        code: 'INTERNAL_ERROR',
        message: 'Gagal menyimpan tautan berbagi. Silakan coba lagi.',
        details: {},
      });
      // Ensure zero leakage of internal database or PostgREST error details
      expect(res.body.error.message).not.toContain('PGRST205');
      expect(res.body.error.message).not.toContain('decision_shares');
      expect(res.body.error.message).not.toContain('schema cache');
    });
  });

  describe('Active Share Inspection & Revocation', () => {
    it('returns active share summary for project owner', async () => {
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce(mockProject);
      vi.spyOn(shareRepository, 'findActiveByProjectId').mockResolvedValueOnce({
        id: 'share-active-1',
        project_id: projectId,
        scenario_id: scenarioId,
        token_hash: 'some-hash',
        snapshot: mockSnapshot,
        created_by: ownerUserId,
        created_at: '2026-08-18T10:00:00.000Z',
        expires_at: '2026-09-18T10:00:00.000Z',
        revoked_at: null,
      });

      const res = await request(app)
        .get(`/api/projects/${projectId}/shares/active`)
        .set('Authorization', `Bearer ${validAuthToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual({
        id: 'share-active-1',
        created_at: '2026-08-18T10:00:00.000Z',
        expires_at: '2026-09-18T10:00:00.000Z',
        is_active: true,
      });
    });

    it('successfully revokes an active share link', async () => {
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce(mockProject);
      vi.spyOn(shareRepository, 'findById').mockResolvedValueOnce({
        id: 'share-to-revoke',
        project_id: projectId,
        scenario_id: scenarioId,
        token_hash: 'some-hash',
        snapshot: mockSnapshot,
        created_by: ownerUserId,
        created_at: '2026-08-18T10:00:00.000Z',
        expires_at: '2026-09-18T10:00:00.000Z',
        revoked_at: null,
      });
      vi.spyOn(shareRepository, 'revoke').mockResolvedValueOnce({
        id: 'share-to-revoke',
        project_id: projectId,
        scenario_id: scenarioId,
        token_hash: 'some-hash',
        snapshot: mockSnapshot,
        created_by: ownerUserId,
        created_at: '2026-08-18T10:00:00.000Z',
        expires_at: '2026-09-18T10:00:00.000Z',
        revoked_at: '2026-08-18T11:00:00.000Z',
      });

      const res = await request(app)
        .delete(`/api/projects/${projectId}/shares/share-to-revoke`)
        .set('Authorization', `Bearer ${validAuthToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.is_revoked).toBe(true);
      expect(res.body.data.revoked_at).toBe('2026-08-18T11:00:00.000Z');
    });

    it('rejects revocation attempt by a non-owner with 403 FORBIDDEN', async () => {
      vi.spyOn(projectRepository, 'findById').mockResolvedValueOnce({
        ...mockProject,
        user_id: otherUserId,
      });

      const res = await request(app)
        .delete(`/api/projects/${projectId}/shares/share-to-revoke`)
        .set('Authorization', `Bearer ${validAuthToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('Public Read-Only Retrieval Endpoint (GET /api/shares/:token)', () => {
    const rawPublicToken = 'cryptographically-random-test-token-42xyz';
    const computedHash = crypto.createHash('sha256').update(rawPublicToken).digest('hex');

    it('allows unauthenticated access and returns sanitized snapshot without private fields', async () => {
      vi.spyOn(shareRepository, 'findByTokenHash').mockImplementation(async (hash) => {
        if (hash === computedHash) {
          return {
            id: 'share-1',
            project_id: projectId,
            scenario_id: scenarioId,
            token_hash: computedHash,
            snapshot: mockSnapshot,
            created_by: ownerUserId,
            created_at: '2026-08-18T10:00:00.000Z',
            expires_at: new Date(Date.now() + 86400000).toISOString(),
            revoked_at: null,
          };
        }
        return null;
      });

      const res = await request(app).get(`/api/shares/${rawPublicToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('snapshot');
      expect(res.body.data).toHaveProperty('created_at');
      expect(res.body.data).toHaveProperty('expires_at');

      const snapshot = res.body.data.snapshot;
      expect(snapshot.project.building_type).toBe('Ruko');
      expect(snapshot.project.location).toBe('Surabaya, Jawa Timur');
      expect(snapshot.financial.capex).toBe(60000000);
      expect(snapshot.financial.payback_years).toBe(6.6);
      expect(snapshot.configuration.pv_kwp).toBe(4);

      // Verify privacy: NO sensitive or internal database fields
      expect(res.body.data.project_id).toBeUndefined();
      expect(res.body.data.created_by).toBeUndefined();
      expect(res.body.data.token_hash).toBeUndefined();
      expect(res.body.data.user_id).toBeUndefined();
      expect(snapshot.user_id).toBeUndefined();
      expect(snapshot.owner_email).toBeUndefined();
      expect(snapshot.project_id).toBeUndefined();
      expect(snapshot.scenario_id).toBeUndefined();
    });

    it('returns 404 NOT_FOUND for non-existent token', async () => {
      vi.spyOn(shareRepository, 'findByTokenHash').mockResolvedValueOnce(null);

      const res = await request(app).get('/api/shares/non-existent-token-123456');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('rejects access to revoked link with 404 NOT_FOUND and revoked details', async () => {
      vi.spyOn(shareRepository, 'findByTokenHash').mockResolvedValueOnce({
        id: 'share-revoked',
        project_id: projectId,
        scenario_id: scenarioId,
        token_hash: computedHash,
        snapshot: mockSnapshot,
        created_by: ownerUserId,
        created_at: '2026-08-18T10:00:00.000Z',
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        revoked_at: '2026-08-18T10:30:00.000Z',
      });

      const res = await request(app).get(`/api/shares/${rawPublicToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
      expect(res.body.error.message).toContain('dicabut');
      expect(res.body.error.details.reason).toBe('revoked');
    });

    it('rejects access to expired link with 404 NOT_FOUND and expired details', async () => {
      vi.spyOn(shareRepository, 'findByTokenHash').mockResolvedValueOnce({
        id: 'share-expired',
        project_id: projectId,
        scenario_id: scenarioId,
        token_hash: computedHash,
        snapshot: mockSnapshot,
        created_by: ownerUserId,
        created_at: '2026-07-01T10:00:00.000Z',
        expires_at: '2026-07-31T10:00:00.000Z', // In the past
        revoked_at: null,
      });

      const res = await request(app).get(`/api/shares/${rawPublicToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
      expect(res.body.error.message).toContain('kedaluwarsa');
      expect(res.body.error.details.reason).toBe('expired');
    });

    it('preserves snapshot immutability even if active scenario in database changes', async () => {
      // Snapshot stored in share has capex: 60M and pv_kwp: 4
      const frozenSnapshot = { ...mockSnapshot };

      vi.spyOn(shareRepository, 'findByTokenHash').mockResolvedValueOnce({
        id: 'share-immutable',
        project_id: projectId,
        scenario_id: scenarioId,
        token_hash: computedHash,
        snapshot: frozenSnapshot,
        created_by: ownerUserId,
        created_at: '2026-08-18T10:00:00.000Z',
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        revoked_at: null,
      });

      const res = await request(app).get(`/api/shares/${rawPublicToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.snapshot.financial.capex).toBe(60000000);
      expect(res.body.data.snapshot.configuration.pv_kwp).toBe(4);
    });
  });

  describe('ShareRepository Persistence & Database Failure Handling', () => {
    it('successfully persists a share record to supabaseAdmin', async () => {
      const mockDbRecord = {
        id: 'db-share-123',
        project_id: projectId,
        scenario_id: scenarioId,
        token_hash: 'hashed-token-val',
        snapshot: mockSnapshot,
        created_by: ownerUserId,
        created_at: '2026-08-18T10:00:00.000Z',
        expires_at: '2026-09-17T10:00:00.000Z',
        revoked_at: null,
      };

      const mockSingle = vi.fn().mockResolvedValueOnce({ data: mockDbRecord, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      vi.spyOn(supabaseAdmin, 'from').mockReturnValueOnce({ insert: mockInsert } as never);

      const result = await shareRepository.create({
        project_id: projectId,
        scenario_id: scenarioId,
        token_hash: 'hashed-token-val',
        snapshot: mockSnapshot,
        created_by: ownerUserId,
        expires_at: '2026-09-17T10:00:00.000Z',
      });

      expect(result).toEqual(mockDbRecord);
      expect(mockInsert).toHaveBeenCalledWith({
        project_id: projectId,
        scenario_id: scenarioId,
        token_hash: 'hashed-token-val',
        snapshot: mockSnapshot,
        created_by: ownerUserId,
        expires_at: '2026-09-17T10:00:00.000Z',
      });
    });

    it('throws InternalServerError with user-friendly message when database insert returns an error (e.g. unmigrated table)', async () => {
      const mockSingle = vi.fn().mockResolvedValueOnce({
        data: null,
        error: {
          code: 'PGRST205',
          message: "Could not find the table 'public.decision_shares' in the schema cache",
          details: null,
          hint: "Perhaps you meant the table 'public.locations'",
        },
      });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      vi.spyOn(supabaseAdmin, 'from').mockReturnValueOnce({ insert: mockInsert } as never);

      await expect(
        shareRepository.create({
          project_id: projectId,
          scenario_id: scenarioId,
          token_hash: 'hashed-token-val',
          snapshot: mockSnapshot,
          created_by: ownerUserId,
          expires_at: '2026-09-17T10:00:00.000Z',
        })
      ).rejects.toThrow('Gagal menyimpan tautan berbagi. Silakan coba lagi.');
    });

    it('catches and logs unexpected network/driver exception during create and throws user-friendly InternalServerError', async () => {
      vi.spyOn(supabaseAdmin, 'from').mockImplementationOnce(() => {
        throw new Error('ETIMEDOUT: Connection reset by peer');
      });

      await expect(
        shareRepository.create({
          project_id: projectId,
          scenario_id: scenarioId,
          token_hash: 'hashed-token-val',
          snapshot: mockSnapshot,
          created_by: ownerUserId,
          expires_at: '2026-09-17T10:00:00.000Z',
        })
      ).rejects.toThrow('Gagal menyimpan tautan berbagi. Silakan coba lagi.');
    });

    it('findByTokenHash returns record on match and null on missing/error', async () => {
      const mockRecord = {
        id: 'share-lookup-1',
        token_hash: 'lookup-hash',
        snapshot: mockSnapshot,
      };

      // 1. Success case
      const mockMaybeSingleSuccess = vi.fn().mockResolvedValueOnce({ data: mockRecord, error: null });
      const mockEqSuccess = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingleSuccess });
      const mockSelectSuccess = vi.fn().mockReturnValue({ eq: mockEqSuccess });
      vi.spyOn(supabaseAdmin, 'from').mockReturnValueOnce({ select: mockSelectSuccess } as never);

      const found = await shareRepository.findByTokenHash('lookup-hash');
      expect(found).toEqual(mockRecord);

      // 2. Error / Missing case
      const mockMaybeSingleFail = vi.fn().mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST205', message: 'Table not found' },
      });
      const mockEqFail = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingleFail });
      const mockSelectFail = vi.fn().mockReturnValue({ eq: mockEqFail });
      vi.spyOn(supabaseAdmin, 'from').mockReturnValueOnce({ select: mockSelectFail } as never);

      const notFound = await shareRepository.findByTokenHash('missing-hash');
      expect(notFound).toBeNull();
    });

    it('findActiveByProjectId returns active share and null when not found', async () => {
      const mockActive = { id: 'active-1', project_id: projectId };

      const mockMaybeSingle = vi.fn().mockResolvedValueOnce({ data: mockActive, error: null });
      const mockLimit = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockGt = vi.fn().mockReturnValue({ order: mockOrder });
      const mockIs = vi.fn().mockReturnValue({ gt: mockGt });
      const mockEq = vi.fn().mockReturnValue({ is: mockIs });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      vi.spyOn(supabaseAdmin, 'from').mockReturnValueOnce({ select: mockSelect } as never);

      const active = await shareRepository.findActiveByProjectId(projectId);
      expect(active).toEqual(mockActive);
    });

    it('revoke updates revoked_at and throws InternalServerError on database failure', async () => {
      const mockRevoked = { id: 'share-rev', revoked_at: '2026-10-15T08:00:00.000Z' };

      // Success
      const mockSingleSuccess = vi.fn().mockResolvedValueOnce({ data: mockRevoked, error: null });
      const mockSelectSuccess = vi.fn().mockReturnValue({ single: mockSingleSuccess });
      const mockEqSuccess = vi.fn().mockReturnValue({ select: mockSelectSuccess });
      const mockUpdateSuccess = vi.fn().mockReturnValue({ eq: mockEqSuccess });
      vi.spyOn(supabaseAdmin, 'from').mockReturnValueOnce({ update: mockUpdateSuccess } as never);

      const res = await shareRepository.revoke('share-rev');
      expect(res).toEqual(mockRevoked);

      // Failure
      const mockSingleFail = vi.fn().mockResolvedValueOnce({ data: null, error: { message: 'DB error' } });
      const mockSelectFail = vi.fn().mockReturnValue({ single: mockSingleFail });
      const mockEqFail = vi.fn().mockReturnValue({ select: mockSelectFail });
      const mockUpdateFail = vi.fn().mockReturnValue({ eq: mockEqFail });
      vi.spyOn(supabaseAdmin, 'from').mockReturnValueOnce({ update: mockUpdateFail } as never);

      await expect(shareRepository.revoke('share-rev')).rejects.toThrow(
        'Gagal mencabut tautan berbagi. Silakan coba lagi.'
      );
    });
  });
});
