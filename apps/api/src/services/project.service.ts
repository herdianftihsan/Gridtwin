// apps/api/src/services/project.service.ts
import { projectRepository, ProjectRecord } from "../repositories/project.repository.js";
import { scenarioRepository } from "../repositories/scenario.repository.js";
import { toSimulationResultContract } from "../mappers/simulation.mapper.js";
import {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectQueryInput,
} from "../schemas/project.schema.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";

export class ProjectService {
  async assertOwnership(userId: string, projectId: string): Promise<ProjectRecord> {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError(`Project with id '${projectId}' not found.`);
    }

    if (project.user_id !== userId) {
      throw new ForbiddenError("You do not have permission to access this project.");
    }

    return project;
  }

  async createProject(userId: string, input: CreateProjectInput): Promise<ProjectRecord> {
    return projectRepository.create(userId, input);
  }

  async getProjects(userId: string, query: ProjectQueryInput) {
    return projectRepository.findByUserId(userId, query.page, query.limit);
  }

  async getProjectDetail(userId: string, projectId: string) {
    const project = await this.assertOwnership(userId, projectId);

    const [recommendedRow, recentRows] = await Promise.all([
      scenarioRepository.findRecommended(projectId),
      scenarioRepository.findRecent(projectId, 10),
    ]);

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
              recommendedRow.simulation_results,
            ),
          }
        : null;

    const recentScenarios = recentRows
      .filter((row) => row.simulation_results !== null)
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
  }

  async updateProject(userId: string, projectId: string, input: UpdateProjectInput) {
    await this.assertOwnership(userId, projectId);

    // If baseline context changes, invalidate existing active recommendation
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
  }

  async deleteProject(userId: string, projectId: string): Promise<void> {
    await this.assertOwnership(userId, projectId);
    await projectRepository.delete(projectId);
  }
}

export const projectService = new ProjectService();
