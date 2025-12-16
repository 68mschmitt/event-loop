/**
 * PresetsPanel - displays and loads preset scenarios.
 */

import { useState } from 'react';
import { PRESET_SCENARIOS, getPresetsByDifficulty } from '@/scenarios/presets';
import { parseScenario } from '@/scenarios/parser';
import { useLoadScenario } from '@/state/hooks/useLoadScenario';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import type { ScenarioDifficulty, ScenarioDefinition } from '@/core/types/scenario';

type DifficultyFilter = 'all' | ScenarioDifficulty;

interface PresetCardProps {
  scenario: ScenarioDefinition;
  onLoad: () => void;
}

function PresetCard({ scenario, onLoad }: PresetCardProps) {
  const { metadata } = scenario;
  
  // Map difficulty to badge variant
  const difficultyVariant = {
    beginner: 'success' as const,
    intermediate: 'warning' as const,
    advanced: 'error' as const,
  }[metadata.difficulty];

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 hover:border-zinc-600 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-zinc-200 mb-1">
            {metadata.title}
          </h4>
          <div className="flex items-center gap-2">
            <Badge variant={difficultyVariant}>
              {metadata.difficulty}
            </Badge>
            <span className="text-xs text-zinc-500">
              ~{metadata.estimatedDuration}s
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-zinc-400 mb-3">
        {metadata.description}
      </p>

      {/* Learning Objectives */}
      <div className="mb-3">
        <p className="text-xs font-semibold text-zinc-400 mb-1">
          You'll learn:
        </p>
        <ul className="text-xs text-zinc-500 space-y-1">
          {metadata.learningObjectives.map((objective, index) => (
            <li key={index} className="flex items-start">
              <span className="text-zinc-600 mr-2">•</span>
              <span>{objective}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {metadata.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 text-xs rounded bg-zinc-700/50 text-zinc-400"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={onLoad}
          variant="primary"
          size="sm"
          className="flex-1"
        >
          Load Scenario
        </Button>
      </div>
    </div>
  );
}

export function PresetsPanel() {
  const [filter, setFilter] = useState<DifficultyFilter>('all');
  const loadScenario = useLoadScenario();

  const filteredScenarios =
    filter === 'all'
      ? PRESET_SCENARIOS
      : getPresetsByDifficulty(filter);

  const handleLoadScenario = (scenario: ScenarioDefinition) => {
    try {
      const state = parseScenario(scenario);
      loadScenario(state);
    } catch (error) {
      console.error('Failed to load scenario:', error);
      // TODO: Show error toast/notification
    }
  };

  const filterOptions: { value: DifficultyFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-zinc-200 mb-2">
          Preset Scenarios
        </h3>
        <p className="text-sm text-zinc-400">
          Explore educational scenarios that demonstrate key event loop concepts.
        </p>
      </div>

      {/* Difficulty Filters */}
      <div className="flex gap-2">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`
              px-3 py-1.5 text-sm rounded-md transition-colors
              ${
                filter === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Scenario Cards */}
      <div className="space-y-3">
        {filteredScenarios.length === 0 ? (
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-6 text-center">
            <p className="text-sm text-zinc-400">
              No scenarios found for this difficulty level.
            </p>
          </div>
        ) : (
          filteredScenarios.map((scenario) => (
            <PresetCard
              key={scenario.id}
              scenario={scenario}
              onLoad={() => handleLoadScenario(scenario)}
            />
          ))
        )}
      </div>

      {/* Statistics */}
      <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
        <p className="text-xs text-zinc-500">
          {PRESET_SCENARIOS.length} total scenarios •{' '}
          {getPresetsByDifficulty('beginner').length} beginner •{' '}
          {getPresetsByDifficulty('intermediate').length} intermediate •{' '}
          {getPresetsByDifficulty('advanced').length} advanced
        </p>
      </div>
    </div>
  );
}
