import { apiFetch } from '@/lib/auth'

export interface PublicKeyResponse {
  mode: 'pagbank' | 'local'
  publicKey?: string | null
  error?: string
}

interface PagSeguroEncryptResult {
  encryptedCard: string
  hasErrors: boolean
  errors: Array<{ code: string; message: string }>
}

declare global {
  interface Window {
    PagSeguro?: {
      encryptCard: (params: {
        publicKey: string
        holder: string
        number: string
        expMonth: string
        expYear: string
        securityCode: string
      }) => PagSeguroEncryptResult
    }
  }
}

let cachedPublicKey: string | null = null
let cachedMode: 'pagbank' | 'local' | null = null

export async function getCardMode(): Promise<PublicKeyResponse> {
  const response = await apiFetch<PublicKeyResponse>('/api/cartoes/public-key')
  if (response.mode === 'pagbank' && response.publicKey) {
    cachedPublicKey = response.publicKey
  }
  cachedMode = response.mode
  return response
}

export function getCachedMode(): 'pagbank' | 'local' | null {
  return cachedMode
}

const SDK_ERROR_MESSAGES: Record<string, string> = {
  INVALID_NUMBER: 'Número do cartão inválido.',
  INVALID_SECURITY_CODE: 'CVV inválido. Use 3 ou 4 dígitos.',
  INVALID_EXPIRATION_MONTH: 'Mês de validade inválido.',
  INVALID_EXPIRATION_YEAR: 'Ano de validade inválido.',
  INVALID_PUBLIC_KEY: 'Chave pública inválida. Tente novamente.',
  INVALID_HOLDER: 'Nome do titular inválido.',
}

export function encryptCardData(params: {
  holder: string
  number: string
  expMonth: string
  expYear: string
  securityCode: string
}): string {
  if (!cachedPublicKey) {
    throw new Error('Chave pública do PagBank não disponível.')
  }

  const PagSeguro = window.PagSeguro
  if (!PagSeguro || typeof PagSeguro.encryptCard !== 'function') {
    throw new Error('SDK do PagBank não carregado. Recarregue a página.')
  }

  const result = PagSeguro.encryptCard({
    publicKey: cachedPublicKey,
    holder: params.holder,
    number: params.number,
    expMonth: params.expMonth,
    expYear: params.expYear,
    securityCode: params.securityCode,
  })

  if (result.hasErrors) {
    const messages = result.errors
      .map((e) => SDK_ERROR_MESSAGES[e.code] || e.message)
      .join(' ')
    throw new Error(messages || 'Erro ao criptografar cartão.')
  }

  if (!result.encryptedCard) {
    throw new Error('Falha ao criptografar dados do cartão.')
  }

  return result.encryptedCard
}