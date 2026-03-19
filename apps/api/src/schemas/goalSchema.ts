import { z } from 'zod';

export const goalSchema = z.object({
  target_type: z.enum(['seller', 'head', 'team', 'bu']),
  target_id: z.union([z.number(), z.string(), z.bigint()]).transform(val => BigInt(val)),
  p1: z.number().nullable().optional(),
  tcv: z.number().nullable().optional(),
  nmrr: z.number().nullable().optional(),
  implementation: z.number().nullable().optional(),
  monthly: z.number().nullable().optional(),
  month: z.number().min(1).max(12),
  year: z.number().min(2024),
});

export type GoalInput = z.infer<typeof goalSchema>;
