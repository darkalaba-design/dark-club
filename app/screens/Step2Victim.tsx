'use client'

import SelectionCard from '../components/SelectionCard'
import { victimRoles } from '../data/roles'

interface Step2VictimProps {
  selectedRole: string | null
  onSelect: (roleId: string) => void
}

export default function Step2Victim({ selectedRole, onSelect }: Step2VictimProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2 text-light">Шаг 2: Кто ваша аудитория?</h2>
      <p className="text-gray-400 mb-8">На кого вы хотите воздействовать?</p>

      <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3 gap-4">
        {victimRoles.map(role => (
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
