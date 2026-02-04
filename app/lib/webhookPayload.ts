/**
 * Типы и подготовка структурированного payload для webhook (по ТЗ Claude).
 */

import type { Profile } from '../data/profiles'
import { manipulatorRoles } from '../data/roles'
import { targetActions } from '../data/actions'
import { psychotypes } from '../data/psychotypes'
import { complexes } from '../data/complexes'
import { shadows } from '../data/shadows'
import {
  communicationStyleOptions,
  motivationProfileOptions,
  referenceOptions,
  decisionPaceOptions
} from '../data/profileParams'
import { audienceContextToCurrentState } from './scenario'
import type { AudienceContextId } from '../hooks/useAppState'

const stateLabels: Record<string, string> = {
  в_ресурсе: 'В ресурсе',
  в_стрессе: 'В стрессе',
  в_эйфории: 'В эйфории',
  в_апатии: 'В апатии'
}

export interface WebhookPayload {
  setup: {
    manipulatorRole: { id: string; label: string; description: string }
    victimState: { id: string; label: string }
    targetAction: { id: string; label: string; description: string }
    targetDetails: string | null
  }
  profile: {
    name: string
    gender: string | null
    age: string | null
    psychotype: { id: string; label: string; description: string } | null
    complexes: Array<{ id: string; label: string; description: string }>
    shadows: Array<{ id: string; label: string; description: string }>
    beliefs: string[]
    values: string[]
    triggers: { positive: string[]; negative: string[]; painPoints: string[] }
    communicationStyle: string | null
    motivation: string | null
    reference: string | null
    decisionSpeed: string | null
    notes: string | null
  }
  meta: {
    timestamp: string
    appVersion: string
    locale: string
  }
}

export function prepareWebhookPayload(
  manipulatorRoleId: string | null,
  audienceContext: AudienceContextId | null,
  targetActionId: string | null,
  targetActionDetail: string | null,
  profile: Profile
): WebhookPayload {
  const currentState = audienceContextToCurrentState(audienceContext)
  const manipulator = manipulatorRoleId
    ? manipulatorRoles.find(r => r.id === manipulatorRoleId)
    : null
  const action = targetActionId
    ? targetActions.find(a => a.id === targetActionId)
    : null
  const psychotypeData = profile.psychotype
    ? psychotypes.find(p => p.id === profile.psychotype)
    : null
  const complexesData = profile.complexes
    .map(id => complexes.find(c => c.id === id))
    .filter((c): c is NonNullable<typeof c> => !!c)
  const shadowsData = profile.shadows
    .map(id => shadows.find(s => s.id === id))
    .filter((s): s is NonNullable<typeof s> => !!s)

  const commLabel = profile.communicationStyle
    ? communicationStyleOptions.find(o => o.id === profile.communicationStyle)?.label ?? null
    : null
  const motivationLabel = profile.motivationProfile
    ? motivationProfileOptions.find(o => o.id === profile.motivationProfile)?.label ?? null
    : null
  const motivationShort = profile.motivationProfile === 'toward' ? 'к' : profile.motivationProfile === 'away' ? 'от' : null
  const referenceLabel = profile.reference
    ? referenceOptions.find(o => o.id === profile.reference)?.label ?? null
    : null
  const referenceShort = profile.reference === 'internal' ? 'внутренняя' : profile.reference === 'external' ? 'внешняя' : null
  const decisionLabel = profile.decisionPace
    ? decisionPaceOptions.find(o => o.id === profile.decisionPace)?.label ?? null
    : null

  return {
    setup: {
      manipulatorRole: {
        id: manipulatorRoleId ?? '',
        label: manipulator?.title ?? manipulatorRoleId ?? '',
        description: manipulator?.description ?? ''
      },
      victimState: {
        id: currentState,
        label: stateLabels[currentState] ?? currentState
      },
      targetAction: {
        id: targetActionId ?? '',
        label: action?.title ?? targetActionId ?? '',
        description: action?.description ?? ''
      },
      targetDetails: targetActionDetail?.trim() || null
    },
    profile: {
      name: profile.name,
      gender: profile.gender ?? null,
      age: profile.age ?? null,
      psychotype: psychotypeData
        ? { id: psychotypeData.id, label: psychotypeData.title, description: psychotypeData.fullDesc }
        : null,
      complexes: complexesData.map(c => ({ id: c.id, label: c.title, description: c.description })),
      shadows: shadowsData.map(s => ({ id: s.id, label: s.title, description: s.description })),
      beliefs: profile.beliefs ?? [],
      values: profile.values ?? [],
      triggers: {
        positive: profile.triggersPositive ?? [],
        negative: profile.triggersNegative ?? [],
        painPoints: profile.painPoints ?? []
      },
      communicationStyle: commLabel ?? null,
      motivation: motivationShort ?? motivationLabel ?? null,
      reference: referenceShort ?? referenceLabel ?? null,
      decisionSpeed: decisionLabel ?? null,
      notes: profile.notes?.trim() || null
    },
    meta: {
      timestamp: new Date().toISOString(),
      appVersion: '1.0.0',
      locale: 'ru'
    }
  }
}
