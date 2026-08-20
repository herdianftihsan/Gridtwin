// apps/api/src/services/simulation.service.ts
import { projectService } from "./project.service.js";
import { scenarioRepository } from "../repositories/scenario.repository.js";
import { simulationResultRepository } from "../repositories/simulation-result.repository.js";
import { toDatabaseSimulationResultPayload } from "../mappers/simulation.mapper.js";
import { simulate } from "../simulation/simulate.js";
import { optimize } from "../optimization/optimize.js";
import { SimulateInput, OptimizeInput } from "../schemas/project.schema.js";
import { SimulationContext } from "../simulation/types.js";

export class SimulationService {
  async runSimulate(userId: string, projectId: string, input: SimulateInput) {
    const project = await projectService.assertOwnership(userId, projectId);

    const context: SimulationContext = {
      building_type: project.building_type,
      location: project.location,
      roof_area: project.roof_area,
      monthly_bill: Number(project.monthly_bill),
      budget: Number(project.budget),
      objective: project.objective,
    };

    const simulationResult = simulate(
      {
        solar_kwp: input.solar_kwp,
        battery_kwh: input.battery_kwh,
        ac_units: input.ac_units,
        is_led_upgraded: input.is_led_upgraded,
      },
      context,
    );

    if (!input.persist) {
      return {
        scenario_type: "custom" as const,
        simulation_result: simulationResult,
      };
    }

    // Persist Scenario and Simulation Result with rollback protection
    const createdScenario = await scenarioRepository.create({
      project_id: projectId,
      scenario_type: "custom",
      solar_kwp: input.solar_kwp,
      battery_kwh: input.battery_kwh,
      ac_units: input.ac_units,
      is_led_upgraded: input.is_led_upgraded,
      is_recommended: false,
    });

    try {
      const payload = toDatabaseSimulationResultPayload(createdScenario.id, simulationResult);
      await simulationResultRepository.create(payload);

      return {
        scenario_id: createdScenario.id,
        scenario_type: "custom" as const,
        simulation_result: simulationResult,
      };
    } catch (err) {
      // Rollback orphan scenario record on persistence failure
      await scenarioRepository.deleteById(createdScenario.id);
      throw err;
    }
  }

  async runOptimize(userId: string, projectId: string, input?: OptimizeInput) {
    const project = await projectService.assertOwnership(userId, projectId);

    // Apply transient objective override without permanently mutating projects table
    const effectiveObjective = input?.objective ?? project.objective;

    const context: SimulationContext = {
      building_type: project.building_type,
      location: project.location,
      roof_area: project.roof_area,
      monthly_bill: Number(project.monthly_bill),
      budget: Number(project.budget),
      objective: effectiveObjective,
    };

    const optimizationResult = optimize(context);

    // Atomic recommendation replacement
    await scenarioRepository.deactivateRecommended(projectId);

    const createdScenario = await scenarioRepository.create({
      project_id: projectId,
      scenario_type: "recommended",
      solar_kwp: optimizationResult.configuration.solar_kwp,
      battery_kwh: optimizationResult.configuration.battery_kwh,
      ac_units: optimizationResult.configuration.ac_units,
      is_led_upgraded: optimizationResult.configuration.is_led_upgraded,
      is_recommended: true,
    });

    try {
      const payload = toDatabaseSimulationResultPayload(
        createdScenario.id,
        optimizationResult.simulation_result,
      );
      await simulationResultRepository.create(payload);

      return {
        scenario_id: createdScenario.id,
        scenario_type: "recommended" as const,
        simulation_result: optimizationResult.simulation_result,
      };
    } catch (err) {
      await scenarioRepository.deleteById(createdScenario.id);
      throw err;
    }
  }
}

export const simulationService = new SimulationService();
