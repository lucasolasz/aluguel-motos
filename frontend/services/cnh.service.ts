import { apiFetch } from '@/lib/auth'
import type { Cnh, CreateCnh } from '@/lib/types'

export async function getMinhaCnh(): Promise<Cnh | null> {
  const result = await apiFetch<Cnh | undefined>('/api/cnh/me')
  return result ?? null
}

export async function salvarCnh(data: CreateCnh): Promise<Cnh> {
  return apiFetch<Cnh>('/api/cnh', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
