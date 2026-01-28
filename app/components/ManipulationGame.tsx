'use client'

import React, { useState, useMemo } from 'react'
import { ArrowRight, ArrowLeft, RotateCcw, CheckCircle, Info } from 'lucide-react'

type Step = 'role-self' | 'role-target' | 'target' | 'techniques'

interface Role {
  id: number
  name: string
  context: string
}

interface Target {
  id: number
  name: string
  hint: string
}

interface Technique {
  id: number
  name: string
  description: string
  templates: string[]
  targetEmotions: string[]
  bestTargets: string[]
}

interface SelectedData {
  selfRole: Role | null
  targetRole: Role | null
  target: Target | null
  selectedTechnique: Technique | null
}

const ManipulationConstructor = () => {
  const [currentStep, setCurrentStep] = useState<Step>('role-self')
  const [selectedData, setSelectedData] = useState<SelectedData>({
    selfRole: null,
    targetRole: null,
    target: null,
    selectedTechnique: null
  })

  // РОЛИ
  const roles: Role[] = [
    { id: 1, name: 'Жена', context: 'семейные отношения' },
    { id: 2, name: 'Муж', context: 'семейные отношения' },
    { id: 3, name: 'Родитель', context: 'воспитание' },
    { id: 4, name: 'Ребёнок', context: 'семья' },
    { id: 5, name: 'Начальник', context: 'работа' },
    { id: 6, name: 'Подчинённый', context: 'работа' },
    { id: 7, name: 'Продавец', context: 'продажи' },
    { id: 8, name: 'Покупатель', context: 'продажи' },
    { id: 9, name: 'Друг', context: 'дружба' },
    { id: 10, name: 'Учитель', context: 'образование' },
    { id: 11, name: 'Ученик', context: 'образование' },
    { id: 12, name: 'Врач', context: 'медицина' },
    { id: 13, name: 'Пациент', context: 'медицина' },
  ]

  // МИШЕНИ (потребности)
  const targets: Target[] = [
    { id: 1, name: 'Потребность в новых знаниях', hint: 'Давить: "ты недостаточно образован"' },
    { id: 2, name: 'Потребность в деньгах', hint: 'Давить: угроза финансовой нестабильности' },
    { id: 3, name: 'Потребность в сексе/близости', hint: 'Давить: угроза лишения близости' },
    { id: 4, name: 'Потребность в эмоциональном контакте', hint: 'Давить: эмоциональная холодность' },
    { id: 5, name: 'Потребность в самоутверждении и признании', hint: 'Давить: обесценивание достижений' },
    { id: 6, name: 'Потребность в общении', hint: 'Давить: угроза изоляции' },
    { id: 7, name: 'Потребность в самовыражении', hint: 'Давить: подавление индивидуальности' },
    { id: 8, name: 'Потребность в смысле жизни', hint: 'Давить: обесценивание целей' },
    { id: 9, name: 'Потребность в чистоте', hint: 'Давить: стыд за "грязь"' },
    { id: 10, name: 'Потребность в вероисповедании', hint: 'Давить: сомнение в вере' },
    { id: 11, name: 'Потребность в воспитании детей', hint: 'Давить: "ты плохой родитель"' },
    { id: 12, name: 'Потребность в красоте', hint: 'Давить: критика внешности' },
    { id: 13, name: 'Потребность в музыке', hint: 'Давить: обесценивание вкуса' },
    { id: 14, name: 'Потребность в алкоголе/курении', hint: 'Давить: стыд за зависимость' },
    { id: 15, name: 'Потребность в определенной еде', hint: 'Давить: критика пищевых привычек' },
    { id: 16, name: 'Потребность в отдыхе', hint: 'Давить: обвинение в лени' },
    { id: 17, name: 'Потребность в развлечении', hint: 'Давить: стыд за "инфантильность"' },
    { id: 18, name: 'Потребность в спорте', hint: 'Давить: сравнение с другими' },
    { id: 19, name: 'Потребность в предметах роскоши', hint: 'Давить: стыд за материализм' },
    { id: 20, name: 'Потребность в доминировании', hint: 'Давить: подрыв авторитета' },
    { id: 21, name: 'Потребность в образовании', hint: 'Давить: "ты недостаточно умный"' },
    { id: 22, name: 'Потребность в принадлежности группе', hint: 'Давить: угроза исключения' },
    { id: 23, name: 'Потребность в страдании', hint: 'Давить: обесценивание боли' },
    { id: 24, name: 'Потребность в танцах', hint: 'Давить: стыд за самовыражение' },
    { id: 25, name: 'Потребность в нежности', hint: 'Давить: холодность, отказ' },
    { id: 26, name: 'Потребность в заботе', hint: 'Давить: "ты эгоист"' },
    { id: 27, name: 'Потребность в труде', hint: 'Давить: обесценивание работы' },
    { id: 28, name: 'Потребность в материнстве/отцовстве', hint: 'Давить: сомнение в родительских качествах' }
  ]

  // ТЕХНИКИ МАНИПУЛЯЦИИ
  const techniques: Technique[] = [
    {
      id: 1,
      name: 'Обобщение (Универсализация)',
      description: 'Создание ложного социального доказательства через "все/никто/всегда/никогда"',
      templates: [
        'Все нормальные [роль] так делают...',
        'Никто никогда не [то, что просит жертва]...',
        'Любой на моём месте [оправдание]...',
        'Все говорят, что ты [негативное]...'
      ],
      targetEmotions: ['Стыд ("я не как все")', 'Страх исключения', 'Желание соответствовать'],
      bestTargets: ['Потребность в принадлежности группе', 'Потребность в признании']
    },
    {
      id: 2,
      name: 'Эгоизм манипулятора (Ультиматум)',
      description: 'Давление через угрозу разрыва отношений, отказ меняться',
      templates: [
        'Я такой, какой есть. Не нравится — [уходи/расходимся]',
        'Любить — значит принимать. А ты меня не принимаешь',
        'Я не буду под тебя подстраиваться',
        'Тебе нужен другой человек, а не я'
      ],
      targetEmotions: ['Страх потери', 'Вина', 'Беспомощность'],
      bestTargets: ['Потребность в любви', 'Потребность в стабильности', 'Страх одиночества']
    },
    {
      id: 3,
      name: 'Ты адекватный? (Сомнение)',
      description: 'Обесценивание реакций и чувств жертвы, приписывание излишней эмоциональности',
      templates: [
        'Ты слишком [драматизируешь/остро реагируешь/чувствительный]',
        'Ты из мухи слона делаешь',
        'Это всего лишь [преуменьшение], а ты устроил/а...',
        'У тебя паранойя'
      ],
      targetEmotions: ['Стыд за чувства', 'Сомнение в себе', 'Растерянность'],
      bestTargets: ['Потребность быть "нормальным"', 'Уверенность в себе']
    },
    {
      id: 4,
      name: 'Патологизация (Диагноз дилетанта)',
      description: 'Приписывание психологических проблем',
      templates: [
        'У тебя явно [травма/комплекс/проблемы] из детства',
        'Это твои внутренние [конфликты/страхи/неврозы]',
        'Тебе бы к психологу с этим...',
        'Ты проецируешь на меня свои страхи'
      ],
      targetEmotions: ['Стыд', 'Тревога ("что-то не так со мной")', 'Замешательство'],
      bestTargets: ['Потребность быть здоровым', 'Доверие к своему восприятию']
    },
    {
      id: 5,
      name: 'Игра в жертву',
      description: 'Переворачивание ситуации, где манипулятор становится пострадавшим',
      templates: [
        'Я и так для тебя всё делаю, а ты...',
        'Мне так тяжело, а ты ещё нагружаешь',
        'После всего, что я для тебя сделал...',
        'Вечно я виноват/а'
      ],
      targetEmotions: ['Вина', 'Жалость', 'Обязанность компенсировать'],
      bestTargets: ['Потребность заботиться', 'Чувство долга', 'Эмпатия']
    },
    {
      id: 6,
      name: 'Навешивание ярлыков',
      description: 'Присвоение негативной идентичности',
      templates: [
        'Ты — [неудачник/эгоист/слабак]',
        'Ты ведёшь себя как [негативная роль]',
        'Типичный [обобщённый ярлык]',
        'Ты просто [негативное качество]'
      ],
      targetEmotions: ['Стыд', 'Оборонительная позиция', 'Желание доказать обратное'],
      bestTargets: ['Самооценка', 'Потребность в признании']
    },
    {
      id: 7,
      name: 'Ложная дилемма',
      description: 'Создание иллюзии выбора только между двумя плохими вариантами',
      templates: [
        'Либо ты [делаешь что хочу], либо [угроза]',
        'Выбирай: я или [что-то ценное]',
        'Или доверяешь мне, или проверяешь — третьего не дано'
      ],
      targetEmotions: ['Тревога выбора', 'Страх потери', 'Давление'],
      bestTargets: ['Потребность в безопасности', 'Избегание конфликта']
    },
    {
      id: 8,
      name: 'Минимизация',
      description: 'Преуменьшение значимости проблемы или чувств',
      templates: [
        'Подумаешь, всего-то [преуменьшение]',
        'Да ладно, это ерунда',
        'Есть проблемы и посерьёзнее',
        'Ты преувеличиваешь значение этого'
      ],
      targetEmotions: ['Сомнение в важности', 'Чувство глупости', 'Обесценивание'],
      bestTargets: ['Доверие к себе', 'Право на чувства']
    },
    {
      id: 9,
      name: 'Gaslighting',
      description: 'Искажение реальности, отрицание фактов',
      templates: [
        'Этого не было, тебе показалось',
        'Я такого не говорил, ты придумываешь',
        'У тебя плохая память',
        'Ты всё перепутал/а'
      ],
      targetEmotions: ['Сомнение в реальности', 'Растерянность', 'Страх сумасшествия'],
      bestTargets: ['Доверие к своей памяти', 'Уверенность в восприятии']
    },
    {
      id: 10,
      name: 'Переворачивание (DARVO)',
      description: 'Отрицание → Атака → Перестановка ролей жертвы и агрессора',
      templates: [
        'Это ты меня [то, в чём обвиняет жертва]',
        'Я тут жертва, а не ты',
        'Ты на меня нападаешь, а я защищаюсь',
        'Кто кого обижает — ещё посмотрим'
      ],
      targetEmotions: ['Замешательство', 'Вина', 'Оборонительная позиция'],
      bestTargets: ['Чувство справедливости', 'Эмпатия']
    },
    {
      id: 11,
      name: 'Сравнение вниз',
      description: 'Обесценивание через сравнение с худшим вариантом',
      templates: [
        'А вот [имя] вообще [хуже], а я всего лишь...',
        'Будь рад/а что не хуже',
        'Могло быть гораздо хуже',
        'Другие бы на твоём месте...'
      ],
      targetEmotions: ['Ложная благодарность', 'Снижение планки', 'Примирение с плохим'],
      bestTargets: ['Потребность в лучшем', 'Стандарты отношений']
    },
    {
      id: 12,
      name: 'Проекция будущего кошмара',
      description: 'Запугивание последствиями',
      templates: [
        'Если ты [не сделаешь], то [катастрофа]',
        'Пожалеешь потом...',
        'Потом поздно будет',
        'Останешься одна/один и поймёшь'
      ],
      targetEmotions: ['Страх будущего', 'Тревога', 'Паника'],
      bestTargets: ['Потребность в безопасности', 'Избегание потерь']
    },
    {
      id: 13,
      name: 'Приписывание намерений',
      description: 'Чтение мыслей, приписывание негативных мотивов',
      templates: [
        'Ты специально [негативное действие]',
        'Ты хочешь [негативная цель]',
        'Я знаю, что ты задумал/а',
        'Ты делаешь это назло мне'
      ],
      targetEmotions: ['Оборонительная позиция', 'Несправедливость', 'Возмущение'],
      bestTargets: ['Потребность быть понятым', 'Чувство справедливости']
    },
    {
      id: 14,
      name: 'Встраивание вины и стыда',
      description: 'Прямое индуцирование негативных эмоций',
      templates: [
        'Как ты мог/ла так поступить?',
        'Мне стыдно за тебя',
        'Ты подвёл/подвела меня',
        'Из-за тебя [негативное последствие]'
      ],
      targetEmotions: ['Вина', 'Стыд', 'Самобичевание'],
      bestTargets: ['Совесть', 'Потребность быть хорошим']
    },
    {
      id: 15,
      name: 'Провокация идентичности',
      description: 'Давление через социальную роль или гендер',
      templates: [
        'Где твоя [мужская гордость/женская мудрость]?',
        'Ты [мужчина/женщина] или как?',
        'Настоящий/ая [роль] так не поступает',
        'Какой из тебя [роль]?'
      ],
      targetEmotions: ['Стыд за несоответствие', 'Давление роли', 'Оборонительная позиция'],
      bestTargets: ['Гендерная идентичность', 'Социальная роль', 'Самоуважение']
    }
  ]

  // Фильтрация техник на основе выбранной мишени
  const filteredTechniques = useMemo(() => {
    if (!selectedData.target) return techniques

    return techniques.filter(tech => {
      // Проверяем, подходит ли техника для выбранной мишени
      return tech.bestTargets.some(bestTarget => 
        selectedData.target?.name.toLowerCase().includes(bestTarget.toLowerCase().replace('потребность в ', '')) ||
        bestTarget.toLowerCase().includes(selectedData.target.name.toLowerCase().replace('потребность в ', ''))
      )
    }).sort((a, b) => {
      // Сортируем по релевантности (сколько совпадений с мишенью)
      const aScore = a.bestTargets.filter(t => 
        selectedData.target?.name.toLowerCase().includes(t.toLowerCase().replace('потребность в ', '')) ||
        t.toLowerCase().includes(selectedData.target.name.toLowerCase().replace('потребность в ', ''))
      ).length
      const bScore = b.bestTargets.filter(t => 
        selectedData.target?.name.toLowerCase().includes(t.toLowerCase().replace('потребность в ', '')) ||
        t.toLowerCase().includes(selectedData.target.name.toLowerCase().replace('потребность в ', ''))
      ).length
      return bScore - aScore
    })
  }, [selectedData.target])

  const handleNext = () => {
    if (currentStep === 'role-self' && selectedData.selfRole) {
      setCurrentStep('role-target')
    } else if (currentStep === 'role-target' && selectedData.targetRole) {
      setCurrentStep('target')
    } else if (currentStep === 'target' && selectedData.target) {
      setCurrentStep('techniques')
    }
  }

  const handleBack = () => {
    if (currentStep === 'role-target') {
      setCurrentStep('role-self')
    } else if (currentStep === 'target') {
      setCurrentStep('role-target')
    } else if (currentStep === 'techniques') {
      setCurrentStep('target')
    }
  }

  const handleReset = () => {
    setCurrentStep('role-self')
    setSelectedData({
      selfRole: null,
      targetRole: null,
      target: null,
      selectedTechnique: null
    })
  }

  const canProceed = () => {
    if (currentStep === 'role-self') return selectedData.selfRole !== null
    if (currentStep === 'role-target') return selectedData.targetRole !== null
    if (currentStep === 'target') return selectedData.target !== null
    return false
  }

  // Компонент карточки
  const Card = ({ 
    title, 
    subtitle, 
    selected = false, 
    onClick,
    color = '#3b82f6'
  }: {
    title: string
    subtitle?: string
    selected?: boolean
    onClick?: () => void
    color?: string
  }) => (
    <div
      onClick={onClick}
      style={{
        border: `2px solid ${selected ? color : '#e5e7eb'}`,
        borderRadius: '12px',
        padding: '16px',
        backgroundColor: selected ? `${color}10` : 'white',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        if (onClick && !selected) {
          e.currentTarget.style.borderColor = color
          e.currentTarget.style.backgroundColor = `${color}05`
        }
      }}
      onMouseLeave={(e) => {
        if (onClick && !selected) {
          e.currentTarget.style.borderColor = '#e5e7eb'
          e.currentTarget.style.backgroundColor = 'white'
        }
      }}
    >
      {selected && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          color: color
        }}>
          <CheckCircle size={20} />
        </div>
      )}
      <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: subtitle ? '4px' : '0' }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: '13px', color: '#666' }}>
          {subtitle}
        </div>
      )}
    </div>
  )

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Заголовок */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px' 
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
          🎭 Конструктор Манипуляций
        </h1>
        <button
          onClick={handleReset}
          style={{
            padding: '10px 16px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            background: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px'
          }}
        >
          <RotateCcw size={16} />
          Сброс
        </button>
      </div>

      {/* Прогресс */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '32px',
        justifyContent: 'center'
      }}>
        {(['role-self', 'role-target', 'target', 'techniques'] as Step[]).map((step, index) => {
          const stepNames = ['Ваша роль', 'Роль цели', 'Мишень', 'Техники']
          const isActive = currentStep === step
          const isCompleted = 
            (step === 'role-self' && selectedData.selfRole) ||
            (step === 'role-target' && selectedData.targetRole) ||
            (step === 'target' && selectedData.target) ||
            (step === 'techniques' && selectedData.selectedTechnique)
          
          return (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: isActive ? '#3b82f6' : isCompleted ? '#10b981' : '#e5e7eb',
                color: isActive || isCompleted ? 'white' : '#666',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                {isCompleted && !isActive ? '✓' : index + 1}
              </div>
              {index < 3 && (
                <div style={{
                  width: '40px',
                  height: '2px',
                  backgroundColor: isCompleted ? '#10b981' : '#e5e7eb'
                }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Шаг 1: Выбор своей роли */}
      {currentStep === 'role-self' && (
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>
            Шаг 1: Выберите вашу роль
          </h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            Кто вы в этой ситуации?
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '12px' 
          }}>
            {roles.map(role => (
              <Card
                key={role.id}
                title={role.name}
                subtitle={role.context}
                selected={selectedData.selfRole?.id === role.id}
                onClick={() => setSelectedData(prev => ({ ...prev, selfRole: role }))}
                color="#3b82f6"
              />
            ))}
          </div>
        </div>
      )}

      {/* Шаг 2: Выбор роли цели */}
      {currentStep === 'role-target' && (
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>
            Шаг 2: Выберите роль манипулируемого
          </h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            На кого вы хотите воздействовать?
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '12px' 
          }}>
            {roles.map(role => (
              <Card
                key={role.id}
                title={role.name}
                subtitle={role.context}
                selected={selectedData.targetRole?.id === role.id}
                onClick={() => setSelectedData(prev => ({ ...prev, targetRole: role }))}
                color="#ef4444"
              />
            ))}
          </div>
        </div>
      )}

      {/* Шаг 3: Выбор мишени */}
      {currentStep === 'target' && (
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>
            Шаг 3: Выберите мишень (потребность)
          </h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            На какую потребность вы хотите воздействовать?
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
            gap: '12px' 
          }}>
            {targets.map(target => (
              <div key={target.id}>
                <Card
                  title={target.name}
                  subtitle={target.hint}
                  selected={selectedData.target?.id === target.id}
                  onClick={() => setSelectedData(prev => ({ ...prev, target }))}
                  color="#f59e0b"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Шаг 4: Подбор техник */}
      {currentStep === 'techniques' && (
        <div>
          <div style={{ 
            backgroundColor: '#f0f9ff', 
            padding: '16px', 
            borderRadius: '12px', 
            marginBottom: '24px',
            border: '1px solid #0ea5e9'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>📋 Ваш выбор:</div>
            <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <div><strong>Ваша роль:</strong> {selectedData.selfRole?.name}</div>
              <div><strong>Роль цели:</strong> {selectedData.targetRole?.name}</div>
              <div><strong>Мишень:</strong> {selectedData.target?.name}</div>
            </div>
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>
            Шаг 4: Подходящие техники
          </h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            На основе выбранной мишени подобраны наиболее эффективные техники:
          </p>

          {filteredTechniques.length === 0 ? (
            <div style={{ 
              padding: '24px', 
              textAlign: 'center', 
              backgroundColor: '#fef3c7',
              borderRadius: '12px',
              border: '1px solid #fbbf24'
            }}>
              <p>Для выбранной мишени не найдено подходящих техник. Попробуйте выбрать другую мишень.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredTechniques.map(tech => (
                <div
                  key={tech.id}
                  style={{
                    border: `2px solid ${selectedData.selectedTechnique?.id === tech.id ? '#10b981' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    padding: '20px',
                    backgroundColor: selectedData.selectedTechnique?.id === tech.id ? '#f0fdf4' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setSelectedData(prev => ({ 
                    ...prev, 
                    selectedTechnique: prev.selectedTechnique?.id === tech.id ? null : tech 
                  }))}
                  onMouseEnter={(e) => {
                    if (selectedData.selectedTechnique?.id !== tech.id) {
                      e.currentTarget.style.borderColor = '#3b82f6'
                      e.currentTarget.style.backgroundColor = '#f0f9ff'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedData.selectedTechnique?.id !== tech.id) {
                      e.currentTarget.style.borderColor = '#e5e7eb'
                      e.currentTarget.style.backgroundColor = 'white'
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '18px', 
                        fontWeight: 'bold', 
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {tech.name}
                        {selectedData.selectedTechnique?.id === tech.id && (
                          <CheckCircle size={20} color="#10b981" />
                        )}
                      </div>
                      <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                        {tech.description}
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    backgroundColor: '#f9fafb', 
                    padding: '12px', 
                    borderRadius: '8px',
                    marginBottom: '12px'
                  }}>
                    <div style={{ 
                      fontSize: '13px', 
                      fontWeight: 'bold', 
                      marginBottom: '8px',
                      color: '#374151'
                    }}>
                      💡 Шаблоны фраз:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {tech.templates.map((template, i) => (
                        <div key={i} style={{ 
                          fontSize: '13px', 
                          color: '#4b5563',
                          fontStyle: 'italic',
                          paddingLeft: '12px',
                          borderLeft: '2px solid #d1d5db'
                        }}>
                          • {template}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#dc2626' }}>
                        Вызывает эмоции:
                      </div>
                      <div style={{ color: '#666' }}>
                        {tech.targetEmotions.join(', ')}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#2563eb' }}>
                        Работает с мишенями:
                      </div>
                      <div style={{ color: '#666' }}>
                        {tech.bestTargets.join(', ')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedData.selectedTechnique && (
            <div style={{ 
              marginTop: '24px',
              padding: '20px',
              backgroundColor: '#ecfdf5',
              borderRadius: '12px',
              border: '2px solid #10b981'
            }}>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Info size={20} color="#10b981" />
                Выбранная техника: {selectedData.selectedTechnique.name}
              </div>
              <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#065f46' }}>
                <p style={{ marginBottom: '8px' }}>
                  Используйте эту технику для воздействия на <strong>{selectedData.target?.name}</strong> 
                  {' '}в ситуации, где вы <strong>{selectedData.selfRole?.name}</strong>, 
                  {' '}а цель — <strong>{selectedData.targetRole?.name}</strong>.
                </p>
                <p>
                  Техника вызовет следующие эмоции: {selectedData.selectedTechnique.targetEmotions.join(', ')}.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Навигация */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginTop: '32px',
        paddingTop: '24px',
        borderTop: '1px solid #e5e7eb'
      }}>
        <button
          onClick={handleBack}
          disabled={currentStep === 'role-self'}
          style={{
            padding: '12px 24px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            background: currentStep === 'role-self' ? '#f3f4f6' : 'white',
            cursor: currentStep === 'role-self' ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: currentStep === 'role-self' ? 0.5 : 1
          }}
        >
          <ArrowLeft size={18} />
          Назад
        </button>

        {currentStep !== 'techniques' && (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              background: canProceed() ? '#3b82f6' : '#9ca3af',
              color: 'white',
              cursor: canProceed() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 'bold'
            }}
          >
            Далее
            <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  )
}

export default ManipulationConstructor
