'use client'

import { useEffect, useState, useCallback } from 'react'

/** Ключ localStorage: окно установки закрыто — больше не показывать автоматически */
const INSTALL_POPUP_DISMISSED_KEY = 'dark-club-pwa-install-popup-dismissed'

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed'; platform?: string }>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform?: string }>
}

/**
 * Определяет iOS (Safari) для подсказки «Поделиться → На экран «Домой»».
 */
export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

/**
 * true, если приложение запущено как установленная PWA (standalone).
 * В этом случае не показывать установку.
 */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    (window as Window & { standalone?: boolean }).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  )
}

/**
 * Хук: состояние установки и окно подсказки.
 * - Перехватывает beforeinstallprompt (Android/Chromium).
 * - «Показать один раз» при первом визите через localStorage.
 * - Не показывать, если приложение уже установлено (standalone).
 */
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPopupAuto, setShowPopupAuto] = useState(false)
  const [popupOpen, setPopupOpen] = useState(false)
  const [installResult, setInstallResult] = useState<'idle' | 'prompting' | 'installed'>('idle')

  const standalone = typeof window !== 'undefined' ? isStandalone() : false
  const ios = typeof navigator !== 'undefined' ? isIOS() : false

  // Register service worker and listen for install prompt
  useEffect(() => {
    if (typeof window === 'undefined') return

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          // Проверяем обновления Service Worker
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Новый Service Worker установлен, можно обновить страницу
                  console.log('New service worker installed')
                }
              })
            }
          })
        })
        .catch((err) => {
          console.error('Service Worker registration failed:', err)
        })
    }

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Auto-show popup only once: not dismissed and not standalone
      if (standalone) return
      try {
        const dismissed = localStorage.getItem(INSTALL_POPUP_DISMISSED_KEY)
        if (!dismissed) setShowPopupAuto(true)
      } catch {
        setShowPopupAuto(true)
      }
    }

    const onAppInstalled = () => {
      setDeferredPrompt(null)
      setShowPopupAuto(false)
      setPopupOpen(false)
      setInstallResult('installed')
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [standalone])

  // iOS: auto-show popup once on first visit (if not dismissed, not standalone)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!ios || standalone) return
    try {
      const dismissed = localStorage.getItem(INSTALL_POPUP_DISMISSED_KEY)
      if (!dismissed) setShowPopupAuto(true)
    } catch {
      setShowPopupAuto(true)
    }
  }, [ios, standalone])

  const dismissPopup = useCallback(() => {
    setShowPopupAuto(false)
    setPopupOpen(false)
    try {
      localStorage.setItem(INSTALL_POPUP_DISMISSED_KEY, '1')
    } catch {}
  }, [])

  const openPopup = useCallback(() => {
    setPopupOpen(true)
  }, [])

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return
    setInstallResult('prompting')
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setPopupOpen(false)
        setShowPopupAuto(false)
      }
    } finally {
      setInstallResult('idle')
    }
  }, [deferredPrompt])

  const isPopupVisible = (showPopupAuto || popupOpen) && !standalone && installResult !== 'installed'
  const canOfferInstall = (deferredPrompt != null || ios) && !standalone && installResult !== 'installed'

  return {
    deferredPrompt,
    isIOS: ios,
    isStandalone: standalone,
    showPopupAuto,
    popupOpen,
    isPopupVisible,
    canOfferInstall,
    installResult,
    dismissPopup,
    openPopup,
    handleInstallClick,
  }
}
