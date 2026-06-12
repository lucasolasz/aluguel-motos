import { apiFetch } from '@/lib/auth'
import type { Multa, CriarMultaPayload, EditarMultaPayload } from '@/lib/atendimento-types'

export async function adminCriarMulta(reservaId: string, payload: CriarMultaPayload): Promise<Multa> {
  return apiFetch<Multa>(`/api/admin/reservas/${reservaId}/multas`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function adminEditarMulta(
  reservaId: string,
  multaId: string,
  payload: EditarMultaPayload,
): Promise<Multa> {
  return apiFetch<Multa>(`/api/admin/reservas/${reservaId}/multas/${multaId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function adminCancelarMulta(reservaId: string, multaId: string): Promise<void> {
  await apiFetch<void>(`/api/admin/reservas/${reservaId}/multas/${multaId}`, { method: 'DELETE' })
}

export async function adminListarTodasMultas(): Promise<Multa[]> {
  return apiFetch<Multa[]>('/api/admin/multas')
}

export async function getMultasDaReserva(reservaId: string): Promise<Multa[]> {
  return apiFetch<Multa[]>(`/api/reservas/${reservaId}/multas`)
}
