import { Request, Response, NextFunction } from 'express';
import { projectService } from '../services/project.service.js';
import { CreateProjectInput, UpdateProjectInput, ProjectQueryInput } from '../schemas/project.schema.js';

export class ProjectController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
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
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
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
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
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
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
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
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const projectId = req.params.id as string;
      await projectService.deleteProject(userId, projectId);

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

export const projectController = new ProjectController();