import { supabaseAdmin } from '../config/supabase.js';
import { InternalServerError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import type { DecisionBriefSnapshot } from '@gridtwin/shared';

export interface DecisionShareRecord {
  id: string;
  project_id: string;
  scenario_id: string | null;
  token_hash: string;
  snapshot: DecisionBriefSnapshot;
  created_by: string;
  created_at: string;
  expires_at: string;
  revoked_at: string | null;
}

export class ShareRepository {
  async create(payload: {
    project_id: string;
    scenario_id?: string | null;
    token_hash: string;
    snapshot: DecisionBriefSnapshot;
    created_by: string;
    expires_at: string;
  }): Promise<DecisionShareRecord> {
    try {
      const { data, error } = await supabaseAdmin
        .from('decision_shares')
        .insert({
          project_id: payload.project_id,
          scenario_id: payload.scenario_id ?? null,
          token_hash: payload.token_hash,
          snapshot: payload.snapshot,
          created_by: payload.created_by,
          expires_at: payload.expires_at,
        })
        .select()
        .single();

      if (error || !data) {
        logger.error(
          'shareRepository.create failed',
          error ? new Error(error.message) : new Error('No data returned from decision_shares insert'),
          {
            operation: 'shareRepository.create',
            projectId: payload.project_id,
            scenarioId: payload.scenario_id ?? null,
            code: error?.code,
            details: error?.details,
            hint: error?.hint,
          }
        );
        throw new InternalServerError('Gagal menyimpan tautan berbagi. Silakan coba lagi.');
      }

      return data as DecisionShareRecord;
    } catch (err) {
      if (err instanceof InternalServerError) {
        throw err;
      }
      logger.error(
        'shareRepository.create unexpected exception',
        err instanceof Error ? err : new Error(String(err)),
        {
          operation: 'shareRepository.create',
          projectId: payload.project_id,
          scenarioId: payload.scenario_id ?? null,
        }
      );
      throw new InternalServerError('Gagal menyimpan tautan berbagi. Silakan coba lagi.');
    }
  }

  async findByTokenHash(tokenHash: string): Promise<DecisionShareRecord | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('decision_shares')
        .select('*')
        .eq('token_hash', tokenHash)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      return data as DecisionShareRecord;
    } catch {
      return null;
    }
  }

  async findById(shareId: string): Promise<DecisionShareRecord | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('decision_shares')
        .select('*')
        .eq('id', shareId)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      return data as DecisionShareRecord;
    } catch {
      return null;
    }
  }

  async findActiveByProjectId(projectId: string): Promise<DecisionShareRecord | null> {
    try {
      const nowIso = new Date().toISOString();
      const { data, error } = await supabaseAdmin
        .from('decision_shares')
        .select('*')
        .eq('project_id', projectId)
        .is('revoked_at', null)
        .gt('expires_at', nowIso)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      return data as DecisionShareRecord;
    } catch {
      return null;
    }
  }

  async revoke(shareId: string): Promise<DecisionShareRecord> {
    try {
      const { data, error } = await supabaseAdmin
        .from('decision_shares')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', shareId)
        .select()
        .single();

      if (error || !data) {
        logger.error(
          'shareRepository.revoke failed',
          error ? new Error(error.message) : new Error('No data returned from decision_shares revoke'),
          {
            operation: 'shareRepository.revoke',
            shareId,
            code: error?.code,
            details: error?.details,
            hint: error?.hint,
          }
        );
        throw new InternalServerError('Gagal mencabut tautan berbagi. Silakan coba lagi.');
      }

      return data as DecisionShareRecord;
    } catch (err) {
      if (err instanceof InternalServerError) {
        throw err;
      }
      logger.error(
        'shareRepository.revoke unexpected exception',
        err instanceof Error ? err : new Error(String(err)),
        { operation: 'shareRepository.revoke', shareId }
      );
      throw new InternalServerError('Gagal mencabut tautan berbagi. Silakan coba lagi.');
    }
  }
}

export const shareRepository = new ShareRepository();
