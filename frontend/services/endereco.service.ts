import { apiFetch } from '@/lib/auth'
import type { CreateEnderecoCobranca, EnderecoCobranca } from '@/lib/types'

export async function getMeusEnderecos(): Promise<EnderecoCobranca[]> {
  return apiFetch<EnderecoCobranca[]>('/api/enderecos-cobranca/me')
}

export async function criarEndereco(data: CreateEnderecoCobranca): Promise<EnderecoCobranca> {
  return apiFetch<EnderecoCobranca>('/api/enderecos-cobranca', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
