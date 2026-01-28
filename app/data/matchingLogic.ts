import { Target } from './targets'
import { Technique } from './techniques'

export interface MatchingResult {
  targets: Target[]
  techniques: Technique[]
}

export const matchingLogic: Record<string, { targets: string[], techniques: string[] }> = {
  'boss_subordinate_change_behavior': {
    targets: ['fear', 'authority', 'belonging', 'consistency'],
    techniques: ['authority_card', 'social_proof', 'framing', 'foot_in_door']
  },
  'boss_subordinate_collaborate': {
    targets: ['vanity', 'reciprocity', 'belonging'],
    techniques: ['flattery', 'reciprocity_trigger', 'social_proof']
  },
  'salesperson_client_buy': {
    targets: ['fear', 'greed', 'scarcity', 'reciprocity'],
    techniques: ['scarcity_pressure', 'social_proof', 'door_in_face', 'framing']
  },
  'colleague_colleague_victim_agree': {
    targets: ['reciprocity', 'belonging', 'consistency'],
    techniques: ['reciprocity_trigger', 'social_proof', 'yes_ladder']
  },
  'friend_friend_victim_forgive': {
    targets: ['guilt', 'reciprocity', 'belonging'],
    techniques: ['guilt_trip', 'reciprocity_trigger', 'silence_power']
  },
  'partner_partner_victim_trust': {
    targets: ['guilt', 'reciprocity', 'consistency'],
    techniques: ['reciprocity_trigger', 'guilt_trip', 'flattery']
  },
  'parent_child_change_behavior': {
    targets: ['fear', 'guilt', 'authority', 'consistency'],
    techniques: ['authority_card', 'guilt_trip', 'false_dilemma', 'foot_in_door']
  },
  'default': {
    targets: ['reciprocity', 'curiosity', 'belonging'],
    techniques: ['reciprocity_trigger', 'social_proof', 'framing']
  }
}

export function getRecommendations(
  manipulatorRole: string | null,
  victimRole: string | null,
  targetAction: string | null,
  allTargets: Target[],
  allTechniques: Technique[]
): MatchingResult {
  if (!manipulatorRole || !victimRole || !targetAction) {
    const defaultMatch = matchingLogic['default']
    return {
      targets: defaultMatch.targets.map(id => allTargets.find(t => t.id === id)!).filter(Boolean),
      techniques: defaultMatch.techniques.map(id => allTechniques.find(t => t.id === id)!).filter(Boolean)
    }
  }

  const key = `${manipulatorRole}_${victimRole}_${targetAction}`
  const match = matchingLogic[key] || matchingLogic['default']

  const selectedTargets = match.targets
    .map(id => allTargets.find(t => t.id === id))
    .filter((t): t is Target => t !== undefined)

  const selectedTechniques = match.techniques
    .map(id => allTechniques.find(t => t.id === id))
    .filter((t): t is Technique => t !== undefined)

  return {
    targets: selectedTargets,
    techniques: selectedTechniques
  }
}
