'use client'

/**
 * Reusable install popup:
 * - Android/Chromium: Install button that triggers prompt()
 * - iOS: "Tap Share → Add to Home Screen" instructions
 * Simple, clean UI; no external libraries; responsive.
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
      {/* Backdrop: tap to close */}
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
      {/* Popup card */}
      <div
        role="dialog"
        aria-label="Install app"
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
          Install app
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
            Tap <strong style={{ color: '#e0e0e0' }}>Share</strong> at the bottom of the screen, then{' '}
            <strong style={{ color: '#e0e0e0' }}>Add to Home Screen</strong>.
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
            Add this app to your device for a better experience.
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
            Use your browser menu to install this app.
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
            Not now
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
              {isPrompting ? '…' : 'Install'}
            </button>
          )}
        </div>
      </div>
    </>
  )
}
