/**
 * Предпочтения техник по психотипу для офлайн-алгоритма сценария.
 * id психотипа → prefer / avoid (id техник).
 */

export const psychotypePreferences: Record<string, { prefer: string[]; avoid: string[] }> = {
  epileptoid: {
    prefer: ['authority_card', 'framing', 'social_proof'],
    avoid: ['guilt_trip', 'flattery']
  },
  hysteroid: {
    prefer: ['flattery', 'social_proof', 'scarcity_pressure'],
    avoid: ['silence_power']
  },
  schizoid: {
    prefer: ['framing', 'authority_card'],
    avoid: ['flattery', 'guilt_trip', 'social_proof']
  },
  paranoid: {
    prefer: ['authority_card', 'framing', 'reciprocity_trigger'],
    avoid: ['door_in_face', 'false_dilemma']
  },
  emotive: {
    prefer: ['reciprocity_trigger', 'flattery', 'framing'],
    avoid: ['scarcity_pressure', 'false_dilemma', 'guilt_trip']
  },
  hyperthymic: {
    prefer: ['scarcity_pressure', 'yes_ladder', 'social_proof'],
    avoid: ['silence_power']
  }
}
