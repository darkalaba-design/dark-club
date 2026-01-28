'use client'

import { useState } from 'react'
import TargetCard from '../components/TargetCard'
import TechniqueCard from '../components/TechniqueCard'
import TechniqueDetailModal from '../components/TechniqueDetailModal'
import EthicsChecklist from '../components/EthicsChecklist'
import Accordion from '../components/Accordion'
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
      <Accordion title="Ваш сценарий" icon="📊" defaultOpen={true}>
        <div className="space-y-3 text-gray-300 pt-2">
          <div className="flex items-start gap-2">
            <strong className="text-light min-w-[80px]">Роль:</strong>
            <span>{manipulator?.title || 'Не выбрано'}</span>
          </div>
          <div className="flex items-start gap-2">
            <strong className="text-light min-w-[80px]">Аудитория:</strong>
            <span>{victim?.title || 'Не выбрано'}</span>
          </div>
          <div className="flex items-start gap-2">
            <strong className="text-light min-w-[80px]">Цель:</strong>
            <span>{action?.title || 'Не выбрано'}</span>
          </div>
        </div>
      </Accordion>

      {/* Мишени */}
      <Accordion title="Уязвимые мишени" icon="🎯" defaultOpen={true}>
        <div className="grid grid-cols-1 gap-4 pt-2">
          {targets.map(target => (
            <TargetCard key={target.id} target={target} />
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
        </div>
      </Accordion>

      {/* Этический чек-лист */}
      <Accordion title="Этический чек-лист" icon="⚠️" defaultOpen={true}>
        <div className="pt-2">
          <EthicsChecklist
            checklist={ethicsChecklist}
            onChange={onEthicsChange}
            showWarning={showWarning}
          />
        </div>
      </Accordion>

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
