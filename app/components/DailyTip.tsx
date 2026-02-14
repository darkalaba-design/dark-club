'use client'

import { useState, useEffect } from 'react'
import { useDailyTip } from '../hooks/useDailyTip'
import { getTipCategoryLabel } from '../data/dailyTips'
import type { DailyTip as DailyTipType } from '../data/dailyTips'

export default function DailyTip() {
  const { currentTip, nextTip } = useDailyTip()
  const [displayTip, setDisplayTip] = useState<DailyTipType>(currentTip)

  useEffect(() => {
    setDisplayTip(currentTip)
  }, [currentTip.id])

  const handleNext = () => {
    setDisplayTip(nextTip())
  }

  const tip = displayTip
  const categoryLabel = getTipCategoryLabel(tip.category)

  return (
    <section className="w-full max-w-[800px] mx-auto" aria-labelledby="daily-tip-heading">
      <h2 id="daily-tip-heading" className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        📚 Совет дня
      </h2>
      <div className="rounded-xl border border-dark bg-dark-card p-5 shadow-lg">
        <div className="flex gap-4">
          <span className="text-4xl flex-shrink-0" aria-hidden>
            {tip.icon}
          </span>
          <div className="min-w-0 flex-1">
            <span className="inline-block text-xs font-medium text-gray-400 mb-2">
              {categoryLabel}
            </span>
            <h3 className="text-lg font-semibold text-light mb-2">{tip.title}</h3>
            <p className="text-sm text-gray-300 leading-relaxed mb-3">{tip.text}</p>
            <p className="text-sm text-blue-400/90 flex items-start gap-2">
              <span className="flex-shrink-0" aria-hidden>✅</span>
              <span>{tip.action}</span>
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-dark">
          <button
            type="button"
            onClick={handleNext}
            className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            Следующий совет →
          </button>
        </div>
      </div>
    </section>
  )
}
