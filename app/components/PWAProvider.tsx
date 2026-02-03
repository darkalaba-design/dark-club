'use client'

import { useEffect, useState } from 'react'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import InstallPopup from './InstallPopup'

/**
 * PWAProvider: окно установки (показ один раз), кнопка «Установить» внизу, баннер «Нет сети».
 * Регистрирует Service Worker через useInstallPrompt.
 * Окно установки показывается один раз при первом визите; закрытие сохраняется в localStorage.
 * Не показывает установку, если приложение уже установлено (standalone).
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

      {/* Окно установки: авто-показ один раз или по кнопке внизу */}
      <InstallPopup
        isOpen={isPopupVisible}
        onClose={dismissPopup}
        onInstallClick={handleInstallClick}
        isIOS={isIOS}
        hasDeferredPrompt={deferredPrompt != null}
        isPrompting={installResult === 'prompting'}
      />

      {/* Кнопка «Установить приложение» внизу; скрыта в standalone */}
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
          aria-label="Установить приложение"
        >
          Установить приложение
        </button>
      )}

      {/* Баннер при отсутствии сети */}
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
          Нет подключения к интернету
        </div>
      )}
    </>
  )
}
