// apps/api/src/routes/project.routes.ts
import { Router } from "express";
import { projectController } from "../controllers/project.controller.js";
import { simulationController } from "../controllers/simulation.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { validateBody, validateQuery } from "../middlewares/validate.js";
import {
  createProjectSchema,
  updateProjectSchema,
  simulateSchema,
  optimizeSchema,
  projectQuerySchema,
} from "../schemas/project.schema.js";

const router = Router();

// Protect all project and simulation routes
router.use(requireAuth);

router.post("/", validateBody(createProjectSchema), projectController.create);
router.get("/", validateQuery(projectQuerySchema), projectController.list);
router.get("/:id", projectController.getById);
router.patch("/:id", validateBody(updateProjectSchema), projectController.update);
router.delete("/:id", projectController.delete);

router.post("/:id/simulate", validateBody(simulateSchema), simulationController.simulate);
router.post("/:id/optimize", validateBody(optimizeSchema), simulationController.optimize);

export { router as projectRouter };
