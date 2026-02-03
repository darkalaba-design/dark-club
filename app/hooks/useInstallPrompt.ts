'use client'

import { useEffect, useState, useCallback } from 'react'

/** localStorage key: popup shown once and dismissed = don't auto-show again */
const INSTALL_POPUP_DISMISSED_KEY = 'dark-club-pwa-install-popup-dismissed'

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed'; platform?: string }>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform?: string }>
}

/**
 * Detects iOS (Safari) for "Share → Add to Home Screen" instructions.
 */
export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

/**
 * True when app is running as installed PWA (standalone).
 * Do not show install UI in this case.
 */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    (window as Window & { standalone?: boolean }).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  )
}

/**
 * Hook: install prompt state and popup behavior.
 * - Captures beforeinstallprompt (Android/Chromium).
 * - Tracks "show once on first visit" via localStorage.
 * - Does not show if already installed (standalone).
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
      navigator.serviceWorker.register('/sw.js').catch(() => {})
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
