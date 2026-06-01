import { apiFetch } from '@/lib/auth'
import type { Reservation } from '@/lib/types'
import type {
  AdminReservaResumo,
  ReservaDetalhe,
  CriarVistoriaPayload,
  SalvarContratoPayload,
  ConcluirDevolucaoPayload,
} from '@/lib/atendimento-types'

export interface CreateReservaPayload {
  motoId: string
  seguroId: string
  dataRetirada: string
  dataDevolucao: string
  horaRetirada: string
  horaDevolucao: string
  localRetiradaId: string
  localDevolucaoId: string
  cartaoId?: string
  lavagemServicoId?: string
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

// ─── Admin: atendimento presencial (retirada / devolução) ────────────────────

export async function adminListarReservas(cpf?: string): Promise<AdminReservaResumo[]> {
  const qs = cpf && cpf.trim() ? `?cpf=${encodeURIComponent(cpf.trim())}` : ''
  return apiFetch<AdminReservaResumo[]>(`/api/admin/reservas${qs}`)
}

export async function adminGetReservaDetalhe(id: string): Promise<ReservaDetalhe> {
  return apiFetch<ReservaDetalhe>(`/api/admin/reservas/${id}`)
}

export async function adminVerificarCnh(id: string): Promise<ReservaDetalhe> {
  return apiFetch<ReservaDetalhe>(`/api/admin/reservas/${id}/cnh-verificada`, { method: 'PATCH' })
}

export async function adminCobrar(id: string): Promise<ReservaDetalhe> {
  return apiFetch<ReservaDetalhe>(`/api/admin/reservas/${id}/cobrar`, { method: 'POST' })
}

export async function adminRegistrarVistoria(
  id: string,
  payload: CriarVistoriaPayload,
): Promise<ReservaDetalhe> {
  return apiFetch<ReservaDetalhe>(`/api/admin/reservas/${id}/vistorias`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function adminSalvarContrato(
  id: string,
  payload: SalvarContratoPayload,
): Promise<ReservaDetalhe> {
  return apiFetch<ReservaDetalhe>(`/api/admin/reservas/${id}/contrato`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function adminConcluirRetirada(id: string): Promise<ReservaDetalhe> {
  return apiFetch<ReservaDetalhe>(`/api/admin/reservas/${id}/concluir-retirada`, { method: 'POST' })
}

export async function adminAcertarCaucao(
  id: string,
  valorDescontoCaucao: number,
): Promise<ReservaDetalhe> {
  return apiFetch<ReservaDetalhe>(`/api/admin/reservas/${id}/acertar-caucao`, {
    method: 'POST',
    body: JSON.stringify({ valorDescontoCaucao }),
  })
}

export async function adminConcluirDevolucao(
  id: string,
  payload: ConcluirDevolucaoPayload,
): Promise<ReservaDetalhe> {
  return apiFetch<ReservaDetalhe>(`/api/admin/reservas/${id}/concluir-devolucao`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
