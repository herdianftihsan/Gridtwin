import { Router } from 'express';
import { shareController } from '../controllers/share.controller.js';
import { validateParams } from '../middlewares/validate.js';
import { shareTokenParamSchema } from '../schemas/share.schema.js';
import { createRateLimiter } from '../middlewares/rate-limiter.js';

const router = Router();

// Public rate limiter: 60 requests / minute / IP
const publicShareRateLimiter = createRateLimiter(
  60,
  60_000,
  'Terlalu banyak permintaan akses ringkasan. Silakan coba kembali beberapa saat lagi.'
);

// Read-only public access to a shared decision summary snapshot
router.get(
  '/:token',
  publicShareRateLimiter,
  validateParams(shareTokenParamSchema),
  shareController.getPublic
);

export { router as shareRouter };
