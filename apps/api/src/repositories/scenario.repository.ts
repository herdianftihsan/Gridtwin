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
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create scenario: ${error?.message}`);
    }

    return data as DatabaseScenarioRow;
  }

  async findRecommended(projectId: string): Promise<ScenarioWithResult | null> {
    const { data, error } = await supabaseAdmin
      .from('scenarios')
      .select('*, simulation_results(*)')
      .eq('project_id', projectId)
      .eq('is_recommended', true)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch recommended scenario: ${error.message}`);
    }

    return (data as ScenarioWithResult) || null;
  }

  async findRecent(projectId: string, limit = 10): Promise<ScenarioWithResult[]> {
    const { data, error } = await supabaseAdmin
      .from('scenarios')
      .select('*, simulation_results(*)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch recent scenarios: ${error.message}`);
    }

    return (data as ScenarioWithResult[]) || [];
  }

  async deactivateRecommended(projectId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('scenarios')
      .update({ is_recommended: false, updated_at: new Date().toISOString() })
      .eq('project_id', projectId)
      .eq('is_recommended', true);

    if (error) {
      throw new Error(`Failed to deactivate existing recommended scenario: ${error.message}`);
    }
  }

  async deleteById(scenarioId: string): Promise<void> {
    await supabaseAdmin.from('scenarios').delete().eq('id', scenarioId);
  }
}

export const scenarioRepository = new ScenarioRepository();