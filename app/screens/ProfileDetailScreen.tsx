'use client'

import { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react'
import { useProfiles } from '../hooks/useProfiles'
import { useSavedScenarios } from '../contexts/SavedScenariosContext'
import type { SavedScenario } from '../contexts/SavedScenariosContext'
import DossierLikeContent from '../components/DossierLikeContent'
import {
  relationshipTypeLabels,
  relationshipTypes,
  calculateCompleteness,
  type Profile
} from '../data/profiles'
import { psychotypes, type Psychotype } from '../data/psychotypes'
import { complexes, type Complex } from '../data/complexes'
import { shadows, type Shadow } from '../data/shadows'
import { beliefsExamples } from '../data/beliefsExamples'
import { valuesExamples } from '../data/valuesExamples'
import { triggersPositiveExamples, triggersNegativeExamples } from '../data/triggersExamples'
import { painPointsExamples } from '../data/painPointsExamples'
import {
  communicationStyleOptions,
  motivationProfileOptions,
  referenceOptions,
  decisionPaceOptions,
  genderOptions,
  ageRangeOptions,
  type ProfileParamOption
} from '../data/profileParams'
import Accordion from '../components/Accordion'
import { sendProfileToDossierWebhook } from '../lib/dossierWebhook'

const EMOJI_OPTIONS = ['👤', '👔', '👩', '🧑', '🫂', '💼', '🎭', '⭐', '🔥', '💜']

type ModalKind = 'edit' | 'psychotype' | 'complex' | 'shadow' | 'belief' | 'value' | 'triggersPositive' | 'triggersNegative' | 'painPoints' | 'communicationStyle' | 'motivationProfile' | 'reference' | 'decisionPace' | null

interface ProfileDetailScreenProps {
  profileId: string
  onBack: () => void
}

export default function ProfileDetailScreen({ profileId, onBack }: ProfileDetailScreenProps) {
  const { getProfile, updateProfile, deleteProfile } = useProfiles()
  const { getByProfileId, getById, deleteScenario } = useSavedScenarios()
  const profile = getProfile(profileId)
  const savedForProfile = getByProfileId(profileId)
  const hasSavedScenarios = savedForProfile.length > 0
  const [profileDetailTab, setProfileDetailTab] = useState<'profile' | 'scenarios'>('profile')
  const [viewingScenarioId, setViewingScenarioId] = useState<string | null>(null)
  const [savedVisible, setSavedVisible] = useState(false)
  const [modal, setModal] = useState<ModalKind>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [beliefInput, setBeliefInput] = useState('')
  const [valueInput, setValueInput] = useState('')
  const [triggerPositiveInput, setTriggerPositiveInput] = useState('')
  const [triggerNegativeInput, setTriggerNegativeInput] = useState('')
  const [painPointInput, setPainPointInput] = useState('')
  const [showProgressBar, setShowProgressBar] = useState(false)
  const [showDossierView, setShowDossierView] = useState(false)
  const [dossierLoading, setDossierLoading] = useState(false)
  const [dossierError, setDossierError] = useState<string | null>(null)

  const showSaved = useCallback(() => {
    setSavedVisible(true)
    const t = setTimeout(() => setSavedVisible(false), 2000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (savedVisible) {
      const t = setTimeout(() => setSavedVisible(false), 2000)
      return () => clearTimeout(t)
    }
  }, [savedVisible])

  const handleUpdate = useCallback((patch: Partial<Profile>) => {
    if (!profileId) return
    updateProfile(profileId, patch)
    showSaved()
  }, [profileId, updateProfile, showSaved])

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <p className="text-gray-400">Профиль не найден.</p>
        <button onClick={onBack} className="mt-4 text-blue-400 hover-text-light">
          ← Назад к списку
        </button>
      </div>
    )
  }

  const completeness = calculateCompleteness(profile)
  const psychotype = profile.psychotype ? psychotypes.find(p => p.id === profile.psychotype!) ?? null : null
  const profileComplexes = profile.complexes.map(id => complexes.find(c => c.id === id)).filter(Boolean) as Complex[]
  const profileShadows = profile.shadows.map(id => shadows.find(s => s.id === id)).filter(Boolean) as Shadow[]

  const handleDeleteClick = () => setShowDeleteConfirm(true)

  const handleDeleteConfirm = () => {
    deleteProfile(profileId)
    setShowDeleteConfirm(false)
    onBack()
  }

  const handleEditSave = (name: string, avatar: string, relationshipType: string) => {
    handleUpdate({ name, avatar, relationshipType })
    setModal(null)
  }

  const handleCreateOrUpdateDossier = useCallback(async () => {
    if (!profileId || !profile) return
    setDossierLoading(true)
    setDossierError(null)
    try {
      const result = await sendProfileToDossierWebhook(profile)
      handleUpdate({ dossier: result, dossierCreatedAt: Date.now() })
      setShowDossierView(true)
    } catch (e) {
      setDossierError(e instanceof Error ? e.message : 'Ошибка отправки')
    } finally {
      setDossierLoading(false)
    }
  }, [profileId, profile, handleUpdate])

  const handleAddBelief = () => {
    const text = beliefInput.trim()
    if (text && !profile.beliefs.includes(text)) {
      handleUpdate({ beliefs: [...profile.beliefs, text] })
      setBeliefInput('')
      setModal(null)
    }
  }

  const handleAddValue = () => {
    const text = valueInput.trim()
    if (text && !profile.values.includes(text)) {
      handleUpdate({ values: [...profile.values, text] })
      setValueInput('')
      setModal(null)
    }
  }

  const triggersPositive = profile.triggersPositive ?? []
  const triggersNegative = profile.triggersNegative ?? []

  const handleAddTriggerPositive = () => {
    const text = triggerPositiveInput.trim()
    if (text && !triggersPositive.includes(text)) {
      handleUpdate({ triggersPositive: [...triggersPositive, text] })
      setTriggerPositiveInput('')
      setModal(null)
    }
  }

  const handleAddTriggerNegative = () => {
    const text = triggerNegativeInput.trim()
    if (text && !triggersNegative.includes(text)) {
      handleUpdate({ triggersNegative: [...triggersNegative, text] })
      setTriggerNegativeInput('')
      setModal(null)
    }
  }

  const painPoints = profile.painPoints ?? []
  const handleAddPainPoint = () => {
    const text = painPointInput.trim()
    if (text && !painPoints.includes(text)) {
      handleUpdate({ painPoints: [...painPoints, text] })
      setPainPointInput('')
      setModal(null)
    }
  }

  useEffect(() => {
    if (modal || showDossierView || viewingScenarioId) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [modal, showDossierView, viewingScenarioId])

  // Показывать полоску прогресса после прокрутки на 300px, скрывать при прокрутке наверх
  useEffect(() => {
    const SCROLL_THRESHOLD = 300
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setShowProgressBar(window.scrollY >= SCROLL_THRESHOLD)
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="max-w-2xl mx-auto">
      {/* Синяя полоска прогресса — появляется после 300px прокрутки, выезжает/уезжает плавно */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          zIndex: 9999,
          backgroundColor: '#1a1a1a',
          transform: showProgressBar ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.25s ease-out'
        }}
        role="progressbar"
        aria-valuenow={completeness}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Профиль заполнен"
        aria-hidden={!showProgressBar}
      >
        <div
          style={{
            width: `${completeness}%`,
            height: '100%',
            backgroundColor: '#3b82f6',
            transition: 'width 0.2s ease'
          }}
        />
      </div>

      {/* Небольшой отступ, чтобы контент не уходил под полоску */}
      <div style={{ height: 4 }} aria-hidden />

      {/* Breadcrumbs / Back */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover-text-light transition-colors text-sm"
        >
          <span>←</span>
          <span>Назад к списку профилей</span>
        </button>
        {savedVisible && (
          <span className="text-sm text-green-400 flex items-center gap-1">
            <span>✓</span> Сохранено
          </span>
        )}
      </div>

      {/* Header */}
      <div className="bg-dark-card border border-dark rounded-xl p-6 mb-6 shadow-lg text-center">
        <div className="flex items-start gap-4 justify-center">
          <span className="text-5xl flex-shrink-0">{profile.avatar}</span>
          <div className="min-w-0 flex-1 flex flex-col gap-2 items-start max-w-md">
            <h1 className="text-2xl font-bold text-light">{profile.name}</h1>
            <span className="inline-block px-2 py-0.5 rounded text-sm text-gray-400">
              {relationshipTypeLabels[profile.relationshipType] ?? profile.relationshipType}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setModal('edit')}
                className="text-sm text-gray-400 hover-text-light transition-colors"
                title="Редактировать"
              >
                ✏️ Редактировать
              </button>
              <button
                onClick={handleDeleteClick}
                className="text-sm text-red-400 hover-text-red-300 transition-colors"
                title="Удалить"
              >
                🗑️ Удалить
              </button>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4 pt-4 border-t border-dark">
          <p className="text-sm text-gray-400 mb-1">Профиль заполнен на {completeness}%</p>
          <div className="mt-2 h-2 rounded-full bg-dark-bg overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${completeness}%` }}
            />
          </div>
          {completeness < 100 && completeness > 0 && (
            <p className="text-xs text-gray-500 mt-1">💡 Заполните хотя бы психотип и 1–2 комплекса для базового анализа</p>
          )}
          {completeness === 100 && (
            <p className="text-xs text-green-500 mt-1">✅ Профиль полностью заполнен. Анализ будет максимально точным!</p>
          )}
          {completeness >= 99 && (
            <div className="mt-2 block">
              {!profile.dossier ? (
                <button
                  type="button"
                  onClick={handleCreateOrUpdateDossier}
                  disabled={dossierLoading}
                  className="mt-4 w-full md-w-auto px-6 py-3 bg-transparent border-2 border-blue-500 text-blue-500 hover-bg-blue-500-20 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled-opacity-50"
                >
                  {dossierLoading ? 'Отправка…' : 'Создать Досье'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDossierView(true)}
                  className="mt-4 w-full md-w-auto px-6 py-3 bg-transparent border-2 border-blue-500 text-blue-500 hover-bg-blue-500-20 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  Досье профиля
                </button>
              )}
              {dossierError && <p className="text-xs text-red-400 mt-2">{dossierError}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Вкладки: только если есть сохранённые сценарии */}
      {hasSavedScenarios && (
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setProfileDetailTab('profile')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-colors ${profileDetailTab === 'profile' ? 'bg-blue-500/20 border border-blue-500 text-blue-300' : 'bg-dark-card border border-dark text-gray-400 hover:text-light'}`}
          >
            Профиль
          </button>
          <button
            type="button"
            onClick={() => setProfileDetailTab('scenarios')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-colors ${profileDetailTab === 'scenarios' ? 'bg-blue-500/20 border border-blue-500 text-blue-300' : 'bg-dark-card border border-dark text-gray-400 hover:text-light'}`}
          >
            Сценарии
          </button>
        </div>
      )}

      {/* Контент вкладки «Профиль» или всё, если сценариев нет */}
      {(!hasSavedScenarios || profileDetailTab === 'profile') && (
        <>
          {/* Section: Пол и возраст */}
          <Accordion title="Пол и возраст" icon="👤" defaultOpen={true}>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-light mb-3">Пол</h4>
                <div className="flex flex-row gap-3" role="radiogroup" aria-label="Пол">
                  {genderOptions.map(opt => {
                    const selected = profile.gender === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => handleUpdate({ gender: opt.id })}
                        className={`flex-1 flex items-center justify-center gap-3 px-5 py-4 rounded-xl border text-sm font-medium transition-colors ${selected ? 'border-blue-500 bg-blue-500-20 text-light' : 'border-dark bg-dark-bg text-gray-400 hover-border-dark-hover hover-text-light'}`}
                      >
                        {opt.icon && <span className="text-xl" aria-hidden>{opt.icon}</span>}
                        <span>{opt.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-light mb-3">Возраст</h4>
                <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Возрастной диапазон">
                  {ageRangeOptions.map(opt => {
                    const selected = profile.age === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => handleUpdate({ age: opt.id })}
                        className={`flex flex-col items-center justify-center gap-1.5 px-4 py-4 rounded-xl border text-center min-h-[72px] transition-colors ${selected ? 'border-blue-500 bg-blue-500-20 text-light' : 'border-dark bg-dark-bg text-gray-400 hover-border-dark-hover hover-text-light'}`}
                      >
                        {opt.icon && <span className="text-2xl mb-2" aria-hidden>{opt.icon}</span>}
                        <span className="text-lg font-semibold">{opt.label}</span>
                        {opt.subtitle && <span className={`text-xs ${selected ? 'text-gray-400' : 'text-gray-500'}`}>{opt.subtitle}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </Accordion>

          {/* Section: Psychotype */}
          <Accordion title="Структура личности" icon="🧠" defaultOpen={true}>
            {!psychotype ? (
              <div>
                <p className="text-gray-400 mb-3">Психотип не определён</p>
                <button
                  onClick={() => setModal('psychotype')}
                  className="px-4 py-2 rounded-lg bg-dark-bg border border-dark text-light hover-bg-dark-hover transition-colors"
                >
                  Выбрать психотип
                </button>
              </div>
            ) : (
              <PsychotypeCard
                psychotype={psychotype}
                onChange={() => setModal('psychotype')}
                onRemove={() => handleUpdate({ psychotype: null })}
              />
            )}
          </Accordion>

          {/* Section: Complexes */}
          <Accordion title="Комплексы" icon="💭" defaultOpen={true}>
            {profileComplexes.length === 0 ? (
              <div>
                <p className="text-gray-400 mb-3">Комплексы не выявлены</p>
                <button
                  onClick={() => setModal('complex')}
                  className="px-4 py-2 rounded-lg bg-dark-bg border border-dark text-light hover-bg-dark-hover transition-colors"
                >
                  Добавить комплекс
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {profileComplexes.map(c => (
                  <ExpandableComplexCard
                    key={c.id}
                    complex={c}
                    onRemove={() => handleUpdate({ complexes: profile.complexes.filter(id => id !== c.id) })}
                  />
                ))}
                <button
                  onClick={() => setModal('complex')}
                  className="text-sm text-blue-400 hover-underline"
                >
                  + Добавить ещё комплекс
                </button>
              </div>
            )}
          </Accordion>

          {/* Section: Shadows */}
          <Accordion title="Тень (вытесненное)" icon="🌑" defaultOpen={true}>
            {profileShadows.length === 0 ? (
              <div>
                <p className="text-gray-400 mb-3">Теневые аспекты не определены</p>
                <button
                  onClick={() => setModal('shadow')}
                  className="px-4 py-2 rounded-lg bg-dark-bg border border-dark text-light hover-bg-dark-hover transition-colors"
                >
                  Добавить теневой аспект
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {profileShadows.map(s => (
                  <ExpandableShadowCard
                    key={s.id}
                    shadow={s}
                    onRemove={() => handleUpdate({ shadows: profile.shadows.filter(id => id !== s.id) })}
                  />
                ))}
                <button
                  onClick={() => setModal('shadow')}
                  className="text-sm text-blue-400 hover-underline"
                >
                  + Добавить ещё
                </button>
              </div>
            )}
          </Accordion>

          {/* Section: Beliefs */}
          <Accordion title="Убеждения" icon="💬" defaultOpen={true}>
            {profile.beliefs.length === 0 ? (
              <div>
                <p className="text-gray-400 mb-3">Убеждения не указаны</p>
                <button
                  onClick={() => setModal('belief')}
                  className="px-4 py-2 rounded-lg bg-dark-bg border border-dark text-light hover-bg-dark-hover transition-colors"
                >
                  Добавить убеждение
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {profile.beliefs.map((b, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 py-1 px-3 rounded-lg bg-dark-bg border-b border-dark last-border-b-0">
                    <span className="text-gray-400">{b}</span>
                    <button
                      onClick={() => handleUpdate({ beliefs: profile.beliefs.filter((_, j) => j !== i) })}
                      className="text-gray-500 hover-text-red-400 text-lg leading-none"
                      aria-label="Удалить"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <div className="pt-4">
                  <button onClick={() => setModal('belief')} className="text-sm text-blue-400 hover-underline">
                    + Добавить убеждение
                  </button>
                </div>
              </div>
            )}
          </Accordion>

          {/* Section: Values */}
          <Accordion title="Ценности" icon="⭐" defaultOpen={true}>
            {profile.values.length === 0 ? (
              <div>
                <p className="text-gray-400 mb-3">Ценности не определены</p>
                <button
                  onClick={() => setModal('value')}
                  className="px-4 py-2 rounded-lg bg-dark-bg border border-dark text-light hover-bg-dark-hover transition-colors"
                >
                  Добавить ценность
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {profile.values.map((v, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 py-1 px-3 rounded-lg bg-dark-bg border-b border-dark last-border-b-0">
                    <span className="text-gray-400">{v}</span>
                    <button
                      onClick={() => handleUpdate({ values: profile.values.filter((_, j) => j !== i) })}
                      className="text-gray-500 hover-text-red-400 text-lg leading-none"
                      aria-label="Удалить"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <div className="pt-4">
                  <button onClick={() => setModal('value')} className="text-sm text-blue-400 hover-underline">
                    + Добавить ценность
                  </button>
                </div>
              </div>
            )}
          </Accordion>

          {/* Section: Triggers */}
          <Accordion title="Триггеры и болевые точки" icon="🎯" defaultOpen={true}>
            <p className="text-sm text-gray-400 mb-4">
              Что запускает реакцию: мотивирует или выводит из себя. Персонализирует манипуляцию.
            </p>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-light mb-2">Позитивные триггеры (мотивируют, вдохновляют)</h4>
                {triggersPositive.length === 0 ? (
                  <p className="text-gray-500 text-sm mb-2">Не указаны</p>
                ) : (
                  <div className="space-y-2 mb-2">
                    {triggersPositive.map((t, i) => (
                      <div key={i} className="flex items-center justify-between gap-2 py-1 px-3 rounded-lg bg-dark-bg border-b border-dark last-border-b-0">
                        <span className="text-gray-400">{t}</span>
                        <button
                          onClick={() => handleUpdate({ triggersPositive: triggersPositive.filter((_, j) => j !== i) })}
                          className="text-gray-500 hover-text-red-400 text-lg leading-none"
                          aria-label="Удалить"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setModal('triggersPositive')}
                  className="text-sm text-blue-400 hover-underline"
                >
                  + Добавить позитивный триггер
                </button>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-light mb-2">Негативные триггеры (выводят из себя, демотивируют)</h4>
                {triggersNegative.length === 0 ? (
                  <p className="text-gray-500 text-sm mb-2">Не указаны</p>
                ) : (
                  <div className="space-y-2 mb-2">
                    {triggersNegative.map((t, i) => (
                      <div key={i} className="flex items-center justify-between gap-2 py-1 px-3 rounded-lg bg-dark-bg border-b border-dark last-border-b-0">
                        <span className="text-gray-400">{t}</span>
                        <button
                          onClick={() => handleUpdate({ triggersNegative: triggersNegative.filter((_, j) => j !== i) })}
                          className="text-gray-500 hover-text-red-400 text-lg leading-none"
                          aria-label="Удалить"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setModal('triggersNegative')}
                  className="text-sm text-blue-400 hover-underline"
                >
                  + Добавить негативный триггер
                </button>
              </div>
            </div>
          </Accordion>

          {/* Section: Дополнительные параметры — Коммуникационный стиль */}
          <Accordion title="Коммуникационный стиль" icon="💬" defaultOpen={false}>
            <p className="text-sm text-gray-400 mb-4">Как человек общается? Влияет на выбор фраз: прямому говорим прямо, непрямому — через истории.</p>
            {!profile.communicationStyle ? (
              <button
                onClick={() => setModal('communicationStyle')}
                className="px-4 py-2 rounded-lg bg-dark-bg border border-dark text-light hover-bg-dark-hover transition-colors"
              >
                Выбрать стиль
              </button>
            ) : (
              <ParamCard
                option={communicationStyleOptions.find(o => o.id === profile.communicationStyle)!}
                onChange={() => setModal('communicationStyle')}
                onRemove={() => handleUpdate({ communicationStyle: null })}
              />
            )}
          </Accordion>

          {/* Section: Мотивационный профиль */}
          <Accordion title="Мотивационный профиль (К/От)" icon="🎯" defaultOpen={false}>
            <p className="text-sm text-gray-400 mb-4">Что его мотивирует? Для точного фрейминга: «К» — «Ты получишь...», «От» — «Ты избежишь...»</p>
            {!profile.motivationProfile ? (
              <button
                onClick={() => setModal('motivationProfile')}
                className="px-4 py-2 rounded-lg bg-dark-bg border border-dark text-light hover-bg-dark-hover transition-colors"
              >
                Выбрать профиль
              </button>
            ) : (
              <ParamCard
                option={motivationProfileOptions.find(o => o.id === profile.motivationProfile)!}
                onChange={() => setModal('motivationProfile')}
                onRemove={() => handleUpdate({ motivationProfile: null })}
              />
            )}
          </Accordion>

          {/* Section: Референция */}
          <Accordion title="Референция" icon="🧭" defaultOpen={false}>
            <p className="text-sm text-gray-400 mb-4">На что опирается при решениях? Внутренняя — свой опыт, внешняя — мнение экспертов и других.</p>
            {!profile.reference ? (
              <button
                onClick={() => setModal('reference')}
                className="px-4 py-2 rounded-lg bg-dark-bg border border-dark text-light hover-bg-dark-hover transition-colors"
              >
                Выбрать тип референции
              </button>
            ) : (
              <ParamCard
                option={referenceOptions.find(o => o.id === profile.reference)!}
                onChange={() => setModal('reference')}
                onRemove={() => handleUpdate({ reference: null })}
              />
            )}
          </Accordion>

          {/* Section: Темп принятия решений */}
          <Accordion title="Темп принятия решений" icon="⏱️" defaultOpen={false}>
            <p className="text-sm text-gray-400 mb-4">Как быстро принимает решения? Влияет на тактику: импульсивному — дефицит, взвешенному — факты и время, прокрастинатору — дедлайны и малые шаги.</p>
            {!profile.decisionPace ? (
              <button
                onClick={() => setModal('decisionPace')}
                className="px-4 py-2 rounded-lg bg-dark-bg border border-dark text-light hover-bg-dark-hover transition-colors"
              >
                Выбрать темп
              </button>
            ) : (
              <ParamCard
                option={decisionPaceOptions.find(o => o.id === profile.decisionPace)!}
                onChange={() => setModal('decisionPace')}
                onRemove={() => handleUpdate({ decisionPace: null })}
              />
            )}
          </Accordion>

          {/* Section: Болевые точки */}
          <Accordion title="Болевые точки (текущие проблемы)" icon="🩹" defaultOpen={false}>
            <p className="text-sm text-gray-400 mb-4">С чем он сейчас борется? Прямая персонализация фраз: если болит «недооценённость», используем лесть и признание.</p>
            {painPoints.length === 0 ? (
              <div>
                <p className="text-gray-400 mb-3">Болевые точки не указаны</p>
                <button
                  onClick={() => setModal('painPoints')}
                  className="px-4 py-2 rounded-lg bg-dark-bg border border-dark text-light hover-bg-dark-hover transition-colors"
                >
                  Добавить болевую точку
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {painPoints.map((p, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 py-1 px-3 rounded-lg bg-dark-bg border-b border-dark last-border-b-0">
                    <span className="text-gray-400">{p}</span>
                    <button
                      onClick={() => handleUpdate({ painPoints: painPoints.filter((_, j) => j !== i) })}
                      className="text-gray-500 hover-text-red-400 text-lg leading-none"
                      aria-label="Удалить"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <div className="pt-4">
                  <button onClick={() => setModal('painPoints')} className="text-sm text-blue-400 hover-underline">
                    + Добавить болевую точку
                  </button>
                </div>
              </div>
            )}
          </Accordion>

          {/* Section: Notes */}
          <Accordion title="Свободные заметки" icon="📝" defaultOpen={false}>
            <textarea
              value={profile.notes}
              onChange={e => handleUpdate({ notes: e.target.value })}
              placeholder="Любые наблюдения, особенности поведения, контекст..."
              className="w-full min-h-[120px] px-4 py-3 rounded-lg bg-dark-bg border border-dark text-light placeholder-gray-500 resize-y"
            />
          </Accordion>

        </>
      )}

      {/* Контент вкладки «Сценарии» — только при наличии сохранённых */}
      {hasSavedScenarios && profileDetailTab === 'scenarios' && (
        <div>
          <p className="text-sm text-gray-400 mb-4">
            AI-сценарии, которые вы получали для этого профиля. Доступны офлайн.
          </p>
          <div className="grid grid-cols-1 gap-3">
            {savedForProfile.map(s => (
              <SavedScenarioCard
                key={s.id}
                scenario={s}
                onOpen={() => setViewingScenarioId(s.id)}
                onDelete={() => deleteScenario(s.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {modal === 'edit' && (
        <EditProfileModal
          profile={profile}
          onClose={() => setModal(null)}
          onSave={handleEditSave}
        />
      )}
      {modal === 'psychotype' && (
        <PsychotypeSelectModal
          currentId={profile.psychotype}
          onClose={() => setModal(null)}
          onSelect={id => {
            handleUpdate({ psychotype: id })
            setModal(null)
          }}
        />
      )}
      {modal === 'complex' && (
        <ComplexSelectModal
          selectedIds={profile.complexes}
          onClose={() => setModal(null)}
          onToggle={id => {
            const next = profile.complexes.includes(id)
              ? profile.complexes.filter(x => x !== id)
              : [...profile.complexes, id]
            handleUpdate({ complexes: next })
            showSaved()
          }}
        />
      )}
      {modal === 'shadow' && (
        <ShadowSelectModal
          selectedIds={profile.shadows}
          onClose={() => setModal(null)}
          onToggle={id => {
            const next = profile.shadows.includes(id)
              ? profile.shadows.filter(x => x !== id)
              : [...profile.shadows, id]
            handleUpdate({ shadows: next })
            showSaved()
          }}
        />
      )}
      {modal === 'belief' && (
        <BeliefModal
          value={beliefInput}
          onChange={setBeliefInput}
          onClose={() => { setModal(null); setBeliefInput('') }}
          onAdd={handleAddBelief}
        />
      )}
      {modal === 'value' && (
        <ValueModal
          value={valueInput}
          onChange={setValueInput}
          onClose={() => { setModal(null); setValueInput('') }}
          onAdd={handleAddValue}
        />
      )}
      {modal === 'triggersPositive' && (
        <TriggerModal
          title="Добавить позитивный триггер"
          subtitle="Что мотивирует, вдохновляет"
          examples={triggersPositiveExamples}
          value={triggerPositiveInput}
          onChange={setTriggerPositiveInput}
          onClose={() => { setModal(null); setTriggerPositiveInput('') }}
          onAdd={handleAddTriggerPositive}
        />
      )}
      {modal === 'triggersNegative' && (
        <TriggerModal
          title="Добавить негативный триггер"
          subtitle="Что выводит из себя, демотивирует"
          examples={triggersNegativeExamples}
          value={triggerNegativeInput}
          onChange={setTriggerNegativeInput}
          onClose={() => { setModal(null); setTriggerNegativeInput('') }}
          onAdd={handleAddTriggerNegative}
        />
      )}
      {modal === 'painPoints' && (
        <TriggerModal
          title="Добавить болевую точку"
          subtitle="С чем он сейчас борется? Прямая персонализация фраз."
          examples={painPointsExamples}
          value={painPointInput}
          onChange={setPainPointInput}
          onClose={() => { setModal(null); setPainPointInput('') }}
          onAdd={handleAddPainPoint}
        />
      )}
      {modal === 'communicationStyle' && (
        <SelectOneParamModal
          title="Коммуникационный стиль"
          options={communicationStyleOptions}
          currentId={profile.communicationStyle}
          onClose={() => setModal(null)}
          onSelect={id => { handleUpdate({ communicationStyle: id }); setModal(null) }}
        />
      )}
      {modal === 'motivationProfile' && (
        <SelectOneParamModal
          title="Мотивационный профиль"
          options={motivationProfileOptions}
          currentId={profile.motivationProfile}
          onClose={() => setModal(null)}
          onSelect={id => { handleUpdate({ motivationProfile: id }); setModal(null) }}
        />
      )}
      {modal === 'reference' && (
        <SelectOneParamModal
          title="Референция"
          options={referenceOptions}
          currentId={profile.reference}
          onClose={() => setModal(null)}
          onSelect={id => { handleUpdate({ reference: id }); setModal(null) }}
        />
      )}
      {modal === 'decisionPace' && (
        <SelectOneParamModal
          title="Темп принятия решений"
          options={decisionPaceOptions}
          currentId={profile.decisionPace}
          onClose={() => setModal(null)}
          onSelect={id => { handleUpdate({ decisionPace: id }); setModal(null) }}
        />
      )}

      {/* Экран досье профиля */}
      {showDossierView && profile.dossier != null && (
        <DossierView
          profileName={profile.name}
          dossier={profile.dossier}
          profileUpdatedAt={profile.updatedAt}
          dossierCreatedAt={profile.dossierCreatedAt ?? 0}
          onClose={() => setShowDossierView(false)}
          onUpdateDossier={handleCreateOrUpdateDossier}
          updating={dossierLoading}
          updateError={dossierError}
        />
      )}

      {/* Просмотр сохранённого сценария (полноэкранный) */}
      {viewingScenarioId && (() => {
        const scenario = getById(viewingScenarioId)
        if (!scenario) return null
        return (
          <div className="fixed inset-0 z-50 bg-dark-bg overflow-y-auto">
            <button
              type="button"
              onClick={() => setViewingScenarioId(null)}
              className="fixed top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-lg bg-dark-card border border-dark text-gray-400 hover:text-light hover:border-dark-hover transition-colors"
              aria-label="Закрыть"
            >
              <span className="text-xl leading-none" aria-hidden>×</span>
            </button>
            <div className="max-w-3xl mx-auto p-6 pt-16">
              <h2 className="text-xl font-semibold text-light mb-2">
                {scenario.targetActionTitle ?? 'AI-сценарий'}
                {scenario.targetActionDetail && (
                  <span className="text-gray-400 font-normal"> — {scenario.targetActionDetail}</span>
                )}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                {scenario.manipulatorRoleTitle && <span>{scenario.manipulatorRoleTitle} · </span>}
                {new Date(scenario.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
              <div className="bg-dark-card border border-dark rounded-xl p-6">
                <DossierLikeContent content={scenario.content} />
              </div>
            </div>
          </div>
        )
      })()}

      {/* Подтверждение удаления профиля */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black-70"
          onClick={() => setShowDeleteConfirm(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div
            className="bg-dark-card border border-dark rounded-xl max-w-sm w-full p-6 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <h2 id="delete-dialog-title" className="text-xl font-semibold text-light mb-2">
              Удалить профиль «{profile.name}»?
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Профиль будет удалён без возможности восстановления.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-lg text-gray-400 hover-text-light border border-dark hover-border-dark-hover transition-colors font-medium"
              >
                Отменить
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SavedScenarioCard({
  scenario,
  onOpen,
  onDelete
}: {
  scenario: SavedScenario
  onOpen: () => void
  onDelete: () => void
}) {
  const title = scenario.targetActionTitle ?? 'AI-сценарий'
  const subtitle = [
    scenario.manipulatorRoleTitle,
    scenario.targetActionDetail,
    new Date(scenario.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
  ].filter(Boolean).join(' · ')
  const preview = scenario.content.slice(0, 120).replace(/\n/g, ' ').trim() + (scenario.content.length > 120 ? '…' : '')

  return (
    <div className="border border-dark rounded-xl p-4 bg-dark-bg hover:border-blue-500/40 transition-colors flex flex-col gap-2">
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen() } }}
        className="flex-1 min-w-0 cursor-pointer text-left"
      >
        <h4 className="font-medium text-light">{title}</h4>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        {preview && <p className="text-sm text-gray-400 mt-2 line-clamp-2">{preview}</p>}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-dark">
        <button
          type="button"
          onClick={onOpen}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          Открыть
        </button>
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onDelete() }}
          className="text-sm text-gray-500 hover:text-red-400"
          aria-label="Удалить сценарий"
        >
          Удалить
        </button>
      </div>
    </div>
  )
}

function DossierView({
  profileName,
  dossier,
  profileUpdatedAt,
  dossierCreatedAt,
  onClose,
  onUpdateDossier,
  updating,
  updateError
}: {
  profileName: string
  dossier: unknown
  profileUpdatedAt: number
  dossierCreatedAt: number
  onClose: () => void
  onUpdateDossier: () => void
  updating: boolean
  updateError: string | null
}) {
  const needsUpdate = profileUpdatedAt > dossierCreatedAt

  const renderDossierContent = () => {
    if (dossier == null) return null
    // HTML от Make.com — рендерим как разметку (удобно, если сценарий возвращает HTML из ChatGPT)
    if (typeof dossier === 'string') {
      if (dossier.trim().startsWith('<')) {
        return (
          <div
            className="dossier-view prose prose-invert max-w-none prose-headings:font-semibold prose-h1:text-lg prose-h1:text-blue-400 prose-h2:text-base prose-h2:text-blue-300 prose-h3:text-sm prose-h3:text-gray-200 prose-p:text-gray-300 prose-li:text-gray-300 prose-strong:text-gray-200 prose-a:text-blue-400 prose-code:text-gray-400"
            dangerouslySetInnerHTML={{ __html: dossier }}
          />
        )
      }
      // Обычный текст: # / ## / ###, списки (—, -, 1.), "Секция:", параграфы
      const blocks = dossier.split(/\n\n+/)
      return (
        <div className="dossier-view space-y-0">
          {blocks.map((block, i) => {
            const lines = block.split('\n').filter(Boolean)
            const firstLine = lines[0] ?? ''
            const trimmedFirst = firstLine.trim()
            if (/^###\s/.test(trimmedFirst)) {
              const title = trimmedFirst.replace(/^###\s+/, '')
              return (
                <div key={i} className="dossier-section">
                  <h3>{title}</h3>
                  {lines.length > 1 && <div className="dossier-body">{lines.slice(1).join('\n')}</div>}
                </div>
              )
            }
            if (/^##\s/.test(trimmedFirst)) {
              const title = trimmedFirst.replace(/^##\s+/, '')
              return (
                <div key={i} className="dossier-section">
                  <h2>{title}</h2>
                  {lines.length > 1 && <div className="dossier-body">{lines.slice(1).join('\n')}</div>}
                </div>
              )
            }
            if (/^#\s/.test(trimmedFirst)) {
              const title = trimmedFirst.replace(/^#\s+/, '')
              return (
                <div key={i} className="dossier-section">
                  <h1>{title}</h1>
                  {lines.length > 1 && <div className="dossier-body">{lines.slice(1).join('\n')}</div>}
                </div>
              )
            }
            const isListLine = (l: string) => /^[—\-]\s/.test(l) || /^\d+[.)]\s/.test(l)
            const listItemIndices = lines.map((l, idx) => (isListLine(l) ? idx : -1)).filter(idx => idx >= 0)
            const hasList = listItemIndices.length > 0
            const firstListIdx = listItemIndices[0] ?? lines.length
            const headerLines = firstListIdx > 0 ? lines.slice(0, firstListIdx) : []
            const listLines = lines.slice(firstListIdx).filter(isListLine)
            if (hasList && listLines.length > 0) {
              return (
                <div key={i} className="dossier-section">
                  {headerLines.length > 0 && (
                    <div className="dossier-section-title whitespace-pre-wrap">
                      {headerLines.map(line => line.trim()).join('\n')}
                    </div>
                  )}
                  <ul className="dossier-list">
                    {listLines.map((line, j) => (
                      <li key={j} className="whitespace-pre-wrap">
                        {line.replace(/^[—\-]\s/, '').replace(/^\d+[.)]\s/, '')}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            }
            const isSectionHeader = /^[А-Яа-яA-Za-z0-9\s\-]+:\s*$/.test(trimmedFirst) && lines.length >= 1
            if (isSectionHeader && trimmedFirst) {
              return (
                <div key={i} className="dossier-section">
                  <div className="dossier-section-title">{firstLine.replace(/:$/, '').trim()}</div>
                  {lines.length > 1 && <div className="dossier-body">{lines.slice(1).join('\n')}</div>}
                </div>
              )
            }
            return (
              <p key={i} className="dossier-paragraph dossier-body">
                {block}
              </p>
            )
          })}
        </div>
      )
    }
    // Объект от webhook — форматируем секциями (заголовок + содержимое)
    if (typeof dossier === 'object' && !Array.isArray(dossier)) {
      return (
        <div className="dossier-view space-y-4">
          {Object.entries(dossier as Record<string, unknown>).map(([key, value]) => (
            <div key={key} className="dossier-section border-b border-dark pb-4 last-border-b-0">
              <h3 className="capitalize">{key.replace(/_/g, ' ')}</h3>
              {value == null ? (
                <p className="text-sm text-gray-500">—</p>
              ) : typeof value === 'string' ? (
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{value}</p>
              ) : Array.isArray(value) ? (
                <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                  {value.map((item, i) => (
                    <li key={i}>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</li>
                  ))}
                </ul>
              ) : typeof value === 'object' ? (
                <pre className="text-xs text-gray-400 whitespace-pre-wrap break-words">
                  {JSON.stringify(value, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-gray-300">{String(value)}</p>
              )}
            </div>
          ))}
        </div>
      )
    }
    if (Array.isArray(dossier)) {
      return (
        <ul className="dossier-view dossier-list">
          {dossier.map((item, i) => (
            <li key={i}>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</li>
          ))}
        </ul>
      )
    }
    return <pre className="dossier-view text-sm dossier-body">{String(dossier)}</pre>
  }

  return (
    <div className="fixed inset-0 z-50 bg-dark-bg overflow-y-auto">
      <button
        type="button"
        onClick={onClose}
        className="fixed top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-lg bg-dark-card border border-dark text-gray-400 hover-text-light hover-border-dark-hover transition-colors"
        aria-label="Закрыть"
      >
        <span className="text-xl leading-none" aria-hidden>×</span>
      </button>
      <div className="max-w-3xl mx-auto p-6 pt-16">
        <h2 className="text-xl font-semibold text-light mb-4">Досье профиля: {profileName}</h2>
        <div className="mb-6">{renderDossierContent()}</div>
        {needsUpdate && (
          <div className="border-t border-dark pt-4">
            <p className="text-sm text-gray-400 mb-2">Профиль изменён после создания досье.</p>
            <button
              type="button"
              onClick={onUpdateDossier}
              disabled={updating}
              className="px-6 py-3 bg-transparent border-2 border-blue-500 text-blue-500 hover-bg-blue-500-20 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled-opacity-50"
            >
              {updating ? 'Обновление…' : 'Обновить досье'}
            </button>
            {updateError && <p className="text-xs text-red-400 mt-2">{updateError}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

function PsychotypeCard({
  psychotype,
  onChange,
  onRemove
}: {
  psychotype: Psychotype
  onChange: () => void
  onRemove: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="border border-blue-500-30 rounded-xl p-4 bg-dark-bg flex flex-col gap-3">
      <div
        role="button"
        tabIndex={0}
        onClick={onChange}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange() } }}
        className="flex items-start justify-between gap-2 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">{psychotype.icon}</span>
          <div>
            <h4 className="font-semibold text-light">{psychotype.title}</h4>
            <p className="text-sm text-gray-400">{psychotype.shortDesc}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-lg" aria-hidden>✏️</span>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onRemove() }}
            className="text-sm text-gray-500 hover-text-red-400"
            aria-label="Удалить"
          >
            ×
          </button>
        </div>
      </div>
      <div className="flex justify-center">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-gray-400 hover-text-light"
        >
          {expanded ? 'Свернуть' : 'Подробнее'}
        </button>
      </div>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-dark text-sm text-gray-300 space-y-2">
          <p>{psychotype.fullDesc}</p>
          <p><strong className="text-light">Сильные стороны:</strong> {psychotype.strengths.join(', ')}</p>
          <p><strong className="text-light">Слабости:</strong> {psychotype.weaknesses.join(', ')}</p>
          <p><strong className="text-light">Триггеры:</strong> {psychotype.triggers.join(', ')}</p>
          <p><strong className="text-light">Как общаться:</strong> {psychotype.communication}</p>
        </div>
      )}
    </div>
  )
}

function ExpandableComplexCard({ complex, onRemove }: { complex: Complex; onRemove: () => void }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="border border-dark rounded-xl p-4 bg-dark-bg flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{complex.icon}</span>
          <div className="flex flex-col gap-1">
            <h4 className="font-medium text-light">{complex.title}</h4>
            <p className="text-sm text-gray-400">{complex.description}</p>
          </div>
        </div>
        <button onClick={onRemove} className="text-gray-500 hover-text-red-400 text-lg">×</button>
      </div>
      <button onClick={() => setExpanded(!expanded)} className="text-sm text-gray-400 hover-text-light">
        {expanded ? 'Свернуть' : 'Подробнее'}
      </button>
      {expanded && (
        <div className="mt-2 pt-2 border-t border-dark text-sm text-gray-300 flex flex-col gap-2">
          <p><strong className="text-light">Проявления:</strong> {complex.manifestations.join(', ')}</p>
          <p><strong className="text-light">Как использовать:</strong> {complex.howToUse}</p>
        </div>
      )}
    </div>
  )
}

function ExpandableShadowCard({ shadow, onRemove }: { shadow: Shadow; onRemove: () => void }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="border border-gray-600 rounded-xl p-4 bg-dark-bg flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{shadow.icon}</span>
          <div className="flex flex-col gap-1">
            <h4 className="text-base font-medium text-light">{shadow.title}</h4>
            <p className="text-sm text-gray-400" style={{ fontSize: '14px' }}>{shadow.description}</p>
          </div>
        </div>
        <button onClick={onRemove} className="text-gray-500 hover-text-red-400 text-lg">×</button>
      </div>
      <button onClick={() => setExpanded(!expanded)} className="text-sm text-gray-400 hover-text-light">
        {expanded ? 'Свернуть' : 'Подробнее'}
      </button>
      {expanded && (
        <div className="mt-2 pt-2 border-t border-dark text-sm text-gray-300 flex flex-col gap-2">
          <p><strong className="text-light">Признаки:</strong> {shadow.signs.join(', ')}</p>
          <p><strong className="text-light">Как работать:</strong> {shadow.howToWork}</p>
        </div>
      )}
    </div>
  )
}

function ParamCard({
  option,
  onChange,
  onRemove
}: {
  option: ProfileParamOption
  onChange: () => void
  onRemove: () => void
}) {
  return (
    <div className="border border-blue-500-30 rounded-xl p-4 bg-dark-bg flex items-start justify-between gap-2">
      <div
        role="button"
        tabIndex={0}
        onClick={onChange}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange() } }}
        className="flex-1 min-w-0 cursor-pointer"
      >
        <h4 className="font-semibold text-light">{option.label}</h4>
        {option.description && <p className="text-sm text-gray-400 mt-1">{option.description}</p>}
      </div>
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onRemove() }}
        className="text-gray-500 hover-text-red-400 text-lg flex-shrink-0"
        aria-label="Удалить"
      >
        ×
      </button>
    </div>
  )
}

function SelectOneParamModal({
  title,
  options,
  currentId,
  onClose,
  onSelect
}: {
  title: string
  options: ProfileParamOption[]
  currentId: string | null
  onClose: () => void
  onSelect: (id: string) => void
}) {
  return (
    <div className="fixed inset-0 z-50 bg-dark-bg overflow-y-auto">
      <button
        type="button"
        onClick={onClose}
        className="fixed top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-lg bg-dark-card border border-dark text-gray-400 hover-text-light hover-border-dark-hover transition-colors"
        aria-label="Закрыть"
      >
        <span className="text-xl leading-none" aria-hidden>×</span>
      </button>
      <div className="p-6 pt-16">
        <h2 className="text-xl font-semibold text-light mb-4">{title}</h2>
        <div className="grid grid-cols-1 gap-3">
          {options.map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className="text-left p-4 rounded-lg border border-dark bg-dark-bg hover-bg-dark-hover transition-colors flex flex-col gap-1"
            >
              <span className="text-base font-medium text-light">{opt.label}</span>
              {opt.description && <span className="text-xs text-gray-400">{opt.description}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function EditProfileModal({
  profile,
  onClose,
  onSave
}: {
  profile: Profile
  onClose: () => void
  onSave: (name: string, avatar: string, relationshipType: string) => void
}) {
  const [name, setName] = useState(profile.name)
  const [avatar, setAvatar] = useState(profile.avatar)
  const [relationshipType, setRelationshipType] = useState(profile.relationshipType)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(name.trim(), avatar, relationshipType)
  }

  return (
    <div className="fixed inset-0 z-50 bg-dark-bg overflow-y-auto">
      <button
        type="button"
        onClick={onClose}
        className="fixed top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-lg bg-dark-card border border-dark text-gray-400 hover-text-light hover-border-dark-hover transition-colors"
        aria-label="Закрыть"
      >
        <span className="text-xl leading-none" aria-hidden>×</span>
      </button>
      <div className="min-h-screen flex items-center justify-center p-4 pt-16">
        <div className="bg-dark-card border border-dark rounded-xl max-w-md w-full p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-light mb-4">Редактировать профиль</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Имя</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-dark text-light"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Аватар</label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatar(emoji)}
                    className={`w-10 h-10 rounded-lg border-2 text-xl flex items-center justify-center transition-colors ${avatar === emoji ? 'border-blue-500 bg-blue-500-20' : 'border-dark bg-dark-bg hover-border-gray-500'}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Тип отношений</label>
              <select
                value={relationshipType}
                onChange={e => setRelationshipType(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-dark text-light"
              >
                {relationshipTypes.map(key => (
                  <option key={key} value={key}>{relationshipTypeLabels[key]}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg text-gray-400 hover-text-light">
                Отмена
              </button>
              <button type="submit" disabled={!name.trim()} className="flex-1 py-2 rounded-lg bg-blue-500 text-white font-medium disabled-opacity-50">
                Сохранить
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function PsychotypeSelectModal({
  currentId,
  onClose,
  onSelect
}: {
  currentId: string | null
  onClose: () => void
  onSelect: (id: string) => void
}) {
  return (
    <div className="fixed inset-0 z-50 bg-dark-bg overflow-y-auto">
      <button
        type="button"
        onClick={onClose}
        className="fixed top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-lg bg-dark-card border border-dark text-gray-400 hover-text-light hover-border-dark-hover transition-colors"
        aria-label="Закрыть"
      >
        <span className="text-xl leading-none" aria-hidden>×</span>
      </button>
      <div className="p-6 pt-16">
        <h2 className="text-xl font-semibold text-light mb-4">Выберите психотип</h2>
        <div className="grid grid-cols-1 gap-3">
          {psychotypes.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              className="text-left p-4 rounded-lg border border-dark bg-dark-bg hover-bg-dark-hover transition-colors flex items-center gap-3"
            >
              <span className="text-2xl">{p.icon}</span>
              <div className="flex flex-col gap-1">
                <h4 className="text-base font-medium text-light">{p.title}</h4>
                <p className="text-xs text-gray-400">{p.shortDesc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ComplexSelectModal({
  selectedIds,
  onClose,
  onToggle
}: {
  selectedIds: string[]
  onClose: () => void
  onToggle: (id: string) => void
}) {
  const CARD_GAP = 16
  const CARD_WIDTH_RATIO = 0.8
  const viewportRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [viewportWidthPx, setViewportWidthPx] = useState(0)

  useLayoutEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const update = () => setViewportWidthPx(el.clientWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const cardWidthPx = viewportWidthPx > 0 ? Math.min(Math.round(viewportWidthPx * CARD_WIDTH_RATIO), 400) : undefined

  return (
    <div className="fixed inset-0 z-50 bg-dark-bg flex flex-col">
      <style>{`.complex-carousel::-webkit-scrollbar { display: none }`}</style>
      <button
        type="button"
        onClick={onClose}
        className="fixed top-4 right-4 z-[60] w-10 h-10 flex items-center justify-center rounded-lg bg-dark-card border border-dark text-gray-400 hover:text-light hover:border-dark-hover transition-colors"
        aria-label="Закрыть"
      >
        <span className="text-xl leading-none" aria-hidden>×</span>
      </button>
      <div className="flex-none px-4 pt-2 pb-6" style={{ paddingTop: 8, paddingBottom: 24 }}>
        <h2 className="text-xl font-semibold text-light">Выбор комплекса</h2>
        <p className="text-sm text-gray-400 mt-1">Свайпайте влево-вправо</p>
      </div>
      <div
        ref={viewportRef}
        className="flex-1 min-h-0 overflow-hidden px-4 pb-6"
      >
        <div
          ref={scrollRef}
          role="region"
          aria-label="Карусель комплексов"
          className="complex-carousel flex h-full gap-4 overflow-x-auto overflow-y-hidden snap-x snap-mandatory overscroll-x-contain"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            scrollSnapType: 'x mandatory'
          }}
        >
          {complexes.map(c => {
            const selected = selectedIds.includes(c.id)
            return (
              <div
                key={c.id}
                data-complex-card
                className={`flex-shrink-0 min-w-0 max-w-[400px] rounded-xl border border-dark bg-dark-card overflow-y-auto overflow-x-hidden flex flex-col snap-start snap-always ${cardWidthPx == null ? 'w-4/5' : ''}`}
                style={{
                  minHeight: '280px',
                  ...(cardWidthPx != null ? { width: cardWidthPx } : {}),
                  scrollSnapAlign: 'start',
                  scrollSnapStop: 'always'
                }}
              >
                <div className="p-5 flex flex-col gap-3 flex-1 min-w-0 min-h-0 break-words overflow-hidden">
                  <div className="flex items-start gap-3">
                    <span className="text-4xl flex-shrink-0">{c.icon}</span>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <h3 className="text-lg font-semibold text-light leading-tight break-words">{c.title}</h3>
                      <p className="text-sm text-gray-400 mt-1 break-words">{c.description}</p>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Проявления</p>
                    <ul className="text-sm text-gray-300 space-y-0.5 list-disc list-inside break-words">
                      {c.manifestations.map((m, i) => (
                        <li key={i} className="break-words">{m}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Как использовать</p>
                    <p className="text-sm text-gray-300 break-words">{c.howToUse}</p>
                  </div>
                  <button
                    type="button"
                    onPointerDown={e => e.stopPropagation()}
                    onClick={() => onToggle(c.id)}
                    className={`mt-2 w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors ${selected ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' : 'bg-dark-bg text-gray-300 border border-dark hover:bg-dark-hover'}`}
                  >
                    {selected ? '✓ В профиле' : 'Добавить в профиль'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ShadowSelectModal({
  selectedIds,
  onClose,
  onToggle
}: {
  selectedIds: string[]
  onClose: () => void
  onToggle: (id: string) => void
}) {
  return (
    <div className="fixed inset-0 z-50 bg-dark-bg overflow-y-auto">
      <button
        type="button"
        onClick={onClose}
        className="fixed top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-lg bg-dark-card border border-dark text-gray-400 hover-text-light hover-border-dark-hover transition-colors"
        aria-label="Закрыть"
      >
        <span className="text-xl leading-none" aria-hidden>×</span>
      </button>
      <div className="p-6 pt-16">
        <h2 className="text-xl font-semibold text-light mb-4">Добавить теневой аспект</h2>
        <div className="grid grid-cols-1 gap-3">
          {shadows.map(s => {
            const selected = selectedIds.includes(s.id)
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onToggle(s.id)}
                className={`text-left p-4 rounded-lg border flex items-center gap-3 transition-colors ${selected ? 'border-blue-500 bg-blue-500-20' : 'border-dark bg-dark-bg hover-bg-dark-hover'}`}
              >
                <span className="text-2xl">{s.icon}</span>
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <h4 className="text-base font-medium text-light">{s.title}</h4>
                  <p className="text-xs text-gray-400 truncate">{s.description}</p>
                </div>
                {selected && <span className="text-green-400">✓</span>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function BeliefModal({
  value,
  onChange,
  onClose,
  onAdd
}: {
  value: string
  onChange: (v: string) => void
  onClose: () => void
  onAdd: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 bg-dark-bg overflow-y-auto">
      <button
        type="button"
        onClick={onClose}
        className="fixed top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-lg bg-dark-card border border-dark text-gray-400 hover-text-light hover-border-dark-hover transition-colors"
        aria-label="Закрыть"
      >
        <span className="text-xl leading-none" aria-hidden>×</span>
      </button>
      <div className="min-h-screen flex items-center justify-center p-4 pt-16">
        <div className="bg-dark-card border border-dark rounded-xl max-w-md w-full p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-light mb-4">Добавить убеждение</h2>
          <p className="text-sm text-gray-400 mb-2">Выберите из примеров или введите своё</p>
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="Например: Деньги — корень зла"
            className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-dark text-light placeholder-gray-500 mb-3"
          />
          <div className="flex flex-wrap gap-2 mb-4">
            {beliefsExamples.map(b => (
              <button
                key={b}
                type="button"
                onClick={() => onChange(b)}
                className="rounded-lg text-sm bg-dark-bg border border-dark text-gray-400 hover-text-light"
                style={{ padding: '4px 8px' }}
              >
                {b}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg text-gray-400 hover-text-light">
              Отмена
            </button>
            <button
              type="button"
              onClick={onAdd}
              disabled={!value.trim()}
              className="flex-1 py-2 rounded-lg bg-blue-500 text-white font-medium disabled-opacity-50"
            >
              Добавить
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ValueModal({
  value,
  onChange,
  onClose,
  onAdd
}: {
  value: string
  onChange: (v: string) => void
  onClose: () => void
  onAdd: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 bg-dark-bg overflow-y-auto">
      <button
        type="button"
        onClick={onClose}
        className="fixed top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-lg bg-dark-card border border-dark text-gray-400 hover-text-light hover-border-dark-hover transition-colors"
        aria-label="Закрыть"
      >
        <span className="text-xl leading-none" aria-hidden>×</span>
      </button>
      <div className="min-h-screen flex items-center justify-center p-4 pt-16">
        <div className="bg-dark-card border border-dark rounded-xl max-w-md w-full p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-light mb-4">Добавить ценность</h2>
          <p className="text-sm text-gray-400 mb-2">Выберите из примеров или введите свою</p>
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="Например: Семья"
            className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-dark text-light placeholder-gray-500 mb-3"
          />
          <div className="flex flex-wrap gap-2 mb-4">
            {valuesExamples.map(v => (
              <button
                key={v}
                type="button"
                onClick={() => onChange(v)}
                className="rounded-lg text-sm bg-dark-bg border border-dark text-gray-400 hover-text-light"
                style={{ padding: '4px 8px' }}
              >
                {v}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg text-gray-400 hover-text-light">
              Отмена
            </button>
            <button
              type="button"
              onClick={onAdd}
              disabled={!value.trim()}
              className="flex-1 py-2 rounded-lg bg-blue-500 text-white font-medium disabled-opacity-50"
            >
              Добавить
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function TriggerModal({
  title,
  subtitle,
  examples,
  value,
  onChange,
  onClose,
  onAdd
}: {
  title: string
  subtitle: string
  examples: string[]
  value: string
  onChange: (v: string) => void
  onClose: () => void
  onAdd: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 bg-dark-bg overflow-y-auto">
      <button
        type="button"
        onClick={onClose}
        className="fixed top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-lg bg-dark-card border border-dark text-gray-400 hover-text-light hover-border-dark-hover transition-colors"
        aria-label="Закрыть"
      >
        <span className="text-xl leading-none" aria-hidden>×</span>
      </button>
      <div className="min-h-screen flex items-center justify-center p-4 pt-16">
        <div className="bg-dark-card border border-dark rounded-xl max-w-md w-full p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-light mb-1">{title}</h2>
          <p className="text-sm text-gray-400 mb-4">{subtitle}</p>
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="Например: Когда его хвалят публично"
            className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-dark text-light placeholder-gray-500 mb-3"
          />
          <div className="flex flex-wrap gap-2 mb-4">
            {examples.map(ex => (
              <button
                key={ex}
                type="button"
                onClick={() => onChange(ex)}
                className="rounded-lg text-sm bg-dark-bg border border-dark text-gray-400 hover-text-light"
                style={{ padding: '4px 8px' }}
              >
                {ex}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg text-gray-400 hover-text-light">
              Отмена
            </button>
            <button
              type="button"
              onClick={onAdd}
              disabled={!value.trim()}
              className="flex-1 py-2 rounded-lg bg-blue-500 text-white font-medium disabled-opacity-50"
            >
              Добавить
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
