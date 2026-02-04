'use client'

import { useState } from 'react'
import SelectionCard from '../components/SelectionCard'
import { useAppData } from '../hooks/useAppData'
import { relationshipTypeLabels } from '../data/profiles'
import { psychotypes } from '../data/psychotypes'
import type { Profile } from '../data/profiles'
import type { AudienceContextId } from '../hooks/useAppState'

const AUDIENCE_CONTEXT_OPTIONS: { id: AudienceContextId; label: string }[] = [
  { id: 'resource', label: 'В ресурсе (спокоен, открыт)' },
  { id: 'stress', label: 'В стрессе (раздражён, закрыт)' },
  { id: 'euphoria', label: 'В эйфории (перевозбуждён)' },
  { id: 'apathy', label: 'В апатии (выгорел, безразличен)' },
  { id: 'unknown', label: 'Неизвестно' }
]

interface Step2VictimProps {
  selectedRole: string | null
  selectedProfileId: string | null
  onSelect: (roleId: string) => void
  onSelectProfile: (profileId: string) => void
  onContextSelected: (contextId: AudienceContextId) => void
  profiles: (Profile & { completeness?: number })[]
  getProfile: (id: string) => Profile | null
}

export default function Step2Victim({
  selectedRole,
  selectedProfileId,
  onSelect,
  onSelectProfile,
  onContextSelected,
  profiles,
  getProfile
}: Step2VictimProps) {
  const appData = useAppData()
  const [audienceTab, setAudienceTab] = useState<'role' | 'profile'>(
    selectedProfileId ? 'profile' : 'role'
  )
  const [showContextPopup, setShowContextPopup] = useState(false)

  if (appData.loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Загрузка данных...</p>
      </div>
    )
  }

  const handleTabRole = () => setAudienceTab('role')
  const handleTabProfile = () => setAudienceTab('profile')

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2 text-light">Шаг 2: Кто ваша аудитория?</h2>
      <p className="text-gray-400 mb-6">На кого вы хотите воздействовать?</p>

      {/* Табы: Общая роль | Мой профиль */}
      <div className="flex gap-2 mb-6 p-1 bg-dark-bg rounded-lg w-full max-w-md">
        <button
          type="button"
          onClick={handleTabRole}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${audienceTab === 'role' ? 'bg-dark-card text-light' : 'text-gray-400 hover-text-light'}`}
        >
          Общая роль
        </button>
        <button
          type="button"
          onClick={handleTabProfile}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${audienceTab === 'profile' ? 'bg-dark-card text-light' : 'text-gray-400 hover-text-light'}`}
        >
          Мой профиль
        </button>
      </div>

      {audienceTab === 'role' && (
        <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3 gap-4">
          {appData.victimRoles.map(role => (
            <SelectionCard
              key={role.id}
              icon={role.icon}
              title={role.title}
              description={role.description}
              selected={selectedRole === role.id}
              onClick={() => {
                onSelect(role.id)
                setShowContextPopup(true)
              }}
            />
          ))}
        </div>
      )}

      {audienceTab === 'profile' && (
        <div>
          {profiles.length === 0 ? (
            <p className="text-sm text-gray-500">
              Нет созданных профилей. Добавьте их в разделе «Профили».
            </p>
          ) : (
            <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3 gap-4">
              {profiles.map(profile => {
                const pPsychotype = profile.psychotype
                  ? psychotypes.find(pr => pr.id === profile.psychotype)
                  : null
                const descParts = [
                  relationshipTypeLabels[profile.relationshipType] ?? profile.relationshipType,
                  pPsychotype && `${pPsychotype.title} ${pPsychotype.icon}`,
                  profile.completeness != null ? `${profile.completeness}%` : null
                ].filter(Boolean)
                const description = descParts.join(' · ')
                return (
                  <SelectionCard
                    key={profile.id}
                    icon={profile.avatar}
                    title={profile.name}
                    description={description}
                    selected={selectedProfileId === profile.id}
                    onClick={() => {
                      onSelectProfile(profile.id)
                      setShowContextPopup(true)
                    }}
                  />
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Попап: текущее состояние (контекст) аудитории */}
      {showContextPopup && (selectedRole || selectedProfileId) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black-70"
          onClick={() => setShowContextPopup(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="context-dialog-title"
        >
          <div
            className="bg-dark-card-selected border-2 border-blue-500 rounded-xl w-full p-6 shadow-lg shadow-blue-500-20"
            style={{ maxWidth: 320 }}
            onClick={e => e.stopPropagation()}
          >
            <h3 id="context-dialog-title" className="text-lg font-semibold text-light mb-4">
              💡 Текущее состояние (контекст)
            </h3>
            <div className="flex flex-col gap-2">
              {AUDIENCE_CONTEXT_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onContextSelected(opt.id)
                    setShowContextPopup(false)
                  }}
                  className="text-left px-4 py-3 rounded-lg bg-dark-bg-blue border border-blue-500-30 text-light hover-bg-dark-page hover-border-blue-500 transition-colors cursor-pointer"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
