'use client'

import SelectionCard from '../components/SelectionCard'
import { manipulatorRoles } from '../data/roles'

interface Step1ManipulatorProps {
  selectedRole: string | null
  onSelect: (roleId: string) => void
}

export default function Step1Manipulator({ selectedRole, onSelect }: Step1ManipulatorProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2 text-light">Шаг 1: Выберите свою роль</h2>
      <p className="text-gray-400 mb-8">Кто вы в этой ситуации?</p>

      <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3 gap-4">
        {manipulatorRoles.map(role => (
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
    </div>
  )
}
