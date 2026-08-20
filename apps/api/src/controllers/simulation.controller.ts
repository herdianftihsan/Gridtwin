import { Request, Response, NextFunction } from 'express';
import { simulationService } from '../services/simulation.service.js';
import { SimulateInput, OptimizeInput } from '../schemas/project.schema.js';

export class SimulationController {
  async simulate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const projectId = req.params.id as string;
      const input: SimulateInput = req.body;

      const result = await simulationService.runSimulate(userId, projectId, input);
      const statusCode = input.persist ? 201 : 200;

      res.status(statusCode).json({
        data: result,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  async optimize(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const projectId = req.params.id as string;
      const input: OptimizeInput = req.body;

      const result = await simulationService.runOptimize(userId, projectId, input);

      res.status(200).json({
        data: result,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const simulationController = new SimulationController();