'use client'

import { useState, useCallback } from 'react'
import { Target } from '../data/targets'
import { Technique } from '../data/techniques'

export interface AppState {
  currentStep: number // 0 = welcome, 1-3 = steps, 4 = results
  selectedMode: 'communication' | 'marketing' | 'defense'
  manipulatorRole: string | null
  victimRole: string | null
  targetAction: string | null
  selectedTechnique: string | null
  results: {
    targets: Target[]
    techniques: Technique[]
  }
  ethicsChecklist: {
    noHarm: boolean
    openDialogue: boolean
    trustPreserved: boolean
  }
}

const initialState: AppState = {
  currentStep: 0,
  selectedMode: 'communication',
  manipulatorRole: null,
  victimRole: null,
  targetAction: null,
  selectedTechnique: null,
  results: {
    targets: [],
    techniques: []
  },
  ethicsChecklist: {
    noHarm: false,
    openDialogue: false,
    trustPreserved: false
  }
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

  const setTargetAction = useCallback((action: string | null) => {
    setState(prev => ({ ...prev, targetAction: action }))
  }, [])

  const setSelectedTechnique = useCallback((technique: string | null) => {
    setState(prev => ({ ...prev, selectedTechnique: technique }))
  }, [])

  const setResults = useCallback((results: { targets: Target[], techniques: Technique[] }) => {
    setState(prev => ({ ...prev, results }))
  }, [])

  const setEthicsChecklist = useCallback((checklist: Partial<AppState['ethicsChecklist']>) => {
    setState(prev => ({
      ...prev,
      ethicsChecklist: { ...prev.ethicsChecklist, ...checklist }
    }))
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
    setSelectedTechnique,
    setResults,
    setEthicsChecklist,
    reset,
    goToStep
  }
}
