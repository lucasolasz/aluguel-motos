import { apiFetch } from '@/lib/auth'
import type { Reservation } from '@/lib/types'

export interface CreateReservaPayload {
  motoId: string
  seguroId: string
  dataRetirada: string
  dataDevolucao: string
  acessorios: { acessorioId: string; quantidade: number }[]
}

export async function getMinhasReservas(): Promise<Reservation[]> {
  return apiFetch<Reservation[]>('/api/reservas/me')
}

export async function criarReserva(data: CreateReservaPayload): Promise<Reservation> {
  return apiFetch<Reservation>('/api/reservas', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function cancelarReserva(id: string): Promise<Reservation> {
  return apiFetch<Reservation>(`/api/reservas/${id}/cancelar`, { method: 'PATCH' })
}
