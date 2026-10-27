import { z } from 'zod';

export const createSettingSchema = z.object({
  body: z.object({
    group: z.string().min(1, 'Group is required'),
    key: z.string().min(1, 'Key is required'),
    value: z.any(),
    description: z.string().optional(),
  }),
});

export const updateSettingSchema = z.object({
  body: z.object({
    value: z.any(),
    description: z.string().optional(),
  }),
});

export const createMasterDataSchema = z.object({
  body: z.object({
    type: z.string().min(1, 'Type is required'),
    code: z.string().min(1, 'Code is required'),
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
  }),
});

export const createFeatureFlagSchema = z.object({
  body: z.object({
    featureKey: z.string().min(1, 'Feature key is required'),
    isEnabled: z.boolean(),
    metadata: z.record(z.string(), z.any()).optional(),
  }),
});

export const createNumberSequenceSchema = z.object({
  body: z.object({
    type: z.string().min(1, 'Type is required'),
    prefix: z.string().optional(),
    suffix: z.string().optional(),
    padding: z.number().int().min(1).max(10).optional(),
    includeYear: z.boolean().optional(),
    includeBranchCode: z.boolean().optional(),
    resetPolicy: z.enum(['NEVER', 'YEARLY', 'MONTHLY']).optional(),
  }),
});
