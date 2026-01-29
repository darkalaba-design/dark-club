'use client'

import { useState, useCallback, useEffect } from 'react'
import type { Profile } from '../data/profiles'
import { createEmptyProfile, calculateCompleteness } from '../data/profiles'

const STORAGE_KEY = 'dark-club-profiles'

function loadProfiles(): Profile[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Profile[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveProfiles(profiles: Profile[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
  } catch (e) {
    console.warn('Failed to save profiles', e)
  }
}

function generateId(): string {
  return `p_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([])

  useEffect(() => {
    setProfiles(loadProfiles())
  }, [])

  const addProfile = useCallback((name: string, avatar: string = '👤', relationshipType: string = 'other'): Profile => {
    const base = createEmptyProfile(name, avatar, relationshipType)
    const now = Date.now()
    const profile: Profile = {
      ...base,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      lastUsed: null
    }
    setProfiles(prev => {
      const next = [...prev, profile]
      saveProfiles(next)
      return next
    })
    return profile
  }, [])

  const updateProfile = useCallback((id: string, patch: Partial<Profile>) => {
    setProfiles(prev => {
      const next = prev.map(p =>
        p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p
      )
      saveProfiles(next)
      return next
    })
  }, [])

  const deleteProfile = useCallback((id: string) => {
    setProfiles(prev => {
      const next = prev.filter(p => p.id !== id)
      saveProfiles(next)
      return next
    })
  }, [])

  const getProfile = useCallback((id: string | null): Profile | null => {
    if (!id) return null
    return profiles.find(p => p.id === id) ?? null
  }, [profiles])

  const markProfileUsed = useCallback((id: string) => {
    setProfiles(prev => {
      const next = prev.map(p => p.id === id ? { ...p, lastUsed: Date.now(), updatedAt: Date.now() } : p)
      saveProfiles(next)
      return next
    })
  }, [])

  const profilesWithCompleteness = profiles.map(p => ({
    ...p,
    completeness: calculateCompleteness(p)
  }))

  return {
    profiles: profilesWithCompleteness,
    addProfile,
    updateProfile,
    deleteProfile,
    getProfile,
    markProfileUsed
  }
}
