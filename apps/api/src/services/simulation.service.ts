import { projectService } from "./project.service.js";
import { locationService } from "./location.service.js";
import { scenarioRepository } from "../repositories/scenario.repository.js";
import { simulationResultRepository } from "../repositories/simulation-result.repository.js";
import { toDatabaseSimulationResultPayload } from "../mappers/simulation.maper.js";
import { simulate } from "../simulation/simulate.js";
import { optimize } from "../optimization/optimize.js";
import { SimulateInput, OptimizeInput } from "../schemas/project.schema.js";
import { SimulationContext } from "../simulation/types.js";
import { calculatePvConstraints } from "../simulation/solar.js";
import { lookupPsh } from "../simulation/constants.js";

export class SimulationService {
  async runSimulate(userId: string, projectId: string, input: SimulateInput) {
    const project = await projectService.assertOwnership(userId, projectId);

    const locationRecord = await locationService.findById(project.location);

    const context: SimulationContext = {
      building_type: project.building_type,
      location: project.location,
      roof_area: project.roof_area,
      monthly_bill: Number(project.monthly_bill),
      budget: Number(project.budget),
      objective: project.objective,
      ...(locationRecord ? { assumptions: { psh: lookupPsh(locationRecord.name) } } : {}),
    };

    const simulationResult = simulate(
      {
        solar_kwp: input.solar_kwp,
        battery_kwh: input.battery_kwh,
        ac_units: input.ac_units,
        is_led_upgraded: input.is_led_upgraded,
        refrigerator_units: input.refrigerator_units,
        water_pump_upgraded: input.water_pump_upgraded,
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
      refrigerator_units: input.refrigerator_units,
      water_pump_upgraded: input.water_pump_upgraded,
      is_recommended: false,
      name: input.name ?? null,
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

    const locationRecord = await locationService.findById(project.location);

    const context: SimulationContext = {
      building_type: project.building_type,
      location: project.location,
      roof_area: project.roof_area,
      monthly_bill: Number(project.monthly_bill),
      budget: Number(project.budget),
      objective: effectiveObjective,
      ...(locationRecord ? { assumptions: { psh: lookupPsh(locationRecord.name) } } : {}),
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
      refrigerator_units: optimizationResult.configuration.refrigerator_units,
      water_pump_upgraded: optimizationResult.configuration.water_pump_upgraded,
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

  async getRoadmap(userId: string, projectId: string) {
    const project = await projectService.assertOwnership(userId, projectId);

    const locationRecord = await locationService.findById(project.location);

    const context: SimulationContext = {
      building_type: project.building_type,
      location: project.location,
      roof_area: project.roof_area,
      monthly_bill: Number(project.monthly_bill),
      budget: Number(project.budget),
      objective: project.objective,
      ...(locationRecord ? { assumptions: { psh: lookupPsh(locationRecord.name) } } : {}),
    };

    const { maxPvAllowed } = calculatePvConstraints(context.roof_area);

    // Stage 1: Current Baseline (No assets)
    const stage1 = simulate({ solar_kwp: 0, battery_kwh: 0, ac_units: 0, is_led_upgraded: false, refrigerator_units: 0, water_pump_upgraded: false }, context);

    // Stage 2: Efficiency (Max AC within budget? We'll just use 2 ACs and LED as a baseline efficiency step, or max 5 if feasible)
    // For MVP Roadmap, let's propose a standard efficiency step: 3 AC units and LED.
    // If that breaks budget, we can scale down, but simulate() doesn't enforce budget, it just calculates metrics.
    // The roadmap is an aspirational timeline.
    const stage2 = simulate({ solar_kwp: 0, battery_kwh: 0, ac_units: 3, is_led_upgraded: true, refrigerator_units: 1, water_pump_upgraded: false }, context);

    // Stage 3: Solar (Max PV, no battery)
    // We cap at 10 kWp because the system maxes at 10.
    const solarPV = Math.min(maxPvAllowed, 10);
    const stage3 = simulate({ solar_kwp: solarPV, battery_kwh: 0, ac_units: 3, is_led_upgraded: true, refrigerator_units: 1, water_pump_upgraded: false }, context);

    // Stage 4: Solar + Battery
    const stage4 = simulate({ solar_kwp: solarPV, battery_kwh: 10, ac_units: 3, is_led_upgraded: true, refrigerator_units: 1, water_pump_upgraded: false }, context);

    return [
      { stage: 1, title: 'Current Baseline', description: 'Your building running 100% on grid power.', result: stage1 },
      { stage: 2, title: 'Efficiency Upgrade', description: 'Upgrade ACs to Inverter and switch to Smart LEDs.', result: stage2 },
      { stage: 3, title: 'Solar PV Addition', description: 'Maximize roof space with Solar PV generation.', result: stage3 },
      { stage: 4, title: 'Solar + Battery', description: 'Add battery storage for nighttime independence.', result: stage4 }
    ];
  }
}

export const simulationService = new SimulationService();
