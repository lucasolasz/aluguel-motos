const COOKIE_NAME = 'auth-token'

export function getToken(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

const COOKIE_MAX_AGE = 24 * 60 * 60

export function setToken(token: string): void {
  const secure = location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`
}

export function clearToken(): void {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`
}

export function authHeaders(): HeadersInit {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

import { API_URL } from './config'

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(init?.headers ?? {}),
    },
  })
    if (!res.ok) {
    if (res.status === 401) {
      clearToken()
      if (typeof window !== 'undefined') {
        const redirect = encodeURIComponent(window.location.pathname + window.location.search)
        window.location.href = `/login?redirect=${redirect}`
      }
    }
    let message = `HTTP ${res.status}`
    try {
      const body = await res.json()
      if (body && typeof body.message === 'string') {
        message = body.message
      } else {
        message = `Erro inesperado (${res.status})`
      }
    } catch {
      const text = await res.text().catch(() => res.statusText)
      message = text || message
    }
    throw new Error(message)
  }
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T
  }
  return res.json() as Promise<T>
}
