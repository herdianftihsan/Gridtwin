import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai.service.js';
import { WhatIfRequestInput, ExplainRequestInput } from '../ai/schemas.js';

export class AiController {
  async whatIf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const input: WhatIfRequestInput = req.body;
      const result = await aiService.handleWhatIf(userId, input);

      res.status(201).json({
        data: result,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  async explain(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const input: ExplainRequestInput = req.body;
      const result = await aiService.handleExplain(userId, input);

      res.status(200).json({
        data: result,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const aiController = new AiController();