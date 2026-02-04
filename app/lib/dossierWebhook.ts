import type { Profile } from '../data/profiles'
import { formatProfileForPrompt } from './formatProfileForPrompt'

const DOSSIER_WEBHOOK_URL = 'https://hook.eu2.make.com/0tubplrpn5t31qfofdhc3u91wtqf9r7b'

/**
 * Отправляет profileForPrompt на webhook (тот же URL для «Создать Досье» и «Обновить досье»).
 * В body только profileForPrompt — текст для User prompt в Make.com → ChatGPT.
 * @throws Error при ошибке сети или не-2xx ответе
 */
export async function sendProfileToDossierWebhook(profile: Profile): Promise<unknown> {
  const profileForPrompt = formatProfileForPrompt(profile)
  const payload = { profileForPrompt }
  const res = await fetch(DOSSIER_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    throw new Error(`Webhook error: ${res.status} ${res.statusText}`)
  }
  const contentType = res.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return res.json()
  }
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}
