/**
 * Модуль 1: Анализ входных данных — собираем контекст для сценария.
 */

import type { Profile } from '../../data/profiles'
import { relationshipTypeToVictimRoleId } from '../../data/profiles'
import { getStateModifiers } from '../../data/stateModifiers'
import type { CurrentStateId } from '../../data/stateModifiers'
import type { ScenarioInput } from './types'
import type { AnalyzedContext } from './types'

export function analyzeContext(data: ScenarioInput): AnalyzedContext {
  const relationshipType =
    data.victim.type === 'profile' && data.victim.profile
      ? relationshipTypeToVictimRoleId[data.victim.profile.relationshipType] ?? data.victim.profile.relationshipType
      : (data.victim.role ?? 'stranger')

  const matrixKey = [data.manipulatorRole, relationshipType, data.targetAction].filter(Boolean).join('_') || 'default'
  const stateModifiers = getStateModifiers(data.victim.currentState)
  const hasProfile = data.victim.type === 'profile' && !!data.victim.profile

  return {
    matrixKey,
    relationshipType,
    stateModifiers,
    hasProfile,
    profile: data.victim.profile ?? null
  }
}

/** Маппинг audienceContext (UI) → currentState (алгоритм). */
export function audienceContextToCurrentState(
  context: 'resource' | 'stress' | 'euphoria' | 'apathy' | 'unknown' | null
): CurrentStateId {
  const map: Record<string, CurrentStateId> = {
    resource: 'в_ресурсе',
    stress: 'в_стрессе',
    euphoria: 'в_эйфории',
    apathy: 'в_апатии',
    unknown: 'в_ресурсе'
  }
  return (context && map[context]) ?? 'в_ресурсе'
}
