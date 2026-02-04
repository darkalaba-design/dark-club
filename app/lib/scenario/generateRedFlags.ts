/**
 * Модуль 5: Генерация предостережений (красные флаги).
 */

import { psychotypes } from '../../data/psychotypes'
import type { Profile } from '../../data/profiles'
import type { ScenarioTarget } from './types'
import type { RedFlagItem } from './types'
import type { StateModifiers } from '../../data/stateModifiers'
import type { CurrentStateId } from '../../data/stateModifiers'

const currentStateLabels: Record<CurrentStateId, string> = {
  в_ресурсе: 'в ресурсе',
  в_стрессе: 'в стрессе',
  в_эйфории: 'в эйфории',
  в_апатии: 'в апатии'
}

export function generateRedFlags(
  profile: Profile | null,
  _targets: ScenarioTarget[],
  stateModifiers: StateModifiers,
  currentStateId?: CurrentStateId
): { title: string; items: RedFlagItem[] } {
  const items: RedFlagItem[] = []

  if (profile?.psychotype) {
    const psychotype = psychotypes.find(p => p.id === profile.psychotype)
    if (psychotype?.triggers?.length) {
      for (const trigger of psychotype.triggers) {
        items.push({
          type: 'психотип',
          flag: `Не упоминайте: ${trigger}`,
          reason: `Триггер для ${psychotype.title}`
        })
      }
    }
  }

  if (stateModifiers.avoidTechniques?.length) {
    const stateLabel = currentStateId ? currentStateLabels[currentStateId] : 'в текущем состоянии'
    items.push({
      type: 'состояние',
      flag: 'Не используйте давление',
      reason: `Человек ${stateLabel} — давление вызовет отторжение`
    })
  }

  if (profile?.triggersNegative?.length) {
    for (const trigger of profile.triggersNegative) {
      items.push({
        type: 'триггер',
        flag: `❌ «${trigger}»`,
        reason: 'Негативный триггер из профиля — избегайте этого!'
      })
    }
  }

  if (profile?.complexes?.length) {
    for (const id of profile.complexes) {
      if (id === 'inferiority') {
        items.push({
          type: 'комплекс',
          flag: 'Не критикуйте и не сравнивайте с другими',
          reason: 'Комплекс неполноценности — любая критика воспринимается болезненно'
        })
      } else if (id === 'superiority') {
        items.push({
          type: 'комплекс',
          flag: 'Не обесценивайте его достижения',
          reason: 'Комплекс превосходства — обесценивание вызовет агрессию'
        })
      } else if (id === 'victim') {
        items.push({
          type: 'комплекс',
          flag: 'Не обвиняйте и не давите ответственностью',
          reason: 'Комплекс жертвы — включится защита «это не моя вина»'
        })
      }
    }
  }

  items.push({
    type: 'общее',
    flag: 'Не лгите и не обманывайте',
    reason: 'Если ложь раскроется — доверие потеряно навсегда'
  })
  items.push({
    type: 'общее',
    flag: 'Не манипулируйте ради манипуляции',
    reason: 'Цель должна приносить пользу обеим сторонам'
  })

  return {
    title: '⚠️ ЧЕГО ИЗБЕГАТЬ (Красные флаги)',
    items
  }
}
