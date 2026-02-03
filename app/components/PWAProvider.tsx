'use client'

import { useEffect, useState } from 'react'

const IOS_BANNER_KEY = 'dark-club-pwa-ios-banner-dismissed'

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (window as Window & { standalone?: boolean }).standalone === true || window.matchMedia('(display-mode: standalone)').matches
}

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  const [showIOSBanner, setShowIOSBanner] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Register service worker for Chrome Android installability
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    // Show iOS hint only in Safari, not in standalone, and if not dismissed
    if (isIOS() && !isStandalone()) {
      try {
        const dismissed = localStorage.getItem(IOS_BANNER_KEY)
        if (!dismissed) setShowIOSBanner(true)
      } catch {
        setShowIOSBanner(true)
      }
    }
  }, [])

  const dismissIOSBanner = () => {
    setShowIOSBanner(false)
    try {
      localStorage.setItem(IOS_BANNER_KEY, '1')
    } catch {}
  }

  return (
    <>
      {children}
      {showIOSBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-dark-card border-t border-dark px-4 py-3 text-center text-sm text-gray-300 shadow-lg">
          <p className="mb-1 font-medium text-light">Установить приложение</p>
          <p className="mb-3 text-xs">Нажмите кнопку «Поделиться» внизу экрана и выберите «На экран „Домой“»</p>
          <button
            type="button"
            onClick={dismissIOSBanner}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            Понятно
          </button>
        </div>
      )}
    </>
  )
}
