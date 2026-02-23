'use client'

import { useEffect } from 'react'
import { useAppState } from '../hooks/useAppState'
import { useAppData, useRecommendations } from '../hooks/useAppData'
import { useProfiles } from '../hooks/useProfiles'
import { relationshipTypeToVictimRoleId } from '../data/profiles'
import StepIndicator from './StepIndicator'
import BreadcrumbsStrip from './BreadcrumbsStrip'
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
    setTargetActionDetail,
    setSelectedProfileId,
    setAudienceContext,
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
  }

  const handleActionDetailSelected = (detail: string) => {
    setTargetActionDetail(detail)
    setTimeout(() => nextStep(), 300)
  }

  const handleBack = () => {
    prevStep()
  }

  const handleVictimSelect = (roleId: string) => {
    setSelectedProfileId(null)
    setVictimRole(roleId)
  }

  const handleProfileSelect = (profileId: string) => {
    const profile = getProfile(profileId)
    if (!profile) return
    setVictimRole(null)
    setSelectedProfileId(profileId)
    setVictimRole(relationshipTypeToVictimRoleId[profile.relationshipType] ?? 'stranger')
  }

  const handleContextSelected = (contextId: import('../hooks/useAppState').AudienceContextId) => {
    setAudienceContext(contextId)
    setTimeout(() => nextStep(), 300)
  }

  const isHome = state.mainSection === 'analysis' && state.currentStep === 0
  const isAnalysis = state.mainSection === 'analysis' && state.currentStep > 0
  const isProfiles = state.mainSection === 'profiles'

  return (
    <div className="min-h-full flex flex-col flex-1 pb-bottom-nav">
      {/* Раздел Профили */}
      {state.mainSection === 'profiles' && (
        <div className="max-w-6xl w-full mx-auto py-4 md-py-8">
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
            <WelcomeScreen
              onStart={handleStart}
              onShowAllScenarios={() => { setMainSection('profiles'); setProfileDetailId(null) }}
            />
          ) : (
            <div className="max-w-6xl w-full mx-auto py-4 md-py-8">
              <div className="mb-6 w-full min-w-0">
                {state.currentStep >= 1 && state.currentStep <= 4 && (
                  <BreadcrumbsStrip
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
                  onContextSelected={handleContextSelected}
                  profiles={profilesWithCompleteness}
                  getProfile={getProfile}
                />
              )}

              {state.currentStep === 3 && (
                <Step3Action
                  selectedAction={state.targetAction}
                  onSelect={handleActionSelect}
                  onActionDetailSelected={handleActionDetailSelected}
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
                  audienceContext={state.audienceContext}
                  targetActionDetail={state.targetActionDetail}
                  onReset={reset}
                />
              )}
            </div>
          )}
        </>
      )}

      {/* Нижнее меню: иконка + подпись, как в приложениях */}
      <nav className="bottom-nav bg-dark-bg border-t border-dark" aria-label="Нижняя навигация">
        <button
          type="button"
          onClick={() => { setMainSection('analysis'); goToStep(0) }}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 min-w-0 text-xs font-medium transition-colors border-0 bg-transparent rounded-none ${isHome ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
          aria-current={isHome ? 'page' : undefined}
        >
          <span className="text-xl leading-none" aria-hidden>🏠</span>
          <span>Главная</span>
        </button>
        <button
          type="button"
          onClick={() => { setMainSection('analysis'); goToStep(1) }}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 min-w-0 text-xs font-medium transition-colors border-0 bg-transparent rounded-none ${isAnalysis ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
          aria-current={isAnalysis ? 'page' : undefined}
        >
          <span className="text-xl leading-none" aria-hidden>🎭</span>
          <span>Анализ</span>
        </button>
        <button
          type="button"
          onClick={() => { setMainSection('profiles'); setProfileDetailId(null) }}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 min-w-0 text-xs font-medium transition-colors border-0 bg-transparent rounded-none ${isProfiles ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
          aria-current={isProfiles ? 'page' : undefined}
        >
          <span className="text-xl leading-none" aria-hidden>👥</span>
          <span>Профили</span>
        </button>
      </nav>
    </div>
  )
}