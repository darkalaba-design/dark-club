'use client'

import { useState } from 'react'
import { relationshipTypeLabels, relationshipTypes } from '../data/profiles'

interface CreateProfileModalProps {
  onClose: () => void
  onCreate: (name: string, avatar: string, relationshipType: string) => void
}

const EMOJI_OPTIONS = ['👤', '👔', '👩', '🧑', '🫂', '💼', '🎭', '⭐', '🔥', '💜']

export default function CreateProfileModal({ onClose, onCreate }: CreateProfileModalProps) {
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('👤')
  const [relationshipType, setRelationshipType] = useState('other')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onCreate(trimmed, avatar, relationshipType)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black-70" onClick={onClose}>
      <div
        className="bg-dark-card border border-dark rounded-xl max-w-md w-full p-6 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-light mb-4">Новый профиль</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Имя человека *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Например: Иван Петров"
              className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-dark text-light placeholder-gray-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Аватар</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  className={`w-10 h-10 rounded-lg border-2 text-xl flex items-center justify-center transition-colors ${avatar === emoji ? 'border-blue-500 bg-blue-500-20' : 'border-dark bg-dark-bg hover-border-gray-500'
                    }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Тип отношений</label>
            <select
              value={relationshipType}
              onChange={e => setRelationshipType(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-dark text-light"
            >
              {relationshipTypes.map(key => (
                <option key={key} value={key}>
                  {relationshipTypeLabels[key]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-dark text-gray-400 hover-text-light transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-2 rounded-lg bg-blue-500 text-white font-medium disabled-opacity-50 disabled-cursor-not-allowed hover-bg-blue-600 transition-colors"
            >
              Создать профиль
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
