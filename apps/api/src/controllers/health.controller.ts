import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { sendSuccess } from '../utils/response.js';

export const getHealth = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let dbStatus = 'healthy';

    // Verify basic Supabase connectivity by querying projects table limit 0
    const { error } = await supabaseAdmin.from('projects').select('id').limit(0);
    if (error) {
      dbStatus = 'degraded';
    }

    sendSuccess(res, {
      status: 'healthy',
      database: dbStatus,
      uptime: process.uptime(),
      service: 'GridTwin AI Backend',
      version: '1.0.0',
    });
  } catch (err) {
    next(err);
  }
};