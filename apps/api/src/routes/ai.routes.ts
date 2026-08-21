import { Router } from 'express';
import { aiController } from '../controllers/ai.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validate.js';
import { aiRateLimiter } from '../middlewares/rate-limiter.js';
import { whatIfRequestSchema, explainRequestSchema } from '../ai/schemas.js';

const router = Router();

router.use(requireAuth);
router.use(aiRateLimiter(10, 60_000)); // 10 req/min/IP limit

router.post('/what-if', validateBody(whatIfRequestSchema), aiController.whatIf);
router.post('/explain', validateBody(explainRequestSchema), aiController.explain);

export { router as aiRouter };