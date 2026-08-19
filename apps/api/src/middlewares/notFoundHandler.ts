import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../utils/errors.js';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
};