'use client'

import SelectionCard from '../components/SelectionCard'
import { targetActions } from '../data/actions'

interface Step3ActionProps {
  selectedAction: string | null
  onSelect: (actionId: string) => void
}

export default function Step3Action({ selectedAction, onSelect }: Step3ActionProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2 text-light">Шаг 3: Чего вы хотите добиться?</h2>
      <p className="text-gray-400 mb-8">Какую цель вы преследуете?</p>

      <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3 gap-4">
        {targetActions.map(action => (
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
