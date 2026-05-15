import { apiFetch } from '@/lib/auth'
import type { Reservation } from '@/lib/types'

export async function getMinhasReservas(): Promise<Reservation[]> {
  return apiFetch<Reservation[]>('/api/reservas/me')
}

export async function cancelarReserva(id: string): Promise<Reservation> {
  return apiFetch<Reservation>(`/api/reservas/${id}/cancelar`, { method: 'PATCH' })
}
