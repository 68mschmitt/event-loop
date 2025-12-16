/**
 * Tests for preset scenarios.
 */

import { describe, it, expect } from 'vitest';
import { PRESET_SCENARIOS, getPresetById, getPresetsByDifficulty } from '@/scenarios/presets';
import { validateScenario } from '@/scenarios/validator';
import { parseScenario } from '@/scenarios/parser';

describe('Preset Scenarios', () => {
  describe('scenario validity', () => {
    it('should have at least 4 preset scenarios', () => {
      expect(PRESET_SCENARIOS.length).toBeGreaterThanOrEqual(4);
    });

    it('should have all scenarios pass validation', () => {
      for (const scenario of PRESET_SCENARIOS) {
        const result = validateScenario(scenario);
        if (!result.success) {
          console.error(`Scenario "${scenario.id}" failed validation:`, result.errors);
        }
        expect(result.success).toBe(true);
      }
    });

    it('should have unique IDs for all scenarios', () => {
      const ids = PRESET_SCENARIOS.map((s) => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all required metadata fields', () => {
      for (const scenario of PRESET_SCENARIOS) {
        expect(scenario.metadata.title).toBeTruthy();
        expect(scenario.metadata.description).toBeTruthy();
        expect(scenario.metadata.difficulty).toBeTruthy();
        expect(scenario.metadata.tags.length).toBeGreaterThan(0);
        expect(scenario.metadata.learningObjectives.length).toBeGreaterThan(0);
        expect(scenario.metadata.estimatedDuration).toBeGreaterThan(0);
      }
    });
  });

  describe('scenario parsing', () => {
    it('should parse all scenarios without errors', () => {
      for (const scenario of PRESET_SCENARIOS) {
        expect(() => parseScenario(scenario)).not.toThrow();
      }
    });

    it('should create valid simulator states', () => {
      for (const scenario of PRESET_SCENARIOS) {
        const state = parseScenario(scenario);
        expect(state).toBeDefined();
        expect(state.callStack).toBeDefined();
        expect(state.macroQueue).toBeDefined();
        expect(state.microQueue).toBeDefined();
        expect(state.rafQueue).toBeDefined();
      }
    });
  });

  describe('difficulty distribution', () => {
    it('should have beginner scenarios', () => {
      const beginner = getPresetsByDifficulty('beginner');
      expect(beginner.length).toBeGreaterThan(0);
    });

    it('should have intermediate scenarios', () => {
      const intermediate = getPresetsByDifficulty('intermediate');
      expect(intermediate.length).toBeGreaterThan(0);
    });

    it('should have advanced scenarios', () => {
      const advanced = getPresetsByDifficulty('advanced');
      expect(advanced.length).toBeGreaterThan(0);
    });
  });

  describe('getPresetById', () => {
    it('should find scenario by ID', () => {
      const scenario = PRESET_SCENARIOS[0];
      if (!scenario) return;
      const found = getPresetById(scenario.id);
      expect(found).toBe(scenario);
    });

    it('should return undefined for non-existent ID', () => {
      const found = getPresetById('non-existent');
      expect(found).toBeUndefined();
    });
  });

  describe('individual scenarios', () => {
    it('basic-macro should have correct structure', () => {
      const scenario = getPresetById('basic-macro');
      expect(scenario).toBeDefined();
      if (!scenario) return;
      expect(scenario.metadata.difficulty).toBe('beginner');
      expect(scenario.tasks.length).toBe(1);
      expect(scenario.tasks[0]?.type).toBe('macro');
    });

    it('microtask-priority should demonstrate priority', () => {
      const scenario = getPresetById('microtask-priority');
      expect(scenario).toBeDefined();
      if (!scenario) return;
      expect(scenario.tasks.length).toBe(2);
      // Should have both macro and micro tasks
      const types = scenario.tasks.map((t) => t.type);
      expect(types).toContain('macro');
      expect(types).toContain('micro');
    });

    it('promise-chain should have spawned tasks', () => {
      const scenario = getPresetById('promise-chain');
      expect(scenario).toBeDefined();
      if (!scenario) return;
      // Should have at least one task with spawns
      const hasSpawns = scenario.tasks.some((t) => t.spawns && t.spawns.length > 0);
      expect(hasSpawns).toBe(true);
    });
  });
});
