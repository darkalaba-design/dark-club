/**
 * Типы для офлайн-алгоритма генерации сценария влияния.
 */

import type { Profile } from '../../data/profiles'
import type { Target } from '../../data/targets'
import type { Technique } from '../../data/techniques'
import type { CurrentStateId } from '../../data/stateModifiers'

/** Входные данные для генерации сценария (офлайн и webhook). */
export interface ScenarioInput {
  manipulatorRole: string | null
  victim: {
    type: 'general' | 'profile'
    role?: string
    profile?: Profile | null
    currentState: CurrentStateId
  }
  targetAction: string | null
  targetDetails?: string | null
}

/** Результат анализа контекста (модуль 1). */
export interface AnalyzedContext {
  matrixKey: string
  relationshipType: string
  stateModifiers: import('../../data/stateModifiers').StateModifiers
  hasProfile: boolean
  profile: Profile | null
}

/** Мишень с приоритетом и источником (для сценария). */
export interface ScenarioTarget {
  id: string
  title: string
  description: string
  icon: string
  source?: string
  howToUse?: string
  why?: string
  priority: 'critical' | 'high' | 'medium'
  type?: 'use' | 'avoid'
  contextNote?: string
}

/** Фаза сценария. */
export interface ScenarioPhase {
  title: string
  goal: string
  technique: { title: string; description: string; id?: string } | null
  targetUsed?: ScenarioTarget | null
  phrases: string[]
  expectedReaction: string
  notes: string[]
}

/** Красный флаг. */
export interface RedFlagItem {
  type: string
  flag: string
  reason: string
}

/** Возражение и ответ (План Б). */
export interface ObjectionItem {
  objection: string
  response: string
  example?: string
}

/** Итоговый сценарий влияния. */
export interface InfluenceScenario {
  summary: {
    manipulatorRole: string | null
    victimName: string
    psychotype: string | null
    targetAction: string | null
    targetDetails: string | null
    currentState: CurrentStateId
  }
  keyIdea: string
  phases: ScenarioPhase[]
  planB: { title: string; objections: ObjectionItem[] }
  redFlags: { title: string; items: RedFlagItem[] }
  targets: ScenarioTarget[]
  techniques: Technique[]
}
