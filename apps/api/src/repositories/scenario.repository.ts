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
    refrigerator_units: number;
    water_pump_upgraded: boolean;
    is_recommended?: boolean;
    name?: string | null;
    what_if_query?: string | null;
    ai_explanation?: string | null;
  }): Promise<DatabaseScenarioRow> {
    const insertPayload = {
      project_id: payload.project_id,
      scenario_type: payload.scenario_type,
      solar_kwp: payload.solar_kwp,
      battery_kwh: payload.battery_kwh,
      ac_units: payload.ac_units,
      is_led_upgraded: payload.is_led_upgraded,
      refrigerator_units: payload.refrigerator_units,
      water_pump_upgraded: payload.water_pump_upgraded,
      is_recommended: payload.is_recommended ?? false,
      name: payload.name ?? null,
      what_if_query: payload.what_if_query ?? null,
      ai_explanation: payload.ai_explanation ?? null,
    };

    let result = await supabaseAdmin.from('scenarios').insert(insertPayload).select().single();

    // Graceful fallback if DB migration for new columns hasn't been applied yet
    if (result.error && (result.error.message.includes('refrigerator_units') || result.error.message.includes('water_pump_upgraded'))) {
      const fallbackPayload = { ...insertPayload } as Record<string, unknown>;
      delete fallbackPayload.refrigerator_units;
      delete fallbackPayload.water_pump_upgraded;
      
      result = await supabaseAdmin.from('scenarios').insert(fallbackPayload).select().single();
    }

    if (result.error || !result.data) {
      throw new Error(`Failed to create scenario: ${result.error?.message}`);
    }

    return result.data as DatabaseScenarioRow;
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

  async update(scenarioId: string, payload: { name: string }): Promise<void> {
    const { error } = await supabaseAdmin
      .from('scenarios')
      .update({
        name: payload.name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', scenarioId);

    if (error) {
      throw new Error(`Failed to update scenario: ${error.message}`);
    }
  }

  async deleteById(scenarioId: string): Promise<void> {
    const { error } = await supabaseAdmin.from('scenarios').delete().eq('id', scenarioId);
    if (error) {
      throw new Error(`Failed to delete scenario: ${error.message}`);
    }
  }
}

export const scenarioRepository = new ScenarioRepository();