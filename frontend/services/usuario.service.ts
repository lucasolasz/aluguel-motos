import { apiFetch } from '@/lib/auth'
import type { UserProfile } from '@/lib/types'

export async function getMeuPerfil(): Promise<UserProfile> {
  return apiFetch<UserProfile>('/api/usuarios/me')
}

export async function atualizarPerfil(data: Partial<UserProfile>): Promise<UserProfile> {
  return apiFetch<UserProfile>('/api/usuarios/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}
