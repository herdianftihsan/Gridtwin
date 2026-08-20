import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const { error } = await supabaseAdmin.from('projects').select('id').limit(1);
    const dbStatus = error ? 'unhealthy' : 'connected';

    res.status(200).json({
      data: {
        status: 'healthy',
        database: dbStatus,
        uptime: process.uptime(),
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    res.status(200).json({
      data: {
        status: 'healthy',
        database: 'disconnected',
        uptime: process.uptime(),
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  }
});

export { router as healthRouter };