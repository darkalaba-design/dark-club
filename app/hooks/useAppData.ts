'use client'

import { useMemo } from 'react'
import { ManipulatorRole, VictimRole } from '../data/roles'
import { TargetAction } from '../data/actions'
import { Target } from '../data/targets'
import { Technique } from '../data/techniques'
import { getRecommendations, getRecommendationsForProfile } from '../data/matchingLogic'
import type { Profile } from '../data/profiles'
import { manipulatorRoles, victimRoles } from '../data/roles'
import { targetActions } from '../data/actions'
import { targets } from '../data/targets'
import { techniques } from '../data/techniques'
import { matchingLogic } from '../data/matchingLogic'

export interface AppData {
  manipulatorRoles: ManipulatorRole[]
  victimRoles: VictimRole[]
  targetActions: TargetAction[]
  targets: Target[]
  techniques: Technique[]
  matchingLogic: Record<string, { targets: string[], techniques: string[] }>
  loading: boolean
}

export function useAppData(): AppData {
  return useMemo(
    () => ({
      manipulatorRoles,
      victimRoles,
      targetActions,
      targets,
      techniques,
      matchingLogic,
      loading: false
    }),
    []
  )
}

/**
 * Рекомендации по мишеням и техникам. При переданном профиле учитываются комплексы и тени профиля.
 */
export function useRecommendations(
  manipulatorRole: string | null,
  victimRole: string | null,
  targetAction: string | null,
  appData: AppData,
  profile: Profile | null = null
): { targets: Target[], techniques: Technique[], profileTargets?: import('../data/matchingLogic').ProfileTargetItem[] } {
  if (!manipulatorRole || !targetAction || appData.loading) {
    return { targets: [], techniques: [] }
  }

  if (profile) {
    return getRecommendationsForProfile(
      manipulatorRole,
      profile,
      targetAction,
      appData.targets,
      appData.techniques
    )
  }

  if (!victimRole) return { targets: [], techniques: [] }

  return getRecommendations(
    manipulatorRole,
    victimRole,
    targetAction,
    appData.targets,
    appData.techniques,
    appData.matchingLogic
  )
}
