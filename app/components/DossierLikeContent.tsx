'use client'

import type { ReactNode } from 'react'

/**
 * Форматирует текст в стиле досье: # / ## / ###, списки (—, -, 1.), подзаголовки "Секция:", параграфы.
 * Текст в **двух звёздочках** рендерится как жирный.
 * Используется в досье профиля и в AI-сценарии (ответ webhook).
 */
function withBold(text: string): ReactNode {
  const parts = text.split(/\*\*/)
  if (parts.length === 1) return text
  return parts.map((part, idx) =>
    idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part
  )
}

export default function DossierLikeContent({ content }: { content: string }) {
  if (!content || typeof content !== 'string') return null

  const trimmed = content.trim()
  if (trimmed.startsWith('<')) {
    return (
      <div
        className="dossier-view prose prose-invert max-w-none prose-headings:font-semibold prose-h1:text-lg prose-h1:text-blue-400 prose-h2:text-base prose-h2:text-blue-300 prose-h3:text-sm prose-h3:text-gray-200 prose-p:text-gray-300 prose-li:text-gray-300 prose-strong:text-gray-200 prose-a:text-blue-400 prose-code:text-gray-400"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  const blocks = content.split(/\n\n+/)
  return (
    <div className="dossier-view space-y-0">
      {blocks.map((block, i) => {
        const lines = block.split('\n').filter(Boolean)
        const firstLine = lines[0] ?? ''
        const trimmedFirst = firstLine.trim()
        if (/^####\s/.test(trimmedFirst)) {
          const title = trimmedFirst.replace(/^####\s+/, '')
          return (
            <div key={i} className="dossier-section dossier-section-h4">
              <h4>{withBold(title)}</h4>
              {lines.length > 1 && <div className="dossier-body">{withBold(lines.slice(1).join('\n'))}</div>}
            </div>
          )
        }
        if (/^###\s/.test(trimmedFirst)) {
          const title = trimmedFirst.replace(/^###\s+/, '')
          return (
            <div key={i} className="dossier-section dossier-section-h3">
              <h3>{withBold(title)}</h3>
              {lines.length > 1 && <div className="dossier-body">{withBold(lines.slice(1).join('\n'))}</div>}
            </div>
          )
        }
        if (/^##\s/.test(trimmedFirst)) {
          const title = trimmedFirst.replace(/^##\s+/, '')
          return (
            <div key={i} className="dossier-section dossier-section-h2">
              <h2>{withBold(title)}</h2>
              {lines.length > 1 && <div className="dossier-body">{withBold(lines.slice(1).join('\n'))}</div>}
            </div>
          )
        }
        if (/^#\s/.test(trimmedFirst)) {
          const title = trimmedFirst.replace(/^#\s+/, '')
          return (
            <div key={i} className="dossier-section dossier-section-h1">
              <h1>{withBold(title)}</h1>
              {lines.length > 1 && <div className="dossier-body">{withBold(lines.slice(1).join('\n'))}</div>}
            </div>
          )
        }
        const isListLine = (l: string) => /^[—\-]\s/.test(l) || /^\d+[.)]\s/.test(l)
        const listItemIndices = lines.map((l, idx) => (isListLine(l) ? idx : -1)).filter(idx => idx >= 0)
        const hasList = listItemIndices.length > 0
        const firstListIdx = listItemIndices[0] ?? lines.length
        const headerLines = firstListIdx > 0 ? lines.slice(0, firstListIdx) : []
        const listLines = lines.slice(firstListIdx).filter(isListLine)
        if (hasList && listLines.length > 0) {
          return (
            <div key={i} className="dossier-section">
              {headerLines.length > 0 && (
                <div className="dossier-section-title whitespace-pre-wrap">
                  {withBold(headerLines.map(line => line.trim()).join('\n'))}
                </div>
              )}
              <ul className="dossier-list">
                {listLines.map((line, j) => (
                  <li key={j} className="whitespace-pre-wrap">
                    {withBold(line.replace(/^[—\-]\s/, '').replace(/^\d+[.)]\s/, ''))}
                  </li>
                ))}
              </ul>
            </div>
          )
        }
        const isSectionHeader = /^[А-Яа-яA-Za-z0-9\s\-]+:\s*$/.test(trimmedFirst) && lines.length >= 1
        if (isSectionHeader && trimmedFirst) {
          return (
            <div key={i} className="dossier-section">
              <div className="dossier-section-title">{withBold(firstLine.replace(/:$/, '').trim())}</div>
              {lines.length > 1 && <div className="dossier-body">{withBold(lines.slice(1).join('\n'))}</div>}
            </div>
          )
        }
        return (
          <p key={i} className="dossier-paragraph dossier-body">
            {withBold(block)}
          </p>
        )
      })}
    </div>
  )
}
