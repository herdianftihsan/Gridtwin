import { z } from "zod";

export const updateScenarioSchema = z
  .object({
    name: z.string().trim().max(100, "Name must not exceed 100 characters").min(1, "Name cannot be empty"),
  })
  .strict();

export type UpdateScenarioInput = z.infer<typeof updateScenarioSchema>;
