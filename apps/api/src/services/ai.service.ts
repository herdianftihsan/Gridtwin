import { projectService } from './project.service.js';
import { scenarioRepository } from '../repositories/scenario.repository.js';
import { simulationResultRepository } from '../repositories/simulation-result.repository.js';
import { toDatabaseSimulationResultPayload, toSimulationResultContract } from '../mappers/simulation.maper.js';
import { intentParserService } from '../ai/intent-parser.service.js';
import { explanationService } from '../ai/explanation.service.js';
import { simulate } from '../simulation/simulate.js';
import { optimize } from '../optimization/optimize.js';
import { SimulationContext, SimulationConfig } from '../simulation/types.js';
import { WhatIfRequestInput, ExplainRequestInput } from '../ai/schemas.js';
import { NotFoundError } from '../utils/errors.js';

export class AiService {
  async handleWhatIf(userId: string, input: WhatIfRequestInput) {
    const project = await projectService.assertOwnership(userId, input.project_id);

    // 1. Extract structured intent via Gemini
    const intent = await intentParserService.parseWhatIfIntent(input.message);

    // 2. Build simulation/optimization context
    const effectiveBudget = intent.budget ?? Number(project.budget);
    const effectiveObjective = intent.objective ?? project.objective;

    const context: SimulationContext = {
      building_type: project.building_type,
      location: project.location,
      roof_area: project.roof_area,
      monthly_bill: Number(project.monthly_bill),
      budget: effectiveBudget,
      objective: effectiveObjective,
    };

    let finalConfig: SimulationConfig;
    let simulationResult;

    if (intent.action === 'simulate') {
      finalConfig = {
        solar_kwp: intent.solar_kwp ?? 0,
        battery_kwh: intent.battery_kwh ?? 0,
        ac_units: intent.ac_units ?? 0,
        is_led_upgraded: intent.is_led_upgraded ?? false,
      };
      simulationResult = simulate(finalConfig, context);
    } else {
      const optimizationRes = optimize(context);
      finalConfig = optimizationRes.configuration;
      simulationResult = optimizationRes.simulation_result;
    }

    // 3. Persist as scenario_type = 'what_if'
    const createdScenario = await scenarioRepository.create({
      project_id: project.id,
      scenario_type: 'what_if',
      solar_kwp: finalConfig.solar_kwp,
      battery_kwh: finalConfig.battery_kwh,
      ac_units: finalConfig.ac_units,
      is_led_upgraded: finalConfig.is_led_upgraded,
      is_recommended: false,
      what_if_query: input.message,
    });

    try {
      const payload = toDatabaseSimulationResultPayload(createdScenario.id, simulationResult);
      await simulationResultRepository.create(payload);

      return {
        scenario_id: createdScenario.id,
        scenario_type: 'what_if' as const,
        what_if_query: input.message,
        simulation_result: simulationResult,
      };
    } catch (err) {
      await scenarioRepository.deleteById(createdScenario.id);
      throw err;
    }
  }

  async handleExplain(userId: string, input: ExplainRequestInput) {
    // 1. Fetch scenario and verify ownership through project
    const scenario = await scenarioRepository.findById(input.scenario_id);
    if (!scenario) {
      throw new NotFoundError(`Scenario with id '${input.scenario_id}' not found.`);
    }

    await projectService.assertOwnership(userId, scenario.project_id);
    if (!scenario.simulation_results) {
      throw new NotFoundError('Simulation results for this scenario were not found.');
    }

    // 2. Map verified numerical contract
    const simulationResult = toSimulationResultContract(scenario, scenario.simulation_results);

    // 3. Request Gemini natural language explanation
    const explanation = await explanationService.generateExplanation({
      configuration: {
        solar_kwp: Number(scenario.solar_kwp),
        battery_kwh: Number(scenario.battery_kwh),
        ac_units: Number(scenario.ac_units),
        is_led_upgraded: Boolean(scenario.is_led_upgraded),
      },
      baseline: simulationResult.baseline,
      energy: simulationResult.energy,
      financial: simulationResult.financial,
      environmental: simulationResult.environmental,
      grid: simulationResult.grid,
      assumptions: simulationResult.assumptions,
      user_context_question: input.user_context_question,
    });

    // 4. Persist generated explanation to scenario record
    await scenarioRepository.updateExplanation(scenario.id, explanation);

    return {
      scenario_id: scenario.id,
      explanation,
    };
  }
}

export const aiService = new AiService();