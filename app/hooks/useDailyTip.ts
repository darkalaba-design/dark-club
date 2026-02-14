'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { dailyTips, type DailyTip } from '../data/dailyTips'

const STORAGE_KEY = 'dark-club-daily-tips'

interface StoredTipState {
  lastShownDate: string
  currentTipId: string
  viewedTips: string[]
}

function getTodayKey(): string {
  if (typeof window === 'undefined') return new Date().toISOString().slice(0, 10)
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function loadStored(): StoredTipState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredTipState
  } catch {
    return null
  }
}

function saveStored(state: StoredTipState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.warn('Failed to save daily tip state', e)
  }
}

function pickRandomTip(excludeIds: string[]): DailyTip {
  const available = dailyTips.filter(t => !excludeIds.includes(t.id))
  const pool = available.length > 0 ? available : dailyTips
  return pool[Math.floor(Math.random() * pool.length)]!
}

export function useDailyTip() {
  const today = getTodayKey()
  // Always start with null so SSR and first client render match (dailyTips[0]); then sync from localStorage in useEffect
  const [stored, setStored] = useState<StoredTipState | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const s = loadStored()
    if (!s || s.lastShownDate !== today) {
      const viewed = s?.viewedTips ?? []
      const allViewed = viewed.length >= dailyTips.length
      const nextViewed = allViewed ? [] : viewed
      const tip = pickRandomTip(allViewed ? [] : viewed)
      const next: StoredTipState = {
        lastShownDate: today,
        currentTipId: tip.id,
        viewedTips: allViewed ? [tip.id] : [...nextViewed, tip.id]
      }
      saveStored(next)
      setStored(next)
    } else {
      setStored(s)
    }
  }, [today])

  const currentTip = useMemo((): DailyTip => {
    if (!stored) return dailyTips[0]!
    const tip = dailyTips.find(t => t.id === stored.currentTipId)
    return tip ?? dailyTips[0]!
  }, [stored])

  const nextTip = useCallback(() => {
    const other = dailyTips.filter(t => t.id !== currentTip.id)
    return other[Math.floor(Math.random() * other.length)] ?? currentTip
  }, [currentTip])

  return { currentTip, nextTip }
}
