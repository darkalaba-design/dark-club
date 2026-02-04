/**
 * Модуль 3: Подбор техник — база из матрицы, фильтр по состоянию, модификация по психотипу и стилю.
 */

import { matchingLogic } from '../../data/matchingLogic'
import { techniques } from '../../data/techniques'
import type { Technique } from '../../data/techniques'
import type { Profile } from '../../data/profiles'
import type { StateModifiers } from '../../data/stateModifiers'
import { psychotypePreferences } from '../../data/psychotypePreferences'
import { commStylePreferences } from '../../data/commStylePreferences'

export function getBaseTechniques(matrixKey: string): Technique[] {
  const match = matchingLogic[matrixKey] ?? matchingLogic['default']
  return (match.techniques as string[])
    .map(id => techniques.find(t => t.id === id))
    .filter((t): t is Technique => !!t)
}

export function filterTechniquesByState(
  baseTechniques: Technique[],
  stateModifiers: StateModifiers
): Technique[] {
  return baseTechniques.filter(t => !stateModifiers.avoidTechniques.includes(t.id))
}

export function modifyTechniquesByPsychotype(
  techs: Technique[],
  profile: Profile | null
): Technique[] {
  if (!profile?.psychotype) return techs
  const prefs = psychotypePreferences[profile.psychotype]
  if (!prefs) return techs
  return techs
    .filter(t => !prefs.avoid.includes(t.id))
    .sort((a, b) => {
      const aPref = prefs.prefer.includes(a.id) ? 0 : 1
      const bPref = prefs.prefer.includes(b.id) ? 0 : 1
      return aPref - bPref
    })
}

export function modifyTechniquesByCommStyle(
  techs: Technique[],
  profile: Profile | null
): Technique[] {
  if (!profile?.communicationStyle) return techs
  const prefs = commStylePreferences[profile.communicationStyle]
  if (!prefs) return techs
  return techs
    .filter(t => !prefs.avoid.includes(t.id))
    .sort((a, b) => {
      const aPref = prefs.prefer.includes(a.id) ? 0 : 1
      const bPref = prefs.prefer.includes(b.id) ? 0 : 1
      return aPref - bPref
    })
}
