import { Request, Response } from 'express';
import { sendSuccess } from '../utils/response.js';

export const getHealth = (_req: Request, res: Response): void => {
  sendSuccess(res, {
    status: 'healthy',
    uptime: process.uptime(),
    service: 'GridTwin AI Backend',
    version: '1.0.0',
  });
};