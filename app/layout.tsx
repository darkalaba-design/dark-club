import type { Metadata, Viewport } from 'next'
import './globals.css'
import PWAProvider from './components/PWAProvider'

export const metadata: Metadata = {
  title: 'Dark Club - Баттл Манипуляций',
  description: 'Обучающая игра для изучения техник манипуляций и защиты от них',
  manifest: '/manifest.json',
  icons: {
    apple: '/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Dark Club',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        {/* Splash screen (iOS): большой логотип по центру, чёрный фон сверху и снизу */}
        <link
          rel="apple-touch-startup-image"
          href="/splash.png"
          media="(device-width: 390px) and (device-height: 844px)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash.png"
          media="(device-width: 428px) and (device-height: 926px)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash.png"
          media="(device-width: 430px) and (device-height: 932px)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash.png"
          media="(device-width: 393px) and (device-height: 852px)"
        />
        {/* По умолчанию: большой логотип на чёрном фоне (splash.png 1080×1920) */}
        <link rel="apple-touch-startup-image" href="/splash.png" />
      </head>
      <body>
        <PWAProvider>{children}</PWAProvider>
      </body>
    </html>
  )
}
