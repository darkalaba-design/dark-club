'use client'

import type { Profile } from '../data/profiles'
import { relationshipTypeLabels } from '../data/profiles'
import { calculateCompleteness } from '../data/profiles'

interface ProfileCardProps {
  profile: Profile & { completeness?: number }
  onClick: () => void
}

export default function ProfileCard({ profile, onClick }: ProfileCardProps) {
  const completeness = profile.completeness ?? calculateCompleteness(profile)
  const relationLabel = relationshipTypeLabels[profile.relationshipType] ?? profile.relationshipType
  const lastUsed = profile.lastUsed
    ? new Date(profile.lastUsed).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
    : null

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-dark-card border border-dark rounded-xl p-4 hover-bg-dark-hover transition-colors hover-transform -translate-y-1"
    >
      <div className="flex items-start gap-4">
        <span className="text-4xl flex-shrink-0">{profile.avatar}</span>
        <div className="min-w-0 flex-1 flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-light truncate">{profile.name}</h3>
          <span className="inline-block px-2 py-0.5 rounded text-xs text-gray-400">
            {relationLabel}
          </span>
          <div className="h-1.5 rounded-full bg-dark-bg overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${completeness}%` }}
            />
          </div>
          {lastUsed && (
            <p className="text-xs text-gray-500">Использован: {lastUsed}</p>
          )}
        </div>
      </div>
    </button>
  )
}
