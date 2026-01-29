'use client'

import SelectionCard from '../components/SelectionCard'
import { useAppData } from '../hooks/useAppData'

interface Step3ActionProps {
  selectedAction: string | null
  onSelect: (actionId: string) => void
}

export default function Step3Action({ selectedAction, onSelect }: Step3ActionProps) {
  const appData = useAppData()

  if (appData.loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Загрузка данных...</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2 text-light">Шаг 3: Чего вы хотите добиться?</h2>
      <p className="text-gray-400 mb-8">Какую цель вы преследуете?</p>

      <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3 gap-4">
        {appData.targetActions.map(action => (
          <SelectionCard
            key={action.id}
            icon={action.icon}
            title={action.title}
            description={action.description}
            selected={selectedAction === action.id}
            onClick={() => onSelect(action.id)}
          />
        ))}
      </div>
    </div>
  )
}
