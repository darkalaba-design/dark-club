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
  /** Позитивные триггеры: что мотивирует, вдохновляет */
  triggersPositive: string[]
  /** Негативные триггеры: что выводит из себя, демотивирует */
  triggersNegative: string[]
  /** Коммуникационный стиль: прямой, непрямой, эмоциональный и т.д. */
  communicationStyle: string | null
  /** Мотивационный профиль: К (к результату) / От (от проблемы) */
  motivationProfile: string | null
  /** Референция: внутренняя (своё мнение) / внешняя (мнение других) */
  reference: string | null
  /** Темп принятия решений: импульсивный, взвешенный, прокрастинатор */
  decisionPace: string | null
  /** Болевые точки (текущие проблемы): с чем сейчас борется — для персонализации фраз */
  painPoints: string[]
  /** Пол: мужской, женский */
  gender: string | null
  /** Возрастной диапазон: 25-35, 35-45, 45-55, 55+ */
  age: string | null
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
    triggersPositive: [],
    triggersNegative: [],
    communicationStyle: null,
    motivationProfile: null,
    reference: null,
    decisionPace: null,
    painPoints: [],
    gender: null,
    age: null,
    notes: ''
  }
}

export function calculateCompleteness(profile: Profile): number {
  let points = 0
  const maxPoints = 13
  if (profile.psychotype) points++
  if (profile.complexes.length > 0) points++
  if (profile.shadows.length > 0) points++
  if (profile.beliefs.length > 0) points++
  if (profile.values.length > 0) points++
  const hasTriggers = (profile.triggersPositive?.length ?? 0) > 0 || (profile.triggersNegative?.length ?? 0) > 0
  if (hasTriggers) points++
  if (profile.communicationStyle) points++
  if (profile.motivationProfile) points++
  if (profile.reference) points++
  if (profile.decisionPace) points++
  if ((profile.painPoints?.length ?? 0) > 0) points++
  if (profile.gender) points++
  if (profile.age) points++
  return Math.round((points / maxPoints) * 100)
}
