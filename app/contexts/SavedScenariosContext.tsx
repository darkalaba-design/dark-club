'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'dark-club-saved-scenarios'

export interface SavedScenario {
  id: string
  profileId: string
  /** Текст сценария (markdown-like) */
  content: string
  createdAt: number
  /** Для карточки: роль манипулятора */
  manipulatorRoleTitle?: string
  /** Для карточки: цель действия */
  targetActionTitle?: string
  /** Уточнение цели */
  targetActionDetail?: string
}

function loadSavedScenarios(): SavedScenario[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SavedScenario[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveSavedScenarios(items: SavedScenario[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (e) {
    console.warn('Failed to save scenarios', e)
  }
}

function generateId(): string {
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export type SavedScenariosContextValue = {
  savedScenarios: SavedScenario[]
  addScenario: (params: {
    profileId: string
    content: string
    manipulatorRoleTitle?: string
    targetActionTitle?: string
    targetActionDetail?: string
  }) => SavedScenario
  deleteScenario: (id: string) => void
  getByProfileId: (profileId: string) => SavedScenario[]
  getById: (id: string) => SavedScenario | null
}

const SavedScenariosContext = createContext<SavedScenariosContextValue | null>(null)

export function SavedScenariosProvider({ children }: { children: React.ReactNode }) {
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([])

  useEffect(() => {
    setSavedScenarios(loadSavedScenarios())
  }, [])

  const addScenario = useCallback(
    (params: {
      profileId: string
      content: string
      manipulatorRoleTitle?: string
      targetActionTitle?: string
      targetActionDetail?: string
    }): SavedScenario => {
      const scenario: SavedScenario = {
        id: generateId(),
        profileId: params.profileId,
        content: params.content,
        createdAt: Date.now(),
        manipulatorRoleTitle: params.manipulatorRoleTitle,
        targetActionTitle: params.targetActionTitle,
        targetActionDetail: params.targetActionDetail
      }
      setSavedScenarios(prev => {
        const next = [scenario, ...prev]
        saveSavedScenarios(next)
        return next
      })
      return scenario
    },
    []
  )

  const deleteScenario = useCallback((id: string) => {
    setSavedScenarios(prev => {
      const next = prev.filter(s => s.id !== id)
      saveSavedScenarios(next)
      return next
    })
  }, [])

  const getByProfileId = useCallback(
    (profileId: string): SavedScenario[] => {
      return savedScenarios.filter(s => s.profileId === profileId).sort((a, b) => b.createdAt - a.createdAt)
    },
    [savedScenarios]
  )

  const getById = useCallback(
    (id: string): SavedScenario | null => {
      return savedScenarios.find(s => s.id === id) ?? null
    },
    [savedScenarios]
  )

  const value: SavedScenariosContextValue = {
    savedScenarios,
    addScenario,
    deleteScenario,
    getByProfileId,
    getById
  }

  return (
    <SavedScenariosContext.Provider value={value}>
      {children}
    </SavedScenariosContext.Provider>
  )
}

export function useSavedScenarios(): SavedScenariosContextValue {
  const ctx = useContext(SavedScenariosContext)
  if (!ctx) throw new Error('useSavedScenarios must be used within SavedScenariosProvider')
  return ctx
}
