/**
 * Тесты: calculateCompleteness
 * Критично — от этой функции зависит доступность AI-сценария (≥50%) и досье (≥99%).
 */

import { calculateCompleteness } from '@/app/data/profiles'

const emptyProfile = {
  id: 'p_test',
  name: 'Тест',
  avatar: '🧠',
  relationshipType: 'colleague',
  psychotype: null,
  complexes: [],
  shadows: [],
  beliefs: [],
  values: [],
  triggersPositive: [],
  triggersNegative: [],
  painPoints: [],
  communicationStyle: null,
  motivationProfile: null,
  reference: null,
  decisionPace: null,
  gender: null,
  age: null,
  notes: '',
  dossier: null,
  dossierCreatedAt: null,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  lastUsed: null,
}

describe('calculateCompleteness', () => {
  it('пустой профиль (только имя) возвращает 0%', () => {
    expect(calculateCompleteness(emptyProfile)).toBe(0)
  })

  it('полностью заполненный профиль возвращает 100%', () => {
    const full = {
      ...emptyProfile,
      psychotype: 'paranoid',
      complexes: ['inferiority'],
      shadows: ['control'],
      beliefs: ['мир опасен'],
      values: ['безопасность'],
      triggersPositive: ['признание'],
      triggersNegative: ['критика'],
      painPoints: ['страх ошибки'],
      communicationStyle: 'analytical',
      motivationProfile: 'achievement',
      reference: 'internal',
      decisionPace: 'slow',
      gender: 'male',
      age: '35-45',
      notes: 'заметки',
    }
    expect(calculateCompleteness(full)).toBe(100)
  })

  it('результат всегда между 0 и 100', () => {
    const partial = {
      ...emptyProfile,
      psychotype: 'paranoid',
      complexes: ['inferiority'],
    }
    const result = calculateCompleteness(partial)
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('не падает на профиле без новых полей (обратная совместимость)', () => {
    const oldFormat = {
      id: 'p_old',
      name: 'Старый профиль',
      // нет новых полей
    } as any
    expect(() => calculateCompleteness(oldFormat)).not.toThrow()
  })

  it('добавление психотипа увеличивает процент', () => {
    const without = calculateCompleteness(emptyProfile)
    const with_ = calculateCompleteness({ ...emptyProfile, psychotype: 'paranoid' })
    expect(with_).toBeGreaterThan(without)
  })

  it('порог AI-сценария ≥50% достижим', () => {
    const partial = {
      ...emptyProfile,
      psychotype: 'paranoid',
      complexes: ['inferiority', 'impostor'],
      shadows: ['control'],
      beliefs: ['мир опасен'],
      values: ['безопасность'],
      communicationStyle: 'analytical',
    }
    expect(calculateCompleteness(partial)).toBeGreaterThanOrEqual(50)
  })
})
