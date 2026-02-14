'use client'

import DailyTip from '../components/DailyTip'
import DailyChallenge from '../components/DailyChallenge'
import ActiveScenarios from '../components/ActiveScenarios'

interface WelcomeScreenProps {
  onStart: () => void
  onShowAllScenarios?: () => void
}

export default function WelcomeScreen({ onStart, onShowAllScenarios }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center w-full max-w-[800px] mx-auto px-4 pb-8 pt-6">
      {/* Блок 1: Совет дня */}
      <div className="w-full mb-8">
        <DailyTip />
      </div>

      {/* Блок 2: Челлендж дня */}
      <div className="w-full mb-8">
        <DailyChallenge />
      </div>

      {/* Блок 3: Активные сценарии */}
      <div className="w-full mb-10">
        <ActiveScenarios
          onStartAnalysis={onStart}
          onShowAllScenarios={onShowAllScenarios}
        />
      </div>

      {/* Пресуппозиции НЛП */}
      <section className="w-full mt-6 pt-8 border-t border-dark">
        <div className="bg-dark-card border border-dark rounded-xl p-6 md:p-8">
          <h3 className="text-lg font-semibold text-light mb-4">Ключевые пресуппозиции НЛП</h3>
          <ul className="space-y-3 text-sm text-gray-400 leading-relaxed">
            <li className="flex flex-col gap-0.5">
              <span className="text-light font-medium">«Карта — не территория»</span>
              <span>Субъективное восприятие мира не является самой реальностью.</span>
            </li>
            <li className="flex flex-col gap-0.5">
              <span className="text-light font-medium">«Намерение любого действия — позитивно»</span>
              <span>Любое поведение имеет благие цели, даже если оно деструктивно.</span>
            </li>
            <li className="flex flex-col gap-0.5">
              <span className="text-light font-medium">«Нет поражений, есть только обратная связь»</span>
              <span>Ошибки — это опыт и информация, а не неудачи.</span>
            </li>
            <li className="flex flex-col gap-0.5">
              <span className="text-light font-medium">«Смысл коммуникации — в реакции»</span>
              <span>Важен результат вашего общения, а не то, что вы хотели сказать.</span>
            </li>
            <li className="flex flex-col gap-0.5">
              <span className="text-light font-medium">«У каждого есть все необходимые ресурсы»</span>
              <span>Человек способен изменить свое поведение и добиться успеха.</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  )
}
