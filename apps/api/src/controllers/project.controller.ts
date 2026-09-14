// apps/api/src/controllers/project.controller.ts
import { Request, Response, NextFunction } from 'express';
import { projectService } from '../services/project.service.js';
import { CreateProjectInput, UpdateProjectInput, ProjectQueryInput } from '../schemas/project.schema.js';

export class ProjectController {
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const input: CreateProjectInput = req.body;
      const created = await projectService.createProject(userId, input);

      res.status(201).json({
        data: created,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const query = req.query as unknown as ProjectQueryInput;
      const { data, total } = await projectService.getProjects(userId, query);

      res.status(200).json({
        data: data.map((p) => ({
          id: p.id,
          building_type: p.building_type,
          location: p.location,
          monthly_bill: p.monthly_bill,
          created_at: p.created_at,
        })),
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const projectId = req.params.id as string;
      const detail = await projectService.getProjectDetail(userId, projectId);

      res.status(200).json({
        data: detail,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const projectId = req.params.id as string;
      const input: UpdateProjectInput = req.body;
      const updated = await projectService.updateProject(userId, projectId, input);

      res.status(200).json({
        data: updated,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const projectId = req.params.id as string;
      await projectService.deleteProject(userId, projectId);

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  listScenarios = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const projectId = req.params.id as string;
      
      const scenarios = await projectService.getProjectScenarios(userId, projectId);

      res.status(200).json({
        data: scenarios,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  };

  getRoadmap = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const projectId = req.params.id as string;

      // We will need to import simulationService, or move getRoadmap to projectService. 
      // Actually, since it uses simulate(), I put it in simulationService.
      // So I will call simulationService.getRoadmap(userId, projectId)
      // I will need to import simulationService at the top of this file.
      const roadmap = await (await import('../services/simulation.service.js')).simulationService.getRoadmap(userId, projectId);

      res.status(200).json({
        data: roadmap,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  };
}

export const projectController = new ProjectController();