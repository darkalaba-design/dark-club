'use client'

import { useState, useEffect } from 'react'
import { useDailyChallenge } from '../hooks/useDailyChallenge'
import type { DailyChallenge as DailyChallengeType, ChallengeDifficulty } from '../data/challenges'

const difficultyLabels: Record<ChallengeDifficulty, string> = {
  easy: '⭐ Лёгкий',
  medium: '⭐⭐ Средний',
  hard: '⭐⭐⭐ Сложный'
}

const difficultyColors: Record<ChallengeDifficulty, string> = {
  easy: 'text-green-400 border-green-500/40 bg-green-500/10',
  medium: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10',
  hard: 'text-red-400 border-red-500/40 bg-red-500/10'
}

export default function DailyChallenge() {
  const { currentChallenge, completedCount, totalCount, markCompleted, nextChallenge } = useDailyChallenge()
  const [displayChallenge, setDisplayChallenge] = useState<DailyChallengeType>(currentChallenge)

  useEffect(() => {
    setDisplayChallenge(currentChallenge)
  }, [currentChallenge.id])
  const [expanded, setExpanded] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)

  const challenge = displayChallenge
  const diffLabel = difficultyLabels[challenge.difficulty]
  const diffColor = difficultyColors[challenge.difficulty]

  const handleCompleted = () => {
    markCompleted(challenge.id)
    setJustCompleted(true)
    setTimeout(() => setJustCompleted(false), 1500)
  }

  const handleNext = () => {
    setDisplayChallenge(nextChallenge())
    setExpanded(false)
  }

  return (
    <section className="w-full max-w-[800px] mx-auto" aria-labelledby="daily-challenge-heading">
      <h2 id="daily-challenge-heading" className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        🎯 Челлендж дня
      </h2>
      <div
        className={`rounded-xl border p-5 shadow-lg transition-colors duration-300 ${justCompleted ? 'border-green-500/50 bg-green-500/5' : 'border-dark bg-dark-card'
          }`}
      >
        <div className="flex gap-4">
          <span className="text-4xl flex-shrink-0" aria-hidden>
            {challenge.icon}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-light mb-2">{challenge.title}</h3>
            <span
              className={`inline-block px-2 py-0.5 rounded text-xs font-medium border mb-2 ${diffColor}`}
            >
              {diffLabel}
            </span>
            <p className="text-sm text-gray-500 mt-2 mb-2">Время: {challenge.duration}</p>
            <p className="text-sm text-gray-300 leading-relaxed">{challenge.description}</p>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-dark space-y-3">
            <p className="text-sm">
              <span className="font-medium text-light">Цель: </span>
              <span className="text-gray-300">{challenge.goal}</span>
            </p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
              {challenge.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            <p className="text-sm text-gray-400">
              <span className="font-medium">Самопроверка: </span>
              {challenge.validation}
            </p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-dark flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            {expanded ? 'Свернуть' : 'Подробнее'}
          </button>
          <button
            type="button"
            onClick={handleCompleted}
            className="text-sm font-medium text-green-400 hover:text-green-300 transition-colors"
          >
            Выполнено ✓
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="text-sm font-medium text-gray-400 hover:text-gray-300 transition-colors"
          >
            Другой челлендж →
          </button>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          Выполнено {completedCount} из {totalCount} челленджей
        </p>
      </div>
    </section>
  )
}
