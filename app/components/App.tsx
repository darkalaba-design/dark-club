'use client'

import { useEffect } from 'react'
import { useAppState } from '../hooks/useAppState'
import { useAppData, useRecommendations } from '../hooks/useAppData'
import { useProfiles } from '../hooks/useProfiles'
import { relationshipTypeToVictimRoleId } from '../data/profiles'
import StepIndicator from './StepIndicator'
import Breadcrumbs from './Breadcrumbs'
import WelcomeScreen from '../screens/WelcomeScreen'
import Step1Manipulator from '../screens/Step1Manipulator'
import Step2Victim from '../screens/Step2Victim'
import Step3Action from '../screens/Step3Action'
import Step4Results from '../screens/Step4Results'
import ProfilesListScreen from '../screens/ProfilesListScreen'
import ProfileDetailScreen from '../screens/ProfileDetailScreen'

export default function App() {
  const appData = useAppData()
  const { getProfile, profiles: profilesWithCompleteness, markProfileUsed } = useProfiles()
  const {
    state,
    nextStep,
    prevStep,
    setManipulatorRole,
    setVictimRole,
    setTargetAction,
    setSelectedProfileId,
    setMainSection,
    setProfileDetailId,
    setSelectedTechnique,
    setResults,
    reset,
    goToStep
  } = useAppState()

  const selectedProfile = state.selectedProfileId ? getProfile(state.selectedProfileId) : null
  const recommendations = useRecommendations(
    state.manipulatorRole,
    state.victimRole,
    state.targetAction,
    appData,
    selectedProfile ?? null
  )

  useEffect(() => {
    if (!appData.loading) {
      setResults(recommendations)
    }
  }, [state.manipulatorRole, state.victimRole, state.targetAction, state.selectedProfileId, appData.loading, setResults])

  useEffect(() => {
    if (state.currentStep === 4 && state.selectedProfileId) {
      markProfileUsed(state.selectedProfileId)
    }
  }, [state.currentStep, state.selectedProfileId, markProfileUsed])

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

  const handleVictimSelect = (roleId: string) => {
    setSelectedProfileId(null)
    setVictimRole(roleId)
    setTimeout(() => nextStep(), 300)
  }

  const handleProfileSelect = (profileId: string) => {
    const profile = getProfile(profileId)
    if (!profile) return
    setVictimRole(null)
    setSelectedProfileId(profileId)
    setVictimRole(relationshipTypeToVictimRoleId[profile.relationshipType] ?? 'stranger')
    setTimeout(() => nextStep(), 300)
  }

  return (
    <div className="min-h-screen">
      {/* Навигация: Главная, Анализ, Профили */}
      <nav className="border-b border-dark bg-dark-bg sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            type="button"
            style={{ backgroundColor: 'unset', background: 'unset', border: 'none', borderWidth: 0, borderColor: 'transparent', borderStyle: 'none', borderImage: 'none' }}
            onClick={() => { setMainSection('analysis'); goToStep(0) }}
            className={`bg-transparent border-0 border-none border-transparent text-sm font-medium transition-colors ${state.mainSection === 'analysis' && state.currentStep === 0 ? 'text-blue-400' : 'text-gray-400 hover-text-light'}`}
          >
            🏠 Главная
          </button>
          <button
            type="button"
            style={{ backgroundColor: 'unset', background: 'unset', border: 'none', borderWidth: 0, borderColor: 'transparent', borderStyle: 'none', borderImage: 'none' }}
            onClick={() => { setMainSection('analysis'); goToStep(1) }}
            className={`bg-transparent border-0 border-none border-transparent text-sm font-medium transition-colors ${state.mainSection === 'analysis' && state.currentStep > 0 ? 'text-blue-400' : 'text-gray-400 hover-text-light'}`}
          >
            🎭 Анализ
          </button>
          <button
            type="button"
            style={{ backgroundColor: 'unset', background: 'unset', border: 'none', borderWidth: 0, borderColor: 'transparent', borderStyle: 'none', borderImage: 'none' }}
            onClick={() => { setMainSection('profiles'); setProfileDetailId(null) }}
            className={`bg-transparent border-0 border-none border-transparent text-sm font-medium transition-colors ${state.mainSection === 'profiles' ? 'text-blue-400' : 'text-gray-400 hover-text-light'}`}
          >
            👥 Профили
          </button>
        </div>
      </nav>

      {/* Раздел Профили */}
      {state.mainSection === 'profiles' && (
        <div className="max-w-6xl mx-auto py-4 md-py-8">
          {state.profileDetailId ? (
            <ProfileDetailScreen
              profileId={state.profileDetailId}
              onBack={() => setProfileDetailId(null)}
            />
          ) : (
            <ProfilesListScreen
              onBack={() => setMainSection('analysis')}
              onOpenProfile={id => setProfileDetailId(id)}
            />
          )}
        </div>
      )}

      {/* Раздел Анализ */}
      {state.mainSection === 'analysis' && (
        <>
          {state.currentStep === 0 ? (
            <WelcomeScreen onStart={handleStart} />
          ) : (
            <div className="max-w-6xl mx-auto py-4 md-py-8">
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
                    selectedProfile={selectedProfile ?? undefined}
                    onStepClick={goToStep}
                  />
                )}
              </div>

              {state.currentStep <= 3 && (
                <StepIndicator currentStep={state.currentStep} totalSteps={3} />
              )}

              {state.currentStep === 1 && (
                <Step1Manipulator
                  selectedRole={state.manipulatorRole}
                  onSelect={handleRoleSelect}
                />
              )}

              {state.currentStep === 2 && (
                <Step2Victim
                  selectedRole={state.victimRole}
                  selectedProfileId={state.selectedProfileId}
                  onSelect={handleVictimSelect}
                  onSelectProfile={handleProfileSelect}
                  profiles={profilesWithCompleteness}
                  getProfile={getProfile}
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
                  profileTargets={state.results.profileTargets}
                  selectedProfile={selectedProfile ?? undefined}
                  onReset={reset}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
