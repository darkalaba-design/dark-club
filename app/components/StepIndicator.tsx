'use client'

interface StepIndicatorProps {
  currentStep: number
  totalSteps?: number
}

export default function StepIndicator({ currentStep, totalSteps = 3 }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      <div className="text-sm text-gray-400">
        Шаг {currentStep} из {totalSteps}
      </div>
      <div className="flex gap-1 ml-4">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNum = index + 1
          const isActive = stepNum === currentStep
          const isCompleted = stepNum < currentStep

          return (
            <div
              key={stepNum}
              className={`w-2 h-2 rounded-full transition-all ${isActive
                  ? 'bg-blue-500 w-8'
                  : isCompleted
                    ? 'bg-green-500'
                    : 'bg-gray-600'
                }`}
            />
          )
        })}
      </div>
    </div>
  )
}
