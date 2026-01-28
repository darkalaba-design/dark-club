'use client'

import { useState } from 'react'
import TargetCard from '../components/TargetCard'
import TechniqueCard from '../components/TechniqueCard'
import TechniqueDetailModal from '../components/TechniqueDetailModal'
import EthicsChecklist from '../components/EthicsChecklist'
import { manipulatorRoles } from '../data/roles'
import { victimRoles } from '../data/roles'
import { targetActions } from '../data/actions'
import { Technique } from '../data/techniques'
import { Target } from '../data/targets'

interface Step4ResultsProps {
  manipulatorRole: string | null
  victimRole: string | null
  targetAction: string | null
  targets: Target[]
  techniques: Technique[]
  ethicsChecklist: {
    noHarm: boolean
    openDialogue: boolean
    trustPreserved: boolean
  }
  onEthicsChange: (checklist: Partial<Step4ResultsProps['ethicsChecklist']>) => void
  onReset: () => void
}

export default function Step4Results({
  manipulatorRole,
  victimRole,
  targetAction,
  targets,
  techniques,
  ethicsChecklist,
  onEthicsChange,
  onReset
}: Step4ResultsProps) {
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null)
  const [showWarning, setShowWarning] = useState(false)

  const manipulator = manipulatorRoles.find(r => r.id === manipulatorRole)
  const victim = victimRoles.find(r => r.id === victimRole)
  const action = targetActions.find(a => a.id === targetAction)

  const handleReset = () => {
    if (window.confirm('Вы уверены, что хотите начать заново?')) {
      onReset()
    }
  }

  const handleSavePDF = () => {
    // Заглушка
    alert('Экспорт в PDF будет доступен в следующей версии')
  }

  return (
    <div>
      {/* Сводка */}
      <div className="bg-dark-card border border-dark rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4 text-light flex items-center gap-2">
          📊 Ваш сценарий:
        </h3>
        <div className="space-y-2 text-gray-300">
          <div><strong className="text-light">Роль:</strong> {manipulator?.title || 'Не выбрано'}</div>
          <div><strong className="text-light">Аудитория:</strong> {victim?.title || 'Не выбрано'}</div>
          <div><strong className="text-light">Цель:</strong> {action?.title || 'Не выбрано'}</div>
        </div>
      </div>

      {/* Мишени */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold mb-6 text-light flex items-center gap-2">
          🎯 УЯЗВИМЫЕ МИШЕНИ
        </h3>
        <div className="grid grid-cols-1 lg-grid-cols-2 gap-4">
          {targets.map(target => (
            <TargetCard key={target.id} target={target} />
          ))}
        </div>
      </div>

      {/* Техники */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold mb-6 text-light flex items-center gap-2">
          🛠️ РЕКОМЕНДУЕМЫЕ ТЕХНИКИ
        </h3>
        <div className="grid grid-cols-1 lg-grid-cols-2 gap-4">
          {techniques.map(technique => (
            <TechniqueCard
              key={technique.id}
              technique={technique}
              onClick={() => setSelectedTechnique(technique)}
            />
          ))}
        </div>
      </div>

      {/* Этический чек-лист */}
      <div className="mb-8">
        <EthicsChecklist
          checklist={ethicsChecklist}
          onChange={onEthicsChange}
          showWarning={showWarning}
        />
      </div>

      {/* Кнопки */}
      <div className="flex flex-col sm-flex-row gap-4 justify-between">
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-dark-card-light hover-bg-dark-hover text-light rounded-lg font-medium transition-colors border border-dark"
        >
          Начать заново
        </button>
        <button
          onClick={handleSavePDF}
          disabled
          className="px-6 py-3 bg-dark-card-light text-gray-500 rounded-lg font-medium cursor-not-allowed opacity-50 border border-dark"
          title="Скоро"
        >
          Сохранить в PDF
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
