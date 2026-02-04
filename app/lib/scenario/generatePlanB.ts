/**
 * Модуль 6: Генерация Плана Б (возражения и ответы).
 */

import { objectionsByAction, objectionExamplePhrases } from '../../data/objectionsByAction'
import type { Profile } from '../../data/profiles'
import type { ObjectionItem } from './types'

export function generatePlanB(
  _techniques: unknown[],
  profile: Profile | null,
  targetAction: string | null
): { title: string; objections: ObjectionItem[] } {
  const objections: ObjectionItem[] = []
  const actionId = targetAction ?? 'agree'
  const relevant = objectionsByAction[actionId] ?? [
    { objection: 'Не уверен', response: 'Уточните причину и работайте с ней' }
  ]

  for (const obj of relevant) {
    objections.push({
      objection: `«${obj.objection}»`,
      response: obj.response,
      example: objectionExamplePhrases[obj.objection] ?? 'Адаптируйте ответ под ситуацию'
    })
  }

  return {
    title: '🔄 ПЛАН Б (если основной сценарий не сработал)',
    objections
  }
}
