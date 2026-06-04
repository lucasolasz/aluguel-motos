import { apiFetch } from '@/lib/auth'
import type { CreateEnderecoCobranca, EnderecoCobranca, Endereco, CreateEndereco, UpdateEndereco } from '@/lib/types'

export async function getMeusEnderecos(): Promise<EnderecoCobranca[]> {
  return apiFetch<EnderecoCobranca[]>('/api/enderecos-cobranca/me')
}

export async function criarEndereco(data: CreateEnderecoCobranca): Promise<EnderecoCobranca> {
  return apiFetch<EnderecoCobranca>('/api/enderecos-cobranca', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getMeuEndereco(): Promise<Endereco | null> {
  return apiFetch<Endereco>('/api/enderecos/me')
}

export async function criarMeuEndereco(data: CreateEndereco): Promise<Endereco> {
  return apiFetch<Endereco>('/api/enderecos', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function atualizarMeuEndereco(id: string, data: UpdateEndereco): Promise<Endereco> {
  return apiFetch<Endereco>(`/api/enderecos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}
