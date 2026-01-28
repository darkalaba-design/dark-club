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
        min-h-180 p-5 rounded-xl cursor-pointer transition-all duration-200
        border-2
        ${selected
          ? 'border-blue-500 bg-dark-card-light shadow-lg shadow-blue-500-20 transform -translate-y-1'
          : 'border-dark bg-dark-card hover-border-dark-hover hover-transform hover-translate-y hover-shadow-lg'
        }
      `}
    >
      <div className="flex flex-col items-center text-center h-full">
        <div className="text-4xl mb-3">{icon}</div>
        <h3 className="text-lg font-semibold mb-2 text-light">{title}</h3>
        <p className="text-sm text-gray-400 opacity-80 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
