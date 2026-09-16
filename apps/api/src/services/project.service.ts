// apps/api/src/services/project.service.ts
import { projectRepository, ProjectRecord } from '../repositories/project.repository.js';
import { assertProjectOwnership } from './project-ownership.service.js';
import { scenarioRepository, ScenarioWithResult } from '../repositories/scenario.repository.js';
import { toSimulationResultContract } from '../mappers/simulation.maper.js';
import { CreateProjectInput, UpdateProjectInput, ProjectQueryInput } from '../schemas/project.schema.js';
import { locationService, LocationRecord } from './location.service.js';
import { ValidationError } from '../utils/errors.js';

export type EnrichedProject = ProjectRecord & {
  location_data?: LocationRecord | undefined;
};

export class ProjectService {
  assertOwnership = async (userId: string, projectId: string): Promise<ProjectRecord> => {
    return assertProjectOwnership(projectId, userId);
  };

  enrichProjectsWithLocations = async (projects: ProjectRecord[]): Promise<EnrichedProject[]> => {
    const locationIds = Array.from(
      new Set(
        projects
          .map((p) => p.location)
          .filter((loc) => loc.startsWith('loc_'))
      )
    );

    const locations = await locationService.findByIds(locationIds);
    const locationMap = new Map(locations.map((loc) => [loc.id, loc]));

    return projects.map((p) => ({
      ...p,
      location_data: p.location.startsWith('loc_') ? locationMap.get(p.location) : undefined,
    }));
  };

  createProject = async (userId: string, input: CreateProjectInput): Promise<EnrichedProject> => {
    if (input.location.startsWith('loc_')) {
      const locationExists = await locationService.findById(input.location);
      if (!locationExists) {
        throw new ValidationError('Location not found');
      }
    }
    const created = await projectRepository.create(userId, input);
    const enriched = await this.enrichProjectsWithLocations([created]);
    return enriched[0]!;
  };

  getProjects = async (userId: string, query: ProjectQueryInput) => {
    const result = await projectRepository.findByUserId(userId, query.page, query.limit);
    const enrichedData = await this.enrichProjectsWithLocations(result.data);
    return { ...result, data: enrichedData };
  };

  getProjectDetail = async (userId: string, projectId: string) => {
    const project = await this.assertOwnership(userId, projectId);
    const enrichedProjects = await this.enrichProjectsWithLocations([project]);
    const enrichedProject = enrichedProjects[0]!;

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
            name: recommendedRow.name,
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
        name: row.name,
        solar_kwp: Number(row.solar_kwp),
        battery_kwh: Number(row.battery_kwh),
        ac_units: Number(row.ac_units),
        is_led_upgraded: Boolean(row.is_led_upgraded),
        created_at: row.created_at,
        simulation_result: toSimulationResultContract(row, row.simulation_results!),
      }));

    return {
      project: enrichedProject,
      recommended_scenario: recommendedScenario,
      recent_scenarios: recentScenarios,
    };
  };

  getProjectScenarios = async (userId: string, projectId: string) => {
    await this.assertOwnership(userId, projectId);
    const rows = await scenarioRepository.findRecent(projectId, 100); // fetching up to 100 for history

    return (rows || [])
      .filter((row) => row && row.simulation_results !== null)
      .map((row) => ({
        id: row.id,
        scenario_type: row.scenario_type,
        name: row.name,
        solar_kwp: Number(row.solar_kwp),
        battery_kwh: Number(row.battery_kwh),
        ac_units: Number(row.ac_units),
        is_led_upgraded: Boolean(row.is_led_upgraded),
        created_at: row.created_at,
        simulation_result: toSimulationResultContract(row, row.simulation_results!),
      }));
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

    if (input.location && input.location.startsWith('loc_')) {
      const locationExists = await locationService.findById(input.location);
      if (!locationExists) {
        throw new ValidationError('Location not found');
      }
    }

    const updated = await projectRepository.update(projectId, input);
    const enriched = await this.enrichProjectsWithLocations([updated]);
    return enriched[0]!;
  };

  deleteProject = async (userId: string, projectId: string): Promise<void> => {
    await this.assertOwnership(userId, projectId);
    await projectRepository.delete(projectId);
  };
}

export const projectService = new ProjectService();