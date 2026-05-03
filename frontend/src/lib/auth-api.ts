import type { AuthResponse, LoginPayload, RegisterPayload, User } from '@/types/auth'

const API_BASE_URL = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_BASE_URL ?? 'https://n11-final-case.duckdns.org')

type RawAuthResponse = {
  token?: string
  access_token?: string
  accessToken?: string
  jwt?: string
  user?: { id?: string | number; username?: string; email?: string }
  id?: string | number
  username?: string
  email?: string
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split('.')
    if (!payload) return null
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(normalized)) as Record<string, unknown>
  } catch {
    return null
  }
}

function adaptAuthResponse(
  raw: RawAuthResponse | string,
  fallback: { username: string; email?: string },
): AuthResponse {
  const rawObject = typeof raw === 'string' ? null : raw
  const token =
    typeof raw === 'string'
      ? raw
      : (rawObject?.token ?? rawObject?.access_token ?? rawObject?.accessToken ?? rawObject?.jwt)

  if (!token) {
    throw new Error('Sunucu token döndürmedi.')
  }

  const claims = decodeJwtPayload(token) ?? {}
  const userFromResponse = rawObject?.user
  const userFromFlat =
    rawObject && (rawObject.username || rawObject.email || rawObject.id)
      ? { id: rawObject.id, username: rawObject.username, email: rawObject.email }
      : null
  const userSource = userFromResponse ?? userFromFlat ?? {}

  const user: User = {
    id: String(
      userSource.id ?? (claims.sub as string | number | undefined) ?? '',
    ),
    username:
      userSource.username ??
      (claims.preferred_username as string | undefined) ??
      (claims.username as string | undefined) ??
      fallback.username,
    email:
      userSource.email ??
      (claims.email as string | undefined) ??
      fallback.email ??
      '',
  }

  return { token, user }
}

async function postAuth(path: string, body: unknown): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const text = await response.text()

  if (!response.ok) {
    let message = text
    try {
      const parsed = JSON.parse(text) as { message?: string; error?: string }
      message = parsed.message ?? parsed.error ?? text
    } catch {
      // text not JSON, use as-is
    }
    throw new Error(message || `İstek başarısız oldu (${response.status}).`)
  }

  if (!text) return {}

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const raw = (await postAuth('/api/user/signin', payload)) as RawAuthResponse | string
  return adaptAuthResponse(raw, { username: payload.username })
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const raw = (await postAuth('/api/user/signup', payload)) as RawAuthResponse | string

  try {
    return adaptAuthResponse(raw, { username: payload.username, email: payload.email })
  } catch {
    return login({ username: payload.username, password: payload.password })
  }
}
