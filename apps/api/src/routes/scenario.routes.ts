import { Router } from 'express';
import { scenarioController } from '../controllers/scenario.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validate.js';
import { updateScenarioSchema } from '../schemas/scenario.schema.js';

const router = Router();

router.use(requireAuth);

router.patch('/:id', validateBody(updateScenarioSchema), scenarioController.update);
router.delete('/:id', scenarioController.delete);

export { router as scenarioRouter };
