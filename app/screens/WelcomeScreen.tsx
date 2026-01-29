'use client'

import Image from 'next/image'

interface WelcomeScreenProps {
  onStart: () => void
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 pt-6">
      <div
        className="mt-6 mb-0 relative flex items-center justify-center overflow-hidden"
        style={{ width: 140, height: 140, minWidth: 0, minHeight: 0, maxWidth: 140, maxHeight: 140, flexShrink: 0, flexGrow: 0, boxSizing: 'border-box' }}
      >
        <Image
          src="/logo.svg"
          alt="Dark Club"
          width={100}
          height={100}
          className="object-contain pb-6"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          priority
        />
      </div>
      <h1 className="text-5xl font-bold mb-4 text-light">DARK CLUB</h1>
      <h2 className="text-2xl text-gray-400 mb-12">Конструктор Манипуляций</h2>

      {/* Режимы (заглушки) */}
      <div className="flex gap-4 mb-12">
        <button
          className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium cursor-default"
          disabled
        >
          Общение
        </button>
        <button
          className="px-6 py-3 bg-dark-card-light text-gray-500 rounded-lg font-medium cursor-not-allowed opacity-50"
          disabled
          title="Скоро"
        >
          Маркетинг
        </button>
        <button
          className="px-6 py-3 bg-dark-card-light text-gray-500 rounded-lg font-medium cursor-not-allowed opacity-50"
          disabled
          title="Скоро"
        >
          Защита
        </button>
      </div>

      {/* Кнопка начать */}
      <button
        onClick={onStart}
        className="px-12 py-4 bg-blue-500 hover:bg-blue-600 text-white text-lg font-semibold rounded-lg transition-colors"
      >
        Начать анализ
      </button>
    </div>
  )
}
