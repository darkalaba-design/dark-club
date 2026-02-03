'use client'

/**
 * Окно установки приложения:
 * - Android/Chromium: кнопка «Установить» вызывает prompt()
 * - iOS: подсказка «Поделиться → На экран «Домой»»
 * Простой интерфейс, без внешних библиотек, адаптивный.
 */

interface InstallPopupProps {
  isOpen: boolean
  onClose: () => void
  onInstallClick: () => void
  isIOS: boolean
  hasDeferredPrompt: boolean
  isPrompting: boolean
}

export default function InstallPopup({
  isOpen,
  onClose,
  onInstallClick,
  isIOS,
  hasDeferredPrompt,
  isPrompting,
}: InstallPopupProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Затемнение: клик закрывает */}
      <div
        role="presentation"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 50,
        }}
      />
      {/* Карточка окна */}
      <div
        role="dialog"
        aria-label="Установить приложение"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(90vw, 360px)',
          maxHeight: '85vh',
          overflow: 'auto',
          backgroundColor: '#252525',
          border: '1px solid #3a3a3a',
          borderRadius: '12px',
          padding: '24px',
          zIndex: 51,
          boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
        }}
      >
        <h3
          style={{
            margin: '0 0 16px',
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#e0e0e0',
          }}
        >
          Установить приложение
        </h3>

        {isIOS ? (
          <p
            style={{
              margin: '0 0 20px',
              fontSize: '0.875rem',
              color: '#9ca3af',
              lineHeight: 1.5,
            }}
          >
            Нажмите <strong style={{ color: '#e0e0e0' }}>Поделиться</strong> внизу экрана, затем{' '}
            <strong style={{ color: '#e0e0e0' }}>На экран «Домой»</strong>.
          </p>
        ) : hasDeferredPrompt ? (
          <p
            style={{
              margin: '0 0 20px',
              fontSize: '0.875rem',
              color: '#9ca3af',
              lineHeight: 1.5,
            }}
          >
            Добавьте приложение на устройство для удобного доступа.
          </p>
        ) : (
          <p
            style={{
              margin: '0 0 20px',
              fontSize: '0.875rem',
              color: '#9ca3af',
              lineHeight: 1.5,
            }}
          >
            Используйте меню браузера для установки приложения.
          </p>
        )}

        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 20px',
              fontSize: '0.875rem',
              color: '#9ca3af',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Не сейчас
          </button>
          {!isIOS && hasDeferredPrompt && (
            <button
              type="button"
              onClick={onInstallClick}
              disabled={isPrompting}
              style={{
                padding: '10px 20px',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#fff',
                backgroundColor: '#3b82f6',
                border: 'none',
                borderRadius: '8px',
                cursor: isPrompting ? 'wait' : 'pointer',
                opacity: isPrompting ? 0.8 : 1,
              }}
            >
              {isPrompting ? '…' : 'Установить'}
            </button>
          )}
        </div>
      </div>
    </>
  )
}
