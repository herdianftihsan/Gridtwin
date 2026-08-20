import { supabaseAdmin } from "../config/supabase.js";
import { DatabaseSimulationResultRow } from "../mappers/simulation.maper.js";

export class SimulationResultRepository {
  async create(
    payload: Omit<DatabaseSimulationResultRow, "id" | "created_at">,
  ): Promise<DatabaseSimulationResultRow> {
    const { data, error } = await supabaseAdmin
      .from("simulation_results")
      .insert(payload)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to insert simulation result: ${error?.message}`);
    }

    return data as DatabaseSimulationResultRow;
  }
}

export const simulationResultRepository = new SimulationResultRepository();
