'use client'

import { useState } from 'react'
import TargetCard from '../components/TargetCard'
import ProfileTargetCard from '../components/ProfileTargetCard'
import TechniqueCard from '../components/TechniqueCard'
import TechniqueDetailModal from '../components/TechniqueDetailModal'
import Accordion from '../components/Accordion'
import { useAppData } from '../hooks/useAppData'
import { Technique } from '../data/techniques'
import { Target } from '../data/targets'
import type { Profile } from '../data/profiles'
import { relationshipTypeLabels } from '../data/profiles'
import { psychotypes } from '../data/psychotypes'
import type { ProfileTargetItem } from '../data/matchingLogic'

interface Step4ResultsProps {
  manipulatorRole: string | null
  victimRole: string | null
  targetAction: string | null
  targets: Target[]
  techniques: Technique[]
  profileTargets?: ProfileTargetItem[]
  selectedProfile?: Profile
  onReset: () => void
}

export default function Step4Results({
  manipulatorRole,
  victimRole,
  targetAction,
  targets,
  techniques,
  profileTargets = [],
  selectedProfile,
  onReset
}: Step4ResultsProps) {
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null)
  const appData = useAppData()

  const manipulator = appData.manipulatorRoles.find(r => r.id === manipulatorRole)
  const victim = appData.victimRoles.find(r => r.id === victimRole)
  const action = appData.targetActions.find(a => a.id === targetAction)
  const psychotype = selectedProfile?.psychotype
    ? psychotypes.find(p => p.id === selectedProfile.psychotype)
    : null

  const handleReset = () => {
    if (window.confirm('Вы уверены, что хотите начать заново?')) {
      onReset()
    }
  }

  return (
    <div>
      {/* Сводка */}
      <Accordion title="Ваш сценарий" icon="📊" defaultOpen={true}>
        <div className="space-y-3 text-gray-300 pt-2">
          <div className="flex items-start gap-2">
            <strong className="text-light min-w-[80px]">Роль:</strong>
            <span>{manipulator?.title || 'Не выбрано'}</span>
          </div>
          <div className="flex items-start gap-2">
            <strong className="text-light min-w-[80px]">Аудитория:</strong>
            <span>
              {selectedProfile
                ? `${selectedProfile.name} (${relationshipTypeLabels[selectedProfile.relationshipType] ?? selectedProfile.relationshipType})`
                : victim?.title || 'Не выбрано'}
            </span>
          </div>
          {selectedProfile && psychotype && (
            <div className="flex items-start gap-2">
              <strong className="text-light min-w-[80px]">Психотип:</strong>
              <span>{psychotype.title} {psychotype.icon}</span>
            </div>
          )}
          <div className="flex items-start gap-2">
            <strong className="text-light min-w-[80px]">Цель:</strong>
            <span>{action?.title || 'Не выбрано'}</span>
          </div>
        </div>
      </Accordion>

      {/* Мишени: базовые + из профиля */}
      <Accordion title="Уязвимые мишени" icon="🎯" defaultOpen={true}>
        <div className="grid grid-cols-1 gap-4 pt-2">
          {targets.map(target => (
            <TargetCard key={target.id} target={target} />
          ))}
          {selectedProfile && profileTargets.length > 0 && profileTargets.map(item => (
            <ProfileTargetCard
              key={item.id}
              item={item}
              profileName={selectedProfile.name}
            />
          ))}
        </div>
      </Accordion>

      {/* Техники */}
      <Accordion title="Рекомендуемые техники" icon="🛠️" defaultOpen={true}>
        <div className="grid grid-cols-1 gap-4 pt-2">
          {techniques.map(technique => (
            <TechniqueCard
              key={technique.id}
              technique={technique}
              onClick={() => setSelectedTechnique(technique)}
            />
          ))}
          {selectedProfile && psychotype && (
            <div className="bg-dark-card border border-dark rounded-xl p-5" style={{ borderLeft: '4px solid #8b5cf6' }}>
              <div className="text-xs font-semibold text-purple-400 mb-1">
                💼 Особенности для {selectedProfile.name} ({psychotype.title})
              </div>
              <p className="text-sm text-gray-300">{psychotype.communication}</p>
            </div>
          )}
        </div>
      </Accordion>

      {/* Кнопки */}
      <div className="flex flex-col sm-flex-row gap-4">
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-dark-card-light hover-bg-dark-hover text-light rounded-lg font-medium transition-colors border border-dark"
        >
          Начать заново
        </button>
      </div>

      {/* Модальное окно техники */}
      <TechniqueDetailModal
        technique={selectedTechnique}
        onClose={() => setSelectedTechnique(null)}
      />
    </div>
  )
}
