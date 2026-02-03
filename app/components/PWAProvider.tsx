'use client'

import { useEffect, useState } from 'react'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import InstallPopup from './InstallPopup'

/**
 * PWAProvider: install popup (show once), bottom install button, offline banner.
 * - Registers Service Worker via useInstallPrompt.
 * - Popup shows only once on first visit; dismissal stored in localStorage.
 * - Does not show install UI when app is already installed (standalone).
 */

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  const {
    deferredPrompt,
    isIOS,
    isStandalone,
    isPopupVisible,
    canOfferInstall,
    installResult,
    dismissPopup,
    openPopup,
    handleInstallClick,
  } = useInstallPrompt()

  const [online, setOnline] = useState(true)

  useEffect(() => {
    if (typeof navigator === 'undefined') return
    setOnline(navigator.onLine)
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  return (
    <>
      {children}

      {/* Install popup: auto-show once on first visit, or when opened via bottom button */}
      <InstallPopup
        isOpen={isPopupVisible}
        onClose={dismissPopup}
        onInstallClick={handleInstallClick}
        isIOS={isIOS}
        hasDeferredPrompt={deferredPrompt != null}
        isPrompting={installResult === 'prompting'}
      />

      {/* Bottom install button: opens same popup; hidden when standalone */}
      {canOfferInstall && (
        <button
          type="button"
          onClick={openPopup}
          style={{
            position: 'fixed',
            bottom: '16px',
            right: '16px',
            zIndex: 40,
            padding: '10px 16px',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#fff',
            backgroundColor: '#3b82f6',
            border: 'none',
            borderRadius: '9999px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
          aria-label="Install app"
        >
          Install app
        </button>
      )}

      {/* Offline banner: show when network is unavailable */}
      {!online && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            padding: '12px 16px',
            fontSize: '0.875rem',
            color: '#e0e0e0',
            backgroundColor: '#252525',
            borderTop: '1px solid #3a3a3a',
            textAlign: 'center',
          }}
        >
          You are offline
        </div>
      )}
    </>
  )
}
