// apps/api/src/repositories/scenario.repository.ts
import { supabaseAdmin } from '../config/supabase.js';
import { DatabaseScenarioRow, DatabaseSimulationResultRow } from '../mappers/simulation.maper.js';

export interface ScenarioWithResult extends DatabaseScenarioRow {
  simulation_results: DatabaseSimulationResultRow | null;
}

export class ScenarioRepository {
  async create(payload: {
    project_id: string;
    scenario_type: 'baseline' | 'recommended' | 'custom' | 'what_if';
    solar_kwp: number;
    battery_kwh: number;
    ac_units: number;
    is_led_upgraded: boolean;
    is_recommended?: boolean;
    name?: string | null;
    what_if_query?: string | null;
    ai_explanation?: string | null;
  }): Promise<DatabaseScenarioRow> {
    const { data, error } = await supabaseAdmin
      .from('scenarios')
      .insert({
        project_id: payload.project_id,
        scenario_type: payload.scenario_type,
        solar_kwp: payload.solar_kwp,
        battery_kwh: payload.battery_kwh,
        ac_units: payload.ac_units,
        is_led_upgraded: payload.is_led_upgraded,
        is_recommended: payload.is_recommended ?? false,
        name: payload.name ?? null,
        what_if_query: payload.what_if_query ?? null,
        ai_explanation: payload.ai_explanation ?? null,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create scenario: ${error?.message}`);
    }

    return data as DatabaseScenarioRow;
  }

  async findById(scenarioId: string): Promise<ScenarioWithResult | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('scenarios')
        .select('*, simulation_results(*)')
        .eq('id', scenarioId)
        .single();

      if (error || !data) {
        return null;
      }

      return data as ScenarioWithResult;
    } catch {
      return null;
    }
  }

  async findRecommended(projectId: string): Promise<ScenarioWithResult | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('scenarios')
        .select('*, simulation_results(*)')
        .eq('project_id', projectId)
        .eq('is_recommended', true)
        .single();

      if (error || !data) {
        return null;
      }

      return data as ScenarioWithResult;
    } catch {
      return null;
    }
  }

  async findRecent(projectId: string, limit = 10): Promise<ScenarioWithResult[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('scenarios')
        .select('*, simulation_results(*)')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !data || !Array.isArray(data)) {
        return [];
      }

      return data as ScenarioWithResult[];
    } catch {
      return [];
    }
  }

  async updateExplanation(scenarioId: string, explanation: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('scenarios')
      .update({
        ai_explanation: explanation,
        updated_at: new Date().toISOString(),
      })
      .eq('id', scenarioId);

    if (error) {
      throw new Error(`Failed to persist AI explanation: ${error.message}`);
    }
  }

  async deactivateRecommended(projectId: string): Promise<void> {
    try {
      await supabaseAdmin
        .from('scenarios')
        .update({
          is_recommended: false,
          updated_at: new Date().toISOString(),
        })
        .eq('project_id', projectId)
        .eq('is_recommended', true);
    } catch {
      // Graceful fallback
    }
  }

  async deleteById(scenarioId: string): Promise<void> {
    try {
      await supabaseAdmin.from('scenarios').delete().eq('id', scenarioId);
    } catch {
      // Graceful fallback
    }
  }
}

export const scenarioRepository = new ScenarioRepository();