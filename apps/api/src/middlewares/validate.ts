import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateBody =
  (schema: ZodSchema) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };

export const validateQuery =
  (schema: ZodSchema) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      req.query = (await schema.parseAsync(req.query)) as never;
      next();
    } catch (error) {
      next(error);
    }
  };

export const validateParams =
  (schema: ZodSchema) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      req.params = (await schema.parseAsync(req.params)) as never;
      next();
    } catch (error) {
      next(error);
    }
  };