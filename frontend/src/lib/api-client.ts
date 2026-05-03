import { getStoredToken, isTokenExpired } from '@/lib/auth-storage'

export const API_BASE_URL = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_BASE_URL ?? 'https://n11-final-case.duckdns.org')

function resolveToken(explicitToken?: string | null) {
  const token = explicitToken ?? getStoredToken()

  if (!token || isTokenExpired(token)) {
    return null
  }

  return token
}

export function createApiHeaders(headers?: HeadersInit, token?: string | null) {
  const resolvedHeaders = new Headers(headers)
  const authToken = resolveToken(token)

  if (authToken) {
    resolvedHeaders.set('Authorization', `Bearer ${authToken}`)
  }

  return resolvedHeaders
}

export function apiFetch(
  input: string,
  init?: RequestInit & {
    token?: string | null
  },
) {
  const { token, headers, ...rest } = init ?? {}

  return fetch(`${API_BASE_URL}${input}`, {
    ...rest,
    headers: createApiHeaders(headers, token),
  })
}
