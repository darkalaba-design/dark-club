'use client'

import { useEffect, useState } from 'react'

type Diagnostic = { label: string; value: string; status: 'ok' | 'warn' | 'fail' }

export default function PWADiagnostics() {
  const [show, setShow] = useState(false)
  const [items, setItems] = useState<Diagnostic[]>([])
  const [installPromptFired, setInstallPromptFired] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('pwa-debug') !== '1') return
    setShow(true)

    const list: Diagnostic[] = []

    // 1. Secure context (HTTPS)
    const isSecure = window.isSecureContext
    list.push({
      label: 'HTTPS (безопасный контекст)',
      value: isSecure ? 'Да' : 'Нет',
      status: isSecure ? 'ok' : 'fail',
    })

    // 2. Display mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    const mode = standalone ? 'standalone (уже установлено)' : 'browser'
    list.push({
      label: 'Режим отображения',
      value: mode,
      status: standalone ? 'warn' : 'ok',
    })

    // 3. User-Agent (short)
    const ua = navigator.userAgent
    const uaShort = ua.length > 50 ? ua.slice(0, 50) + '…' : ua
    list.push({ label: 'User-Agent', value: uaShort, status: 'ok' })

    // 4. Manifest
    list.push({ label: 'Манифест', value: 'Проверяю…', status: 'warn' })
    fetch('/manifest.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!json) {
          setItems((prev) =>
            prev.map((d) =>
              d.label === 'Манифест' ? { ...d, value: 'Ошибка: /manifest.json не загружен', status: 'fail' as const } : d
            )
          )
          return
        }
        const hasName = !!(json.name || json.short_name)
        const hasStartUrl = !!json.start_url
        const hasDisplay = ['standalone', 'fullscreen', 'minimal-ui'].includes(json.display)
        const icons = json.icons || []
        const has192 = icons.some((i: { sizes?: string }) => String(i.sizes || '').includes('192'))
        const has512 = icons.some((i: { sizes?: string }) => String(i.sizes || '').includes('512'))
        const all = hasName && hasStartUrl && hasDisplay && has192 && has512
        setItems((prev) =>
          prev.map((d) =>
            d.label === 'Манифест'
              ? {
                  label: 'Манифест',
                  value: all
                    ? 'OK (name, start_url, display, icons 192+512)'
                    : `Проблемы: name=${hasName} start_url=${hasStartUrl} display=${hasDisplay} 192=${has192} 512=${has512}`,
                  status: all ? 'ok' : 'fail',
                }
              : d
          )
        )
      })
      .catch(() => {
        setItems((prev) =>
          prev.map((d) =>
            d.label === 'Манифест' ? { ...d, value: 'Ошибка загрузки /manifest.json', status: 'fail' as const } : d
          )
        )
      })

    // 5. Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration('/').then((reg) => {
        setItems((prev) =>
          prev.map((d) =>
            d.label === 'Service Worker'
              ? {
                  label: 'Service Worker',
                  value: reg?.active ? 'Зарегистрирован' : reg ? 'Есть, но не active' : 'Не зарегистрирован',
                  status: reg?.active ? 'ok' : 'warn',
                }
              : d
          )
        )
      })
      list.push({ label: 'Service Worker', value: 'Проверяю…', status: 'warn' })
    } else {
      list.push({ label: 'Service Worker', value: 'Не поддерживается', status: 'fail' })
    }

    // 6. beforeinstallprompt
    const handler = () => setInstallPromptFired(true)
    window.addEventListener('beforeinstallprompt', handler)
    list.push({
      label: 'beforeinstallprompt',
      value: 'Ожидание события…',
      status: 'warn',
    })

    setItems(list)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  useEffect(() => {
    if (!installPromptFired || items.length === 0) return
    setItems((prev) =>
      prev.map((d) =>
        d.label === 'beforeinstallprompt'
          ? { ...d, value: 'Сработало — установка доступна', status: 'ok' as const }
          : d
      )
    )
  }, [installPromptFired, items.length])

  if (!show) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-lg mx-auto bg-dark-card border border-dark rounded-xl p-4 shadow-lg text-left">
      <h3 className="text-sm font-semibold text-light mb-2">PWA: диагностика установки</h3>
      <p className="text-xs text-gray-400 mb-3">
        Откройте с <code className="bg-black/30 px-1 rounded">?pwa-debug=1</code>. На Samsung/Android: меню браузера (⋮) → «Установить приложение» или «Добавить на главный экран». Chrome может показывать установку после тапа и ~30 сек на странице.
      </p>
      <ul className="space-y-1.5 text-xs">
        {items.map((d) => (
          <li key={d.label} className="flex items-start gap-2">
            <span
              className={
                d.status === 'ok' ? 'text-green-500' : d.status === 'fail' ? 'text-red-400' : 'text-yellow-500'
              }
            >
              {d.status === 'ok' ? '✓' : d.status === 'fail' ? '✗' : '…'}
            </span>
            <span className="text-gray-400">{d.label}:</span>
            <span className="text-light break-all">{d.value}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => setShow(false)}
        className="mt-3 text-xs text-blue-400 hover:text-blue-300"
      >
        Скрыть
      </button>
    </div>
  )
}
