'use client'

import { useEffect } from 'react'
import { useAppState } from '../hooks/useAppState'
import { getRecommendations } from '../data/matchingLogic'
import { targets } from '../data/targets'
import { techniques } from '../data/techniques'
import StepIndicator from './StepIndicator'
import Breadcrumbs from './Breadcrumbs'
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

  const handleRoleSelect = (roleId: string) => {
    setManipulatorRole(roleId)
    setTimeout(() => nextStep(), 300) // Небольшая задержка для плавности
  }

  const handleVictimSelect = (roleId: string) => {
    setVictimRole(roleId)
    setTimeout(() => nextStep(), 300)
  }

  const handleActionSelect = (actionId: string) => {
    setTargetAction(actionId)
    setTimeout(() => nextStep(), 300)
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
        <div className="max-w-6xl mx-auto px-4 py-4 md-py-8">
          {/* Кнопка назад и хлебные крошки */}
          <div className="mb-6">
            {state.currentStep > 1 && state.currentStep < 4 && (
              <button
                onClick={handleBack}
                className="mb-4 flex items-center gap-2 text-gray-400 hover-text-light transition-colors text-sm"
              >
                <span>←</span>
                <span>Назад</span>
              </button>
            )}
            {state.currentStep <= 3 && (
              <Breadcrumbs
                manipulatorRole={state.manipulatorRole}
                victimRole={state.victimRole}
                targetAction={state.targetAction}
                currentStep={state.currentStep}
              />
            )}
          </div>

          {/* Индикатор прогресса */}
          {state.currentStep <= 3 && (
            <StepIndicator currentStep={state.currentStep} totalSteps={3} />
          )}

          {/* Контент шагов */}
          {state.currentStep === 1 && (
            <Step1Manipulator
              selectedRole={state.manipulatorRole}
              onSelect={handleRoleSelect}
            />
          )}

          {state.currentStep === 2 && (
            <Step2Victim
              selectedRole={state.victimRole}
              onSelect={handleVictimSelect}
            />
          )}

          {state.currentStep === 3 && (
            <Step3Action
              selectedAction={state.targetAction}
              onSelect={handleActionSelect}
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
        </div>
      )}
    </div>
  )
}
