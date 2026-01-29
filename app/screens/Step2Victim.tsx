'use client'

import { useState } from 'react'
import SelectionCard from '../components/SelectionCard'
import { useAppData } from '../hooks/useAppData'
import { relationshipTypeLabels } from '../data/profiles'
import { psychotypes } from '../data/psychotypes'
import type { Profile } from '../data/profiles'

interface Step2VictimProps {
  selectedRole: string | null
  selectedProfileId: string | null
  onSelect: (roleId: string) => void
  onSelectProfile: (profileId: string) => void
  profiles: (Profile & { completeness?: number })[]
  getProfile: (id: string) => Profile | null
}

export default function Step2Victim({
  selectedRole,
  selectedProfileId,
  onSelect,
  onSelectProfile,
  profiles,
  getProfile
}: Step2VictimProps) {
  const appData = useAppData()
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [audienceTab, setAudienceTab] = useState<'role' | 'profile'>(
    selectedProfileId ? 'profile' : 'role'
  )

  const selectedProfile = selectedProfileId ? getProfile(selectedProfileId) : null
  const psychotype = selectedProfile?.psychotype
    ? psychotypes.find(p => p.id === selectedProfile.psychotype)
    : null

  if (appData.loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Загрузка данных...</p>
      </div>
    )
  }

  const handleTabRole = () => {
    setAudienceTab('role')
    setShowProfileModal(false)
  }

  const handleTabProfile = () => {
    setAudienceTab('profile')
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2 text-light">Шаг 2: Кто ваша аудитория?</h2>
      <p className="text-gray-400 mb-6">На кого вы хотите воздействовать?</p>

      {/* Табы: Общая роль | Мой профиль */}
      <div className="flex gap-2 mb-6 p-1 bg-dark-bg rounded-lg border border-dark w-full max-w-md">
        <button
          type="button"
          onClick={handleTabRole}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${audienceTab === 'role' ? 'bg-dark-card text-light border border-dark' : 'text-gray-400 hover-text-light'}`}
        >
          Общая роль
        </button>
        <button
          type="button"
          onClick={handleTabProfile}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${audienceTab === 'profile' ? 'bg-dark-card text-light border border-dark' : 'text-gray-400 hover-text-light'}`}
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
              onClick={() => onSelect(role.id)}
            />
          ))}
        </div>
      )}

      {audienceTab === 'profile' && (
        <div>
          {selectedProfile ? (
            <div className="mb-4 p-4 bg-dark-card border border-dark rounded-xl flex items-center gap-4">
              <span className="text-4xl">{selectedProfile.avatar}</span>
              <div>
                <h3 className="font-semibold text-light">{selectedProfile.name}</h3>
                <span className="text-sm text-gray-400">
                  {relationshipTypeLabels[selectedProfile.relationshipType] ?? selectedProfile.relationshipType}
                  {psychotype && ` · ${psychotype.title} ${psychotype.icon}`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                className="ml-auto text-sm text-blue-400 hover-text-light"
              >
                Сменить
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              className="w-full md-w-auto px-6 py-4 bg-dark-card border border-dark rounded-xl text-light hover-bg-dark-hover transition-colors flex items-center justify-center gap-2"
            >
              <span>👥</span>
              <span>Выбрать из моих профилей</span>
            </button>
          )}

          {profiles.length === 0 && (
            <p className="mt-4 text-sm text-gray-500">
              Нет созданных профилей. Добавьте их в разделе «Профили».
            </p>
          )}
        </div>
      )}

      {/* Модальное окно выбора профиля */}
      {showProfileModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black-70"
          onClick={() => setShowProfileModal(false)}
        >
          <div
            className="bg-dark-card border border-dark rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-light mb-4">Выберите профиль</h3>
            {profiles.length === 0 ? (
              <p className="text-gray-400 mb-4">Нет профилей. Создайте их в разделе «Профили».</p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {profiles.map(profile => (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => {
                      onSelectProfile(profile.id)
                      setShowProfileModal(false)
                    }}
                    className="text-left p-3 rounded-lg border border-dark bg-dark-bg hover-bg-dark-hover transition-colors flex items-center gap-3"
                  >
                    <span className="text-2xl">{profile.avatar}</span>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-light truncate">{profile.name}</h4>
                      <p className="text-sm text-gray-400">
                        {relationshipTypeLabels[profile.relationshipType] ?? profile.relationshipType}
                        {profile.completeness != null && ` · ${profile.completeness}%`}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowProfileModal(false)}
              className="mt-4 w-full py-2 rounded-lg text-gray-400 hover-text-light"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
