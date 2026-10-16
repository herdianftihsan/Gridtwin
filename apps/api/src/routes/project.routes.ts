import { Router } from 'express';
import { projectController } from '../controllers/project.controller.js';
import { simulationController } from '../controllers/simulation.controller.js';
import { shareController } from '../controllers/share.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { validateBody, validateQuery } from '../middlewares/validate.js';
import { createRateLimiter } from '../middlewares/rate-limiter.js';
import {
  createProjectSchema,
  updateProjectSchema,
  simulateSchema,
  optimizeSchema,
  projectQuerySchema,
} from '../schemas/project.schema.js';
import { createShareSchema } from '../schemas/share.schema.js';

const router = Router();

// Rate limiter for share link generation (15 creations / minute)
const shareCreationRateLimiter = createRateLimiter(
  15,
  60_000,
  'Terlalu banyak permintaan pembuatan tautan. Silakan tunggu beberapa saat.'
);

// Protect all project, simulation, and share management routes
router.use(requireAuth);

router.post('/', validateBody(createProjectSchema), projectController.create);
router.get('/', validateQuery(projectQuerySchema), projectController.list);
router.get('/:id', projectController.getById);
router.patch('/:id', validateBody(updateProjectSchema), projectController.update);
router.delete('/:id', projectController.delete);

router.get('/:id/scenarios', projectController.listScenarios);
router.get('/:id/roadmap', projectController.getRoadmap);

router.post('/:id/simulate', validateBody(simulateSchema), simulationController.simulate);
router.post('/:id/optimize', validateBody(optimizeSchema), simulationController.optimize);

// Share management endpoints
router.post('/:id/shares', shareCreationRateLimiter, validateBody(createShareSchema), shareController.create);
router.get('/:id/shares/active', shareController.getActive);
router.delete('/:id/shares/:shareId', shareController.revoke);

export { router as projectRouter };