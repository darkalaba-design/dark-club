/**
 * Модификаторы состояния аудитории для офлайн-алгоритма сценария влияния.
 * Ключи — currentState (в_ресурсе, в_стрессе, в_эйфории, в_апатии).
 */

export type CurrentStateId = 'в_ресурсе' | 'в_стрессе' | 'в_эйфории' | 'в_апатии'

export interface StateModifiers {
  openness: number
  riskTolerance: number
  emotionalStability: number
  preferredApproach: string
  avoidTechniques: string[]
  recommendTechniques: string[]
}

export const stateModifiers: Record<CurrentStateId, StateModifiers> = {
  в_ресурсе: {
    openness: 1.0,
    riskTolerance: 0.8,
    emotionalStability: 1.0,
    preferredApproach: 'позитивный',
    avoidTechniques: [],
    recommendTechniques: ['flattery', 'reciprocity_trigger', 'social_proof']
  },
  в_стрессе: {
    openness: 0.3,
    riskTolerance: 0.2,
    emotionalStability: 0.4,
    preferredApproach: 'поддерживающий',
    avoidTechniques: ['scarcity_pressure', 'guilt_trip', 'false_dilemma'],
    recommendTechniques: ['framing', 'authority_card', 'silence_power']
  },
  в_эйфории: {
    openness: 1.2,
    riskTolerance: 1.5,
    emotionalStability: 0.6,
    preferredApproach: 'энергичный',
    avoidTechniques: ['silence_power'],
    recommendTechniques: ['scarcity_pressure', 'yes_ladder', 'social_proof']
  },
  в_апатии: {
    openness: 0.4,
    riskTolerance: 0.1,
    emotionalStability: 0.3,
    preferredApproach: 'мягкий',
    avoidTechniques: ['scarcity_pressure', 'false_dilemma', 'guilt_trip'],
    recommendTechniques: ['foot_in_door', 'reciprocity_trigger', 'framing']
  }
}

export function getStateModifiers(currentState: CurrentStateId): StateModifiers {
  return stateModifiers[currentState] ?? stateModifiers['в_ресурсе']
}
