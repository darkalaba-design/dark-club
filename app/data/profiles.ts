/**
 * Тип отношений в профиле → id роли жертвы для matchingLogic
 */
export const relationshipTypeToVictimRoleId: Record<string, string> = {
  colleague: 'colleague_victim',
  boss: 'boss_victim',
  subordinate: 'subordinate',
  client: 'client',
  friend: 'friend_victim',
  partner: 'partner_victim',
  relative: 'child',
  other: 'stranger'
}

export const relationshipTypeLabels: Record<string, string> = {
  colleague: 'Коллега',
  boss: 'Руководитель',
  subordinate: 'Подчинённый',
  client: 'Клиент/Партнёр',
  friend: 'Друг',
  partner: 'Романтический партнёр',
  relative: 'Родственник',
  other: 'Другое'
}

export const relationshipTypes = Object.keys(relationshipTypeLabels) as Array<keyof typeof relationshipTypeLabels>

export interface Profile {
  id: string
  name: string
  avatar: string
  relationshipType: string
  psychotype: string | null
  complexes: string[]
  shadows: string[]
  beliefs: string[]
  values: string[]
  notes: string
  createdAt: number
  updatedAt: number
  lastUsed: number | null
}

export function createEmptyProfile(name: string, avatar: string = '👤', relationshipType: string = 'other'): Omit<Profile, 'id' | 'createdAt' | 'updatedAt' | 'lastUsed'> {
  return {
    name,
    avatar,
    relationshipType,
    psychotype: null,
    complexes: [],
    shadows: [],
    beliefs: [],
    values: [],
    notes: ''
  }
}

export function calculateCompleteness(profile: Profile): number {
  let points = 0
  const maxPoints = 6
  if (profile.psychotype) points++
  if (profile.complexes.length > 0) points++
  if (profile.shadows.length > 0) points++
  if (profile.beliefs.length > 0) points++
  if (profile.values.length > 0) points++
  if (profile.notes && profile.notes.trim().length > 10) points++
  return Math.round((points / maxPoints) * 100)
}
