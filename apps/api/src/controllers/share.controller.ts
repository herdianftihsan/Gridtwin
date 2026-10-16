import { Request, Response, NextFunction } from 'express';
import { shareService } from '../services/share.service.js';
import { CreateShareInput } from '../schemas/share.schema.js';
import { logger } from '../utils/logger.js';

export class ShareController {
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const projectId = req.params.id as string;
      const input: CreateShareInput = req.body;
      const originHeader = req.get('origin');

      const created = await shareService.createShare(userId, projectId, input, originHeader);

      res.setHeader('Cache-Control', 'no-store, private');
      res.status(201).json({
        data: created,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      logger.error(
        'shareController.create failed',
        err instanceof Error ? err : new Error(String(err)),
        {
          operation: 'shareController.create',
          projectId: req.params.id,
        }
      );
      next(err);
    }
  };

  getActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const projectId = req.params.id as string;

      const activeShare = await shareService.getActiveShare(userId, projectId);

      res.setHeader('Cache-Control', 'no-store, private');
      res.status(200).json({
        data: activeShare,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  };

  revoke = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const projectId = req.params.id as string;
      const shareId = req.params.shareId as string;

      const result = await shareService.revokeShare(userId, projectId, shareId);

      res.setHeader('Cache-Control', 'no-store, private');
      res.status(200).json({
        data: result,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  };

  getPublic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.params.token as string;
      const result = await shareService.getPublicShare(token);

      // Must revalidate to ensure immediate revocation without stale browser cache
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      res.status(200).json({
        data: result,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  };
}

export const shareController = new ShareController();
