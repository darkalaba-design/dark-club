'use client'

import { useState, useMemo } from 'react'
import { useSavedScenarios } from '../contexts/SavedScenariosContext'
import { useProfiles } from '../hooks/useProfiles'
import DossierLikeContent from './DossierLikeContent'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
const MAX_SHOW = 3

interface ActiveScenariosProps {
  onStartAnalysis: () => void
  onShowAllScenarios?: () => void
}

export default function ActiveScenarios({ onStartAnalysis, onShowAllScenarios }: ActiveScenariosProps) {
  const { savedScenarios, getById, deleteScenario } = useSavedScenarios()
  const { getProfile } = useProfiles()
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const recentScenarios = useMemo(() => {
    const cutoff = Date.now() - THIRTY_DAYS_MS
    return [...savedScenarios]
      .filter(s => s.createdAt >= cutoff)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, MAX_SHOW)
  }, [savedScenarios])

  const hasMore = savedScenarios.filter(s => s.createdAt >= Date.now() - THIRTY_DAYS_MS).length > MAX_SHOW
  const viewingScenario = viewingId ? getById(viewingId) : null

  const formatDate = (ts: number) => {
    const d = new Date(ts)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000))
    if (diffDays === 0) return 'Сегодня'
    if (diffDays === 1) return 'Вчера'
    if (diffDays < 7) return `${diffDays} дн. назад`
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const handleDelete = (id: string) => {
    deleteScenario(id)
    setDeleteConfirmId(null)
    if (viewingId === id) setViewingId(null)
  }

  return (
    <section className="w-full max-w-[800px] mx-auto" aria-labelledby="active-scenarios-heading">
      <h2 id="active-scenarios-heading" className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        📌 Активные сценарии
      </h2>

      {recentScenarios.length === 0 ? (
        <div className="rounded-xl border border-dark bg-dark-card p-8 text-center">
          <span className="text-5xl block mb-4" aria-hidden>📋</span>
          <p className="text-gray-400 mb-4">
            У вас пока нет сохранённых сценариев. Создайте первый!
          </p>
          <button
            type="button"
            onClick={onStartAnalysis}
            className="px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
          >
            Создать сценарий
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {recentScenarios.map(scenario => {
            const profile = getProfile(scenario.profileId)
            const profileName = profile?.name ?? 'Профиль'
            const title = scenario.targetActionTitle ?? 'Сценарий'
            const detail = scenario.targetActionDetail ?? ''
            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => setViewingId(scenario.id)}
                className="w-full text-left rounded-xl border border-blue-500/30 bg-dark-card-selected p-4 flex flex-col gap-2 cursor-pointer hover:border-blue-500/50 hover:bg-dark-card-selected/90 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg flex-shrink-0 opacity-80" aria-hidden>
                        {profile?.avatar ?? '👤'}
                      </span>
                      <p className="font-bold text-gray-400 truncate">{profileName}</p>
                    </div>
                    <p className="text-sm text-blue-300/90 truncate">
                      {title}
                      {detail ? ` — ${detail}` : ''}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Создано {formatDate(scenario.createdAt)}
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-gray-500" aria-hidden>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </span>
                </div>
              </button>
            )
          })}
          {hasMore && onShowAllScenarios && (
            <button
              type="button"
              onClick={onShowAllScenarios}
              className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors w-full text-center py-2"
            >
              Все сценарии →
            </button>
          )}
        </div>
      )}

      {/* Модальное окно просмотра сценария */}
      {viewingScenario && (
        <div className="fixed inset-0 z-50 bg-dark-bg overflow-y-auto">
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 p-4 bg-dark-bg border-b border-dark backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-light truncate">
              {viewingScenario.targetActionTitle ?? 'Сценарий'}
              {viewingScenario.targetActionDetail && (
                <span className="text-gray-400 font-normal"> — {viewingScenario.targetActionDetail}</span>
              )}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(viewingScenario.id)}
                className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 border border-red-500/40 rounded-lg transition-colors"
              >
                Удалить
              </button>
              <button
                type="button"
                onClick={() => setViewingId(null)}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-dark-card border border-dark text-gray-400 hover:text-light hover:border-dark-hover transition-colors"
                aria-label="Закрыть"
              >
                <span className="text-xl leading-none" aria-hidden>×</span>
              </button>
            </div>
          </div>
          <div className="max-w-3xl mx-auto pt-4 pb-8">
            <p className="text-sm text-gray-500 mb-4">
              {viewingScenario.manipulatorRoleTitle && <span>{viewingScenario.manipulatorRoleTitle} · </span>}
              {new Date(viewingScenario.createdAt).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <div className="bg-dark-card border border-dark rounded-xl p-6 w-fit">
              <DossierLikeContent content={viewingScenario.content} />
            </div>
          </div>
        </div>
      )}

      {/* Подтверждение удаления */}
      {deleteConfirmId && (() => {
        const scenario = getById(deleteConfirmId)
        const profile = scenario ? getProfile(scenario.profileId) : null
        const name = profile?.name ?? 'сценарий'
        return (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70"
            onClick={() => setDeleteConfirmId(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-scenario-title"
          >
            <div
              className="bg-dark-card border border-dark rounded-xl max-w-sm w-full p-6 shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <h2 id="delete-scenario-title" className="text-lg font-semibold text-light mb-2">
                Удалить сценарий для {name}?
              </h2>
              <p className="text-sm text-gray-400 mb-6">Сценарий будет удалён без возможности восстановления.</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2.5 rounded-lg text-gray-400 hover:text-light border border-dark hover:border-dark-hover transition-colors font-medium"
                >
                  Отменить
                </button>
                <button
                  type="button"
                  onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                  className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </section>
  )
}
