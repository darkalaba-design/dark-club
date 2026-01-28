'use client'

interface EthicsChecklistProps {
  checklist: {
    noHarm: boolean
    openDialogue: boolean
    trustPreserved: boolean
  }
  onChange: (checklist: Partial<EthicsChecklistProps['checklist']>) => void
  showWarning?: boolean
}

export default function EthicsChecklist({
  checklist,
  onChange,
  showWarning = false
}: EthicsChecklistProps) {
  const allChecked = checklist.noHarm && checklist.openDialogue && checklist.trustPreserved

  return (
    <div className="bg-dark-card border border-dark rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4 text-light flex items-center gap-2">
        ⚠️ ЭТИЧЕСКИЙ ЧЕК-ЛИСТ
      </h3>

      <div className="space-y-4 mb-4">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={checklist.noHarm}
            onChange={(e) => onChange({ noHarm: e.target.checked })}
            className="mt-1 w-5 h-5 rounded border-dark bg-dark-bg text-blue-500 focus-ring-2 focus-ring-blue-500"
          />
          <span className="text-gray-300 group-hover-text-light transition-colors">
            Эта цель не причинит вреда человеку?
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={checklist.openDialogue}
            onChange={(e) => onChange({ openDialogue: e.target.checked })}
            className="mt-1 w-5 h-5 rounded border-dark bg-dark-bg text-blue-500 focus-ring-2 focus-ring-blue-500"
          />
          <span className="text-gray-300 group-hover-text-light transition-colors">
            Я готов к открытому диалогу, если он спросит о моих намерениях?
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={checklist.trustPreserved}
            onChange={(e) => onChange({ trustPreserved: e.target.checked })}
            className="mt-1 w-5 h-5 rounded border-dark bg-dark-bg text-blue-500 focus-ring-2 focus-ring-blue-500"
          />
          <span className="text-gray-300 group-hover-text-light transition-colors">
            Это не нарушит доверие в наших отношениях?
          </span>
        </label>
      </div>

      {showWarning && !allChecked && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-4">
          <p className="text-yellow-400 text-sm">
            ⚠️ Возможно, стоит пересмотреть подход. Манипуляция без этики разрушает отношения.
          </p>
        </div>
      )}
    </div>
  )
}
