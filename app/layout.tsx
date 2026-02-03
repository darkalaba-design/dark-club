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
  // Splash screen (iOS): большой логотип на чёрном фоне — через Metadata API, чтобы теги точно попали в <head>
  links: [
    { rel: 'apple-touch-startup-image', href: '/splash.png', media: '(device-width: 390px) and (device-height: 844px)' },
    { rel: 'apple-touch-startup-image', href: '/splash.png', media: '(device-width: 428px) and (device-height: 926px)' },
    { rel: 'apple-touch-startup-image', href: '/splash.png', media: '(device-width: 430px) and (device-height: 932px)' },
    { rel: 'apple-touch-startup-image', href: '/splash.png', media: '(device-width: 393px) and (device-height: 852px)' },
    { rel: 'apple-touch-startup-image', href: '/splash.png' },
  ],
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
      <body>
        <PWAProvider>{children}</PWAProvider>
      </body>
    </html>
  )
}
