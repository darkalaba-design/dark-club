'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { challenges, challengesTotal, type DailyChallenge } from '../data/challenges'

const STORAGE_KEY = 'dark-club-daily-challenges'

interface StoredChallengeState {
  lastShownDate: string
  currentChallengeId: string
  completed: string[]
}

function getTodayKey(): string {
  if (typeof window === 'undefined') return new Date().toISOString().slice(0, 10)
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function loadStored(): StoredChallengeState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredChallengeState
  } catch {
    return null
  }
}

function saveStored(state: StoredChallengeState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.warn('Failed to save daily challenge state', e)
  }
}

function pickRandomChallenge(completedIds: string[]): DailyChallenge {
  const notCompleted = challenges.filter(c => !completedIds.includes(c.id))
  const pool = notCompleted.length > 0 ? notCompleted : challenges
  return pool[Math.floor(Math.random() * pool.length)]!
}

export function useDailyChallenge() {
  const today = getTodayKey()
  const [stored, setStored] = useState<StoredChallengeState | null>(() =>
    typeof window === 'undefined' ? null : loadStored()
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    const s = loadStored()
    if (!s || s.lastShownDate !== today) {
      const completed = s?.completed ?? []
      const challenge = pickRandomChallenge(completed)
      const next: StoredChallengeState = {
        lastShownDate: today,
        currentChallengeId: challenge.id,
        completed
      }
      saveStored(next)
      setStored(next)
    } else {
      setStored(s)
    }
  }, [today])

  const currentChallenge = useMemo((): DailyChallenge => {
    const s = stored ?? loadStored()
    if (!s) return challenges[0]!
    const c = challenges.find(ch => ch.id === s.currentChallengeId)
    return c ?? challenges[0]!
  }, [stored])

  const completedCount = stored?.completed.length ?? 0

  const markCompleted = useCallback((challengeId: string) => {
    const s = loadStored()
    if (!s || s.completed.includes(challengeId)) return
    const next: StoredChallengeState = { ...s, completed: [...s.completed, challengeId] }
    saveStored(next)
    setStored(next)
  }, [])

  const nextChallenge = useCallback((): DailyChallenge => {
    const other = challenges.filter(c => c.id !== currentChallenge.id)
    return other[Math.floor(Math.random() * other.length)] ?? currentChallenge
  }, [currentChallenge.id])

  return {
    currentChallenge,
    completedCount,
    totalCount: challengesTotal,
    markCompleted,
    nextChallenge
  }
}
