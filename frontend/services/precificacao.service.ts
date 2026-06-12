import { apiFetch as serverFetch } from './api'
import { apiFetch } from '@/lib/auth'
import type { PrecificacaoConfig, PrecificacaoConfigRequest } from '@/lib/pricing'

export async function getPrecificacao(): Promise<PrecificacaoConfig> {
  return serverFetch<PrecificacaoConfig>('/api/precificacao')
}

export async function adminGetPrecificacao(): Promise<PrecificacaoConfig> {
  return apiFetch<PrecificacaoConfig>('/api/precificacao/admin')
}

export async function adminSavePrecificacao(data: PrecificacaoConfigRequest): Promise<PrecificacaoConfig> {
  return apiFetch<PrecificacaoConfig>('/api/precificacao', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}
