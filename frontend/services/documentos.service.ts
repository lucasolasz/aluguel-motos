import { apiFetch } from '@/lib/auth'
import type { Documento } from '@/lib/types'

export async function getMeusDocumentos(): Promise<Documento[]> {
  return apiFetch<Documento[]>('/api/documentos/me')
}

export async function salvarDocumento(tipo: string, url: string): Promise<Documento> {
  return apiFetch<Documento>('/api/documentos', {
    method: 'POST',
    body: JSON.stringify({ tipo, url }),
  })
}
