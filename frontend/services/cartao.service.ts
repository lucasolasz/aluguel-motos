import { apiFetch } from '@/lib/auth'
import type { Cartao, CreateCartao } from '@/lib/types'

export async function getMeusCartoes(): Promise<Cartao[]> {
  return apiFetch<Cartao[]>('/api/cartoes/me')
}

export async function criarCartao(data: CreateCartao): Promise<Cartao> {
  return apiFetch<Cartao>('/api/cartoes', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function associarEndereco(cartaoId: string, enderecoId: string): Promise<Cartao> {
  return apiFetch<Cartao>(`/api/cartoes/${cartaoId}/endereco`, {
    method: 'PATCH',
    body: JSON.stringify({ enderecoCobrancaId: enderecoId }),
  })
}
