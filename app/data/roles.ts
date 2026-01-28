export interface ManipulatorRole {
  id: string
  title: string
  description: string
  icon: string
}

export interface VictimRole {
  id: string
  title: string
  description: string
  icon: string
}

export const manipulatorRoles: ManipulatorRole[] = [
  {
    id: 'boss',
    title: 'Руководитель',
    description: 'Управляю командой, нужно мотивировать и направлять',
    icon: '👔'
  },
  {
    id: 'colleague',
    title: 'Коллега',
    description: 'Работаю в команде на равных',
    icon: '🤝'
  },
  {
    id: 'salesperson',
    title: 'Продавец/Переговорщик',
    description: 'Убеждаю в ценности предложения',
    icon: '💼'
  },
  {
    id: 'friend',
    title: 'Друг',
    description: 'Личные отношения, хочу помочь или договориться',
    icon: '🫂'
  },
  {
    id: 'partner',
    title: 'Партнёр (романтический)',
    description: 'Близкие отношения, решаю конфликт или строю доверие',
    icon: '💑'
  },
  {
    id: 'parent',
    title: 'Родитель',
    description: 'Воспитываю, направляю ребёнка',
    icon: '👨‍👩‍👧'
  }
]

export const victimRoles: VictimRole[] = [
  {
    id: 'subordinate',
    title: 'Подчинённый',
    description: 'Сотрудник в моей команде',
    icon: '👤'
  },
  {
    id: 'boss_victim',
    title: 'Руководитель',
    description: 'Мой начальник',
    icon: '👔'
  },
  {
    id: 'colleague_victim',
    title: 'Коллега',
    description: 'Равный по статусу',
    icon: '🤝'
  },
  {
    id: 'client',
    title: 'Клиент/Покупатель',
    description: 'Принимает решение о покупке',
    icon: '🛍️'
  },
  {
    id: 'friend_victim',
    title: 'Друг',
    description: 'Близкий человек',
    icon: '🫂'
  },
  {
    id: 'partner_victim',
    title: 'Партнёр (романтический)',
    description: 'Вторая половинка',
    icon: '💑'
  },
  {
    id: 'child',
    title: 'Ребёнок',
    description: 'Мой сын/дочь',
    icon: '👶'
  },
  {
    id: 'stranger',
    title: 'Незнакомец',
    description: 'Первый контакт',
    icon: '🎭'
  }
]
