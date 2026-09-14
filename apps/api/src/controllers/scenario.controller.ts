import { Request, Response, NextFunction } from 'express';
import { scenarioRepository } from '../repositories/scenario.repository.js';
import { projectService } from '../services/project.service.js';
import { UpdateScenarioInput } from '../schemas/scenario.schema.js';
import { NotFoundError } from '../utils/errors.js';

export class ScenarioController {
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const scenarioId = req.params.id as string;
      const input: UpdateScenarioInput = req.body;

      const scenario = await scenarioRepository.findById(scenarioId);
      if (!scenario) {
        throw new NotFoundError(`Scenario with id '${scenarioId}' not found.`);
      }

      await projectService.assertOwnership(userId, scenario.project_id);
      
      await scenarioRepository.update(scenarioId, input);

      res.status(200).json({
        data: { ...scenario, name: input.name },
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const scenarioId = req.params.id as string;

      const scenario = await scenarioRepository.findById(scenarioId);
      if (!scenario) {
        throw new NotFoundError(`Scenario with id '${scenarioId}' not found.`);
      }

      await projectService.assertOwnership(userId, scenario.project_id);
      
      await scenarioRepository.deleteById(scenarioId);

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

export const scenarioController = new ScenarioController();
