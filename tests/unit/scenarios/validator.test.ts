/**
 * Tests for scenario validation.
 */

import { describe, it, expect } from 'vitest';
import { validateScenario, formatValidationErrors } from '@/scenarios/validator';
import type { ScenarioDefinition } from '@/core/types/scenario';

describe('validateScenario', () => {
  const validScenario: ScenarioDefinition = {
    id: 'test-scenario',
    version: '1.0',
    metadata: {
      title: 'Test Scenario',
      description: 'A test scenario for validation',
      difficulty: 'beginner',
      tags: ['test'],
      learningObjectives: ['Learn testing'],
      estimatedDuration: 10,
    },
    tasks: [
      {
        id: 'task-1',
        type: 'macro',
        label: 'Test Task',
        duration: 1,
      },
    ],
  };

  describe('schema validation', () => {
    it('should validate a correct scenario', () => {
      const result = validateScenario(validScenario);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validScenario);
    });

    it('should reject scenario with missing id', () => {
      const invalid = { ...validScenario, id: '' };
      const result = validateScenario(invalid);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject scenario with invalid version', () => {
      const invalid = { ...validScenario, version: '2.0' };
      const result = validateScenario(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject scenario with empty tasks array', () => {
      const invalid = { ...validScenario, tasks: [] };
      const result = validateScenario(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject scenario with invalid difficulty', () => {
      const invalid = {
        ...validScenario,
        metadata: {
          ...validScenario.metadata,
          difficulty: 'expert' as any,
        },
      };
      const result = validateScenario(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject task with invalid type', () => {
      const invalid = {
        ...validScenario,
        tasks: [
          {
            id: 'task-1',
            type: 'invalid' as any,
            label: 'Test',
          },
        ],
      };
      const result = validateScenario(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject task with invalid id characters', () => {
      const invalid = {
        ...validScenario,
        tasks: [
          {
            id: 'task@1',
            type: 'macro' as const,
            label: 'Test',
          },
        ],
      };
      const result = validateScenario(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('duplicate task ID detection', () => {
    it('should reject scenario with duplicate top-level task IDs', () => {
      const invalid = {
        ...validScenario,
        tasks: [
          {
            id: 'task-1',
            type: 'macro' as const,
            label: 'First',
          },
          {
            id: 'task-1',
            type: 'micro' as const,
            label: 'Second',
          },
        ],
      };
      const result = validateScenario(invalid);
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'duplicate_task_id',
        })
      );
    });

    it('should reject scenario with duplicate IDs in spawned tasks', () => {
      const invalid = {
        ...validScenario,
        tasks: [
          {
            id: 'task-1',
            type: 'macro' as const,
            label: 'Parent',
            spawns: [
              {
                id: 'child-1',
                type: 'micro' as const,
                label: 'Child A',
              },
              {
                id: 'child-1',
                type: 'micro' as const,
                label: 'Child B',
              },
            ],
          },
        ],
      };
      const result = validateScenario(invalid);
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'duplicate_task_id',
        })
      );
    });
  });

  describe('circular dependency detection', () => {
    it('should reject scenario with circular task spawning via duplicate IDs', () => {
      // Circular references manifest as duplicate IDs
      // A task can't spawn itself directly in valid JSON
      // Our cycle detection works on the ID level
      const invalid = {
        ...validScenario,
        tasks: [
          {
            id: 'task-1',
            type: 'macro' as const,
            label: 'Parent',
            spawns: [
              {
                id: 'task-1', // Same ID as parent creates logical cycle
                type: 'micro' as const,
                label: 'Child with parent ID',
              },
            ],
          },
        ],
      };

      const result = validateScenario(invalid);
      expect(result.success).toBe(false);
      // This will be caught by duplicate ID check
      expect(result.errors.some(e => 
        e.code === 'duplicate_task_id' || e.code === 'circular_dependency'
      )).toBe(true);
    });
  });

  describe('webapi task validation', () => {
    it('should reject webapi task without delay', () => {
      const invalid = {
        ...validScenario,
        tasks: [
          {
            id: 'webapi-1',
            type: 'webapi' as const,
            label: 'Web API without delay',
          },
        ],
      };
      const result = validateScenario(invalid);
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'webapi_missing_delay',
        })
      );
    });

    it('should accept webapi task with delay', () => {
      const valid = {
        ...validScenario,
        tasks: [
          {
            id: 'webapi-1',
            type: 'webapi' as const,
            label: 'Web API with delay',
            delay: 100,
          },
        ],
      };
      const result = validateScenario(valid);
      expect(result.success).toBe(true);
    });
  });

  describe('nested task validation', () => {
    it('should validate nested spawned tasks', () => {
      const valid = {
        ...validScenario,
        tasks: [
          {
            id: 'parent',
            type: 'macro' as const,
            label: 'Parent',
            spawns: [
              {
                id: 'child',
                type: 'micro' as const,
                label: 'Child',
                spawns: [
                  {
                    id: 'grandchild',
                    type: 'micro' as const,
                    label: 'Grandchild',
                  },
                ],
              },
            ],
          },
        ],
      };
      const result = validateScenario(valid);
      expect(result.success).toBe(true);
    });
  });

  describe('formatValidationErrors', () => {
    it('should format errors with paths', () => {
      const errors = [
        {
          path: ['tasks', '0', 'id'],
          message: 'ID is required',
          code: 'required',
        },
        {
          path: ['metadata', 'title'],
          message: 'Title is too short',
          code: 'too_small',
        },
      ];

      const formatted = formatValidationErrors(errors);
      expect(formatted).toContain('tasks.0.id');
      expect(formatted).toContain('ID is required');
      expect(formatted).toContain('metadata.title');
      expect(formatted).toContain('Title is too short');
    });

    it('should format errors without paths', () => {
      const errors = [
        {
          path: [],
          message: 'Invalid scenario',
          code: 'invalid',
        },
      ];

      const formatted = formatValidationErrors(errors);
      expect(formatted).toContain('Invalid scenario');
      expect(formatted).not.toContain(':');
    });
  });
});
