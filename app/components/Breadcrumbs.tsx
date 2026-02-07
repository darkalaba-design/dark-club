'use client'

import { useRef, useState, useCallback } from 'react'
import { useAppData } from '../hooks/useAppData'
import type { Profile } from '../data/profiles'

interface BreadcrumbsProps {
  manipulatorRole: string | null
  victimRole: string | null
  targetAction: string | null
  currentStep: number
  selectedProfile?: Profile
  onStepClick?: (stepNum: number) => void
}

export default function Breadcrumbs({
  manipulatorRole,
  victimRole,
  targetAction,
  currentStep,
  selectedProfile,
  onStepClick
}: BreadcrumbsProps) {
  const appData = useAppData()
  const manipulator = appData.manipulatorRoles.find(r => r.id === manipulatorRole)
  const victim = appData.victimRoles.find(r => r.id === victimRole)
  const action = appData.targetActions.find(a => a.id === targetAction)

  const audienceValue = selectedProfile ? selectedProfile.name : victim?.title
  const audienceIcon = selectedProfile ? selectedProfile.avatar : victim?.icon
  const hasResult = currentStep >= 4
  const canGoToResult = manipulatorRole != null && victimRole != null && targetAction != null

  const steps = [
    { num: 1, label: 'Роль', value: manipulator?.title, icon: manipulator?.icon },
    { num: 2, label: 'Аудитория', value: audienceValue, icon: audienceIcon },
    { num: 3, label: 'Цель', value: action?.title, icon: action?.icon },
    { num: 4, label: 'Результат', value: hasResult ? 'Готово' : undefined, icon: '📊' }
  ]

  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)
  const scrollLeftStart = useRef(0)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current || (e.target as HTMLElement).closest('button')) return
    e.preventDefault()
    startX.current = e.pageX
    scrollLeftStart.current = scrollRef.current.scrollLeft
    setIsDragging(true)

    const onMove = (moveEvent: MouseEvent) => {
      if (!scrollRef.current) return
      moveEvent.preventDefault()
      const deltaX = moveEvent.pageX - startX.current
      scrollRef.current.scrollLeft = scrollLeftStart.current - deltaX
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.style.removeProperty('user-select')
      setIsDragging(false)
    }

    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    startX.current = e.touches[0].pageX
    scrollLeftStart.current = scrollRef.current.scrollLeft
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!scrollRef.current) return
    const deltaX = e.touches[0].pageX - startX.current
    scrollRef.current.scrollLeft = scrollLeftStart.current - deltaX
    startX.current = e.touches[0].pageX
    scrollLeftStart.current = scrollRef.current.scrollLeft
  }, [])

  const handleTouchEnd = useCallback(() => setIsDragging(false), [])

  return (
    <div className="mb-6 w-full max-w-full min-w-0 overflow-hidden -mx-2 px-2">
      <div
        ref={scrollRef}
        role="region"
        aria-label="Хлебные крошки"
        className={`flex items-center gap-2 overflow-x-auto overflow-y-hidden pb-2 scrollbar-hide select-none touch-pan-x w-full min-w-0 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ WebkitOverflowScrolling: 'touch' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {steps.map((step, index) => {
          const isCompleted = step.value !== undefined
          const isCurrent = currentStep === step.num
          const isResultStep = step.num === 4
          const isClickable = onStepClick && (isResultStep ? (currentStep >= 4 || canGoToResult) : isCompleted)
          const showSeparator = index < steps.length - 1

          const stepContent = (
            <>
              {step.icon && <span className="text-base">{step.icon}</span>}
              <div className="flex flex-col text-left">
                <span className="text-xs text-gray-400">{step.label}</span>
                {step.value ? (
                  <span className="font-medium text-xs leading-tight max-w-[120px] truncate">
                    {step.value}
                  </span>
                ) : (
                  <span className="text-xs text-gray-500">Не выбрано</span>
                )}
              </div>
            </>
          )

          const stepClassName = `
            flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all
            ${isCompleted && !isCurrent
              ? 'bg-dark-card text-gray-300 cursor-pointer hover-bg-dark-hover'
              : isCurrent
                ? 'bg-blue-500-20 text-blue-400'
                : 'bg-dark-bg text-gray-500 opacity-50'
            }
          `

          return (
            <div key={step.num} className="flex items-center gap-2 flex-shrink-0">
              {isClickable ? (
                <button
                  type="button"
                  onClick={() => onStepClick(step.num)}
                  onMouseDown={e => e.stopPropagation()}
                  className={stepClassName}
                >
                  {stepContent}
                </button>
              ) : (
                <div className={stepClassName}>
                  {stepContent}
                </div>
              )}
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
