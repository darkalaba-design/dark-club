'use client'

import { Technique } from '../data/techniques'

interface TechniqueCardProps {
  technique: Technique
  onClick: () => void
}

export default function TechniqueCard({ technique, onClick }: TechniqueCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-dark-card border border-dark rounded-xl p-5 hover-border-blue-500 cursor-pointer transition-all hover-transform hover-translate-y hover-shadow-lg"
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl">{technique.icon}</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2 text-light">{technique.title}</h3>
          <p className="text-sm text-gray-400 mb-4 opacity-80">{technique.description}</p>
          <button className="text-sm text-blue-400 hover:text-blue-300 font-medium">
            Подробнее →
          </button>
        </div>
      </div>
    </div>
  )
}
