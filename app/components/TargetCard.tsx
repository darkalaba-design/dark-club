'use client'

import { Target } from '../data/targets'

interface TargetCardProps {
  target: Target
}

export default function TargetCard({ target }: TargetCardProps) {
  return (
    <div className="bg-dark-card border border-dark rounded-xl py-5 hover-border-dark-hover transition-all">
      <div className="flex items-start gap-4">
        <div className="text-4xl">{target.icon}</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2 text-light">{target.title}</h3>
          <p className="text-sm text-gray-400 mb-4 opacity-80">{target.description}</p>
          <div className="rounded-lg p-3 flex flex-col gap-1">
            <div className="text-xs font-semibold text-yellow-400">💡 Почему работает:</div>
            <p className="text-sm text-gray-300">{target.why}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
