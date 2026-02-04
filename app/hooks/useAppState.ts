'use client'

import { useState, useCallback } from 'react'
import { Target } from '../data/targets'
import { Technique } from '../data/techniques'
import type { ProfileTargetItem } from '../data/matchingLogic'

export type MainSection = 'analysis' | 'profiles'

/** Текущее состояние аудитории (контекст) для точности рекомендаций */
export type AudienceContextId = 'resource' | 'stress' | 'euphoria' | 'apathy' | 'unknown'

export interface AppState {
  currentStep: number // 0 = welcome, 1-3 = steps, 4 = results
  selectedMode: 'communication' | 'marketing' | 'defense'
  mainSection: MainSection
  manipulatorRole: string | null
  victimRole: string | null
  targetAction: string | null
  /** Уточнённая формулировка цели (шаг 3.5) */
  targetActionDetail: string | null
  selectedProfileId: string | null // выбранный профиль на шаге 2 (аудитория)
  /** Текущее состояние аудитории: в ресурсе, в стрессе и т.д. */
  audienceContext: AudienceContextId | null
  selectedTechnique: string | null
  results: {
    targets: Target[]
    techniques: Technique[]
    profileTargets?: ProfileTargetItem[]
  }
  profileDetailId: string | null // ID профиля на экране детального просмотра
}

const initialState: AppState = {
  currentStep: 0,
  selectedMode: 'communication',
  mainSection: 'analysis',
  manipulatorRole: null,
  victimRole: null,
  targetAction: null,
  targetActionDetail: null,
  selectedProfileId: null,
  audienceContext: null,
  selectedTechnique: null,
  results: {
    targets: [],
    techniques: []
  },
  profileDetailId: null
}

export function useAppState() {
  const [state, setState] = useState<AppState>(initialState)

  const nextStep = useCallback(() => {
    setState(prev => ({ ...prev, currentStep: Math.min(prev.currentStep + 1, 4) }))
  }, [])

  const prevStep = useCallback(() => {
    setState(prev => ({ ...prev, currentStep: Math.max(prev.currentStep - 1, 0) }))
  }, [])

  const setManipulatorRole = useCallback((role: string | null) => {
    setState(prev => ({ ...prev, manipulatorRole: role }))
  }, [])

  const setVictimRole = useCallback((role: string | null) => {
    setState(prev => ({ ...prev, victimRole: role }))
  }, [])

  const setSelectedProfileId = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedProfileId: id }))
  }, [])

  const setAudienceContext = useCallback((context: AudienceContextId | null) => {
    setState(prev => ({ ...prev, audienceContext: context }))
  }, [])

  const setMainSection = useCallback((section: MainSection) => {
    setState(prev => ({ ...prev, mainSection: section }))
  }, [])

  const setProfileDetailId = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, profileDetailId: id }))
  }, [])

  const setTargetAction = useCallback((action: string | null) => {
    setState(prev => ({ ...prev, targetAction: action, targetActionDetail: null }))
  }, [])

  const setTargetActionDetail = useCallback((detail: string | null) => {
    setState(prev => ({ ...prev, targetActionDetail: detail }))
  }, [])

  const setSelectedTechnique = useCallback((technique: string | null) => {
    setState(prev => ({ ...prev, selectedTechnique: technique }))
  }, [])

  const setResults = useCallback((results: { targets: Target[], techniques: Technique[], profileTargets?: ProfileTargetItem[] }) => {
    setState(prev => ({ ...prev, results }))
  }, [])

  const reset = useCallback(() => {
    setState(initialState)
  }, [])

  const goToStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, currentStep: step }))
  }, [])

  return {
    state,
    nextStep,
    prevStep,
    setManipulatorRole,
    setVictimRole,
    setTargetAction,
    setTargetActionDetail,
    setSelectedProfileId,
    setAudienceContext,
    setMainSection,
    setProfileDetailId,
    setSelectedTechnique,
    setResults,
    reset,
    goToStep
  }
}
