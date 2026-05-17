const COOKIE_NAME = 'auth-token'

export function getToken(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

const COOKIE_MAX_AGE = 15 * 60

export function setToken(token: string): void {
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
}

export function clearToken(): void {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`
}

export function authHeaders(): HeadersInit {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

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
        window.location.href = '/'
      }
    }
    const text = await res.text().catch(() => res.statusText)
    throw new Error(text || `HTTP ${res.status}`)
  }
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T
  }
  return res.json() as Promise<T>
}
