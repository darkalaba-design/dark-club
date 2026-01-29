'use client'

import { useProfilesContext } from '../contexts/ProfilesContext'

export function useProfiles() {
  return useProfilesContext()
}
