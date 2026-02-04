/**
 * Отправка данных на webhook только когда жертва — из профиля.
 * Payload: структурированный JSON (setup, profile, meta) по ТЗ Claude.
 */

import type { Profile } from '../data/profiles'
import { prepareWebhookPayload, type WebhookPayload } from './webhookPayload'
import type { AudienceContextId } from '../hooks/useAppState'

const SCENARIO_WEBHOOK_URL = 'https://hook.eu2.make.com/mlvjuwm9etwmvv2o7mofeinh7kgr0cl5'

/**
 * Готовит payload для webhook (только при наличии профиля).
 */
export function buildScenarioWebhookPayload(
  manipulatorRoleId: string | null,
  audienceContext: AudienceContextId | null,
  targetActionId: string | null,
  targetActionDetail: string | null,
  profile: Profile
): WebhookPayload {
  return prepareWebhookPayload(
    manipulatorRoleId,
    audienceContext,
    targetActionId,
    targetActionDetail,
    profile
  )
}

/**
 * Отправляет структурированный payload на webhook.
 * В body передаётся { body: { setup, profile, meta } }, чтобы в Make.com вытащить всё из {{body}}.
 * @throws Error при ошибке сети или не-2xx
 */
export async function sendScenarioToWebhook(payload: WebhookPayload): Promise<unknown> {
  const res = await fetch(SCENARIO_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body: payload })
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

export type { WebhookPayload }
