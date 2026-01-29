'use client'

import type { ProfileTargetItem } from '../data/matchingLogic'
import type { Complex } from '../data/complexes'
import type { Shadow } from '../data/shadows'

function isComplex(item: ProfileTargetItem): item is Complex {
  return 'howToUse' in item && 'manifestations' in item
}

interface ProfileTargetCardProps {
  item: ProfileTargetItem
  profileName: string
}

export default function ProfileTargetCard({ item, profileName }: ProfileTargetCardProps) {
  const isShadow = !isComplex(item)
  const badgeLabel = isShadow ? 'Тень' : 'Из профиля'
  const tipLabel = isShadow ? 'Как работать:' : 'Как использовать:'
  const tipText = isShadow ? (item as Shadow).howToWork : (item as Complex).howToUse

  return (
    <div className="bg-dark-card border border-dark rounded-xl p-5 hover-border-dark-hover transition-all">
      <div className="flex items-start gap-4">
        <div className="text-4xl">{item.icon}</div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-light">{item.title}</h3>
            <span className="text-xs px-2 py-0.5 rounded bg-dark-bg text-gray-400 border border-dark">
              {badgeLabel}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-dark-bg text-purple-400 border border-dark">
              Из профиля {profileName}
            </span>
          </div>
          <p className="text-sm text-gray-400 mb-4 opacity-80">{item.description}</p>
          <div className="bg-dark-bg rounded-lg p-3 border border-dark">
            <div className="text-xs font-semibold text-yellow-400 mb-1">💡 {tipLabel}</div>
            <p className="text-sm text-gray-300">{tipText}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
