'use client'

import { useState } from 'react'
import SelectionCard from '../components/SelectionCard'
import { useAppData } from '../hooks/useAppData'
import { actionDetailConfig } from '../data/actions'

interface Step3ActionProps {
  selectedAction: string | null
  onSelect: (actionId: string) => void
  onActionDetailSelected: (detail: string) => void
}

export default function Step3Action({
  selectedAction,
  onSelect,
  onActionDetailSelected
}: Step3ActionProps) {
  const appData = useAppData()
  const [showDetailPopup, setShowDetailPopup] = useState(false)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [detailInput, setDetailInput] = useState('')

  if (appData.loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Загрузка данных...</p>
      </div>
    )
  }

  const config = selectedAction ? actionDetailConfig[selectedAction] : null

  const handleOptionClick = (option: string) => {
    onActionDetailSelected(option)
    setShowDetailPopup(false)
    setDetailInput('')
    setShowCustomInput(false)
  }

  const handleCustomSubmit = () => {
    const value = detailInput.trim()
    onActionDetailSelected(value || (config?.options[0] ?? ''))
    setShowDetailPopup(false)
    setDetailInput('')
    setShowCustomInput(false)
  }

  const handleOpenPopup = () => {
    setShowCustomInput(false)
    setDetailInput('')
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2 text-light">Шаг 3: Чего вы хотите добиться?</h2>
      <p className="text-gray-400 mb-8">Какую цель вы преследуете?</p>

      <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3 gap-4">
        {appData.targetActions.map(action => (
          <SelectionCard
            key={action.id}
            icon={action.icon}
            title={action.title}
            description={action.description}
            selected={selectedAction === action.id}
            onClick={() => {
              onSelect(action.id)
              handleOpenPopup()
              setShowDetailPopup(true)
            }}
          />
        ))}
      </div>

      {/* Попап: уточнение цели (шаг 3.5) */}
      {showDetailPopup && selectedAction && config && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black-70"
          onClick={() => setShowDetailPopup(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="action-detail-dialog-title"
        >
          <div
            className="bg-dark-card-selected border-2 border-blue-500 rounded-xl w-full p-6 shadow-lg shadow-blue-500-20"
            style={{ maxWidth: 320 }}
            onClick={e => e.stopPropagation()}
          >
            <h3 id="action-detail-dialog-title" className="text-lg font-semibold text-light mb-4">
              💡 {config.title}
            </h3>

            {showCustomInput ? (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={detailInput}
                  onChange={e => setDetailInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCustomSubmit()}
                  placeholder={config.placeholder ?? 'Введите свой вариант'}
                  className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-blue-500-30 text-light mb-2"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleCustomSubmit}
                  className="w-full py-3 rounded-lg bg-dark-bg-blue border border-blue-500-30 text-light hover-bg-dark-page hover-border-blue-500 transition-colors cursor-pointer text-sm font-medium"
                >
                  Ок
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {config.options.slice(0, 3).map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleOptionClick(option)}
                    className="text-left px-4 py-3 rounded-lg bg-dark-bg-blue border border-blue-500-30 text-light hover-bg-dark-page hover-border-blue-500 transition-colors cursor-pointer"
                  >
                    {option}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="text-left px-4 py-3 rounded-lg bg-dark-bg-blue border border-blue-500-30 text-light hover-bg-dark-page hover-border-blue-500 transition-colors cursor-pointer"
                >
                  Свой вариант
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
