/**
 * Дополнительные параметры профиля: коммуникационный стиль, мотивация, референция, темп решений.
 */

export interface ProfileParamOption {
  id: string
  label: string
  description?: string
  icon?: string
  /** Подпись под основным текстом (например, архетип для возраста) */
  subtitle?: string
}

/** Коммуникационный стиль: как человек общается */
export const communicationStyleOptions: ProfileParamOption[] = [
  { id: 'direct', label: 'Прямой', description: 'Говорит прямо, ценит честность' },
  { id: 'indirect', label: 'Непрямой', description: 'Намёки, контекст, избегание конфликтов' },
  { id: 'emotional', label: 'Эмоциональный', description: 'Экспрессивный, открытый' },
  { id: 'rational', label: 'Рациональный', description: 'Факты, логика, холодный' },
  { id: 'dominant', label: 'Доминирующий', description: 'Перебивает, настаивает' },
  { id: 'accommodating', label: 'Подстраивающийся', description: 'Слушает, соглашается' }
]

/** Мотивационный профиль: что мотивирует (К / От) */
export const motivationProfileOptions: ProfileParamOption[] = [
  {
    id: 'toward',
    label: 'Мотивация «К»',
    description: 'К результату, удовольствию, достижению. Фразы: «Ты получишь...», «Это даст тебе...»'
  },
  {
    id: 'away',
    label: 'Мотивация «От»',
    description: 'От проблемы, боли, потери. Фразы: «Ты избежишь...», «Это защитит тебя от...»'
  }
]

/** Референция: на что опирается при решениях */
export const referenceOptions: ProfileParamOption[] = [
  {
    id: 'internal',
    label: 'Внутренняя референция',
    description: 'На своё мнение, интуицию. Фразы: «Ты сам увидишь...», «Доверься своему опыту»'
  },
  {
    id: 'external',
    label: 'Внешняя референция',
    description: 'На мнение других, авторитетов. Фразы: «Эксперты говорят...», «Все уже используют...»'
  }
]

/** Темп принятия решений */
export const decisionPaceOptions: ProfileParamOption[] = [
  { id: 'impulsive', label: 'Импульсивный', description: 'Быстро, интуитивно' },
  { id: 'weighed', label: 'Взвешенный', description: 'Медленно, аналитически' },
  { id: 'procrastinator', label: 'Прокрастинатор', description: 'Откладывает до последнего' }
]

/** Пол (две кнопки в стиле radio) */
export const genderOptions: ProfileParamOption[] = [
  { id: 'male', label: 'Мужской', icon: '♂' },
  { id: 'female', label: 'Женский', icon: '♀' }
]

/** Возрастной диапазон (кнопки в стиле radio, сетка 2×2) */
export const ageRangeOptions: ProfileParamOption[] = [
  { id: '25-35', label: '25-35', subtitle: 'Воин/Любовница', icon: '⚔️' },
  { id: '35-45', label: '35-45', subtitle: 'Правитель/Мать', icon: '👑' },
  { id: '45-55', label: '45-55', subtitle: 'Маг/Мудрец', icon: '🔮' },
  { id: '55+', label: '55+', subtitle: 'Старец/Хранительница', icon: '🧙' }
]
