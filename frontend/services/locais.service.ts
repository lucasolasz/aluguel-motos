import { apiFetch } from './api'
import type { Local } from '@/lib/types'

export async function getLocais(): Promise<Local[]> {
  return apiFetch<Local[]>('/api/locais')
}

export async function getLocalById(id: string): Promise<Local> {
  return apiFetch<Local>(`/api/locais/${id}`)
}
