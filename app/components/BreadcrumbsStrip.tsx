'use client'

import { useRef, useState, useCallback, useLayoutEffect } from 'react'
import { useAppData } from '../hooks/useAppData'
import type { Profile } from '../data/profiles'

const CENTER_ANIMATION_MS = 300

interface BreadcrumbsStripProps {
  manipulatorRole: string | null
  victimRole: string | null
  targetAction: string | null
  currentStep: number
  selectedProfile?: Profile
  onStepClick?: (stepNum: number) => void
}

export default function BreadcrumbsStrip({
  manipulatorRole,
  victimRole,
  targetAction,
  currentStep,
  selectedProfile,
  onStepClick
}: BreadcrumbsStripProps) {
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
  const trackRef = useRef<HTMLDivElement>(null)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])
  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const draggingRef = useRef(false)
  const hasMovedRef = useRef(false)
  const didDragRef = useRef(false)
  const startX = useRef(0)
  const startTranslateX = useRef(0)
  const translateXRef = useRef(0)
  const pointerIdRef = useRef<number | null>(null)
  translateXRef.current = translateX

  useLayoutEffect(() => {
    if (currentStep < 1 || currentStep > 4) return
    const stepEl = stepRefs.current[currentStep - 1]
    if (!stepEl || !trackRef.current || !scrollRef.current) return
    const viewport = scrollRef.current
    const track = trackRef.current
    const viewportWidth = viewport.clientWidth
    const trackWidth = track.offsetWidth
    const maxScroll = Math.max(0, trackWidth - viewportWidth)
    const stepLeft = stepEl.offsetLeft
    const stepWidth = stepEl.offsetWidth
    const stepCenter = stepLeft + stepWidth / 2
    const viewportCenter = viewportWidth / 2
    let newTranslateX = stepCenter - viewportCenter
    newTranslateX = Math.max(0, Math.min(maxScroll, newTranslateX))
    setIsAnimating(true)
    setTranslateX(newTranslateX)
    const t = setTimeout(() => setIsAnimating(false), CENTER_ANIMATION_MS)
    return () => clearTimeout(t)
  }, [currentStep])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!scrollRef.current || !trackRef.current) return
    const viewport = scrollRef.current
    const track = trackRef.current
    const contentWidth = track.offsetWidth
    const viewportWidth = viewport.clientWidth
    const maxScroll = Math.max(0, contentWidth - viewportWidth)
    e.preventDefault()
    hasMovedRef.current = false
    didDragRef.current = false
    pointerIdRef.current = e.pointerId
    draggingRef.current = true
    setIsDragging(true)
    startX.current = e.clientX
    startTranslateX.current = translateXRef.current

    const onMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerIdRef.current || !scrollRef.current || !trackRef.current) return
      moveEvent.preventDefault()
      hasMovedRef.current = true
      const trackEl = trackRef.current
      const viewportEl = scrollRef.current
      const maxScrollCurrent = Math.max(0, (trackEl?.offsetWidth ?? 0) - (viewportEl?.clientWidth ?? 0))
      const deltaX = moveEvent.clientX - startX.current
      const raw = startTranslateX.current - deltaX
      const clamped = Math.max(0, Math.min(maxScrollCurrent, raw))
      setTranslateX(clamped)
    }

    const endDrag = () => {
      didDragRef.current = hasMovedRef.current
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointercancel', onUp)
      document.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onBlur)
      document.body.style.removeProperty('user-select')
      pointerIdRef.current = null
      draggingRef.current = false
      setIsDragging(false)
    }

    const onUp = (upEvent: PointerEvent) => {
      if (upEvent.pointerId !== pointerIdRef.current) return
      endDrag()
    }

    const onLeave = () => {
      if (!draggingRef.current) return
      endDrag()
    }

    const onBlur = () => {
      if (!draggingRef.current) return
      endDrag()
    }

    document.body.style.userSelect = 'none'
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
    document.addEventListener('pointercancel', onUp)
    document.addEventListener('pointerleave', onLeave)
    window.addEventListener('blur', onBlur)
  }, [])

  return (
    <div className="mb-6 w-full min-w-0">
      <div
        ref={scrollRef}
        role="region"
        aria-label="Хлебные крошки"
        className={`w-full min-w-0 overflow-hidden scrollbar-hide select-none -mx-2 px-2 pb-2 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ touchAction: 'pan-y' }}
        onPointerDown={handlePointerDown}
      >
        <div
          ref={trackRef}
          className={`flex items-center gap-2 py-2 shrink-0 ${isAnimating ? 'transition-transform duration-300 ease-out' : 'transition-none'}`}
          style={{ width: 'max-content', transform: `translateX(${-translateX}px)` }}
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
                ? 'bg-dark-card text-gray-300 cursor-pointer hover:bg-dark-hover'
                : isCurrent
                  ? 'bg-blue-500-20 text-blue-400'
                  : 'bg-dark-bg text-gray-500 opacity-50'
              }
            `

            return (
              <div
                key={step.num}
                ref={el => { stepRefs.current[step.num - 1] = el }}
                className="flex items-center gap-2 flex-shrink-0"
              >
                {isClickable ? (
                  <button
                    type="button"
                    onClick={e => {
                      if (didDragRef.current) {
                        e.preventDefault()
                        return
                      }
                      onStepClick(step.num)
                    }}
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
    </div>
  )
}
