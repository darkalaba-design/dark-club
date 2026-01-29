'use client'

import { useAppData } from '../hooks/useAppData'
import type { Profile } from '../data/profiles'

interface BreadcrumbsProps {
  manipulatorRole: string | null
  victimRole: string | null
  targetAction: string | null
  currentStep: number
  selectedProfile?: Profile
}

export default function Breadcrumbs({
  manipulatorRole,
  victimRole,
  targetAction,
  currentStep,
  selectedProfile
}: BreadcrumbsProps) {
  const appData = useAppData()
  const manipulator = appData.manipulatorRoles.find(r => r.id === manipulatorRole)
  const victim = appData.victimRoles.find(r => r.id === victimRole)
  const action = appData.targetActions.find(a => a.id === targetAction)

  const audienceValue = selectedProfile ? selectedProfile.name : victim?.title
  const audienceIcon = selectedProfile ? selectedProfile.avatar : victim?.icon

  const steps = [
    { num: 1, label: 'Роль', value: manipulator?.title, icon: manipulator?.icon },
    { num: 2, label: 'Аудитория', value: audienceValue, icon: audienceIcon },
    { num: 3, label: 'Цель', value: action?.title, icon: action?.icon }
  ]

  return (
    <div className="mb-6 px-2">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {steps.map((step, index) => {
          const isCompleted = step.value !== undefined
          const isCurrent = currentStep === step.num
          const showSeparator = index < steps.length - 1

          return (
            <div key={step.num} className="flex items-center gap-2 flex-shrink-0">
              <div
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all
                  ${isCompleted && !isCurrent
                    ? 'bg-dark-card border border-dark text-gray-300'
                    : isCurrent
                      ? 'bg-blue-500-20 border border-blue-500-30 text-blue-400'
                      : 'bg-dark-bg border border-dark text-gray-500 opacity-50'
                  }
                `}
              >
                {step.icon && <span className="text-base">{step.icon}</span>}
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400">{step.label}</span>
                  {step.value ? (
                    <span className="font-medium text-xs leading-tight max-w-[120px] truncate">
                      {step.value}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500">Не выбрано</span>
                  )}
                </div>
              </div>
              {showSeparator && (
                <div className="text-gray-600 text-xs mx-1">→</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
