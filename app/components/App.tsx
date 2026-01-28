'use client'

import { useEffect } from 'react'
import { useAppState } from '../hooks/useAppState'
import { getRecommendations } from '../data/matchingLogic'
import { targets } from '../data/targets'
import { techniques } from '../data/techniques'
import StepIndicator from './StepIndicator'
import WelcomeScreen from '../screens/WelcomeScreen'
import Step1Manipulator from '../screens/Step1Manipulator'
import Step2Victim from '../screens/Step2Victim'
import Step3Action from '../screens/Step3Action'
import Step4Results from '../screens/Step4Results'

export default function App() {
  const {
    state,
    nextStep,
    prevStep,
    setManipulatorRole,
    setVictimRole,
    setTargetAction,
    setSelectedTechnique,
    setResults,
    setEthicsChecklist,
    reset,
    goToStep
  } = useAppState()

  // Вычисляем результаты при изменении выбора
  useEffect(() => {
    if (state.manipulatorRole && state.victimRole && state.targetAction) {
      const results = getRecommendations(
        state.manipulatorRole,
        state.victimRole,
        state.targetAction,
        targets,
        techniques
      )
      setResults(results)
    }
  }, [state.manipulatorRole, state.victimRole, state.targetAction, setResults])

  const handleStart = () => {
    goToStep(1)
  }

  const handleNext = () => {
    if (state.currentStep === 1 && !state.manipulatorRole) return
    if (state.currentStep === 2 && !state.victimRole) return
    if (state.currentStep === 3 && !state.targetAction) return
    nextStep()
  }

  const handleBack = () => {
    prevStep()
  }

  const canProceed = () => {
    if (state.currentStep === 1) return state.manipulatorRole !== null
    if (state.currentStep === 2) return state.victimRole !== null
    if (state.currentStep === 3) return state.targetAction !== null
    return false
  }

  return (
    <div className="min-h-screen">
      {state.currentStep === 0 ? (
        <WelcomeScreen onStart={handleStart} />
      ) : (
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Индикатор прогресса */}
          {state.currentStep <= 3 && (
            <StepIndicator currentStep={state.currentStep} totalSteps={3} />
          )}

          {/* Контент шагов */}
          {state.currentStep === 1 && (
            <Step1Manipulator
              selectedRole={state.manipulatorRole}
              onSelect={setManipulatorRole}
            />
          )}

          {state.currentStep === 2 && (
            <Step2Victim
              selectedRole={state.victimRole}
              onSelect={setVictimRole}
            />
          )}

          {state.currentStep === 3 && (
            <Step3Action
              selectedAction={state.targetAction}
              onSelect={setTargetAction}
            />
          )}

          {state.currentStep === 4 && (
            <Step4Results
              manipulatorRole={state.manipulatorRole}
              victimRole={state.victimRole}
              targetAction={state.targetAction}
              targets={state.results.targets}
              techniques={state.results.techniques}
              ethicsChecklist={state.ethicsChecklist}
              onEthicsChange={setEthicsChecklist}
              onReset={reset}
            />
          )}

          {/* Навигация */}
          {state.currentStep > 0 && state.currentStep < 4 && (
            <div className="flex justify-between mt-12 pt-8 border-t border-dark">
              <button
                onClick={handleBack}
                disabled={state.currentStep === 1}
                className={`
                  px-6 py-3 rounded-lg font-medium transition-all
                  ${state.currentStep === 1
                    ? 'bg-dark-card-light text-gray-500 cursor-not-allowed opacity-50'
                    : 'bg-dark-card-light hover-bg-dark-hover text-light border border-dark'
                  }
                `}
              >
                ← Назад
              </button>

              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`
                  px-8 py-3 rounded-lg font-semibold transition-all
                  ${canProceed()
                    ? 'bg-blue-500 hover-bg-blue-600 text-white'
                    : 'bg-dark-card-light text-gray-500 cursor-not-allowed opacity-50'
                  }
                `}
              >
                Далее →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
