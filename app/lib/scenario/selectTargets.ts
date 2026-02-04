/**
 * Модуль 2: Подбор мишеней — базовые из матрицы + из профиля + из ценностей.
 */

import { matchingLogic } from '../../data/matchingLogic'
import { targets } from '../../data/targets'
import { complexes } from '../../data/complexes'
import { shadows } from '../../data/shadows'
import type { Profile } from '../../data/profiles'
import type { Target } from '../../data/targets'
import type { ScenarioTarget } from './types'

const valueToTargetMap: Record<string, string> = {
  Семья: 'belonging',
  Безопасность: 'fear',
  Свобода: 'fear',
  Статус: 'vanity',
  Деньги: 'greed',
  Признание: 'vanity',
  Справедливость: 'guilt',
  Стабильность: 'fear',
  Карьера: 'vanity',
  Независимость: 'fear'
}

export function getBaseTargets(matrixKey: string): ScenarioTarget[] {
  const match = matchingLogic[matrixKey] ?? matchingLogic['default']
  return (match.targets as string[])
    .map(id => targets.find(t => t.id === id))
    .filter((t): t is Target => !!t)
    .map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      icon: t.icon,
      why: t.why,
      source: 'базовая',
      priority: 'medium' as const
    }))
}

export function getProfileTargets(profile: Profile | null): ScenarioTarget[] {
  if (!profile) return []

  const result: ScenarioTarget[] = []

  for (const id of profile.complexes) {
    const c = complexes.find(x => x.id === id)
    if (c) {
      result.push({
        id: c.id,
        title: c.title,
        description: c.description,
        icon: c.icon,
        source: 'комплекс',
        howToUse: c.howToUse,
        priority: 'high'
      })
    }
  }

  for (const id of profile.shadows) {
    const s = shadows.find(x => x.id === id)
    if (s) {
      result.push({
        id: s.id,
        title: s.title,
        description: s.description,
        icon: s.icon,
        source: 'тень',
        howToUse: s.howToWork,
        priority: 'high'
      })
    }
  }

  for (const trigger of profile.triggersNegative ?? []) {
    result.push({
      id: `trigger_neg_${result.length}`,
      title: 'Негативный триггер',
      description: trigger,
      icon: '⚠️',
      source: 'триггер',
      howToUse: 'Избегать этого в коммуникации!',
      priority: 'critical',
      type: 'avoid'
    })
  }

  for (const trigger of profile.triggersPositive ?? []) {
    result.push({
      id: `trigger_pos_${result.length}`,
      title: 'Позитивный триггер',
      description: trigger,
      icon: '✨',
      source: 'триггер',
      howToUse: 'Использовать это для мотивации',
      priority: 'high',
      type: 'use'
    })
  }

  return result
}

export function getValueBasedTargets(profile: Profile | null): ScenarioTarget[] {
  if (!profile?.values?.length) return []

  const result: ScenarioTarget[] = []
  for (const value of profile.values) {
    const targetId = valueToTargetMap[value]
    if (targetId) {
      const t = targets.find(x => x.id === targetId)
      if (t) {
        result.push({
          ...t,
          source: 'ценность',
          contextNote: `Человек ценит "${value}", поэтому эта мишень особенно уязвима`,
          priority: 'high'
        })
      }
    }
  }
  return result
}

export function prioritizeTargets(
  baseTargets: ScenarioTarget[],
  profileTargets: ScenarioTarget[],
  valueTargets: ScenarioTarget[]
): ScenarioTarget[] {
  const all: ScenarioTarget[] = [
    ...baseTargets.map(t => ({ ...t, priority: 'medium' as const, source: t.source ?? 'базовая' })),
    ...profileTargets,
    ...valueTargets
  ]

  const seen = new Set<string>()
  const unique: ScenarioTarget[] = []

  for (const t of all) {
    const key = t.id
    if (!seen.has(key)) {
      unique.push(t)
      seen.add(key)
    } else {
      const existing = unique.find(x => x.id === key)
      if (existing && (t.priority === 'high' || t.priority === 'critical') && existing.priority === 'medium') {
        existing.priority = t.priority
        existing.source = t.source
      }
    }
  }

  const order: Record<string, number> = { critical: 0, high: 1, medium: 2 }
  unique.sort((a, b) => order[a.priority] - order[b.priority])
  return unique
}
