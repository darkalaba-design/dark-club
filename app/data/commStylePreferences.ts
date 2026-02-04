/**
 * Предпочтения техник по коммуникационному стилю (id из profileParams).
 * direct, indirect, emotional, rational, dominant, accommodating.
 */

export const commStylePreferences: Record<string, { prefer: string[]; avoid: string[] }> = {
  direct: {
    prefer: ['framing', 'authority_card'],
    avoid: ['door_in_face', 'foot_in_door']
  },
  indirect: {
    prefer: ['foot_in_door', 'reciprocity_trigger'],
    avoid: ['false_dilemma']
  },
  emotional: {
    prefer: ['flattery', 'reciprocity_trigger', 'social_proof'],
    avoid: ['silence_power']
  },
  rational: {
    prefer: ['authority_card', 'framing'],
    avoid: ['flattery', 'guilt_trip']
  },
  dominant: {
    prefer: ['authority_card', 'scarcity_pressure'],
    avoid: ['foot_in_door']
  },
  accommodating: {
    prefer: ['reciprocity_trigger', 'social_proof', 'flattery'],
    avoid: ['false_dilemma']
  }
}
