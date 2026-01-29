'use client'

import { useState } from 'react'
import ProfileCard from '../components/ProfileCard'
import CreateProfileModal from '../components/CreateProfileModal'
import { useProfiles } from '../hooks/useProfiles'
interface ProfilesListScreenProps {
  onOpenProfile?: (id: string) => void
  onBack?: () => void
}

export default function ProfilesListScreen({ onOpenProfile, onBack }: ProfilesListScreenProps) {
  const { profiles, addProfile } = useProfiles()
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleCreate = (name: string, avatar: string, relationshipType: string) => {
    const newProfile = addProfile(name, avatar, relationshipType)
    setShowCreateModal(false)
    onOpenProfile?.(newProfile.id)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover-text-light transition-colors text-sm"
          >
            <span>←</span>
            <span>Назад</span>
          </button>
        )}
        <div className="flex-1" />
      </div>
      <h1 className="text-2xl font-bold text-light mb-2">Мои профили</h1>
      <p className="text-gray-400 mb-8">Люди, с которыми вы общаетесь</p>

      <button
        onClick={() => setShowCreateModal(true)}
        className="w-full md-w-auto mb-8 px-6 py-3 bg-blue-500 hover-bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <span>+</span>
        <span>Добавить профиль</span>
      </button>

      {profiles.length === 0 ? (
        <div className="text-center py-16 bg-dark-card border border-dark rounded-xl">
          <div className="text-6xl mb-4">🎭</div>
          <p className="text-gray-300 mb-6 max-w-md mx-auto">
            Создайте профили людей, чтобы анализировать их психологию и строить стратегии влияния.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-500 hover-bg-blue-600 text-white font-medium rounded-lg transition-colors"
          >
            Создать первый профиль
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
          {profiles.map(profile => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onClick={() => onOpenProfile?.(profile.id)}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateProfileModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  )
}
