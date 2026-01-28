'use client'

import { useState } from 'react'

interface AccordionProps {
  title: string
  icon?: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export default function Accordion({ title, icon, children, defaultOpen = false }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="bg-dark-card border border-dark rounded-xl overflow-hidden mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 md-p-6 text-left hover-bg-dark-hover transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-2xl">{icon}</span>}
          <h3 className="text-lg md-text-xl font-semibold text-light">{title}</h3>
        </div>
        <div className="flex-shrink-0 ml-4">
          <div
            className={`
              w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
              ${isOpen
                ? 'border-blue-500 bg-blue-500-20'
                : 'border-gray-600 bg-dark-bg'
              }
            `}
          >
            <span
              className={`
                text-lg transition-transform duration-200 text-gray-400
                ${isOpen ? 'rotate-45 text-blue-400' : ''}
              `}
            >
              ✕
            </span>
          </div>
        </div>
      </button>
      {isOpen && (
        <div className="px-4 md-px-6 pb-4 md-pb-6 border-t border-dark">
          {children}
        </div>
      )}
    </div>
  )
}
