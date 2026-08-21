// apps/api/src/services/project.service.ts
import { projectRepository, ProjectRecord } from '../repositories/project.repository.js';
import { assertProjectOwnership } from './project-ownership.service.js';
import { scenarioRepository, ScenarioWithResult } from '../repositories/scenario.repository.js';
import { toSimulationResultContract } from '../mappers/simulation.maper.js';
import { CreateProjectInput, UpdateProjectInput, ProjectQueryInput } from '../schemas/project.schema.js';

export class ProjectService {
  assertOwnership = async (userId: string, projectId: string): Promise<ProjectRecord> => {
    return assertProjectOwnership(projectId, userId);
  };

  createProject = async (userId: string, input: CreateProjectInput): Promise<ProjectRecord> => {
    return projectRepository.create(userId, input);
  };

  getProjects = async (userId: string, query: ProjectQueryInput) => {
    return projectRepository.findByUserId(userId, query.page, query.limit);
  };

  getProjectDetail = async (userId: string, projectId: string) => {
    const project = await this.assertOwnership(userId, projectId);

    let recommendedRow: ScenarioWithResult | null = null;
    let recentRows: ScenarioWithResult[] = [];

    try {
      const results = await Promise.allSettled([
        scenarioRepository.findRecommended(projectId),
        scenarioRepository.findRecent(projectId, 10),
      ]);

      if (results[0].status === 'fulfilled') {
        recommendedRow = results[0].value;
      }
      if (results[1].status === 'fulfilled') {
        recentRows = results[1].value;
      }
    } catch {
      recommendedRow = null;
      recentRows = [];
    }

    const recommendedScenario =
      recommendedRow && recommendedRow.simulation_results
        ? {
            id: recommendedRow.id,
            scenario_type: recommendedRow.scenario_type,
            is_recommended: recommendedRow.is_recommended,
            solar_kwp: Number(recommendedRow.solar_kwp),
            battery_kwh: Number(recommendedRow.battery_kwh),
            ac_units: Number(recommendedRow.ac_units),
            is_led_upgraded: Boolean(recommendedRow.is_led_upgraded),
            simulation_result: toSimulationResultContract(
              recommendedRow,
              recommendedRow.simulation_results
            ),
          }
        : null;

    const recentScenarios = (recentRows || [])
      .filter((row) => row && row.simulation_results !== null)
      .map((row) => ({
        id: row.id,
        scenario_type: row.scenario_type,
        solar_kwp: Number(row.solar_kwp),
        battery_kwh: Number(row.battery_kwh),
        ac_units: Number(row.ac_units),
        is_led_upgraded: Boolean(row.is_led_upgraded),
        created_at: row.created_at,
        simulation_result: toSimulationResultContract(row, row.simulation_results!),
      }));

    return {
      project,
      recommended_scenario: recommendedScenario,
      recent_scenarios: recentScenarios,
    };
  };

  updateProject = async (userId: string, projectId: string, input: UpdateProjectInput) => {
    await this.assertOwnership(userId, projectId);

    const hasBaselineChanged =
      input.monthly_bill !== undefined ||
      input.budget !== undefined ||
      input.roof_area !== undefined ||
      input.location !== undefined ||
      input.objective !== undefined;

    if (hasBaselineChanged) {
      await scenarioRepository.deactivateRecommended(projectId);
    }

    return projectRepository.update(projectId, input);
  };

  deleteProject = async (userId: string, projectId: string): Promise<void> => {
    await this.assertOwnership(userId, projectId);
    await projectRepository.delete(projectId);
  };
}

export const projectService = new ProjectService();