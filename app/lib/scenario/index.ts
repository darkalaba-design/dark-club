/**
 * Офлайн-алгоритм генерации сценария влияния.
 * Вход: manipulatorRole, victim (type + role/profile), currentState, targetAction, targetDetails.
 * Выход: сценарий с фазами, мишенями, техниками, красными флагами и планом Б.
 */

import { psychotypes } from '../../data/psychotypes'
import { analyzeContext, audienceContextToCurrentState } from './analyzeContext'
import {
  getBaseTargets,
  getProfileTargets,
  getValueBasedTargets,
  prioritizeTargets
} from './selectTargets'
import {
  getBaseTechniques,
  filterTechniquesByState,
  modifyTechniquesByPsychotype,
  modifyTechniquesByCommStyle
} from './selectTechniques'
import {
  generateRapportPhase,
  generateTensionPhase,
  generateSolutionPhase,
  generateClosePhase
} from './generateScenario'
import { generateRedFlags } from './generateRedFlags'
import { generatePlanB } from './generatePlanB'
import type { ScenarioInput, InfluenceScenario, ScenarioPhase, ScenarioTarget } from './types'
import type { Technique } from '../../data/techniques'

export type { ScenarioInput, InfluenceScenario, ScenarioPhase, ScenarioTarget }
export { audienceContextToCurrentState }

export function generateInfluenceScenario(input: ScenarioInput): InfluenceScenario {
  const context = analyzeContext(input)
  const baseTargets = getBaseTargets(context.matrixKey)
  const profileTargets = getProfileTargets(context.profile)
  const valueTargets = getValueBasedTargets(context.profile)
  const allTargets = prioritizeTargets(baseTargets, profileTargets, valueTargets)

  let techniques: Technique[] = getBaseTechniques(context.matrixKey)
  techniques = filterTechniquesByState(techniques, context.stateModifiers)
  techniques = modifyTechniquesByPsychotype(techniques, context.profile)
  techniques = modifyTechniquesByCommStyle(techniques, context.profile)

  const targetDetails = input.targetDetails ?? null
  const targetAction = input.targetAction ?? null

  const phases = [
    generateRapportPhase(context, allTargets, context.profile),
    generateTensionPhase(context, allTargets, techniques, context.profile, targetDetails),
    generateSolutionPhase(context, allTargets, techniques, context.profile, targetAction, targetDetails),
    generateClosePhase(context, techniques, context.profile, targetAction)
  ]

  const summary = generateSummary(input)
  const keyIdea = generateKeyIdea(input, allTargets)
  const redFlags = generateRedFlags(
    context.profile,
    allTargets,
    context.stateModifiers,
    input.victim.currentState
  )
  const planB = generatePlanB(techniques, context.profile, targetAction)

  const useTargets = allTargets.filter(t => t.type !== 'avoid')
  return {
    summary,
    keyIdea,
    phases,
    planB,
    redFlags,
    targets: useTargets.slice(0, 5),
    techniques: techniques.slice(0, 4)
  }
}

export function generateSummary(input: ScenarioInput): InfluenceScenario['summary'] {
  const victimName =
    input.victim.type === 'profile' && input.victim.profile
      ? input.victim.profile.name
      : (input.victim.role ?? 'Аудитория')

  return {
    manipulatorRole: input.manipulatorRole,
    victimName,
    psychotype: input.victim.profile?.psychotype ?? null,
    targetAction: input.targetAction,
    targetDetails: input.targetDetails ?? null,
    currentState: input.victim.currentState
  }
}

export function generateKeyIdea(input: ScenarioInput, targets: ScenarioTarget[]): string {
  const primary = targets.find(t => t.type !== 'avoid')
  if (!primary) {
    return 'Ключевая идея: установите контакт и выявите потребность.'
  }

  const profile = input.victim.profile
  const psychotype = profile?.psychotype
    ? psychotypes.find(p => p.id === profile.psychotype)
    : null
  const psychotypeNote = psychotype ? `Учитывая психотип (${psychotype.title}), ` : ''

  const howToUse = primary.howToUse ?? primary.why ?? ''
  return `${psychotypeNote}фокусируйтесь на ${primary.title.toLowerCase()}. ${howToUse}`
}
