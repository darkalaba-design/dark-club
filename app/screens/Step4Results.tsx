'use client'

import { useState, useEffect } from 'react'
import TargetCard from '../components/TargetCard'
import ProfileTargetCard from '../components/ProfileTargetCard'
import TechniqueCard from '../components/TechniqueCard'
import TechniqueDetailModal from '../components/TechniqueDetailModal'
import Accordion from '../components/Accordion'
import DossierLikeContent from '../components/DossierLikeContent'
import { useAppData } from '../hooks/useAppData'
import { Technique } from '../data/techniques'
import { Target } from '../data/targets'
import type { Profile } from '../data/profiles'
import { relationshipTypeLabels } from '../data/profiles'
import { psychotypes } from '../data/psychotypes'
import type { ProfileTargetItem } from '../data/matchingLogic'
import type { AudienceContextId } from '../hooks/useAppState'
import { generateInfluenceScenario, audienceContextToCurrentState } from '../lib/scenario'
import type { InfluenceScenario, ScenarioTarget } from '../lib/scenario'
import { buildScenarioWebhookPayload, sendScenarioToWebhook } from '../lib/scenarioWebhook'
import { calculateCompleteness } from '../data/profiles'

interface Step4ResultsProps {
  manipulatorRole: string | null
  victimRole: string | null
  targetAction: string | null
  targets: Target[]
  techniques: Technique[]
  profileTargets?: ProfileTargetItem[]
  selectedProfile?: Profile
  audienceContext: AudienceContextId | null
  targetActionDetail: string | null
  onReset: () => void
}

type ScenarioResult =
  | { source: 'offline'; data: InfluenceScenario }
  | { source: 'online'; data: unknown }

function isInfluenceScenario(x: unknown): x is InfluenceScenario {
  return (
    typeof x === 'object' &&
    x !== null &&
    'phases' in x &&
    Array.isArray((x as InfluenceScenario).phases) &&
    'summary' in x &&
    'redFlags' in x &&
    'planB' in x
  )
}

/** Преобразует значение scenario в строку (поддержка объекта с .text/.content). */
function scenarioValueToString(val: unknown): string | null {
  if (val == null) return null
  if (typeof val === 'string') return val
  if (typeof val === 'object' && !Array.isArray(val)) {
    const o = val as Record<string, unknown>
    const t = o.text ?? o.content ?? o.value
    if (typeof t === 'string') return t
  }
  return String(val)
}

/** Ключи, в которых может лежать готовый текст сценария. */
const SCENARIO_FIELD_KEYS = ['scenario', 'Scenario', 'text', 'content', 'result', 'response', 'output', 'message']

/** Из объекта достаёт строку сценария по известным ключам. */
function getScenarioFromObject(obj: Record<string, unknown>): string | null {
  for (const key of SCENARIO_FIELD_KEYS) {
    const val = obj[key]
    if (typeof val === 'string' && val.trim() !== '') return val
    if (val != null && typeof val === 'object' && !Array.isArray(val)) {
      const inner = (val as Record<string, unknown>).text ?? (val as Record<string, unknown>).content
      if (typeof inner === 'string' && inner.trim() !== '') return inner
    }
  }
  return null
}

/** Из JSON-строки вытаскивает только поле scenario (парсинг или regex-запас). */
function extractScenarioFromJsonString(bodyStr: string): string | null {
  const trimmed = bodyStr.trim()
  if (!trimmed.startsWith('{')) return null

  try {
    const parsed = JSON.parse(bodyStr) as Record<string, unknown>
    const s = getScenarioFromObject(parsed)
    if (s != null && s !== '') return s
  } catch {
    // JSON.parse не сработал — вытаскиваем значение "scenario" вручную
  }

  // Запас: ищем "scenario": "..." и вырезаем значение строки (учитываем \", \\, \n и кавычки внутри текста)
  const scenarioKey = /"scenario"\s*:\s*"/i.exec(trimmed)
  if (!scenarioKey || scenarioKey.index === undefined) return null
  let start = scenarioKey.index + scenarioKey[0].length
  const sb: string[] = []
  for (let i = start; i < trimmed.length; i++) {
    const c = trimmed[i]
    if (c === '\\') {
      const next = trimmed[i + 1]
      if (next === '"') { sb.push('"'); i++; continue }
      if (next === '\\') { sb.push('\\'); i++; continue }
      if (next === 'n') { sb.push('\n'); i++; continue }
      if (next === 'r') { sb.push('\r'); i++; continue }
      sb.push(next ?? '')
      i++
      continue
    }
    if (c === '"') {
      // Конец строки в JSON — только если после кавычки идут , или }
      let j = i + 1
      while (j < trimmed.length && /\s/.test(trimmed[j])) j++
      const after = trimmed[j]
      if (after === ',' || after === '}' || after === undefined) return sb.join('')
      // иначе это кавычка внутри текста (например "усилием") — добавляем как есть
      sb.push(c)
      continue
    }
    sb.push(c)
  }
  return sb.length > 0 ? sb.join('') : null
}

/** Ищет строку сценария в объекте (в т.ч. body/output/data/result). */
function findScenarioString(obj: Record<string, unknown>): string | null {
  const direct = getScenarioFromObject(obj)
  if (direct != null && direct !== '') return direct

  for (const key of ['body', 'output', 'data', 'result']) {
    const nested = obj[key]
    if (nested == null) continue
    if (typeof nested === 'string' && nested.trim() !== '') {
      const s = extractScenarioFromJsonString(nested)
      if (s != null && s !== '') return s
      // не возвращаем nested — иначе покажем весь body; только если внутри не нашли scenario
      continue
    }
    if (Array.isArray(nested) && nested.length > 0) {
      const first = nested[0]
      if (typeof first === 'object' && first !== null && !Array.isArray(first)) {
        const found = findScenarioString(first as Record<string, unknown>)
        if (found) return found
      }
    }
    if (typeof nested === 'object' && !Array.isArray(nested)) {
      const found = findScenarioString(nested as Record<string, unknown>)
      if (found) return found
    }
  }
  return null
}

/** Извлекает только строку сценария из ответа вебхука. */
function getScenarioContent(data: unknown): string | null {
  if (data == null) return null

  // Ответ Make.com: массив с одним элементом { body: "{\"success\": true, \"scenario\": \"...\"}" }
  if (Array.isArray(data) && data.length > 0) {
    const first = data[0]
    if (first && typeof first === 'object' && !Array.isArray(first)) {
      const obj = first as Record<string, unknown>
      const bodyStr = obj.body ?? obj.output ?? obj.data
      if (typeof bodyStr === 'string' && bodyStr.trim() !== '') {
        const s = extractScenarioFromJsonString(bodyStr)
        if (s != null && s !== '') return s
      }
      const fromObj = getScenarioFromObject(obj)
      if (fromObj != null && fromObj !== '') return fromObj
      const found = findScenarioString(obj)
      if (found) return found
    }
  }

  if (typeof data === 'string') {
    const s = extractScenarioFromJsonString(data)
    if (s != null && s !== '') return s
    if (data.trim() !== '') return data
  }

  if (typeof data === 'object' && !Array.isArray(data)) {
    const fromObj = getScenarioFromObject(data as Record<string, unknown>)
    if (fromObj != null && fromObj !== '') return fromObj
    return findScenarioString(data as Record<string, unknown>)
  }

  return null
}

function renderOnlineResponse(data: unknown) {
  const scenarioContent = getScenarioContent(data)
  if (scenarioContent != null && scenarioContent !== '') {
    return <DossierLikeContent content={scenarioContent} />
  }
  if (data == null) return <p className="text-gray-400">Нет данных</p>
  if (typeof data === 'string') {
    if (data.trim().startsWith('{') || data.trim().startsWith('[')) {
      return <p className="text-gray-400">В ответе не найдено поле scenario.</p>
    }
    return <DossierLikeContent content={data} />
  }
  return <p className="text-gray-400">В ответе не найдено поле scenario.</p>
}

export default function Step4Results({
  manipulatorRole,
  victimRole,
  targetAction,
  targets,
  techniques,
  profileTargets = [],
  selectedProfile,
  audienceContext,
  targetActionDetail,
  onReset
}: Step4ResultsProps) {
  const [scenarioResult, setScenarioResult] = useState<ScenarioResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [aiScenario, setAiScenario] = useState<unknown | null>(null)
  const [loadingAI, setLoadingAI] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'ai' | 'offline'>('ai')
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null)
  const appData = useAppData()

  const manipulator = appData.manipulatorRoles.find(r => r.id === manipulatorRole)
  const victim = appData.victimRoles.find(r => r.id === victimRole)
  const action = appData.targetActions.find(a => a.id === targetAction)
  const psychotype = selectedProfile?.psychotype
    ? psychotypes.find(p => p.id === selectedProfile.psychotype)
    : null

  const profileCompleteness = selectedProfile ? calculateCompleteness(selectedProfile) : 0
  const canRequestAI =
    !!selectedProfile &&
    profileCompleteness >= 50 &&
    typeof navigator !== 'undefined' &&
    navigator.onLine

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setScenarioResult(null)
    setAiScenario(null)
    setAiError(null)
    setViewMode('ai')

    const currentState = audienceContextToCurrentState(audienceContext)
    const input = {
      manipulatorRole,
      victim: {
        type: selectedProfile ? 'profile' as const : 'general' as const,
        role: victimRole ?? undefined,
        profile: selectedProfile ?? null,
        currentState
      },
      targetAction,
      targetDetails: targetActionDetail ?? undefined
    }

    try {
      const scenario = generateInfluenceScenario(input)
      if (!cancelled) {
        setScenarioResult({ source: 'offline', data: scenario })
      }
    } catch (e) {
      if (!cancelled) {
        setError(e instanceof Error ? e.message : 'Ошибка генерации сценария')
      }
    }
    if (!cancelled) setLoading(false)
    return () => { cancelled = true }
  }, [
    manipulatorRole,
    victimRole,
    targetAction,
    selectedProfile?.id,
    audienceContext,
    targetActionDetail
  ])

  const fetchAIScenario = async () => {
    if (!selectedProfile || !canRequestAI) return
    setLoadingAI(true)
    setAiError(null)
    try {
      const payload = buildScenarioWebhookPayload(
        manipulatorRole,
        audienceContext,
        targetAction,
        targetActionDetail,
        selectedProfile
      )
      const res = await sendScenarioToWebhook(payload)
      setAiScenario(res)
      setViewMode('ai')
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Ошибка загрузки. Проверьте сеть.')
    } finally {
      setLoadingAI(false)
    }
  }

  const handleReset = () => {
    if (window.confirm('Вы уверены, что хотите начать заново?')) {
      onReset()
    }
  }

  if (loading) {
    return (
      <div className="py-8 text-center text-gray-400">
        <p>Формируем сценарий...</p>
      </div>
    )
  }

  if (loadingAI) {
    return (
      <div className="ai-loader">
        <div className="ai-loader-core">
          <div className="ai-loader-ring-outer" />
          <div className="ai-loader-ring-inner" />
          <div className="ai-loader-glow" />
        </div>
        <div className="ai-loader-bars" aria-hidden>
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="ai-loader-bar" />
          ))}
        </div>
        <p className="ai-loader-text">Генерируем персонализированный сценарий с помощью AI...</p>
        <p className="ai-loader-sub">Обычно занимает 10–15 секунд.</p>
      </div>
    )
  }

  if (error && !scenarioResult) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          type="button"
          onClick={handleReset}
          className="px-6 py-3 bg-dark-card-light hover:bg-dark-hover text-light rounded-lg font-medium"
        >
          Начать заново
        </button>
      </div>
    )
  }

  // Офлайн-сценарий готов; показываем контент + кнопку AI / табы при наличии ответа
  if (scenarioResult?.source === 'offline') {
    const offlineContent = (
      <Step4OfflineContent
        scenario={scenarioResult.data}
        manipulator={manipulator}
        victim={victim}
        action={action}
        selectedProfile={selectedProfile}
        psychotype={psychotype ?? null}
        profileTargets={profileTargets}
        selectedTechnique={selectedTechnique}
        onReset={handleReset}
        onSelectTechnique={setSelectedTechnique}
      />
    )

    return (
      <div>
        {aiError && (
          <div className="mb-4 p-4 rounded-xl bg-dark-card border border-red-500/40 text-red-300">
            <p className="font-medium">⚠️ Не удалось получить AI-рекомендации. Используем офлайн-режим.</p>
            <button
              type="button"
              onClick={() => { setAiError(null); fetchAIScenario() }}
              className="mt-2 px-4 py-2 text-sm bg-dark-bg border border-dark rounded-lg hover:border-blue-500 transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        )}

        {canRequestAI && !aiScenario && (
          <div className="mb-4">
            <button
              type="button"
              onClick={fetchAIScenario}
              className="px-6 py-3 rounded-lg font-medium border-2 border-blue-500 text-blue-400 hover:bg-blue-500/10 transition-colors"
            >
              🤖 Получить AI-рекомендации
            </button>
            {profileCompleteness < 100 && (
              <p className="text-xs text-gray-500 mt-2">Профиль заполнен на {profileCompleteness}%. Для лучшего результата заполните больше полей.</p>
            )}
          </div>
        )}

        {aiScenario ? (
          <>
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setViewMode('ai')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'ai' ? 'bg-blue-500/20 border border-blue-500 text-blue-300' : 'bg-dark-card border border-dark text-gray-400 hover:text-light'}`}
              >
                🤖 AI-сценарий
              </button>
              <button
                type="button"
                onClick={() => setViewMode('offline')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'offline' ? 'bg-blue-500/20 border border-blue-500 text-blue-300' : 'bg-dark-card border border-dark text-gray-400 hover:text-light'}`}
              >
                📱 Офлайн-сценарий
              </button>
            </div>
            {viewMode === 'ai' ? (
              <div className="bg-dark-card border border-dark rounded-xl p-6">
                {renderOnlineResponse(aiScenario)}
              </div>
            ) : (
              offlineContent
            )}
          </>
        ) : (
          offlineContent
        )}
      </div>
    )
  }

  // Fallback: только карточки (как раньше)
  return (
    <div>
      <Accordion title="Ваш сценарий" icon="📊" defaultOpen={true}>
        <div className="space-y-3 text-gray-300 pt-2">
          <div className="flex items-start gap-2">
            <strong className="text-light min-w-[80px]">Роль:</strong>
            <span>{manipulator?.title || 'Не выбрано'}</span>
          </div>
          <div className="flex items-start gap-2">
            <strong className="text-light min-w-[80px]">Аудитория:</strong>
            <span>
              {selectedProfile
                ? `${selectedProfile.name} (${relationshipTypeLabels[selectedProfile.relationshipType] ?? selectedProfile.relationshipType})`
                : victim?.title || 'Не выбрано'}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <strong className="text-light min-w-[80px]">Цель:</strong>
            <span>{action?.title || 'Не выбрано'}</span>
          </div>
        </div>
      </Accordion>
      <Accordion title="Уязвимые мишени" icon="🎯" defaultOpen={true}>
        <div className="grid grid-cols-1 gap-4 pt-2">
          {targets.map(t => (
            <TargetCard key={t.id} target={t} />
          ))}
          {selectedProfile && profileTargets.length > 0 && profileTargets.map(item => (
            <ProfileTargetCard key={item.id} item={item} profileName={selectedProfile.name} />
          ))}
        </div>
      </Accordion>
      <Accordion title="Рекомендуемые техники" icon="🛠️" defaultOpen={true}>
        <div className="grid grid-cols-1 gap-4 pt-2">
          {techniques.map(technique => (
            <TechniqueCard key={technique.id} technique={technique} onClick={() => setSelectedTechnique(technique)} />
          ))}
        </div>
      </Accordion>
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-dark-card-light hover:bg-dark-hover text-light rounded-lg font-medium transition-colors"
        >
          Начать заново
        </button>
      </div>
      <TechniqueDetailModal technique={selectedTechnique} onClose={() => setSelectedTechnique(null)} />
    </div>
  )
}

interface Step4OfflineContentProps {
  scenario: InfluenceScenario
  manipulator: { title: string } | undefined
  victim: { title: string } | undefined
  action: { title: string } | undefined
  selectedProfile?: Profile
  psychotype: { title: string; icon: string; communication: string } | null
  profileTargets: ProfileTargetItem[]
  selectedTechnique: Technique | null
  onReset: () => void
  onSelectTechnique: (t: Technique | null) => void
}

function Step4OfflineContent({
  scenario,
  manipulator,
  victim,
  action,
  selectedProfile,
  psychotype,
  profileTargets,
  selectedTechnique,
  onReset,
  onSelectTechnique
}: Step4OfflineContentProps) {
  const { summary, keyIdea, phases, redFlags, planB, targets: scenarioTargets, techniques: scenarioTechniques } = scenario
  const baseTargets = scenarioTargets.filter(t => t.type !== 'avoid')

  return (
    <div>
      <Accordion title="Ваш сценарий" icon="📊" defaultOpen={true}>
        <div className="space-y-3 text-gray-300 pt-2">
          <div className="flex items-start gap-2">
            <strong className="text-light min-w-[80px]">Роль:</strong>
            <span>{manipulator?.title || summary.manipulatorRole || '—'}</span>
          </div>
          <div className="flex items-start gap-2">
            <strong className="text-light min-w-[80px]">Аудитория:</strong>
            <span>
              {selectedProfile
                ? `${summary.victimName} (${relationshipTypeLabels[selectedProfile.relationshipType] ?? selectedProfile.relationshipType})`
                : victim?.title || summary.victimName || '—'}
            </span>
          </div>
          {selectedProfile && psychotype && (
            <div className="flex items-start gap-2">
              <strong className="text-light min-w-[80px]">Психотип:</strong>
              <span>{psychotype.title} {psychotype.icon}</span>
            </div>
          )}
          <div className="flex items-start gap-2">
            <strong className="text-light min-w-[80px]">Цель:</strong>
            <span>{action?.title || summary.targetAction || '—'}</span>
          </div>
          {summary.targetDetails && (
            <div className="flex items-start gap-2">
              <strong className="text-light min-w-[80px]">Уточнение:</strong>
              <span>{summary.targetDetails}</span>
            </div>
          )}
        </div>
      </Accordion>

      <Accordion title="Ключевая идея" icon="💡" defaultOpen={true}>
        <p className="text-gray-300 pt-2">{keyIdea}</p>
      </Accordion>

      <Accordion title="Фазы сценария" icon="📜" defaultOpen={true}>
        <div className="space-y-6 pt-2">
          {phases.map((phase, i) => (
            <div key={i} className="border border-dark rounded-xl p-4 bg-dark-card">
              <h3 className="text-light font-semibold mb-2">{phase.title}</h3>
              <p className="text-sm text-gray-400 mb-2">{phase.goal}</p>
              {phase.technique && (
                <p className="text-sm text-blue-300 mb-2">
                  Техника: {phase.technique.title} — {phase.technique.description}
                </p>
              )}
              {phase.targetUsed && phase.targetUsed.source !== 'триггер' && (
                <p className="text-sm text-gray-300 mb-2">
                  Мишень: {phase.targetUsed.title} {phase.targetUsed.icon}
                </p>
              )}
              <ul className="list-disc list-inside text-sm text-gray-300 space-y-1 mb-2">
                {phase.phrases.map((phrase, j) => (
                  <li key={j}>{phrase}</li>
                ))}
              </ul>
              <p className="text-xs text-gray-500">Ожидаемая реакция: {phase.expectedReaction}</p>
              {phase.notes.length > 0 && (
                <div className="mt-2 text-xs text-gray-400 space-y-1">
                  {phase.notes.map((note, j) => (
                    <p key={j}>{note}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Accordion>

      <Accordion title="Уязвимые мишени" icon="🎯" defaultOpen={true}>
        <div className="grid grid-cols-1 gap-4 pt-2">
          {baseTargets.map(t => (
            <div key={t.id} className="bg-dark-card border border-dark rounded-xl p-4">
              <span className="text-lg mr-2">{t.icon}</span>
              <span className="font-medium text-light">{t.title}</span>
              {t.source && <span className="text-xs text-gray-500 ml-2">({t.source})</span>}
              <p className="text-sm text-gray-300 mt-1">{t.description}</p>
              {t.howToUse && <p className="text-xs text-blue-300 mt-1">{t.howToUse}</p>}
            </div>
          ))}
          {selectedProfile && profileTargets.length > 0 && profileTargets.map(item => (
            <ProfileTargetCard key={item.id} item={item} profileName={selectedProfile.name} />
          ))}
        </div>
      </Accordion>

      <Accordion title="Рекомендуемые техники" icon="🛠️" defaultOpen={true}>
        <div className="grid grid-cols-1 gap-4 pt-2">
          {scenarioTechniques.map(technique => (
            <TechniqueCard key={technique.id} technique={technique} onClick={() => onSelectTechnique(technique)} />
          ))}
          {selectedProfile && psychotype && (
            <div className="bg-dark-card border border-dark rounded-xl p-5" style={{ borderLeft: '4px solid #8b5cf6' }}>
              <div className="text-xs font-semibold text-purple-400 mb-1">
                💼 Особенности для {selectedProfile.name} ({psychotype.title})
              </div>
              <p className="text-sm text-gray-300">{psychotype.communication}</p>
            </div>
          )}
        </div>
      </Accordion>

      <Accordion title={redFlags.title} icon="⚠️" defaultOpen={false}>
        <ul className="list-disc list-inside text-sm text-gray-300 space-y-2 pt-2">
          {redFlags.items.map((item, i) => (
            <li key={i}>
              <strong className="text-light">{item.flag}</strong> — {item.reason}
            </li>
          ))}
        </ul>
      </Accordion>

      <Accordion title={planB.title} icon="🔄" defaultOpen={false}>
        <div className="space-y-4 pt-2">
          {planB.objections.map((obj, i) => (
            <div key={i} className="border border-dark rounded-lg p-3 bg-dark-bg">
              <p className="text-light font-medium">{obj.objection}</p>
              <p className="text-sm text-gray-300">Ответ: {obj.response}</p>
              {obj.example && <p className="text-xs text-gray-500 mt-1">Пример: {obj.example}</p>}
            </div>
          ))}
        </div>
      </Accordion>

      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <button
          onClick={onReset}
          className="px-6 py-3 bg-dark-card-light hover:bg-dark-hover text-light rounded-lg font-medium transition-colors"
        >
          Начать заново
        </button>
      </div>

      <TechniqueDetailModal technique={selectedTechnique} onClose={() => onSelectTechnique(null)} />
    </div>
  )
}
