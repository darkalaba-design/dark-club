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
      <body>
        <PWAProvider>{children}</PWAProvider>
      </body>
    </html>
  )
}
