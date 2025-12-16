/**
 * Zod schema validation for scenario definitions.
 * Provides runtime type safety and validation with helpful error messages.
 */

import { z } from 'zod';

/**
 * Schema for scenario task type.
 */
const ScenarioTaskTypeSchema = z.enum(['macro', 'micro', 'raf', 'webapi']);

/**
 * Schema for scenario task definition.
 * Uses lazy evaluation for recursive spawns field.
 */
export const ScenarioTaskSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z
      .string()
      .min(1, 'Task ID cannot be empty')
      .regex(
        /^[a-zA-Z0-9-_]+$/,
        'Task ID can only contain letters, numbers, hyphens, and underscores'
      ),
    type: ScenarioTaskTypeSchema,
    label: z
      .string()
      .min(1, 'Task label cannot be empty')
      .max(100, 'Task label must be 100 characters or less'),
    duration: z
      .number()
      .int()
      .positive('Duration must be a positive integer')
      .optional(),
    delay: z
      .number()
      .int()
      .nonnegative('Delay must be zero or a positive integer')
      .optional(),
    spawns: z.array(ScenarioTaskSchema).optional(),
  })
);

/**
 * Schema for scenario difficulty level.
 */
const ScenarioDifficultySchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
]);

/**
 * Schema for scenario metadata.
 */
export const ScenarioMetadataSchema = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(100, 'Title must be 100 characters or less'),
  description: z
    .string()
    .min(1, 'Description cannot be empty')
    .max(500, 'Description must be 500 characters or less'),
  difficulty: ScenarioDifficultySchema,
  tags: z
    .array(z.string().min(1, 'Tag cannot be empty'))
    .min(1, 'At least one tag is required'),
  learningObjectives: z
    .array(z.string().min(1, 'Learning objective cannot be empty'))
    .min(1, 'At least one learning objective is required'),
  estimatedDuration: z
    .number()
    .positive('Estimated duration must be a positive number'),
});

/**
 * Schema for scenario configuration.
 */
export const ScenarioConfigSchema = z
  .object({
    frameInterval: z.number().positive().optional(),
    autoPlay: z.boolean().optional(),
    playbackSpeed: z
      .number()
      .positive('Playback speed must be positive')
      .max(5, 'Playback speed cannot exceed 5x')
      .optional(),
  })
  .optional();

/**
 * Schema for complete scenario definition.
 */
export const ScenarioDefinitionSchema = z.object({
  id: z
    .string()
    .min(1, 'Scenario ID cannot be empty')
    .regex(
      /^[a-zA-Z0-9-_]+$/,
      'Scenario ID can only contain letters, numbers, hyphens, and underscores'
    ),
  version: z.literal('1.0'),
  metadata: ScenarioMetadataSchema,
  tasks: z
    .array(ScenarioTaskSchema)
    .min(1, 'At least one task is required'),
  config: ScenarioConfigSchema,
});

/**
 * Validates a scenario definition and returns detailed errors.
 */
export function validateScenarioSchema(data: unknown) {
  return ScenarioDefinitionSchema.safeParse(data);
}
