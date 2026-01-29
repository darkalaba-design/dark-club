'use client'

interface SelectionCardProps {
  icon: string
  title: string
  description: string
  selected?: boolean
  onClick?: () => void
}

export default function SelectionCard({
  icon,
  title,
  description,
  selected = false,
  onClick
}: SelectionCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        p-4 rounded-xl cursor-pointer transition-all duration-200
        border-2
        ${selected
          ? 'border-blue-500 bg-dark-card-light shadow-lg shadow-blue-500-20 transform -translate-y-1'
          : 'border-dark bg-dark-card hover-border-dark-hover hover-transform hover-translate-y hover-shadow-lg'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <span className="text-4xl flex-shrink-0 leading-none">{icon}</span>
        <div className="min-w-0 flex-1 flex flex-col gap-1">
          <h3 className="text-base font-semibold text-light">{title}</h3>
          <p className="text-xs text-gray-400 opacity-80 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  )
}
