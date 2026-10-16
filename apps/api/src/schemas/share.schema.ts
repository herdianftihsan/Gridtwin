import { z } from 'zod';

export const createShareSchema = z
  .object({
    scenario_id: z.string().trim().min(1, 'scenario_id cannot be empty').optional(),
    expires_in_days: z.number().int().min(1).max(90).optional(),
  })
  .strict();

export const shareTokenParamSchema = z
  .object({
    token: z.string().trim().min(10, 'Invalid token').max(128, 'Invalid token'),
  })
  .strict();

export const shareIdParamSchema = z
  .object({
    id: z.string().trim().min(1),
    shareId: z.string().trim().min(1),
  })
  .strict();

export type CreateShareInput = z.infer<typeof createShareSchema>;
