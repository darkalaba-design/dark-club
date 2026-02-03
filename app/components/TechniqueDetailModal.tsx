'use client'

import { useEffect } from 'react'
import { Technique } from '../data/techniques'
import { Target } from '../data/targets'
import { targets } from '../data/targets'

interface TechniqueDetailModalProps {
  technique: Technique | null
  onClose: () => void
}

export default function TechniqueDetailModal({ technique, onClose }: TechniqueDetailModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (technique) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [technique, onClose])

  if (!technique) return null

  const relatedTargets = technique.relatedTargets
    .map(id => targets.find(t => t.id === id))
    .filter((t): t is Target => t !== undefined)

  return (
    <div className="fixed inset-0 z-50 bg-dark-bg overflow-y-auto">
      {/* Кнопка закрыть: крестик в квадрате, всегда видна при прокрутке */}
      <button
        type="button"
        onClick={onClose}
        className="fixed top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-lg bg-dark-card border border-dark text-gray-400 hover-text-light hover-border-dark-hover transition-colors"
        aria-label="Закрыть"
      >
        <span className="text-xl leading-none" aria-hidden>×</span>
      </button>

      <div className="p-6 pt-16">
        {/* Заголовок */}
        <div className="flex items-center gap-4 mb-6">
          <div className="text-5xl">{technique.icon}</div>
          <div>
            <h2 className="text-2xl font-bold text-light mb-2">{technique.title}</h2>
            <p className="text-gray-400">{technique.description}</p>
          </div>
        </div>

        {/* Как это работает */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-light flex items-center gap-2">
            🧠 Как это работает
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed">{technique.howItWorks}</p>
        </div>

        {/* На какие мишени бьёт */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-light flex items-center gap-2">
            🎯 На какие мишени бьёт
          </h3>
          <div className="flex flex-wrap gap-2">
            {relatedTargets.map(target => (
              <div
                key={target.id}
                className="flex items-center gap-2 bg-dark-card border border-dark rounded-lg px-4 py-2"
              >
                <span>{target.icon}</span>
                <span className="text-sm text-gray-300">{target.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Шаблоны фраз */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-light flex items-center gap-2">
            💬 Шаблоны фраз
          </h3>
          <div className="space-y-3">
            {technique.templates.map((template, index) => (
              <div
                key={index}
                className="bg-dark-card border border-dark rounded-lg p-4 flex items-start gap-4 group hover-border-dark-hover transition-all"
              >
                <p className="text-sm text-gray-300 italic flex-1">{template}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ожидаемые эмоции */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-light flex items-center gap-2">
            😮 Ожидаемые эмоции
          </h3>
          <div className="flex flex-wrap gap-2">
            {technique.expectedEmotions.map((emotion, index) => (
              <span
                key={index}
                className="text-blue-300 border border-blue-500/30 rounded-full px-3 py-1 text-sm"
              >
                {emotion}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
