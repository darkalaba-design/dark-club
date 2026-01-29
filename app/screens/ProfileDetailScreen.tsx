'use client'

import { useState, useEffect, useCallback } from 'react'
import { useProfiles } from '../hooks/useProfiles'
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
import Accordion from '../components/Accordion'

const EMOJI_OPTIONS = ['👤', '👔', '👩', '🧑', '🫂', '💼', '🎭', '⭐', '🔥', '💜']

type ModalKind = 'edit' | 'psychotype' | 'complex' | 'shadow' | 'belief' | 'value' | null

interface ProfileDetailScreenProps {
  profileId: string
  onBack: () => void
}

export default function ProfileDetailScreen({ profileId, onBack }: ProfileDetailScreenProps) {
  const { getProfile, updateProfile, deleteProfile } = useProfiles()
  const profile = getProfile(profileId)
  const [savedVisible, setSavedVisible] = useState(false)
  const [modal, setModal] = useState<ModalKind>(null)
  const [beliefInput, setBeliefInput] = useState('')
  const [valueInput, setValueInput] = useState('')

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

  const handleDelete = () => {
    if (window.confirm(`Удалить профиль «${profile.name}»?`)) {
      deleteProfile(profileId)
      onBack()
    }
  }

  const handleEditSave = (name: string, avatar: string, relationshipType: string) => {
    handleUpdate({ name, avatar, relationshipType })
    setModal(null)
  }

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

  return (
    <div className="max-w-2xl mx-auto">
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
      <div className="bg-dark-card border border-dark rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <span className="text-5xl flex-shrink-0">{profile.avatar}</span>
          <div className="min-w-0 flex-1 flex flex-col gap-2">
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
                onClick={handleDelete}
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
        </div>
      </div>

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
          <div className="flex flex-wrap gap-2">
            {profile.values.map((v, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-dark-bg border border-dark text-light"
              >
                {v}
                <button
                  onClick={() => handleUpdate({ values: profile.values.filter((_, j) => j !== i) })}
                  className="ml-2 text-gray-500 hover-text-red-400 text-sm leading-none"
                  aria-label="Удалить"
                >
                  ×
                </button>
              </span>
            ))}
            <div className="pt-4 w-full">
              <button onClick={() => setModal('value')} className="text-sm text-blue-400 hover-underline">
                + Добавить ценность
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black-70" onClick={onClose}>
      <div className="bg-dark-card border border-dark rounded-xl max-w-md w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black-70" onClick={onClose}>
      <div className="bg-dark-card border-0 w-full h-full min-h-screen overflow-y-auto p-6 shadow-xl" onClick={e => e.stopPropagation()}>
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
        <button type="button" onClick={onClose} className="mt-4 w-full py-2 rounded-lg text-gray-400 hover-text-light">
          Отмена
        </button>
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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black-70" onClick={onClose}>
      <div className="bg-dark-card border-0 w-full h-full min-h-screen overflow-y-auto p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-semibold text-light mb-4">Выберите комплекс</h2>
        <div className="grid grid-cols-1 gap-3">
          {complexes.map(c => {
            const selected = selectedIds.includes(c.id)
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onToggle(c.id)}
                className={`text-left p-4 rounded-lg border flex items-center gap-3 transition-colors ${selected ? 'border-blue-500 bg-blue-500-20' : 'border-dark bg-dark-bg hover-bg-dark-hover'}`}
              >
                <span className="text-2xl">{c.icon}</span>
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <h4 className="text-base font-medium text-light">{c.title}</h4>
                  <p className="text-xs text-gray-400 truncate">{c.description}</p>
                </div>
                {selected && <span className="text-green-400">✓</span>}
              </button>
            )
          })}
        </div>
        <button type="button" onClick={onClose} className="mt-4 w-full py-2 rounded-lg text-gray-400 hover-text-light">
          Готово
        </button>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black-70" onClick={onClose}>
      <div className="bg-dark-card border-0 w-full h-full min-h-screen overflow-y-auto p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-semibold text-light mb-4">Выберите теневой аспект</h2>
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
        <button type="button" onClick={onClose} className="mt-4 w-full py-2 rounded-lg text-gray-400 hover-text-light">
          Готово
        </button>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black-70" onClick={onClose}>
      <div className="bg-dark-card border border-dark rounded-xl max-w-md w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black-70" onClick={onClose}>
      <div className="bg-dark-card border border-dark rounded-xl max-w-md w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
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
  )
}
