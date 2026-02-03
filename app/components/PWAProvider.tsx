'use client'

import { useEffect, useState } from 'react'

const IOS_BANNER_KEY = 'dark-club-pwa-ios-banner-dismissed'
const INSTALL_BANNER_KEY = 'dark-club-pwa-install-banner-dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed'; platform?: string }>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform?: string }>
}

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
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [installResult, setInstallResult] = useState<'idle' | 'prompting' | 'installed'>('idle')

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Register service worker for PWA installability (same for any URL)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    // Chrome/Edge: capture install prompt so we can show our button
    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      try {
        const dismissed = sessionStorage.getItem(INSTALL_BANNER_KEY)
        if (!dismissed) setShowInstallBanner(true)
      } catch {
        setShowInstallBanner(true)
      }
    }

    const onAppInstalled = () => {
      setDeferredPrompt(null)
      setShowInstallBanner(false)
      setInstallResult('installed')
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
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

  const dismissInstallBanner = () => {
    setShowInstallBanner(false)
    try {
      sessionStorage.setItem(INSTALL_BANNER_KEY, '1')
    } catch {}
  }

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    setInstallResult('prompting')
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowInstallBanner(false)
      }
    } finally {
      setInstallResult('idle')
    }
  }

  const canShowInstallButton = deferredPrompt && !isStandalone() && installResult !== 'installed'

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
            className="text-xs text-blue-400 hover-text-blue-300"
          >
            Понятно
          </button>
        </div>
      )}
      {canShowInstallButton && showInstallBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-dark-card border-t border-solid border-blue-500 px-4 py-3 flex items-center justify-between gap-4 shadow-lg">
          <p className="text-sm text-light font-medium">Установить как приложение</p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              disabled={installResult === 'prompting'}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-70"
            >
              {installResult === 'prompting' ? '…' : 'Установить'}
            </button>
            <button
              type="button"
              onClick={dismissInstallBanner}
              className="text-xs text-gray-400 hover-text-light"
            >
              Позже
            </button>
          </div>
        </div>
      )}
      {canShowInstallButton && !showInstallBanner && (
        <button
          type="button"
          onClick={handleInstallClick}
          disabled={installResult === 'prompting'}
          className="fixed bottom-4 right-4 z-40 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-full shadow-lg transition-colors disabled:opacity-70"
          title="Установить как приложение"
        >
          {installResult === 'prompting' ? '…' : '⬇ Установить'}
        </button>
      )}
    </>
  )
}
