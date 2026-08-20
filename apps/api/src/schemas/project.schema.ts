import { z } from "zod";

export const createProjectSchema = z
  .object({
    building_type: z.enum(["Ruko", "Residential", "Office"], {
      required_error: "building_type is required",
    }),
    location: z.string().trim().min(1, "location is required"),
    roof_area: z.number().positive("roof_area must be greater than 0").nullable().optional(),
    monthly_bill: z.number().positive("monthly_bill must be greater than 0"),
    budget: z.number().min(1_000_000, "budget must be at least 1,000,000 IDR"),
    objective: z.enum(["save_money", "reduce_co2", "independence"], {
      required_error: "objective is required",
    }),
  })
  .strict();

export const updateProjectSchema = z
  .object({
    building_type: z.enum(["Ruko", "Residential", "Office"]).optional(),
    location: z.string().trim().min(1).optional(),
    roof_area: z.number().positive("roof_area must be greater than 0").nullable().optional(),
    monthly_bill: z.number().positive("monthly_bill must be greater than 0").optional(),
    budget: z.number().min(1_000_000, "budget must be at least 1,000,000 IDR").optional(),
    objective: z.enum(["save_money", "reduce_co2", "independence"]).optional(),
  })
  .strict();

export const simulateSchema = z
  .object({
    solar_kwp: z.number().min(0).max(10),
    battery_kwh: z.union([z.literal(0), z.literal(5), z.literal(10), z.literal(15), z.literal(20)]),
    ac_units: z.number().int().min(0).max(5),
    is_led_upgraded: z.boolean(),
    persist: z.boolean().default(false),
  })
  .strict();

export const optimizeSchema = z
  .object({
    objective: z.enum(["save_money", "reduce_co2", "independence"]).optional(),
  })
  .strict();

export const projectQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type SimulateInput = z.infer<typeof simulateSchema>;
export type OptimizeInput = z.infer<typeof optimizeSchema>;
export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;
