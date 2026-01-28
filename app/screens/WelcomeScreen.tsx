'use client'

interface WelcomeScreenProps {
  onStart: () => void
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="text-7xl mb-6">🎭</div>
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
        className="px-12 py-4 bg-blue-500 hover:bg-blue-600 text-white text-lg font-semibold rounded-lg transition-colors mb-16"
      >
        Начать анализ
      </button>

      {/* Disclaimer */}
      <div className="max-w-2xl bg-dark-card border border-dark rounded-xl p-6 text-left">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h3 className="text-lg font-semibold mb-3 text-light">
              Dark Club — образовательный проект
            </h3>
            <p className="text-gray-300 mb-4">
              Мы изучаем психологию влияния, чтобы:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4 ml-4">
              <li>Распознавать манипуляции в свой адрес</li>
              <li>Понимать механизмы убеждения</li>
              <li>Применять этичные техники в бизнесе и общении</li>
            </ul>
            <p className="text-yellow-400 font-medium">
              Помни: манипуляция без согласия — это нарушение границ. Используй знания для защиты и честного влияния.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
