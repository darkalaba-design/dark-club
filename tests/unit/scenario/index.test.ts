/**
 * Интеграционные тесты: generateInfluenceScenario
 * Проверяем что полная цепочка не ломается при разных входных данных.
 */

import { generateInfluenceScenario } from '@/lib/scenario'
import type { ScenarioInput } from '@/lib/scenario/types'

// Минимальный валидный ввод — без профиля
const minimalInput: ScenarioInput = {
  manipulatorRole: 'boss',
  victimRole: 'subordinate',
  targetAction: 'agree',
  targetActionDetail: '',
  audienceContext: 'unknown',
  selectedProfile: null,
}

// Ввод с профилем (частично заполненным)
const inputWithProfile: ScenarioInput = {
  ...minimalInput,
  selectedProfile: {
    id: 'test-profile-1',
    name: 'Тестовый профиль',
    psychotype: 'paranoid',
    complexes: ['inferiority', 'impostor'],
    shadows: ['control'],
    beliefs: ['мир опасен'],
    values: ['безопасность'],
    triggersPositive: ['признание'],
    triggersNegative: ['критика'],
    painPoints: ['страх ошибки'],
    communicationStyle: 'analytical',
    motivationProfile: null,
    reference: null,
    decisionPace: null,
    gender: null,
    age: null,
    notes: '',
    avatar: '🧠',
    relationshipType: 'colleague',
    dossier: null,
    dossierCreatedAt: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    lastUsed: null,
  },
}

describe('generateInfluenceScenario', () => {
  describe('базовая структура ответа', () => {
    it('возвращает объект с обязательными полями при минимальном вводе', () => {
      const result = generateInfluenceScenario(minimalInput)

      expect(result).toBeDefined()
      expect(result.phases).toBeDefined()
      expect(result.targets).toBeDefined()
      expect(result.techniques).toBeDefined()
      expect(result.redFlags).toBeDefined()
      expect(result.planB).toBeDefined()
    })

    it('возвращает ровно 4 фазы сценария', () => {
      const result = generateInfluenceScenario(minimalInput)
      expect(result.phases).toHaveLength(4)
    })

    it('каждая фаза содержит обязательные поля', () => {
      const result = generateInfluenceScenario(minimalInput)
      result.phases.forEach(phase => {
        expect(phase.title).toBeDefined()
        expect(phase.description).toBeDefined()
        expect(Array.isArray(phase.phrases)).toBe(true)
      })
    })
  })

  describe('не падает на граничных случаях', () => {
    it('работает без профиля (selectedProfile: null)', () => {
      expect(() => generateInfluenceScenario(minimalInput)).not.toThrow()
    })

    it('работает с профилем с пустыми массивами', () => {
      const input: ScenarioInput = {
        ...minimalInput,
        selectedProfile: {
          ...inputWithProfile.selectedProfile!,
          complexes: [],
          shadows: [],
          beliefs: [],
          values: [],
          triggersPositive: [],
          triggersNegative: [],
          painPoints: [],
        },
      }
      expect(() => generateInfluenceScenario(input)).not.toThrow()
    })

    it('работает при audienceContext: unknown', () => {
      expect(() => generateInfluenceScenario({
        ...minimalInput,
        audienceContext: 'unknown',
      })).not.toThrow()
    })

    it('работает при всех состояниях аудитории', () => {
      const contexts = ['resource', 'stress', 'euphoria', 'apathy', 'unknown'] as const
      contexts.forEach(ctx => {
        expect(() => generateInfluenceScenario({
          ...minimalInput,
          audienceContext: ctx,
        })).not.toThrow()
      })
    })
  })

  describe('с профилем даёт больше данных', () => {
    it('список мишеней не пуст при заполненном профиле', () => {
      const result = generateInfluenceScenario(inputWithProfile)
      expect(result.targets.length).toBeGreaterThan(0)
    })

    it('список техник не пуст', () => {
      const result = generateInfluenceScenario(inputWithProfile)
      expect(result.techniques.length).toBeGreaterThan(0)
    })
  })
})
