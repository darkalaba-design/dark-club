import type { Profile } from '../data/profiles'
import { psychotypes } from '../data/psychotypes'
import { complexes } from '../data/complexes'
import { shadows } from '../data/shadows'
import {
  genderOptions,
  ageRangeOptions,
  communicationStyleOptions,
  motivationProfileOptions,
  referenceOptions,
  decisionPaceOptions
} from '../data/profileParams'

/**
 * Форматирует данные профиля одним блоком текста для передачи в User prompt (Make.com → ChatGPT).
 * Все поля — человеческим языком, с заголовками секций.
 */
export function formatProfileForPrompt(profile: Profile): string {
  const lines: string[] = []

  // Пол
  const gender = profile.gender
    ? genderOptions.find(o => o.id === profile.gender)?.label ?? profile.gender
    : null
  if (gender) lines.push(`Пол: ${gender}`)

  // Возраст
  const ageOpt = profile.age ? ageRangeOptions.find(o => o.id === profile.age) : null
  if (ageOpt) {
    lines.push(ageOpt.subtitle ? `Возраст: ${ageOpt.label} (${ageOpt.subtitle})` : `Возраст: ${ageOpt.label}`)
  }

  // Структура личности (психотип)
  const psychotype = profile.psychotype
    ? psychotypes.find(p => p.id === profile.psychotype)
    : null
  if (psychotype) {
    lines.push('')
    lines.push('Структура личности:')
    lines.push(`${psychotype.title}. ${psychotype.shortDesc}`)
  }

  // Комплексы
  const profileComplexes = (profile.complexes || [])
    .map(id => complexes.find(c => c.id === id))
    .filter(Boolean) as { title: string; description: string }[]
  if (profileComplexes.length > 0) {
    lines.push('')
    lines.push('Комплексы:')
    profileComplexes.forEach(c => lines.push(`— ${c.title}: ${c.description}`))
  }

  // Тень (вытесненное)
  const profileShadows = (profile.shadows || [])
    .map(id => shadows.find(s => s.id === id))
    .filter(Boolean) as { title: string; description: string }[]
  if (profileShadows.length > 0) {
    lines.push('')
    lines.push('Тень (вытесненное):')
    profileShadows.forEach(s => lines.push(`— ${s.title}: ${s.description}`))
  }

  // Убеждения
  if (profile.beliefs?.length) {
    lines.push('')
    lines.push('Убеждения:')
    profile.beliefs.forEach(b => lines.push(`— ${b}`))
  }

  // Ценности
  if (profile.values?.length) {
    lines.push('')
    lines.push('Ценности:')
    profile.values.forEach(v => lines.push(`— ${v}`))
  }

  // Триггеры и болевые точки
  const hasTriggers =
    (profile.triggersPositive?.length ?? 0) > 0 ||
    (profile.triggersNegative?.length ?? 0) > 0 ||
    (profile.painPoints?.length ?? 0) > 0
  if (hasTriggers) {
    lines.push('')
    lines.push('Триггеры и болевые точки:')
    if (profile.triggersPositive?.length) {
      lines.push('Позитивные триггеры (мотивируют):')
      profile.triggersPositive.forEach(t => lines.push(`— ${t}`))
    }
    if (profile.triggersNegative?.length) {
      lines.push('Негативные триггеры (выводят из себя):')
      profile.triggersNegative.forEach(t => lines.push(`— ${t}`))
    }
    if (profile.painPoints?.length) {
      lines.push('Болевые точки (текущие проблемы):')
      profile.painPoints.forEach(p => lines.push(`— ${p}`))
    }
  }

  // Коммуникационный стиль
  const commStyle = profile.communicationStyle
    ? communicationStyleOptions.find(o => o.id === profile.communicationStyle)?.label ?? profile.communicationStyle
    : null
  if (commStyle) lines.push('', `Коммуникационный стиль: ${commStyle}`)

  // Мотивационный профиль
  const motivation = profile.motivationProfile
    ? motivationProfileOptions.find(o => o.id === profile.motivationProfile)?.label ?? profile.motivationProfile
    : null
  if (motivation) lines.push(`Мотивационный профиль: ${motivation}`)

  // Референция
  const reference = profile.reference
    ? referenceOptions.find(o => o.id === profile.reference)?.label ?? profile.reference
    : null
  if (reference) lines.push(`Референция: ${reference}`)

  // Темп принятия решений
  const decisionPace = profile.decisionPace
    ? decisionPaceOptions.find(o => o.id === profile.decisionPace)?.label ?? profile.decisionPace
    : null
  if (decisionPace) lines.push(`Темп принятия решений: ${decisionPace}`)

  // Свободные заметки
  if (profile.notes?.trim()) {
    lines.push('')
    lines.push('Свободные заметки:')
    lines.push(profile.notes.trim())
  }

  return lines.join('\n').trim()
}
