import { z } from 'zod';

export const whatIfRequestSchema = z
  .object({
    project_id: z.string().uuid('project_id must be a valid UUID'),
    message: z
      .string()
      .trim()
      .min(1, 'Message cannot be empty')
      .max(500, 'Message cannot exceed 500 characters'),
  })
  .strict();

export const explainRequestSchema = z
  .object({
    scenario_id: z.string().uuid('scenario_id must be a valid UUID'),
    user_context_question: z.string().trim().max(500).optional(),
  })
  .strict();

export const whatIfIntentSchema = z
  .object({
    action: z.enum(['optimize', 'simulate']),
    budget: z.number().positive().nullable().optional(),
    objective: z.enum(['save_money', 'reduce_co2', 'independence']).nullable().optional(),
    solar_kwp: z.number().min(0).max(10).nullable().optional(),
    battery_kwh: z
      .union([
        z.literal(0),
        z.literal(5),
        z.literal(10),
        z.literal(15),
        z.literal(20),
      ])
      .nullable()
      .optional(),
    ac_units: z.number().int().min(0).max(5).nullable().optional(),
    is_led_upgraded: z.boolean().nullable().optional(),
  })
  .strict();

export type WhatIfRequestInput = z.infer<typeof whatIfRequestSchema>;
export type ExplainRequestInput = z.infer<typeof explainRequestSchema>;
export type WhatIfIntentOutput = z.infer<typeof whatIfIntentSchema>;