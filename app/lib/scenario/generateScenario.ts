/**
 * Модуль 4: Генерация сценария — 4 фазы с фразами и заметками.
 */

import { psychotypes } from '../../data/psychotypes'
import type { Profile } from '../../data/profiles'
import type { Technique } from '../../data/techniques'
import type { ScenarioTarget } from './types'
import type { ScenarioPhase } from './types'
import type { StateModifiers } from '../../data/stateModifiers'
import type { AnalyzedContext } from './types'

export function generateRapportPhase(
  context: AnalyzedContext,
  _targets: ScenarioTarget[],
  profile: Profile | null
): ScenarioPhase {
  const phase: ScenarioPhase = {
    title: 'Фаза 1: Установление контакта',
    goal: 'Снять сопротивление и создать доверие',
    technique: null,
    phrases: [],
    expectedReaction: '',
    notes: []
  }

  if (profile?.communicationStyle === 'emotional') {
    phase.technique = { title: 'Эмпатическое присоединение', description: 'Покажите, что понимаете его чувства' }
  } else if (profile?.communicationStyle === 'rational') {
    phase.technique = { title: 'Логическое присоединение', description: 'Покажите, что понимаете его логику' }
  } else {
    phase.technique = { title: 'Присоединение к убеждениям', description: 'Согласитесь с его точкой зрения' }
  }

  const approach = context.stateModifiers.preferredApproach
  if (approach === 'поддерживающий') {
    phase.phrases = [
      'Я вижу, что сейчас непростое время. [Пауза, зрительный контакт]',
      'Понимаю, что у тебя сейчас много задач и это давит.',
      'Не хочу добавлять тебе стресса. Просто хотел обсудить один момент.'
    ]
    phase.expectedReaction = 'Расслабление, снижение защиты («Да, сложно сейчас...»)'
  } else if (approach === 'энергичный') {
    phase.phrases = [
      'Классно, что у тебя сейчас такой подъём! Вижу, энергии море.',
      'Хочу поделиться идеей, думаю, тебе зайдёт в таком настроении.',
      'Давно хотел с тобой обсудить — ты как раз в том состоянии, когда можно думать масштабно.'
    ]
    phase.expectedReaction = 'Энтузиазм, открытость («Да, давай, что там?»)'
  } else {
    phase.phrases = [
      '[Имя], хочу обсудить с тобой одну мысль. Минут 10 есть?',
      'Ценю твоё мнение по [тема]. Можем поговорить?',
      'Есть идея, хотел бы услышать твой взгляд.'
    ]
    phase.expectedReaction = 'Нейтральное согласие («Да, слушаю»)'
  }

  if (profile?.psychotype) {
    const psychotype = psychotypes.find(p => p.id === profile.psychotype)
    if (psychotype) {
      phase.notes.push(`💡 Учитывая психотип (${psychotype.title}): ${psychotype.communication}`)
    }
  }

  return phase
}

export function generateTensionPhase(
  context: AnalyzedContext,
  targets: ScenarioTarget[],
  techniques: Technique[],
  profile: Profile | null,
  targetDetails: string | null
): ScenarioPhase {
  const phase: ScenarioPhase = {
    title: 'Фаза 2: Создание напряжения',
    goal: 'Активировать мишень и создать потребность в изменении',
    targetUsed: null,
    technique: null,
    phrases: [],
    expectedReaction: '',
    notes: []
  }

  const useTargets = targets.filter(t => t.type !== 'avoid')
  const primaryTarget = useTargets.find(t => t.priority === 'high' || t.priority === 'critical') ?? useTargets[0]
  phase.targetUsed = primaryTarget ?? null

  const tensionTechs = techniques.filter(t =>
    ['framing', 'authority_card', 'scarcity_pressure'].includes(t.id)
  )
  phase.technique = tensionTechs[0] ?? techniques[0]
  if (phase.technique && 'id' in phase.technique) {
    (phase.technique as { id?: string }).id = (phase.technique as Technique).id
  }

  const targetId = primaryTarget?.id
  if (targetId === 'fear') {
    phase.phrases = [
      'Заметил, что [текущая_ситуация] создаёт риск [потери_чего_то_важного].',
      'Если ничего не изменится, через [срок] мы можем столкнуться с [негативные_последствия].',
      'Не хочу пугать, но факты говорят сами за себя: [конкретные_данные].'
    ]
    phase.expectedReaction = 'Тревога, внимание («А что конкретно может случиться?»)'
  } else if (targetId === 'greed') {
    phase.phrases = [
      'Сейчас есть возможность [получить_выгоду], но она не вечна.',
      'Подумай: [конкуренты/другие] уже используют это и получают [конкретная_выгода].',
      'Ты теряешь [время/деньги/возможности] каждый день, пока не [действие].'
    ]
    phase.expectedReaction = 'Интерес, жадность («Сколько можно получить?»)'
  } else if (targetId === 'vanity') {
    phase.phrases = [
      'Ты один из немногих, кто может это понять и оценить.',
      'С твоим уровнем [экспертизы/опыта], это для тебя — очевидный шаг вперёд.',
      'Не все готовы к таким решениям. Но ты — не «все».'
    ]
    phase.expectedReaction = 'Гордость, открытость («Да, я понимаю это»)'
  } else if (primaryTarget?.source === 'комплекс' && primaryTarget.id === 'inferiority') {
    phase.phrases = [
      'Ты справляешься с этим лучше, чем многие. Но можешь ещё лучше.',
      'Не хочу, чтобы ты потом жалел, что упустил шанс показать свой уровень.',
      'Это возможность доказать (в первую очередь себе), на что ты способен.'
    ]
    phase.expectedReaction = 'Внутренний вызов («Надо доказать...»)'
  } else if (primaryTarget?.howToUse) {
    phase.phrases = [primaryTarget.howToUse]
    phase.expectedReaction = 'Вовлечённость'
  } else {
    phase.phrases = [
      'Текущая ситуация создаёт проблему: [описание_проблемы].',
      'Это влияет на [то_что_важно_для_жертвы].',
      'Чем дольше мы ждём, тем сложнее будет решить.'
    ]
    phase.expectedReaction = 'Осознание проблемы («Да, это действительно так»)'
  }

  if (targetDetails) {
    phase.notes.push(`🎯 Конкретизация: Фокус на «${targetDetails}»`)
  }
  if (profile?.motivationProfile === 'toward') {
    phase.notes.push('💡 Мотивация «К»: Фокусируйтесь на выгодах и возможностях, а не на потерях')
  } else if (profile?.motivationProfile === 'away') {
    phase.notes.push('💡 Мотивация «От»: Фокусируйтесь на проблемах и рисках, которых можно избежать')
  }

  return phase
}

export function generateSolutionPhase(
  _context: AnalyzedContext,
  _targets: ScenarioTarget[],
  techniques: Technique[],
  profile: Profile | null,
  _targetAction: string | null,
  targetDetails: string | null
): ScenarioPhase {
  const phase: ScenarioPhase = {
    title: 'Фаза 3: Предложение решения',
    goal: 'Показать, как ваше предложение решает проблему',
    technique: null,
    phrases: [],
    expectedReaction: 'Интерес, рассмотрение («А как именно это работает?»)',
    notes: []
  }

  const solutionTechs = techniques.filter(t =>
    ['social_proof', 'authority_card', 'framing', 'reciprocity_trigger'].includes(t.id)
  )
  const tech = solutionTechs[0] ?? techniques[0]
  phase.technique = tech ? { title: tech.title, description: tech.description, id: tech.id } : null

  if (tech?.id === 'social_proof') {
    phase.phrases = [
      '[Группа_авторитетных_людей] уже [действие]. Результаты впечатляющие.',
      '[Конкретный_авторитет] говорит, что это лучшее решение для [проблема].',
      'Не буду изобретать велосипед — просто покажу, как это работает у [примеры].'
    ]
  } else if (tech?.id === 'authority_card') {
    phase.phrases = [
      'По данным [авторитетный_источник], этот подход даёт [конкретные_результаты].',
      'Эксперты в [область] единогласны: [ваше_предложение] — стандарт индустрии.',
      'Исследования показали, что [факты_в_пользу_решения].'
    ]
  } else if (tech?.id === 'framing') {
    if (profile?.motivationProfile === 'toward') {
      phase.phrases = [
        'Это не [негатив], а [позитив]. Ты получаешь [конкретная_выгода].',
        'Представь: через [срок] у тебя будет [желаемый_результат].',
        'Это инвестиция в [ценность], которая окупится [как_и_когда].'
      ]
    } else {
      phase.phrases = [
        'Это защитит тебя от [конкретная_угроза].',
        'Ты избежишь [проблема], с которой сталкиваются [другие].',
        'Это не трата [ресурс], а страховка от потери [что_важно].'
      ]
    }
  } else {
    phase.phrases = [
      'Вот что я предлагаю: [конкретное_предложение].',
      'Это решает твою проблему с [проблема] и даёт [выгода].',
      'Давай я покажу, как это работает на практике.'
    ]
  }

  if (targetDetails) {
    phase.notes.push(`🎯 Связь с целью: Подчеркните, как решение помогает «${targetDetails}»`)
  }
  if (profile?.reference === 'external') {
    phase.notes.push('💡 Внешняя референция: Опирайтесь на авторитеты, примеры других, статистику')
  } else if (profile?.reference === 'internal') {
    phase.notes.push('💡 Внутренняя референция: Дайте возможность самому оценить. «Ты сам увидишь...»')
  }

  return phase
}

export function generateClosePhase(
  _context: AnalyzedContext,
  techniques: Technique[],
  profile: Profile | null,
  _targetAction: string | null
): ScenarioPhase {
  const phase: ScenarioPhase = {
    title: 'Фаза 4: Закрытие на действие',
    goal: 'Получить конкретное согласие',
    technique: null,
    phrases: [],
    expectedReaction: 'Согласие («Ну ладно, давай попробуем») или уточняющие вопросы',
    notes: []
  }

  const closeTechs = techniques.filter(t =>
    ['foot_in_door', 'door_in_face', 'yes_ladder', 'silence_power'].includes(t.id)
  )
  const tech = closeTechs[0] ?? techniques[0]
  phase.technique = tech ? { title: tech.title, description: tech.description, id: tech.id } : null

  const pace = profile?.decisionPace
  if (pace === 'impulsive') {
    phase.phrases = [
      'Давай сделаем так: ты [малое_действие] прямо сейчас, и мы стартуем.',
      'Окей? [Протягиваю руку для рукопожатия / жду согласия]',
      'Отлично. Значит договорились — [конкретное_действие] до [срок].'
    ]
    phase.notes.push('⚡ Импульсивный тип: Не давайте времени на раздумья. Закрывайте сразу.')
  } else if (pace === 'weighed') {
    phase.phrases = [
      'Не нужно решать прямо сейчас. Подумай до [срок] и дай знать.',
      'Давай так: я вышлю тебе детали, ты изучишь, и мы созвонимся [когда].',
      'Если появятся вопросы — пиши, обсудим. Договорились?'
    ]
    phase.notes.push('🤔 Взвешенный тип: Дайте время на раздумья, но установите дедлайн.')
  } else if (pace === 'procrastinator') {
    phase.phrases = [
      'Понимаю, что нужно подумать. Но давай зафиксируем дату: [конкретная_дата].',
      'Чтобы не потерять момент, давай сделаем первый шаг сейчас: [малое_действие].',
      'Я позвоню тебе [когда] и мы финализируем. Окей?'
    ]
    phase.notes.push('⏳ Прокрастинатор: Создайте внешний дедлайн и разбейте на малые шаги.')
  } else {
    phase.phrases = [
      'Давай начнём с малого: [минимальное_действие]. Без обязательств.',
      'Попробуешь [действие] в течение [короткий_срок]. Если не зайдёт — вернёмся к старому.',
      'Договорились? [Пауза, ждём согласия]'
    ]
  }

  if (tech?.id === 'silence_power') {
    phase.notes.push('🤐 После предложения — молчите. Пауза 10–15 секунд. Первый заговоривший — проигрывает.')
  }

  return phase
}
