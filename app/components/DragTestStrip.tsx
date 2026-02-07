'use client'

import { useRef, useState, useCallback, useEffect } from 'react'

const CARDS = [
  { id: 1, label: 'Плашка 1', color: 'bg-dark-card' },
  { id: 2, label: 'Плашка 2', color: 'bg-dark-card' },
  { id: 3, label: 'Плашка 3', color: 'bg-dark-card' },
  { id: 4, label: 'Плашка 4', color: 'bg-dark-card' }
]

type DebugInfo = {
  scrollWidth: number
  clientWidth: number
  scrollLeft: number
  overflow: boolean
  userSelect: string
  moveCount: number
  upCount: number
  pointerIdRef: number | null
  lastMovePointerId: number | undefined
  isDragging: boolean
}

const emptyDebug: DebugInfo = {
  scrollWidth: 0,
  clientWidth: 0,
  scrollLeft: 0,
  overflow: false,
  userSelect: '',
  moveCount: 0,
  upCount: 0,
  pointerIdRef: null,
  lastMovePointerId: undefined,
  isDragging: false
}

export default function DragTestStrip() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [debug, setDebug] = useState<DebugInfo>(emptyDebug)
  const draggingRef = useRef(false)
  const startX = useRef(0)
  const startTranslateX = useRef(0)
  const translateXRef = useRef(0)
  translateXRef.current = translateX

  const updateDebug = useCallback((overrides?: Partial<DebugInfo>) => {
    const viewport = scrollRef.current
    const track = trackRef.current
    const contentWidth = track?.offsetWidth ?? 0
    const clientWidth = viewport?.clientWidth ?? 0
    setDebug(prev => {
      const base = {
        ...prev,
        userSelect: document.body.style.userSelect ?? '',
        isDragging: draggingRef.current,
        scrollWidth: contentWidth,
        clientWidth,
        scrollLeft: translateX,
        overflow: contentWidth > clientWidth
      }
      return overrides ? { ...base, ...overrides } : base
    })
  }, [translateX])

  useEffect(() => {
    updateDebug()
    const el = scrollRef.current
    if (!el) return
    const ro = new ResizeObserver(() => updateDebug())
    ro.observe(el)
    return () => ro.disconnect()
  }, [updateDebug])

  // во время драга обновляем панель по rAF, чтобы видеть scrollLeft в реальном времени
  useEffect(() => {
    if (!isDragging) return
    let rafId: number
    const tick = () => {
      updateDebug()
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [isDragging, updateDebug])

  const moveCountRef = useRef(0)
  const upCountRef = useRef(0)
  const pointerIdRef = useRef<number | null>(null)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!scrollRef.current || !trackRef.current) return
    const viewport = scrollRef.current
    const track = trackRef.current
    const contentWidth = track.offsetWidth
    const viewportWidth = viewport.clientWidth
    const maxScroll = Math.max(0, contentWidth - viewportWidth)
    console.log('[DragTest] pointerdown', { clientX: e.clientX, translateX: translateXRef.current, maxScroll })
    e.preventDefault()
    pointerIdRef.current = e.pointerId
    draggingRef.current = true
    setIsDragging(true)
    startX.current = e.clientX
    startTranslateX.current = translateXRef.current
    moveCountRef.current = 0
    updateDebug({ pointerIdRef: e.pointerId, moveCount: 0, lastMovePointerId: undefined })

    const onMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerIdRef.current || !scrollRef.current || !trackRef.current) return
      moveCountRef.current += 1
      if (moveCountRef.current <= 3) {
        console.log('[DragTest] pointermove #' + moveCountRef.current, { clientX: moveEvent.clientX })
      }
      moveEvent.preventDefault()
      const deltaX = moveEvent.clientX - startX.current
      const raw = startTranslateX.current - deltaX
      const clamped = Math.max(0, Math.min(maxScroll, raw))
      setTranslateX(clamped)
      updateDebug({ moveCount: moveCountRef.current, lastMovePointerId: moveEvent.pointerId, scrollLeft: clamped })
    }
    const onBlur = () => {
      if (!draggingRef.current) return
      console.log('[DragTest] window blur — сброс драга')
      endDrag()
    }

    const endDrag = () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointercancel', onUp)
      document.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onBlur)
      document.body.style.removeProperty('user-select')
      pointerIdRef.current = null
      draggingRef.current = false
      setIsDragging(false)
      updateDebug({ upCount: upCountRef.current, pointerIdRef: null })
    }

    const onUp = (upEvent: PointerEvent) => {
      if (upEvent.pointerId !== pointerIdRef.current) return
      upCountRef.current += 1
      console.log('[DragTest] pointerup', { translateX, moves: moveCountRef.current })
      endDrag()
    }

    const onLeave = () => {
      if (!draggingRef.current) return
      console.log('[DragTest] pointerleave — сброс драга')
      endDrag()
    }

    document.body.style.userSelect = 'none'
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
    document.addEventListener('pointercancel', onUp)
    document.addEventListener('pointerleave', onLeave)
    window.addEventListener('blur', onBlur)
  }, [updateDebug])

  return (
    <div className="mb-6 w-full min-w-0">
      <p className="text-xs text-gray-500 mb-2">Тест: перетащи мышью влево/вправо</p>
      <div className="text-xs font-mono text-amber-600/90 mb-1 p-2 rounded bg-black/30 space-y-1">
        <div>
          scrollWidth={debug.scrollWidth} clientWidth={debug.clientWidth} scrollLeft={debug.scrollLeft}{' '}
          {debug.overflow ? '✓ overflow' : '✗ нет overflow'}
        </div>
        <div>userSelect=&quot;{debug.userSelect || '(пусто)'}&quot;</div>
        <div>onMove: moveCount={debug.moveCount}</div>
        <div>onUp: upCount={debug.upCount}</div>
        <div>
          pointerIdRef={debug.pointerIdRef ?? 'null'} lastMovePointerId={debug.lastMovePointerId ?? '—'}{' '}
          match={debug.pointerIdRef !== null && debug.lastMovePointerId === debug.pointerIdRef ? '✓' : '—'}
        </div>
        <div>isDragging={String(debug.isDragging)}</div>
      </div>
      <div
        ref={scrollRef}
        role="region"
        aria-label="Тестовая полоса"
        className={`w-full min-w-0 overflow-hidden select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ touchAction: 'pan-y' }}
        onPointerDown={handlePointerDown}
      >
        <div
          ref={trackRef}
          className="flex gap-3 py-2 shrink-0 transition-none"
          style={{ width: 'max-content', transform: `translateX(${-translateX}px)` }}
        >
          {CARDS.map(card => (
            <div
              key={card.id}
              className={`flex-shrink-0 w-32 py-4 px-3 rounded-lg text-sm text-gray-300 ${card.color}`}
            >
              {card.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
