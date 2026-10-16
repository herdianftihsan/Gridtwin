import crypto from 'crypto';
import { projectService } from './project.service.js';
import { locationService } from './location.service.js';
import { scenarioRepository } from '../repositories/scenario.repository.js';
import { shareRepository } from '../repositories/share.repository.js';
import { CreateShareInput } from '../schemas/share.schema.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { config } from '../config/env.js';
import type {
  DecisionBriefSnapshot,
  PublicDecisionShareResponse,
  CreateDecisionShareResponse,
  ActiveShareSummary,
} from '@gridtwin/shared';

export class ShareService {
  /**
   * Generates a cryptographically random share token, stores its SHA-256 hash at rest,
   * and creates an immutable snapshot of the decision summary.
   */
  async createShare(
    userId: string,
    projectId: string,
    input?: CreateShareInput,
    originHeader?: string
  ): Promise<CreateDecisionShareResponse> {
    const project = await projectService.assertOwnership(userId, projectId);

    // Retrieve the target scenario and its authoritative simulation result
    let scenario;
    if (input?.scenario_id) {
      scenario = await scenarioRepository.findById(input.scenario_id);
      if (!scenario || scenario.project_id !== projectId) {
        throw new NotFoundError('Skenario tidak ditemukan untuk proyek ini');
      }
      if (!scenario.simulation_results) {
        throw new ValidationError('Skenario belum memiliki hasil simulasi yang valid');
      }
    } else {
      scenario = await scenarioRepository.findRecommended(projectId);
      if (!scenario || !scenario.simulation_results) {
        throw new ValidationError(
          'Tidak ada skenario tersimpan untuk proyek ini. Harap simpan skenario sebelum membagikan ringkasan.'
        );
      }
    }

    // Resolve non-sensitive human-readable location name
    let locationString = 'Indonesia';
    if (project.location?.startsWith('loc_')) {
      const loc = await locationService.findById(project.location);
      if (loc) {
        locationString = `${loc.name}, ${loc.province}`;
      }
    } else if (project.location) {
      locationString = project.location;
    }

    const sim = scenario.simulation_results;
    const monthlySavings = Number(sim.monthly_savings);
    const capex = Number(sim.capex);
    const annualSavings = monthlySavings * 12;
    const paybackYears = sim.payback_years !== null ? Number(sim.payback_years) : null;
    const estimatedRoi10yrPct =
      capex > 0 ? Math.round(((annualSavings * 10 - capex) / capex) * 100) : null;

    // Build the immutable, privacy-sanitized snapshot
    const snapshot: DecisionBriefSnapshot = {
      project: {
        building_type: project.building_type,
        location: locationString,
      },
      scenario: {
        name:
          scenario.name ||
          (scenario.is_recommended ? 'Skenario Rekomendasi' : 'Skenario Keputusan'),
        is_recommended: Boolean(scenario.is_recommended),
        scenario_type: scenario.scenario_type,
      },
      configuration: {
        pv_kwp: Number(scenario.solar_kwp),
        battery_kwh: Number(scenario.battery_kwh),
        ac_units: Number(scenario.ac_units),
        led_upgraded: Boolean(scenario.is_led_upgraded),
        refrigerator_units:
          scenario.refrigerator_units != null ? Number(scenario.refrigerator_units) : 0,
        water_pump_upgraded:
          scenario.water_pump_upgraded != null ? Boolean(scenario.water_pump_upgraded) : false,
      },
      baseline: {
        monthly_cost: Number(sim.baseline_monthly_cost),
        monthly_kwh: Number(sim.baseline_monthly_kwh),
      },
      financial: {
        capex,
        new_monthly_cost: Number(sim.new_monthly_cost),
        monthly_savings: monthlySavings,
        annual_savings: annualSavings,
        payback_years: paybackYears,
        estimated_roi_10yr_pct: estimatedRoi10yrPct,
      },
      environmental: {
        co2_reduction_kg_yr: Number(sim.co2_reduction_kg_yr),
        co2_reduction_pct: Number(sim.co2_reduction_pct),
      },
      grid: {
        independence_pct: Number(sim.independence_pct),
      },
      assumptions: {
        tariff: Number(sim.assumptions?.tariff ?? 1500),
        psh: Number(sim.assumptions?.psh ?? 4.5),
        performance_ratio: Number(sim.assumptions?.performance_ratio ?? 0.75),
        battery_charge_efficiency: Number(sim.assumptions?.battery_charge_efficiency ?? 0.95),
        battery_discharge_efficiency: Number(sim.assumptions?.battery_discharge_efficiency ?? 0.95),
        source_version: String(sim.assumptions?.source_version ?? 'mvp-1.0'),
        ...(sim.assumptions?.optimization_objective
          ? { optimization_objective: String(sim.assumptions.optimization_objective) }
          : {}),
      },
      disclaimer:
        'Estimasi penghematan dan performa energi didasarkan pada pemodelan deterministik GridTwin dengan asumsi regulasi ESDM No. 2/2024 (tanpa ekspor daya ke grid). Hasil aktual dapat bervariasi tergantung profil beban riil dan kondisi cuaca.',
      generated_at: new Date().toISOString(),
    };

    // 256 bits entropy, base64url safe string
    const rawToken = crypto.randomBytes(32).toString('base64url');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const days = input?.expires_in_days ?? 30;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

    const record = await shareRepository.create({
      project_id: projectId,
      scenario_id: scenario.id,
      token_hash: tokenHash,
      snapshot,
      created_by: userId,
      expires_at: expiresAt,
    });

    // Determine safe public URL based on allowed origins or configured primary FRONTEND_URL.
    // Normalize trailing slashes before comparing to avoid subtle mismatches.
    const normalizeOrigin = (o: string) => o.replace(/\/$/, '').toLowerCase();
    const normalizedOrigin = originHeader ? normalizeOrigin(originHeader) : null;
    const matchedOrigin =
      normalizedOrigin &&
      config.FRONTEND_URL.some((u) => normalizeOrigin(u) === normalizedOrigin)
        ? originHeader!.replace(/\/$/, '')
        : (config.FRONTEND_URL[0] ?? 'http://localhost:3000').replace(/\/$/, '');

    const shareUrl = `${matchedOrigin}/share/${rawToken}`;

    return {
      id: record.id,
      share_token: rawToken,
      share_url: shareUrl,
      expires_at: record.expires_at,
      created_at: record.created_at,
    };
  }

  /**
   * Retrieves summary of the current active share for a project.
   */
  async getActiveShare(userId: string, projectId: string): Promise<ActiveShareSummary | null> {
    await projectService.assertOwnership(userId, projectId);
    const record = await shareRepository.findActiveByProjectId(projectId);
    if (!record) return null;

    return {
      id: record.id,
      created_at: record.created_at,
      expires_at: record.expires_at,
      is_active: true,
    };
  }

  /**
   * Immediately revokes a share link.
   */
  async revokeShare(
    userId: string,
    projectId: string,
    shareId: string
  ): Promise<{ id: string; revoked_at: string; is_revoked: boolean }> {
    await projectService.assertOwnership(userId, projectId);

    const share = await shareRepository.findById(shareId);
    if (!share || share.project_id !== projectId) {
      throw new NotFoundError('Tautan berbagi tidak ditemukan untuk proyek ini');
    }

    if (share.revoked_at) {
      return { id: share.id, revoked_at: share.revoked_at, is_revoked: true };
    }

    const updated = await shareRepository.revoke(shareId);
    return {
      id: updated.id,
      revoked_at: updated.revoked_at!,
      is_revoked: true,
    };
  }

  /**
   * Resolves a public share token.
   * Hashes the incoming token to look up in DB and returns only the sanitized snapshot.
   */
  async getPublicShare(token: string): Promise<PublicDecisionShareResponse> {
    if (!token || token.length < 10 || token.length > 128) {
      throw new NotFoundError('Tautan ringkasan tidak ditemukan.');
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const share = await shareRepository.findByTokenHash(tokenHash);

    if (!share) {
      throw new NotFoundError('Tautan ringkasan tidak ditemukan atau tidak valid.');
    }

    if (share.revoked_at) {
      throw new NotFoundError('Tautan ringkasan telah dicabut oleh pemilik proyek.', {
        reason: 'revoked',
      });
    }

    if (new Date(share.expires_at).getTime() < Date.now()) {
      throw new NotFoundError('Tautan ringkasan telah kedaluwarsa.', {
        reason: 'expired',
      });
    }

    return {
      snapshot: share.snapshot,
      created_at: share.created_at,
      expires_at: share.expires_at,
    };
  }
}

export const shareService = new ShareService();
